-- =============================================================================
-- Seed: Fruitsville (slug: fruitsville)
-- =============================================================================
-- Run after schema.sql. Safe to re-run — existing rows are updated in place.
--
-- Prices are deliberately 0.00 placeholders. Set real prices in
-- Admin → Products; nothing here is real pricing data.
-- =============================================================================

-- Business -------------------------------------------------------------------
insert into bmp.businesses (slug, name, business_type)
values ('fruitsville', 'Fruitsville', 'restaurant')
on conflict (slug) do update
  set name = excluded.name,
      business_type = excluded.business_type;

-- Settings -------------------------------------------------------------------
insert into bmp.settings (
  business_id, business_name, display_name, tagline, about,
  address, phone, whatsapp, instagram, facebook, tiktok, currency
)
select
  b.id,
  'Fruitsville',
  'MR FRUITSVILLE',
  'Fresh meals, snacks, parfait & juice — made daily.',
  'Fruitsville is a snack, parfait, smoothie and juice spot in Alagbaka, Akure. '
    || 'Everything is made fresh every day — from creamy parfait and yoghurt to '
    || 'shawarma, peppered chicken, spring rolls, samosa, chops and chilled tiger-nut. '
    || 'Stop by, or send us a message on WhatsApp and we''ll have your order ready.',
  'Sovereign Trust Insurance Building, Adjacent First Bank, Alagbaka, Akure, Ondo State, Nigeria',
  '08160868528',
  '2348160868528',
  'https://instagram.com/mrfruitsville',
  'https://facebook.com/mrfruitsville',
  'https://tiktok.com/@mrfruitsville',
  'NGN'
from bmp.businesses b
where b.slug = 'fruitsville'
on conflict (business_id) do update
  set business_name = excluded.business_name,
      display_name  = excluded.display_name,
      tagline       = excluded.tagline,
      about         = excluded.about,
      address       = excluded.address,
      phone         = excluded.phone,
      whatsapp      = excluded.whatsapp,
      instagram     = excluded.instagram,
      facebook      = excluded.facebook,
      tiktok        = excluded.tiktok,
      currency      = excluded.currency;

-- Map: until exact coordinates are entered in Admin → Settings, point the map at
-- the First Bank branch next door (a landmark Google Maps knows precisely).
update bmp.settings st
set map_query = 'First Bank, 1 Alagbaka Road, Alagbaka, Akure, Ondo State, Nigeria'
from bmp.businesses b
where b.id = st.business_id and b.slug = 'fruitsville' and st.map_query is null;

-- Categories -----------------------------------------------------------------
insert into bmp.categories (business_id, name, slug, description, sort_order)
select b.id, c.name, c.slug, c.description, c.sort_order
from bmp.businesses b
cross join (values
  ('Wraps & Shawarma',   'wraps-shawarma',   'Loaded shawarma, wrapped fresh to order.',            1),
  ('Parfait & Yoghurt',  'parfait-yoghurt',  'Layered parfait and creamy yoghurt.',                 2),
  ('Smoothies & Juice',  'smoothies-juice',  'Blended smoothies and chilled drinks.',               3),
  ('Snacks',             'snacks',           'Spring rolls, samosa, chops and tiger-nut.',          4),
  ('Chicken',            'chicken',          'Peppered chicken, chicken wings and chicken salad.',  5)
) as c(name, slug, description, sort_order)
where b.slug = 'fruitsville'
on conflict (business_id, slug) do update
  set name        = excluded.name,
      description = excluded.description,
      sort_order  = excluded.sort_order;

