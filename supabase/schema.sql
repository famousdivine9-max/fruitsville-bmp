-- =============================================================================
-- Business Management Platform (BMP) — multi-tenant schema
-- =============================================================================
-- Every business-owned row carries a business_id. Row Level Security scopes
-- staff access to the business on their profile; public (anon) visitors can
-- read only what the public website needs (business, settings, active
-- categories and products).
--
-- Roles, lowest to highest: customer < staff < manager < administrator < super_admin
--
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP ... IF EXISTS.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.businesses (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name          text not null,
  business_type text not null default 'restaurant',
  created_at    timestamptz not null default now()
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete set null,
  full_name   text,
  role        text not null default 'customer'
              check (role in ('customer', 'staff', 'manager', 'administrator', 'super_admin')),
  created_at  timestamptz not null default now()
);

create table if not exists public.settings (
  business_id   uuid primary key references public.businesses (id) on delete cascade,
  business_name text not null,          -- formal name
  display_name  text,                   -- public wordmark
  tagline       text,
  about         text,
  address       text,
  phone         text,
  whatsapp      text,                   -- international digits, e.g. 234XXXXXXXXXX
  email         text,
  instagram     text,
  facebook      text,
  tiktok        text,
  opening_hours text,
  currency      text not null default 'NGN',
  updated_at    timestamptz not null default now()
);

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (business_id, slug)
);

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id) on delete cascade,
  category_id  uuid references public.categories (id) on delete set null,
  name         text not null,
  description  text,
  price        numeric(12, 2) not null default 0 check (price >= 0),
  image_url    text,
  is_available boolean not null default true,
  is_featured  boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (business_id, name)
);

create table if not exists public.inventory (
  id                  uuid primary key default gen_random_uuid(),
  business_id         uuid not null references public.businesses (id) on delete cascade,
  product_id          uuid not null unique references public.products (id) on delete cascade,
  quantity            int not null default 0,
  low_stock_threshold int not null default 5 check (low_stock_threshold >= 0),
  unit                text not null default 'pcs',
  updated_at          timestamptz not null default now()
);

create table if not exists public.inventory_history (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses (id) on delete cascade,
  product_id     uuid not null references public.products (id) on delete cascade,
  change         int not null,
  quantity_after int not null,
  reason         text not null check (reason in ('sale', 'restock', 'adjustment', 'waste')),
  note           text,
  sale_id        uuid,
  created_by     uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now()
);

create table if not exists public.sales (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses (id) on delete cascade,
  product_id     uuid references public.products (id) on delete set null,
  product_name   text not null,             -- snapshot, survives product deletion
  quantity       int not null check (quantity > 0),
  unit_price     numeric(12, 2) not null check (unit_price >= 0),
  total          numeric(12, 2) generated always as (quantity * unit_price) stored,
  payment_method text not null default 'cash'
                 check (payment_method in ('cash', 'transfer', 'pos', 'other')),
  note           text,
  sold_by        uuid references auth.users (id) on delete set null default auth.uid(),
  sold_at        timestamptz not null default now()
);

-- Reserved for future online ordering. No UI yet (v1.0 ordering is WhatsApp-only).
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  business_id    uuid not null references public.businesses (id) on delete cascade,
  customer_name  text,
  customer_phone text,
  items          jsonb not null default '[]'::jsonb,
  total          numeric(12, 2) not null default 0,
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at     timestamptz not null default now()
);

create index if not exists categories_business_idx        on public.categories (business_id, sort_order);
create index if not exists products_business_idx          on public.products (business_id, category_id);
create index if not exists inventory_business_idx         on public.inventory (business_id);
create index if not exists inventory_history_product_idx  on public.inventory_history (product_id, created_at desc);
create index if not exists sales_business_sold_at_idx     on public.sales (business_id, sold_at desc);
create index if not exists orders_business_idx            on public.orders (business_id, created_at desc);
create index if not exists profiles_business_idx          on public.profiles (business_id);

