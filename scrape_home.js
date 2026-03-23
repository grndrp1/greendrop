const puppeteer = require('puppeteer');
const { createClient } = require('@sanity/client');

// Initialize Sanity Client
const sanityClient = createClient({
    projectId: process.env.SANITY_PROJECT_ID || 'i2own2jr',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-02-27',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

async function extractHtml(page, url) {
    try {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });

        // Let's extract the main elementor wrapper, ignoring header/footers
        const html = await page.evaluate(() => {
            const wrapper = document.querySelector('.elementor-location-archive, .elementor-location-single, main, #main, .page-content, .elementor-type-wp-page');
            if (wrapper) {
                const temp = wrapper.cloneNode(true);
                temp.querySelectorAll('header, footer, nav, .elementor-location-header, .elementor-location-footer, [data-elementor-type="header"], [data-elementor-type="footer"], .has_eae_slider').forEach(n => n.remove());
                return temp.innerHTML.trim();
            }

            const body = document.querySelector('body').cloneNode(true);
            body.querySelectorAll('header, footer, script, style, noscript, nav, .elementor-location-header, .elementor-location-footer, [data-elementor-type="header"], [data-elementor-type="footer"], .has_eae_slider').forEach(n => n.remove());
            return body.innerHTML.trim();
        });

        // Also extract some SEO metadata for good measure
        const meta = await page.evaluate(() => {
            return {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.content || ''
            };
        });

        return { html, meta };
    } catch (e) {
        console.error(`Failed to extract ${url}:`, e.message);
        return { html: null, meta: {} };
    }
}

async function scrapeHome() {
    if (!process.env.SANITY_API_TOKEN) {
        console.error("FATAL: SANITY_API_TOKEN environment variable is not set.");
        return;
    }

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    const { html, meta } = await extractHtml(page, 'https://www.greendropgarage.com/');

    if (html && html.length > 50) {
        try {
            const doc = {
                _type: 'page',
                _id: 'page--home',
                title: 'Home',
                pageType: 'landing',
                slug: { _type: 'slug', current: 'home' },
                seoTitle: meta.title,
                seoDescription: meta.description,
                rawHtml: html
            };
            await sanityClient.createOrReplace(doc);
            console.log(`✅ Created/Patched Homepage Sanity Document!`);
        } catch (err) {
            console.error(`❌ Failed to patch homepage: ${err.message}`);
        }
    } else {
        console.log(`⚠️ No html extracted for homepage`);
    }

    await browser.close();
}

scrapeHome();
