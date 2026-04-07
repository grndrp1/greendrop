# Green Drop Garage — Migration Status Report
_Last updated: April 6, 2026_

---

## ✅ Done / In Good Shape

| Item | Notes |
|---|---|
| **URL scheme** (`/services/{service}`, `/locations/{location}`, `/services/{service}/{location}`) | Route structure exists in `src/app/services` and `src/app/locations` |
| **Redirects** (legacy `/location/*` → new canonical paths) | Built into `next.config.mjs` |
| **Slug normalization** (`oil-change` → `oil-changes`, etc.) | Redirects handle this |
| **NDJSON files generated** (locations, services, serviceLocations, pages) | `sanity_*_enriched.ndjson` files exist in `/greendrop` |
| **Sanity content models** (location, service, serviceLocation, page) | Schema types exist |
| **Home page** | Built and live |
| **Locations pages** | Route exists, appears populated |
| **Services pages** | Route exists including service × location |
| **Contact, Careers, Reviews, Warranty** | Pages exist and deployed |
| **Blog / Posts** | Migrated — temporarily renamed to `/posts` due to routing conflict |
| **Memberships** | Migrated — temporarily renamed to `/member` due to routing conflict |

---

## ⚠️ Still Needs Attention

### 1. Restore canonical URLs for Blog and Memberships
The blog and memberships pages were renamed to `/posts` and `/member` as a workaround for a slug-clash with Sanity's dynamic catch-all route (`[slug]/page.tsx`). These need to go back to their proper URLs:
- `/blog` (not `/posts`)
- `/memberships` (not `/member`)

The right fix is to resolve why the dynamic route is overriding static Next.js routes for these slugs — likely because a Sanity `page` document exists with those same slugs. The solution is to either **delete those Sanity page documents** or explicitly exclude them in `generateStaticParams`.

### 2. Sanity content import verification
The NDJSON files were generated but confirm all data was actually **imported and published** in Sanity Studio:
- 6 location documents
- 8 service documents
- ~48 service × location combo documents
- General pages (About, Contact, etc.)

Check Sanity Studio at `studio.sanity.io` or `localhost:3333`.

### 3. Service × Location page content quality
The route `/services/{service}/{location}/` exists, but verify these pages have **real, unique, SEO-rich content** per location rather than generic placeholders. Thin or duplicate content across locations will hurt SEO.

### 4. Loaner Cars — form placeholder
The Loaner Cars page currently shows `[ FORM WILL APPEAR HERE ]` instead of the actual form embed. The real HTML embed code needs to be added to this page in Sanity.

### 5. Reviews page — St. Johns widget ID
The Elfsight review widget for the **St. Johns** location is using a placeholder or incorrect `widgetId` in Sanity. Needs to be updated with the correct Elfsight embed ID.

### 6. Add 301 redirects for renamed routes
Since `/blog` and `/memberships` were renamed, old URLs need explicit redirects in `next.config.mjs` to preserve SEO equity:
- `/blog` → `/posts`
- `/memberships` → `/member`

Without these, any inbound links or search engine indexing for the old URLs will hit a 404.

---

## 🗺️ The Big Picture

The migration scaffolding is in solid shape — the URL structure, Sanity content models, and redirect strategy are all well-architected per the Migration Plan. What remains is:

1. **Content verification** — Confirm real content is live in Sanity for all pages
2. **URL cleanup** — Restore `/blog` and `/memberships` to their canonical paths
3. **Small outstanding items** — Loaner Cars form, St. Johns reviews widget
4. **SEO gap-fill** — Ensure service × location pages have unique copy

You're close to a clean finish line. The foundation is done.