-- Products -------------------------------------------------------------------
-- TODO: real price pending from Famous — every price below is a 0.00 placeholder.
insert into bmp.products (business_id, category_id, name, description, price, sort_order)
select b.id, c.id, p.name, p.description, 0.00, p.sort_order
from bmp.businesses b
join (values
  ('wraps-shawarma',  'Shawarma',         'Freshly wrapped shawarma.',               1),
  ('parfait-yoghurt', 'Parfait',          'Layered yoghurt, fruit and granola.',     1),
  ('parfait-yoghurt', 'Yoghurt',          'Creamy chilled yoghurt.',                 2),
  ('smoothies-juice', 'Smoothie',         'Fresh fruit smoothie.',                   1),
  ('snacks',          'Tiger-nut',        'Chilled tiger-nut drink.',                1),
  ('snacks',          'Spring Roll',      'Crispy spring rolls.',                    2),
  ('snacks',          'Samosa',           'Golden, crispy samosa.',                  3),
  ('snacks',          'Chops',            'Assorted small chops, served in cups.',   4),
  ('chicken',         'Peppered Chicken', 'Spicy peppered chicken.',                 1),
  ('chicken',         'Chicken Wings',    'Seasoned chicken wings.',                 2),
  ('chicken',         'Chicken Salad',    'Fresh salad topped with chicken.',        3)
) as p(category_slug, name, description, sort_order) on true
join bmp.categories c on c.business_id = b.id and c.slug = p.category_slug
where b.slug = 'fruitsville'
on conflict (business_id, name) do update
  set category_id = excluded.category_id,
      description = excluded.description,
      sort_order  = excluded.sort_order;
  -- price is intentionally NOT overwritten on re-run, so real prices set in
  -- Admin → Products survive re-seeding.

-- Product photos ---------------------------------------------------------------
-- Photos shipped with the site (public/images/products). Only fills products that
-- have no photo yet, or still use one of these bundled photos, so photos uploaded
-- in Admin → Products are never overwritten.
update bmp.products p
set image_url = v.image_url
from bmp.businesses b,
  (values
    ('Parfait',          '/images/products/parfait.jpg'),
    ('Chops',            '/images/products/chops.jpg'),
    ('Spring Roll',      '/images/products/spring-roll.jpg'),
    ('Samosa',           '/images/products/samosa.jpg'),
    ('Chicken Salad',    '/images/products/chicken-salad.jpg'),
    ('Peppered Chicken', '/images/products/peppered-chicken.jpg'),
    ('Shawarma',         '/images/products/shawarma.jpg'),
    ('Smoothie',         '/images/products/smoothie.jpg')
  ) as v(name, image_url)
where b.slug = 'fruitsville'
  and p.business_id = b.id
  and p.name = v.name
  and (p.image_url is null or p.image_url like '/images/products/%');

-- Gallery ----------------------------------------------------------------------
insert into bmp.gallery_images (business_id, image_url, caption, sort_order)
select b.id, g.image_url, g.caption, g.sort_order
from bmp.businesses b
cross join (values
  ('/images/gallery/parfait-cups.jpg',          'Fresh fruit parfait',          1),
  ('/images/gallery/small-chops.jpg',           'Small chops in cups',          2),
  ('/images/gallery/chicken-salad-tray.jpg',    'Chicken salad tray',           3),
  ('/images/gallery/smoothie-and-shawarma.jpg', 'Smoothie & shawarma',          4),
  ('/images/gallery/parfait-batch.jpg',         'Parfait, packed fresh',        5),
  ('/images/gallery/milkshake.jpg',             'Chilled milkshake',            6),
  ('/images/gallery/festive-hamper.jpg',        'Festive hamper',               7),
  ('/images/gallery/fruit-juice-bottles.jpg',   'Fresh fruit juice',            8),
  ('/images/gallery/parfait-batch-top.jpg',     'Parfait toppings',             9),
  ('/images/gallery/fried-rice.jpg',            'Fried rice special',          10)
) as g(image_url, caption, sort_order)
where b.slug = 'fruitsville'
on conflict (business_id, image_url) do update
  set caption = excluded.caption,
      sort_order = excluded.sort_order;

-- First administrator ---------------------------------------------------------
-- The admin login is created by Famous himself in Supabase → Authentication →
-- Users → "Add user" (email + password). Then set his email below and re-run
-- this file (or just this block) to attach him to Fruitsville as administrator.
do $$
declare
  admin_email constant text := 'CHANGE-ME@example.com';  -- TODO: Famous's admin login email
  uid uuid;
begin
  select id into uid from auth.users where lower(email) = lower(admin_email);
  if uid is null then
    raise notice 'No auth user with email % yet — create the login in Supabase Auth, set admin_email, and re-run.', admin_email;
    return;
  end if;

  insert into bmp.profiles (id, business_id, role, full_name)
  values (uid, (select id from bmp.businesses where slug = 'fruitsville'), 'administrator', 'Famous')
  on conflict (id) do update
    set business_id = excluded.business_id,
        role        = 'administrator';
  raise notice 'Promoted % to administrator of Fruitsville.', admin_email;
end $$;
