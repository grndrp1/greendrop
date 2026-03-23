# Green Drop Garage — Sanity Migration & URL Strategy

This spec makes sure every local service page is unique, local, and conversion-focused, while the membership content is simplified into one strong page instead of being spread across many weaker ones. That’s better for SEO, easier to manage, and clearer for customers.

## 1) Recommended Final URL Scheme (with brief SEO rationale)
- **Service pages:** `/services/{service}/`
- **Location pages:** `/locations/{location}/`
- **Service × Location pages (canonical):** `/services/{service}/{location}/`

**Why:** People search by service first (e.g., “brakes Portland”). This structure groups all services together, scales cleanly, and makes internal linking, breadcrumbs, and schema consistent.

## 2) SEO-Friendly Slug Normalization
- Pick one slug per service and use it everywhere to avoid duplicates.
- Examples of normalization used: `oil-change` → `oil-changes`, `maintenance` → `service-maintenance`.
- Keep slugs lowercase, hyphenated, and short. This prevents duplicate content and simplifies redirects.

## 3) Legacy Service Pages & Normalization
- The current site has a few legacy service slugs under `/location/*/*` that don’t match `/services/*`.
- Those legacy slugs are mapped to the canonical service slugs above.
- Membership pages are consolidated to a single `/memberships` page instead of per-location versions.

## 4) How We Get All URLs (Crawl Strategy)
- **Primary:** Custom Antigravity script to crawl the site and fetch pages.
- **Secondary:** Screaming Frog to crawl and export all internal HTML URLs.
- **Fallback:** Use https://www.greendropgarage.com/sitemap.xml if crawling is blocked.
- For this project, the `sitemap.xml` was used to establish the initial URL inventory.

## 5) How Antigravity Extracts Content
- Antigravity runs a script to fetch each page’s HTML.
- It extracts: title, meta description, H1, main content, and structured fields.
- For location pages, it also extracts: address, phone number, and hours.
- The script then prepares this data in a clean, structured format for Sanity.

## 6) Sanity Content Models
- `location`: one document per shop (name, slug, address, phone, hours, etc.).
- `service`: one document per service (name, slug, description, SEO fields).
- `serviceLocation`: links one service to one location (used for `/services/{service}/{location}/` pages).
- `page`: for general content pages like About, Membership, etc.

## 7) NDJSON Output for Sanity CLI
- The migration script outputs NDJSON (one JSON document per line).
- Files are split by type: `locations.ndjson`, `services.ndjson`, `serviceLocations.ndjson`, `pages.ndjson`.
- This format is directly compatible with the Sanity CLI import command.

## 8) Old URL → New URL Mapping (Redirect Planning)
- The script also outputs a CSV mapping file: `old_url` → `new_url`.
- This is used to build 301 redirects in Next.js/Vercel.
- The crawler includes retries, basic rate limiting, and logging so failures are visible and recoverable.

## 9) Deterministic IDs (So Imports Are Safe to Re-Run)
- Each document uses a predictable ID based on its slug(s).
- Examples: `location--central`, `service--brakes`, `serviceLocation--brakes--central`.
- Because IDs are deterministic, re-importing will update existing docs instead of creating duplicates.

## 10) How to Import into Sanity (Quick)
- Install and configure the Sanity CLI for the project.
- Import in this order: Locations → Services → ServiceLocations → Pages.
- Example: `sanity dataset import sanity_locations.ndjson production`
- Repeat for each file. After import, verify references and publish.