-- -----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so RLS policies can call them without
-- recursing into profiles' own policies)
-- -----------------------------------------------------------------------------

create or replace function public.role_rank(r text)
returns int language sql immutable as $$
  select case r
    when 'customer'      then 0
    when 'staff'         then 1
    when 'manager'       then 2
    when 'administrator' then 3
    when 'super_admin'   then 4
    else -1
  end
$$;

create or replace function public.current_business_id()
returns uuid language sql stable security definer set search_path = public as $$
  select business_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'customer')
$$;

-- True when the signed-in user belongs to business `b` with at least role `min_role`.
-- super_admin passes for every business.
create or replace function public.has_role(b uuid, min_role text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'super_admin'
        or (p.business_id = b and public.role_rank(p.role) >= public.role_rank(min_role))
      )
  )
$$;

-- has_role() for a storage folder name; non-UUID folders simply fail the check.
create or replace function public.can_manage_folder(folder text)
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  return public.has_role(folder::uuid, 'manager');
exception when invalid_text_representation then
  return false;
end $$;

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

drop trigger if exists inventory_touch on public.inventory;
create trigger inventory_touch before update on public.inventory
  for each row execute function public.touch_updated_at();

-- Every new product gets an inventory row.
create or replace function public.create_inventory_for_product()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.inventory (business_id, product_id)
  values (new.business_id, new.id)
  on conflict (product_id) do nothing;
  return new;
end $$;

drop trigger if exists products_create_inventory on public.products;
create trigger products_create_inventory after insert on public.products
  for each row execute function public.create_inventory_for_product();

-- A sale reduces inventory and logs the movement.
create or replace function public.apply_sale_to_inventory()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_qty int;
begin
  if new.product_id is null then
    return new;
  end if;

  insert into public.inventory (business_id, product_id, quantity)
  values (new.business_id, new.product_id, -new.quantity)
  on conflict (product_id)
    do update set quantity = public.inventory.quantity - new.quantity
  returning quantity into new_qty;

  insert into public.inventory_history
    (business_id, product_id, change, quantity_after, reason, sale_id, created_by)
  values
    (new.business_id, new.product_id, -new.quantity, new_qty, 'sale', new.id, new.sold_by);

  return new;
end $$;

drop trigger if exists sales_apply_inventory on public.sales;
create trigger sales_apply_inventory after insert on public.sales
  for each row execute function public.apply_sale_to_inventory();

-- New auth users get a profile. A signup may pass { business_slug } in its
-- metadata to attach to a business; the role always starts as 'customer' and
-- must be raised by an administrator (or seed.sql for the first admin).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, business_id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    (select id from public.businesses where slug = new.raw_user_meta_data ->> 'business_slug')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Manual stock movements (restock / adjustment / waste) go through this RPC so
-- inventory and its history always stay in step.
create or replace function public.adjust_inventory(
  p_product_id uuid,
  p_change     int,
  p_reason     text default 'restock',
  p_note       text default null
) returns int language plpgsql security definer set search_path = public as $$
declare
  b uuid;
  new_qty int;
begin
  select business_id into b from public.products where id = p_product_id;
  if b is null then
    raise exception 'Product not found';
  end if;
  if not public.has_role(b, 'staff') then
    raise exception 'Not allowed';
  end if;
  if p_reason not in ('restock', 'adjustment', 'waste') then
    raise exception 'Invalid reason %', p_reason;
  end if;
  -- Only managers can remove stock by hand; staff may record restocks.
  if p_reason <> 'restock' and not public.has_role(b, 'manager') then
    raise exception 'Only managers can make stock adjustments';
  end if;

  insert into public.inventory (business_id, product_id, quantity)
  values (b, p_product_id, p_change)
  on conflict (product_id)
    do update set quantity = public.inventory.quantity + p_change
  returning quantity into new_qty;

  insert into public.inventory_history
    (business_id, product_id, change, quantity_after, reason, note, created_by)
  values
    (b, p_product_id, p_change, new_qty, p_reason, p_note, auth.uid());

  return new_qty;
