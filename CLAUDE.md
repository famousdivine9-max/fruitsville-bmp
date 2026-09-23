# CLAUDE.md — Fruitsville Business Management Platform

This file is project context for Claude Code. Read this in full before making any changes.
It supersedes any earlier placeholder branding found in the codebase (e.g. "Mr. Fruit Ville" as
a Port Harcourt rice-and-soup restaurant, or any rice/swallow/soup-based menu structure —
none of that is the real business, replace it per this document).

---

## 1. WHAT THIS PROJECT IS

A multi-tenant Business Management Platform (BMP): a public customer-facing website + a
protected admin portal, for a Nigerian food business called **Fruitsville** (public-facing
wordmark: "MR FRUITSVILLE"). Built so the same codebase can later be re-skinned for other
business types (salons, boutiques, pharmacies) without schema changes — see the "Long-term
product vision" note at the bottom of this file.

**Stack (already decided, do not change without asking):**
- Frontend: React 18 + Vite + Tailwind CSS + React Router + Recharts
- Backend/DB: Supabase (Postgres + Auth + Storage), accessed directly from the frontend —
  there is no separate custom backend server
- Hosting: Vercel (frontend), Supabase (managed backend)
- No payment gateway yet, no Render, no UptimeRobot — out of scope for this phase (see §6)

**What should already exist in this repo (verify, and build out whatever is missing):**
- React/Vite scaffold: public site (Home, Menu, Gallery, About, Contact) + admin portal
  (Login, Dashboard, Products, Categories, Inventory, Sales, Reports, Settings)
- `supabase/schema.sql` — multi-tenant Postgres schema with Row Level Security. Tables:
  `businesses`, `profiles` (role: customer/staff/manager/administrator/super_admin),
  `categories`, `products`, `inventory`, `inventory_history`, `sales`, `orders`, `settings`.
  A trigger auto-reduces inventory and logs history whenever a `sales` row is inserted.
- `supabase/seed.sql` — template for creating the first business + admin login. If it contains
  old placeholder data (wrong business name/address/menu), rewrite it using the real data in §3.
- `src/lib/supabaseClient.js` — reads `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_BUSINESS_SLUG` from `.env`
- `src/context/AuthContext.jsx` — resolves the current business by slug, loads its `settings`
  row, handles login/session/role
- Tailwind theme tokens in `tailwind.config.js` must match the real brand palette in §4 — if
  they currently use a generic green/orange "citrus" palette, replace them.

**Your job in this session:** verify/build the scaffold above if any of it is missing, rebrand
the whole UI to match Fruitsville's real identity (§4), correct all business data (§3), set the
menu structure to match what Fruitsville actually sells (§5), and work through the task
checklist in §7 in order.

---

## 2. WHAT YOU CAN AND CANNOT DO

