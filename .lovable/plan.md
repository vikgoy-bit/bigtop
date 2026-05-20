# Migrate marketing site into the booking app

Goal: bring the WordPress marketing site at bigtopselfstorage.com into this TanStack Start codebase as native routes, improve the design to match the booking flow, and preserve every existing URL so search rankings don't drop. The existing `/book/*` authenticated flow stays untouched.

## URL inventory (from current sitemap — must all keep working)

Top-level marketing:
- `/` (home)
- `/about`
- `/services`
- `/pricing`
- `/offers`
- `/contact-us`
- `/how-self-storage-works`
- `/smart-entry`
- `/refer-a-friend`
- `/get-a-quote` → redirect into booking flow
- `/space-estimator`
- `/storage-size`

Storage type landing pages:
- `/personal-storage`
- `/business-storage`
- `/student-storage`
- `/secure-storage`
- `/boxes-and-packaging`
- `/self-storage-insurance`
- `/big-protect-insurance-policy`

Legal:
- `/privacy-policy`
- `/cookie-policy`
- `/terms-conditions`
- `/special-conditions`

Old WordPress duplicates we can 301 to canonical:
- `/home/` → `/`
- `/your-details/` → `/book/details`
- `/global-styles/`, `/templete/` → drop (WP internals)

WordPress uses trailing slashes; TanStack routes don't. We'll add a tiny middleware that strips trailing slashes via 301 so `/about/` and `/about` both resolve and SEO consolidates on the no-slash version (Google handles this fine — link equity transfers via 301).

## Phasing

**Phase 1 (this turn): structure + 3 key pages**
- Add a shared `MarketingLayout` (header you already have + footer)
- Build a polished new Home page replacing the placeholder index
- Build About, How Self Storage Works, Smart Entry (the strongest "story" pages)
- Wire all nav links in `SiteHeader` to internal routes instead of external `bigtopselfstorage.com` links
- Add proper `head()` meta on each route (title, description, og)

**Phase 2: storage types + commercial pages**
- Services, Pricing, Offers, Personal/Business/Student/Secure storage, Boxes & Packaging, Insurance, Refer a Friend, Contact, Space Estimator, Storage Size, Get a Quote (redirect)

**Phase 3: legal + SEO polish**
- Privacy, Cookies, Terms, Special Conditions, Big Protect policy
- Sitemap.xml route listing every URL
- Trailing-slash 301 middleware
- JSON-LD LocalBusiness on home + Article on guides

## Design improvements (kept consistent with booking flow)
- Use existing `#0b3a8c` brand blue + design tokens already in the app
- Replace WordPress's generic stock template with a cleaner, more modern editorial layout
- Real photography placeholders we can swap later
- Mobile-first, fast (no WP bloat)

## Reversibility
Old WordPress site remains live at the current host until DNS flips. Every route we add is a single file — deletable in minutes. Booking flow under `_authenticated/book/*` is completely untouched.

## This turn deliverable
Phase 1 only: marketing shell + Home, About, How It Works, Smart Entry + internal nav. You'll be able to click around the whole top of the site in preview. Phase 2/3 follow once you've reviewed the look.
