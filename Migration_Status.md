# Green Drop Garage — Migration Status Report
_Last updated: April 8, 2026_

---

## ✅ Done / In Good Shape

| Item | Notes |
|---|---|
| **URL scheme** (`/services/{service}`, `/locations/{location}`, `/services/{service}/{location}`) | Route structure fully functional. |
| **301 Redirects** (legacy Duda URLs → new canon) | **FIXED & HARDENED**: `trailingSlash: true` enabled to match Duda exactly. |
| **Slug normalization** (`oil-change` → `oil-changes`, etc.) | Verified across all main repair categories. |
| **Locations Page** | **RESTORED**: Collision fixed, professional map & grid live. |
| **Home page** | Built, live, and stabilized. |
| **Services pages** | Route exists including service × location. |
| **Contact, Careers, Reviews, Warranty** | Pages exist, stabilized, and deployed. |
| **Blog / Posts** | **CANONICAL**: Moved back to `/blog` (removed `/posts` workaround). |
| **Memberships** | **CANONICAL**: Moved back to `/memberships` (removed `/member` workaround). |

---

## ⚠️ Still Needs Attention

### 1. Canonical URL Clean-up (COMPLETE)
We have successfully restored the professional paths for `/blog/` and `/memberships/`. 
- **Action Taken**: Excluded these slugs from the top-level dynamic route and updated `next.config.mjs` to redirect the old "workaround" paths back to these canonical versions.

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

### 4. Add 301 redirects for legacy routes (COMPLETE)
Hardened all redirects in `next.config.mjs`.
- **Action Taken**: Enabled `trailingSlash: true` to match exact Duda URL structures, preventing 404s for users arriving from old search results or bookmarks.

---

## 🗺️ The Big Picture

The migration scaffolding is in solid shape — the URL structure, Sanity content models, and redirect strategy are all well-architected per the Migration Plan. What remains is:

1. **Content verification** — Confirm real content is live in Sanity for all pages
2. **URL cleanup** — Restore `/blog` and `/memberships` to their canonical paths
3. **Small outstanding items** — Loaner Cars form, St. Johns reviews widget
4. **SEO gap-fill** — Ensure service × location pages have unique copy

You're close to a clean finish line. The foundation is done.
