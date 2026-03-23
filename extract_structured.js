/**
 * extract_structured.js
 *
 * Parses each siteFiles/*.html file to extract structured hero data:
 *   - Hero background image URL (from inline background-image style)
 *   - Hero h1 / title text
 *   - Hero subtitle text (first paragraph in hero section)
 *   - CTA button text and URL
 *
 * Then patches these fields into the corresponding Sanity documents.
 *
 * Usage: SANITY_API_TOKEN=xxx node extract_structured.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@sanity/client');

const sanityClient = createClient({
    projectId: process.env.SANITY_PROJECT_ID || 'i2own2jr',
    dataset: process.env.SANITY_DATASET || 'production',
    apiVersion: '2024-02-27',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

const SITE_FILES_DIR = path.join(__dirname, 'siteFiles');

// Maps Sanity document IDs to local HTML files and document type
const FILE_MAP = [
    // Homepage
    { id: 'page--home', file: 'index.html', type: 'page' },

    // Location pages
    { id: 'location--central', file: 'central-garage.html', type: 'location' },
    { id: 'location--mlk', file: 'mlk-garage.html', type: 'location' },
    { id: 'location--moreland', file: 'moreland-garage.html', type: 'location' },
    { id: 'location--st-johns', file: 'st-johns-garage.html', type: 'location' },
    { id: 'location--uptown', file: 'uptown-garage.html', type: 'location' },
    { id: 'location--vancouver', file: 'vancouver-garage.html', type: 'location' },

    // Service pages
    { id: 'service--ac-service', file: 'services/ac-service.html', type: 'service' },
    { id: 'service--brakes', file: 'services/brakes.html', type: 'service' },
    { id: 'service--auto-repair', file: 'services/engine-repairs.html', type: 'service' },
    { id: 'service--exhaust-systems', file: 'services/exhaust-systems.html', type: 'service' },
    { id: 'service--oil-changes', file: 'services/oil-changes.html', type: 'service' },
    { id: 'service--service-maintenance', file: 'services/service-maintenance.html', type: 'service' },
    { id: 'service--tires', file: 'services/tires.html', type: 'service' },
    { id: 'service--transmissions', file: 'services/transmissions.html', type: 'service' },
];

/**
 * Extract a background-image URL from an inline style string.
 * Handles: background-image:url(...), url('../lirp.cdn-website.com/...'), etc.
 */
