const puppeteer = require('puppeteer');
const { createClient } = require('@sanity/client');

// Initialize Sanity Client for patching
const sanityClient = createClient({
    projectId: 'i2own2jr',
    dataset: 'production',
    apiVersion: '2024-02-27',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN, // Ensure this is set when running
});

const baseUrl = 'https://www.greendropgarage.com';

// Same mapping variables from Python script
const LOCATION_PAGES = {
    "central": "/central-garage/",
    "mlk": "/mlk-garage/",
    "moreland": "/moreland-garage/",
    "st-johns": "/st-johns-garage/",
    "uptown": "/uptown-garage/",
    "vancouver": "/vancouver-garage/",
};

const SERVICE_PAGES = {
    "ac-service": "/services/ac-service/",
    "auto-repair": "/services/engine-repairs/",
    "brakes": "/services/brakes/",
    "diagnostics": "/services/engine-repairs/",
    "exhaust-systems": "/services/exhaust-systems/",
    "oil-changes": "/services/oil-changes/",
    "service-maintenance": "/services/service-maintenance/",
    "tires": "/services/tires/",
    "transmissions": "/services/transmissions/",
};

const LEGACY_SERVICE_SLUGS = {
    "ac-service": "maintenance",
    "auto-repair": "auto-repair",
    "brakes": "brakes",
    "diagnostics": "diagnostics",
    "oil-changes": "oil-change",
    "service-maintenance": "maintenance",
    "tires": "maintenance",
    "transmissions": "maintenance",
};

async function extractHtml(page, url) {
    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });

        // Let's try to extract the main content container specifically, skipping the header/footer
        const html = await page.evaluate(() => {
            // Find the main content area - usually inside elementor on WP sites
            const contentContainers = document.querySelectorAll('.elementor-location-archive, .elementor-location-single, main, #main, .page-content');

            for (let el of contentContainers) {
                // Return the first valid one we find
                if (el.innerHTML.trim().length > 100) {
                    // Slight cleanup: remove any nested header/footers if they exist
                    const temp = el.cloneNode(true);
                    temp.querySelectorAll('header, footer, nav, .elementor-location-header, .elementor-location-footer, [data-elementor-type="header"], [data-elementor-type="footer"], .has_eae_slider').forEach(n => n.remove());
                    return temp.innerHTML.trim();
                }
            }

            // Fallback: just return the entire body innerHTML if we can't find a specific main tag
            const body = document.querySelector('body').cloneNode(true);
            body.querySelectorAll('header, footer, script, style, noscript, nav, .elementor-location-header, .elementor-location-footer, [data-elementor-type="header"], [data-elementor-type="footer"], .has_eae_slider').forEach(n => n.remove());
            return body.innerHTML.trim();
        });

        return html;
    } catch (e) {
        console.error(`Failed to extract ${url}:`, e.message);
        return null;
    }
}

async function scrapeAndPatch() {
    if (!process.env.SANITY_API_TOKEN) {
        console.error("FATAL: SANITY_API_TOKEN environment variable is not set. Cannot patch.");
        return;
    }

    console.log('Querying Sanity for all documents...');
    const docs = await sanityClient.fetch(`*[_type in ["location", "service", "serviceLocation", "page"]]`);
    console.log(`Found ${docs.length} total documents.`);

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    let successCount = 0;

    for (const doc of docs) {
        let path = null;

        if (doc._type === 'location') {
            path = LOCATION_PAGES[doc.slug?.current];
        } else if (doc._type === 'service') {
            path = SERVICE_PAGES[doc.slug?.current];
        } else if (doc._type === 'page') {
            path = `/${doc.slug?.current}/`;
        } else if (doc._type === 'serviceLocation') {
            const parts = doc._id.replace("serviceLocation--", "").split("--");
            if (parts.length >= 2) {
                const service_slug = parts[0];
                const location_slug = parts.slice(1).join("--");
                const legacy_service = LEGACY_SERVICE_SLUGS[service_slug] || service_slug;
                path = `/location/${location_slug}/${legacy_service}/`;
            }
        }

        if (!path) {
            console.log(`Skipping doc [${doc._type}] ${doc._id} - no valid path found.`);
            continue;
        }

        const url = baseUrl + path;
        const rawHtml = await extractHtml(page, url);

        if (rawHtml && rawHtml.length > 50) {
            try {
                await sanityClient.patch(doc._id).set({ rawHtml }).commit();
                console.log(`✅ Patched [${doc._type}] ${doc._id}`);
                successCount++;
            } catch (err) {
                console.error(`❌ Failed to patch ${doc._id}: ${err.message}`);
            }
        } else {
            // We might get 404s for some service location combos
            console.log(`⚠️ No html extracted for ${url}`);
        }

        // Sleep 1s to be nice
        await new Promise(r => setTimeout(r, 1000));
    }

    await browser.close();
    console.log(`\nFinished! Successfully patched ${successCount} documents.`);
}

scrapeAndPatch();