The Supabase CLI and Vercel CLI are authenticated and linked in this project (via `supabase
login` / `supabase link` and `vercel login` / `vercel link`, already done on Famous's machine).
That means you have real, working access to both platforms from the terminal:

- **Supabase**: you can run `supabase db push`, `supabase migration new`, apply `schema.sql` and
  `seed.sql` against the live linked project, manage Storage buckets, and generally treat the
  Supabase project as something you operate directly — not something to describe steps for.
- **Vercel**: you can run `vercel`, `vercel --prod`, `vercel env add` / `vercel env pull`, and
  deploy or update environment variables directly from the CLI.

**The one thing you genuinely cannot do:** create the Supabase or Vercel *account* itself, or do
anything that requires Famous's own login credentials/2FA/email confirmation for the first time
(e.g. an OAuth consent screen only he can click through, or a payment method on a paid plan).
Account ownership stays his. If a CLI command fails because it needs interactive login or an
approval only he can grant, stop and tell him exactly what to run or click — don't guess around
it or assume it's fine to proceed.

For everything else — schema changes, seeding, deploys, env vars, storage buckets — just do it
directly via the CLI rather than writing out manual dashboard instructions.

---

## 3. REAL BUSINESS DATA (replace all placeholders with this — verbatim)

```
Business (formal):      Fruitsville
Display / wordmark:     MR FRUITSVILLE
Business type:          restaurant  (snacks / parfait / smoothie / juice bar — see §5, this is
                         NOT a rice-and-soup sit-down restaurant, correct the copy accordingly)
Slug:                   fruitsville

Address:                Sovereign Trust Insurance Building,
                         Adjacent First Bank, Alagbaka,
                         Akure, Ondo State, Nigeria

Phone / WhatsApp:       08160868528
                         (format for wa.me links as 2348160868528 — Nigeria country code +234,
                         drop the leading 0)

Social handle:          mrfruitsville  (same handle across Instagram, Facebook, TikTok — build
                         the links as https://instagram.com/mrfruitsville,
                         https://facebook.com/mrfruitsville, https://tiktok.com/@mrfruitsville)

Tagline concept:        "Fresh meals, snacks, parfait & juice — made daily."
                         (adapt naturally, don't force the exact wording everywhere)
```

Update `supabase/seed.sql` to insert this business, this settings row, and the admin profile
using these real values in place of any old placeholder ones.

---

## 4. VISUAL BRAND SYSTEM (from the attached flyer and product sticker)

Replace any generic green/orange "citrus" theme with the actual Fruitsville identity, extracted
from the flyer and sticker artwork:

**Color palette** — UPDATED per Famous: a modern, balanced restaurant look. No single colour may
dominate. The base is a warm neutral (cream background, charcoal "ink" text, charcoal footer), and the
logo's red, green, orange and yellow are shared evenly as accents (rotated via `src/lib/accents.js`).
Tokens live in `tailwind.config.js`:

```js
ink:    { DEFAULT: '#1F1D1B', soft: '#57534E', muted: '#8A847D' }, // text, primary buttons, footer
cream:  { DEFAULT: '#FFFAF3', dark: '#F6EDE0' },                   // backgrounds
red:    { DEFAULT: '#D7261E', ... },  // accent
green:  { DEFAULT: '#1E8A44', ... },  // accent + order/WhatsApp CTAs
orange: { DEFAULT: '#EE8A1F', ... },  // accent + links
yellow: { DEFAULT: '#F4C430', ... },  // accent + star ratings
```

Don't reintroduce a full-red (or any single-colour) UI.

**Typography:** Poppins (display/headings) + Inter (body) — the flyer's bold, slightly
condensed sans-serif wordmark style is a good match for Poppins ExtraBold.

**Logo placement:**
- Top-left of the navbar and again in the footer (grouped with business name, address, and socials)
- `/public/logo.png` is the real "ZFB" logo, cut from the product sticker (red ring on white).
  It's low-resolution; replace it with the original logo file when Famous provides one.

**Staff/admin access:** the public site has NO link to the admin portal. Staff use the separate URL
https://fruitsville-staff.vercel.app (redirects to `/admin/login`, see `vercel.json`).

**Photos & motion:** real photos live in `public/images/gallery` (listed in `bmp.gallery_images`)
and `public/images/products` (set as product `image_url` by seed.sql). The Home hero is a cross-fading
slideshow, with an auto-scrolling photo strip below it. Product cards show the photo with the price tag on it.

**Footer:** four columns: About us, Contact, Address and Reviews. Reviews are real customer
submissions (`bmp.reviews`) that a manager approves in Admin → Reviews. Never seed or invent reviews.

---

## 5. MENU / CATEGORY STRUCTURE

Fruitsville's actual product line, from the flyer, is:

```
Tiger-nut
Shawarma
Yoghurt
Parfait
Smoothie
Spring Roll
Chicken Salad
Peppered Chicken
Samosa
Chops (sold in cups, per the flyer photo)
Chicken Wings
```

This is NOT a rice-and-soup sit-down restaurant menu — do not use Rice/Swallow/Soup/Fish
categories anywhere. Set up `supabase/seed.sql` with categories that fit this real product line
instead. Reasonable groupings (use judgment, these don't have to be exact):
- **Wraps & Shawarma**
- **Parfait & Yoghurt**
- **Smoothies & Juice**
- **Snacks** (Spring Roll, Samosa, Chops, Tiger-nut)
- **Chicken** (Peppered Chicken, Chicken Wings, Chicken Salad)

Do not invent specific prices — leave products without hardcoded prices in the seed, or use an
obvious placeholder (e.g. `0.00` with a code comment `-- TODO: real price pending from Famous`)
so nothing looks like real pricing data until he fills it in through Admin → Products (this UI
should already support adding/editing products — build it if it doesn't exist yet).

---

## 6. ASSETS PENDING FROM FAMOUS (build around these gaps, don't block on them)

- **Logo file** — not provided yet. Use a placeholder at `/public/logo.png` per §4.
- **Product photos** — Famous will provide these after the initial build. The Admin → Products
  image upload flow should let him add photos himself later (uploading to a Supabase Storage
  bucket, e.g. `product-images`) — build or verify that flow, but no actual photo files are
  needed from you now. Make sure product cards degrade gracefully with no image: show a colored
  placeholder (using the new maroon/green palette, not a leftover green-only style) with the
  product's first letter when `image_url` is empty.

---

## 7. TASK CHECKLIST — work through these in order

1. **Confirm project state** — check whether the React/Vite scaffold, Supabase schema, and seed
   file described in §1 already exist in this working directory. If this is a fresh directory
   with nothing in it, build the full scaffold (public site + admin portal + Supabase schema)
   before proceeding to the rebrand steps below.
2. **Set up the design system** — set `tailwind.config.js` color tokens per §4. Every component
   using color for primary/accent roles should use `maroon`/`red` as described, keeping `green`
   only where it's a genuine secondary accent.
3. **Build/update the Home page hero** — maroon gradient background, red accent CTA/badge, logo
   top-left of nav, placeholder image panels where real food photography will go later.
4. **Set the logo placement** — navbar (top-left) and footer, using the `/public/logo.png`
   placeholder approach from §4.
5. **Write `supabase/seed.sql`** — real business name/slug, real address, real phone/WhatsApp
   (remember the wa.me format needs `234` prefix, no leading zero), real social handles, and the
   category structure from §5. No fabricated prices.
6. **Write all business-facing copy** using Fruitsville's real details from §3 — do not use
   "Mr. Fruit Ville" as a rice-and-soup restaurant, Port Harcourt, or any rice/swallow/jollof
   menu language anywhere in the site.
7. **Set `index.html` meta tags** — title and description should reference Fruitsville.
8. **Sanity check the WhatsApp order links** — confirm every place that builds a `wa.me/` link
   (product cards, floating WhatsApp button, home page CTA) correctly strips non-digits and uses
   the `2348160868528` format once the real number is in `settings`.
9. **Run a local build** (`npm install && npm run build`) to confirm nothing is broken.
10. **Apply the schema and seed to the live Supabase project** yourself via the linked CLI
    (`supabase db push`, or running the SQL files against the linked project) rather than asking
    Famous to paste them into the SQL editor — the CLI is authenticated for exactly this.
11. **Pull or set the real Supabase URL/anon key into `.env`** via `vercel env pull` (if already
    set in the Vercel project) or `supabase status`/the linked project's API settings, and set the
    same variables in the Vercel project via `vercel env add` so the deployed site has them too.
12. **Deploy to Vercel** (`vercel --prod`) once the build is clean and env vars are set.
13. **Stop and hand back to Famous only for what's genuinely his to do:**
    - Creating his own admin login in Supabase Authentication (email/password — his identity,
      not something to generate on his behalf)
    - Providing the real logo file and product photos when ready
    - Anything a CLI command reports as needing his interactive approval (per §2)
    Tell him plainly what's live, what's outstanding, and the deployed URL once done.

---

## 8. OUT OF SCOPE — do not build these right now

- Render, UptimeRobot, or any separate backend server — Supabase covers everything needed
- Paystack/Flutterwave or any payment gateway — v1.0 ordering is WhatsApp-only
- An `orders` table/module for future online ordering may exist in the schema but needs no UI
  yet — leave it alone unless asked
- A Gallery page can stay a simple placeholder grid unless asked for more

---

## Long-term product vision (context only, not a task for this session)

This codebase is meant to become a reusable Business Management Platform: the same core modules
(Auth, Dashboard, Products, Categories, Settings) get reused for future clients in other
industries (salons, boutiques, pharmacies) by adding business-type-specific modules, not by
forking the schema. Keep that in mind if you're tempted to hardcode anything Fruitsville-specific
into shared components — business-specific data belongs in the database (`businesses`,
`settings`, `categories`), not hardcoded into component logic.