function extractBgImageFromStyle(styleStr) {
    if (!styleStr) return null;
    const match = styleStr.match(/background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
    if (!match) return null;
    let url = match[1];
    // Fix relative CDN paths
    url = url.replace(/^\.\.\/lirp\.cdn-website\.com\//, 'https://lirp.cdn-website.com/');
    url = url.replace(/^\.\.\/irp\.cdn-website\.com\//, 'https://lirp.cdn-website.com/');
    // Ignore placeholder 1x1 base64 images
    if (url.startsWith('data:image')) return null;
    // Ignore svg/icon images that are small
    if (url.includes('.svg')) return null;
    return url;
}

/**
 * Extract structured hero data from a Duda HTML file.
 */
function extractHeroData($) {
    let heroImageUrl = null;
    let heroTitle = null;
    let heroSubtitle = null;
    let heroCtaText = null;
    let heroCtaUrl = null;

    // ── Hero image: look for the first dmRespRow with a background-image ──
    // Duda puts hero images as background-image on dmRespRow sections
    $('[style]').each((i, el) => {
        if (heroImageUrl) return false; // stop once found
        const style = $(el).attr('style') || '';
        const url = extractBgImageFromStyle(style);
        if (url && url.includes('cdn-website.com')) {
            heroImageUrl = url;
        }
    });

    // Also check CSS in <style> tags for section background-images
    if (!heroImageUrl) {
        $('head style, body style').each((i, el) => {
            if (heroImageUrl) return false;
            const css = $(el).html() || '';
            // Find url() with CDN image that's not an icon/svg
            const matches = [...css.matchAll(/background(?:-image)?\s*:[^;]*url\(['"]?([^'")\s,]+)['"]?\)/gi)];
            for (const m of matches) {
                const url = m[1];
                if (url && url.includes('cdn-website.com') && !url.includes('.svg') && !url.startsWith('data:')) {
                    let fixedUrl = url.replace(/^\.\.\/lirp\.cdn-website\.com\//, 'https://lirp.cdn-website.com/');
                    fixedUrl = fixedUrl.replace(/^\.\.\/irp\.cdn-website\.com\//, 'https://lirp.cdn-website.com/');
                    heroImageUrl = fixedUrl;
                    break;
                }
            }
        });
    }

    // ── Hero title: the first h1 on the page ──
    const h1 = $('h1').first();
    if (h1.length) {
        heroTitle = h1.text().trim().replace(/\s+/g, ' ');
    }

    // If no h1, look for large text paragraphs in the hero area
    if (!heroTitle) {
        // Duda often renders hero headlines as styled paragraphs with font-size classes
        $('.dmNewParagraph p, [data-element-type="paragraph"] p').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 10 && text.length < 200) {
                if (!heroTitle) heroTitle = text;
                return false;
            }
        });
    }

    // ── Hero subtitle: green text / second prominent text ──
    $('h2, h3').each((i, el) => {
        if (heroSubtitle) return false;
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length > 5 && text.length < 200) {
            heroSubtitle = text;
        }
    });

    // ── CTA button: the first lime-green / primary button ──
    // Duda buttons often have class dmWidget or are <a> tags with button styling
    $('a.dmWidget, a[class*="btn"], a[data-widget-type="button"]').each((i, el) => {
        if (heroCtaText) return false;
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        const href = $(el).attr('href') || $(el).attr('runtime_url') || '';
        if (text && !text.toLowerCase().includes('login') && !text.toLowerCase().includes('portal')) {
            heroCtaText = text;
            if (href && !href.startsWith('javascript')) {
                // Convert relative Duda URLs to absolute
                if (href.startsWith('/') || href.startsWith('http')) {
                    heroCtaUrl = href.startsWith('http') ? href : `https://www.greendropgarage.com${href}`;
                } else {
                    heroCtaUrl = `https://www.greendropgarage.com/${href}`;
                }
            } else {
                heroCtaUrl = 'https://www.greendropgarage.com/contact';
            }
        }
    });

    return { heroImageUrl, heroTitle, heroSubtitle, heroCtaText, heroCtaUrl };
}

async function run() {
    if (!process.env.SANITY_API_TOKEN) {
        console.error('FATAL: SANITY_API_TOKEN not set.');
        process.exit(1);
    }

    let success = 0, skipped = 0, errors = 0;

    for (const { id, file, type } of FILE_MAP) {
        const fullPath = path.join(SITE_FILES_DIR, file);
        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️  File not found: ${file}`);
            skipped++;
            continue;
        }

        const html = fs.readFileSync(fullPath, 'utf-8');
        const $ = cheerio.load(html);
        const heroData = extractHeroData($);

        // Log what we found
        const found = Object.entries(heroData)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ');
        console.log(`\n📄 ${file}`);
        console.log(`   Extracted: ${found || 'nothing'}`);
        if (heroData.heroTitle) console.log(`   → title: "${heroData.heroTitle.substring(0, 60)}"`);
        if (heroData.heroImageUrl) console.log(`   → image: ${heroData.heroImageUrl.substring(0, 80)}`);

        // Only patch fields that were found
        const patch = Object.fromEntries(
            Object.entries(heroData).filter(([, v]) => v != null)
        );

        if (Object.keys(patch).length === 0) {
            console.log(`   ⚠️  Nothing to patch`);
            skipped++;
            continue;
        }

        try {
            await sanityClient.patch(id).set(patch).commit();
            console.log(`   ✅ Patched [${type}] ${id}`);
            success++;
        } catch (err) {
            console.error(`   ❌ Failed ${id}: ${err.message}`);
            errors++;
        }
    }

    console.log(`\n\nDone! ✅ ${success} patched, ⚠️ ${skipped} skipped, ❌ ${errors} errors.`);
}

run();
