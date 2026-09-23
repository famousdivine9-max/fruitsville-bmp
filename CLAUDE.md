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

**Color palette** (these are close visual estimates from the artwork — if Famous provides brand
guideline hex codes or the logo file later, prefer those over this estimate):

```js
colors: {
  maroon: {
    DEFAULT: '#6E1E42',   // primary — the flyer's background gradient, nav, hero
    dark:    '#4A1530',   // darker variant — footer, bottom contact bar (matches the flyer's
                            // "For More Enquires" strip)
    light:   '#F5E9EF',
  },
  red: {
    DEFAULT: '#D62839',   // the "MR FRUITSVILLE" wordmark red + "OUR SERVICES" banner red
    dark:    '#B01F2E',
    light:   '#FCEAEC',
  },
  green: {
    DEFAULT: '#1B6B3C',   // the logo's green + the product-list text green + "PARFAIT" wordmark
    dark:    '#14532D',
    light:   '#E7F3EC',
  },
  yellow: {
    DEFAULT: '#F4C430',   // small accent only — the "NET WT 330ml" badge on the sticker
  },
  charcoal: '#2A2A28',
  cream: '#FFFFFF',
}
```

**How these map onto the UI (rename/replace roles, don't just add tokens):**
- Anywhere a color was used as PRIMARY (nav active state, primary buttons, hero background) →
  use `maroon`
- Anywhere a color was used as ACCENT (CTAs, "Order now" buttons, badges) → use `red`
- Keep a `green` token as a SECONDARY accent — it's genuinely part of the brand (the logo and
  "PARFAIT" wordmark are green), just not primary. Use it for things like an "in stock" badge,
  secondary buttons, or small brand flashes
- `yellow` is a minor accent only — a tag, a small badge — never a background or button color

**Typography:** Poppins (display/headings) + Inter (body) — the flyer's bold, slightly
condensed sans-serif wordmark style is a good match for Poppins ExtraBold.

**Logo placement:**
- Top-left of the navbar and again in the footer (grouped with business name, address, and
  socials — mirror how the sticker groups logo + name + address + socials together)
- Logo file is NOT provided yet — Famous will supply the real file later. Build the `<img
  src="/logo.png" alt="Fruitsville logo" />` now, and create a simple placeholder image (a
  circle, green, with a leaf/fruit-ish shape or just the letter "F") at `/public/logo.png` so
  the layout doesn't break before the real file arrives. Leave a clear code comment:
  `{/* TODO: swap /public/logo.png for the real logo file once provided */}`

**Hero section direction:** the flyer's dominant visual is a deep maroon/plum gradient
background with product photography in rounded panels and a red "Today's specials"-style
banner. Build the public Home page hero to follow that direction — maroon gradient background,
red accent badge/CTA, and clearly-labeled placeholder image panels where real product
photography will go (see §6 — photos are pending).

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
