# Green Drop Garage: Discovery & Architecture Report

## Executive Summary (Client Overview)

Welcome to the Discovery and Architecture phase of the Green Drop Garage website rebuild! Our goal with this project is to take your existing website and upgrade it from the restrictive Duda platform to a lightning-fast, highly customizable modern web stack. We have thoroughly analyzed the current site, mapped out the new data structure, and established the technical foundation that will power GreenDrop Garage for years to come.

### Why We Are Rebuilding Section-By-Section
During our initial technical discovery, we analyzed the existing Duda website code to see if we could simply "copy and paste" the design over to the new system. We discovered that Duda uses a very closed-off, convoluted way of generating code. The HTML is deeply tangled with proprietary "widget" code, and their styling approach causes severe CSS rendering issues and broken animations when moved outside of their ecosystem. Because of this, trying to force Duda's messy code into our clean new system would result in a fragile website that is hard to update and prone to visual bugs. 

Instead, we are doing it the right way: **we are manually rebuilding the website section by section**. We take the visual design you already love and recreate it from scratch using modern, clean code (React and Tailwind CSS). This ensures the website will be incredibly fast, pixel-perfect, and fully responsive across all mobile devices without any of Duda's original baggage.

### The "Gold Standard" Content Management System
A major focus of this architecture is giving you total control over your content. We are implementing the "Gold Standard" of headless CMS architecture using Sanity Studio. 

In older website builders, changing a page meant wrestling with a clunky visual editor or risking breaking the design. For Green Drop Garage, we have engineered a **Modular Page Builder**. Instead of giving you a massive blank text box, we have broken the website down into smart building blocks (e.g., a "Customer Reviews Block", a "Services Highlight Block", a "Welcome Block"). 

If you want to create a new promotional landing page, you simply open your Sanity dashboard, click "Add Block," and stack these pre-designed sections like Lego bricks. They will instantly render on the live website looking perfect every time. We've also created a single "Site Settings" area where you can update global information—like your footer address or ASE logos—once, and it instantly syncs across the entire platform.

### Protecting Your SEO: URL Mapping 
A critical part of taking a new website live is ensuring you do not lose any existing Google search rankings. The current routing on the site is slightly fragmented, particularly with legacy service pages nested under location URLs. 

We have developed a comprehensive URL mapping strategy. We are consolidating all services into clean, logical paths (e.g., `/services/oil-changes`). Our migration script automatically crawls your current sitemap, captures every single old URL, and pairs it with its new equivalent. When we launch the new site, we will deploy a master list of permanent "301 Redirects." This tells Google exactly where the pages moved, instantly passing all your hard-earned SEO authority to the new, faster pages so your search traffic doesn't skip a beat.

---

## Technical Architecture & Implementation Details

For the engineering and development side, this section provides a deeper dive into the exact technical implementations, data modeling, and migration scripts determined during the discovery phase.

### 1. The Stack
The platform is being decoupled into a modern headless architecture:
*   **Frontend:** Next.js (App Router), React, and Tailwind CSS.
*   **Backend/CMS:** Sanity.io (Headless CMS).
*   **Hosting:** Vercel (for edge caching, automated CI/CD deployments, and native Next.js image optimization).

### 2. Duda DOM & CSS Limitations
Duda utilizes a drag-and-drop WYSIWYG editor that outputs heavily nested, non-semantic DOM trees (`div` soup) injected with proprietary widget classes (e.g., `dm:widget`, `dmInner`).
*   **CSS Rendering Conflicts:** Duda relies on globally injected stylesheet assets tied to specific element IDs that disappear or break when scraped. Furthermore, their responsive breakpoints rely on hardcoded inline styles injected via JavaScript.
*   **Animation Quirks:** The existing site utilizes scroll-linked fade-in animations reliant on proprietary Duda JS libraries. Extracting the raw HTML retains `opacity: 0` states, causing content to be permanently invisible in a standard React environment.
*   **Action Plan:** Direct DOM extraction for UI components is unviable. The UI components (Hero sections, Trust Banners, Service highlighting) are being manually rebuilt as modular React functional components using Tailwind CSS. This guarantees clean markup, improved Core Web Vitals, and strict accessibility compliance.

### 3. Sanity "Gold Standard" Architecture
We are implementing a dual-pattern Sanity architecture prioritizing both global state management and modular page composition.

*   **Singleton Global Settings:** We have configured a custom Sanity Structure builder to isolate `siteSettings` as a singleton document at the root level. This handles global state (Header navigation, footer contacts, default fallback SEO, and Trust Banner logos) avoiding prop-drilling by fetching this data concurrently in the Next.js root layout.
*   **Modular Page Builder (Block Architecture):** Traditional rich-text editors degrade design integrity. We are utilizing Sanity's array of objects to map directly to React components. The `page` schema includes a `pageBuilder` field accepting specific block schemas (`blockCustomerReviews`, `blockServicesHighlight`, `blockWelcome`). 
*   **Component Resolution:** On the Next.js side, a highly efficient `<BlockRenderer />` component dynamically iterates over the GROQ-fetched `pageBuilder` array. It matches the `_type` coming from Sanity to the corresponding React component, passing the highly typed Sanity data directly in as props.

### 4. Headless Data Modeling
The core business models have been normalized for scalability:
*   `location`: Documents governing distinct physical shops (Vancouver, Uptown, etc.). Contains geo-data, hours, and contact info.
*   `service`: Documents governing specific offerings (Brakes, Oil Changes). Contains descriptions, iconography, and overarching SEO.
*   `page`: General marketing and routing pages.

By normalizing this data, we can dynamically generate the required location-specific service pages (e.g., `/services/oil-changes/vancouver`) by querying intersecting relationships, rather than duplicating data entry.

### 5. Programmatic Content Migration & Redirect Strategy
To transition the legacy content to the new Headless CMS, we are avoiding manual data entry in favor of a programmatic ETL (Extract, Transform, Load) pipeline.

*   **Extraction:** A custom Node.js web scraper (`scrape_full_html.js`) utilizes Cheerio to traverse the live `sitemap.xml`. It targets specific DOM selectors to extract the canonical H1s, Meta descriptions, and raw body text, bypassing the Duda visual wrappers.
*   **Transformation:** We implemented basic string matching and regex normalization on the slugs to ensure consistency (e.g., normalizing `/service-maintenance` and `/oil-change`). Legacy location-nested service URLs are mapped cleanly to the new structure.
*   **Load (Sanity CLI):** The script outputs strictly formatted `NDJSON` (Newline Delimited JSON) files, generating deterministic `_id` fields based on localized slugs (e.g., `location--vancouver`). This allows us to safely and idempotently run `sanity dataset import` multiple times without duplicating database rows.
*   **Redirect Maps:** Concurrently, the script outputs a CSV mapping the absolute legacy URLs to the new relative Next.js paths. This map is compiled directly into the Next.js configuration `redirects()` async function, executing ultra-fast HTTP 301 server-side redirects at the edge, fully preserving Link Equity and user bookmarks.