end $$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.businesses        enable row level security;
alter table public.profiles          enable row level security;
alter table public.settings          enable row level security;
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.inventory         enable row level security;
alter table public.inventory_history enable row level security;
alter table public.sales             enable row level security;
alter table public.orders            enable row level security;

-- businesses: public read (the site resolves its business by slug)
drop policy if exists businesses_public_read on public.businesses;
create policy businesses_public_read on public.businesses for select using (true);

drop policy if exists businesses_admin_update on public.businesses;
create policy businesses_admin_update on public.businesses for update
  using (public.has_role(id, 'administrator'));

-- profiles
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select
  using (id = auth.uid() or public.has_role(business_id, 'administrator'));

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update
  using (id = auth.uid())
  -- users can edit their own name but not their role or business
  with check (
    id = auth.uid()
    and role = public.current_user_role()
    and business_id is not distinct from public.current_business_id()
  );

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update
  using (public.has_role(business_id, 'administrator'))
  with check (public.has_role(business_id, 'administrator') and role <> 'super_admin');

-- settings: public read, administrators write
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select using (true);

drop policy if exists settings_admin_write on public.settings;
create policy settings_admin_write on public.settings for all
  using (public.has_role(business_id, 'administrator'))
  with check (public.has_role(business_id, 'administrator'));

-- categories: public sees active ones; staff see all; managers write
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select
  using (is_active or public.has_role(business_id, 'staff'));

drop policy if exists categories_manager_write on public.categories;
create policy categories_manager_write on public.categories for all
  using (public.has_role(business_id, 'manager'))
  with check (public.has_role(business_id, 'manager'));

-- products: same pattern
drop policy if exists products_read on public.products;
create policy products_read on public.products for select
  using (is_available or public.has_role(business_id, 'staff'));

drop policy if exists products_manager_write on public.products;
create policy products_manager_write on public.products for all
  using (public.has_role(business_id, 'manager'))
  with check (public.has_role(business_id, 'manager'));

-- inventory: staff read; managers edit thresholds/units (quantities move via
-- adjust_inventory() and the sales trigger)
drop policy if exists inventory_staff_read on public.inventory;
create policy inventory_staff_read on public.inventory for select
  using (public.has_role(business_id, 'staff'));

drop policy if exists inventory_manager_write on public.inventory;
create policy inventory_manager_write on public.inventory for update
  using (public.has_role(business_id, 'manager'))
  with check (public.has_role(business_id, 'manager'));

drop policy if exists inventory_history_staff_read on public.inventory_history;
create policy inventory_history_staff_read on public.inventory_history for select
  using (public.has_role(business_id, 'staff'));

-- sales: staff record and read; managers can correct/delete
drop policy if exists sales_staff_read on public.sales;
create policy sales_staff_read on public.sales for select
  using (public.has_role(business_id, 'staff'));

drop policy if exists sales_staff_insert on public.sales;
create policy sales_staff_insert on public.sales for insert
  with check (public.has_role(business_id, 'staff'));

drop policy if exists sales_manager_delete on public.sales;
create policy sales_manager_delete on public.sales for delete
  using (public.has_role(business_id, 'manager'));

-- orders: staff only for now
drop policy if exists orders_staff_all on public.orders;
create policy orders_staff_all on public.orders for all
  using (public.has_role(business_id, 'staff'))
  with check (public.has_role(business_id, 'staff'));

grant execute on function public.adjust_inventory(uuid, int, text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- Storage: product images
-- Files are stored as <business_id>/<file>, so write access is scoped by folder.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists product_images_manager_insert on storage.objects;
create policy product_images_manager_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and public.can_manage_folder((storage.foldername(name))[1])
  );

drop policy if exists product_images_manager_update on storage.objects;
create policy product_images_manager_update on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and public.can_manage_folder((storage.foldername(name))[1])
  );

drop policy if exists product_images_manager_delete on storage.objects;
create policy product_images_manager_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and public.can_manage_folder((storage.foldername(name))[1])
  );
