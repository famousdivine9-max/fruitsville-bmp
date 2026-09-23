# Fruitsville — Business Management Platform

Public website + admin portal for **Fruitsville** (MR FRUITSVILLE), Alagbaka, Akure.
React 18 + Vite + Tailwind + React Router + Recharts, with Supabase (Postgres, Auth, Storage) as the backend.

## Local development

```bash
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

## Database

- `supabase/schema.sql`: multi-tenant schema, RLS policies, triggers (a sale reduces inventory and logs history), and the `product-images` storage bucket. Safe to re-run.
- `supabase/seed.sql`: the Fruitsville business, settings, categories and products (prices are 0.00 placeholders). Safe to re-run; existing prices are kept.
- `supabase/migrations/…_init_schema.sql` is a symlink to `schema.sql`, so the Supabase CLI can apply it.

```bash
supabase link --project-ref <ref>
supabase db push --include-seed
```

### First admin login

1. Supabase dashboard → Authentication → Users → **Add user** (your email + password).
2. In `supabase/seed.sql`, set `admin_email` in the "First administrator" block, then re-run that block (SQL editor or `psql`).
3. Sign in at `/admin/login`.

Roles: `staff` (sales, restocks) < `manager` (products, categories, stock adjustments, reports) < `administrator` (settings, users) < `super_admin`.

## Deploy (Vercel)

```bash
vercel link
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_BUSINESS_SLUG production   # fruitsville
vercel --prod
```

`vercel.json` rewrites every path to `index.html` so client-side routes such as `/menu` and `/admin` work on refresh.

## Pending assets

- `public/logo.png` is a placeholder. Replace it with the real logo file.
- Product photos: upload them in Admin → Products. They go to the `product-images` storage bucket.
