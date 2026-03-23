/**
 * parse_local_html.js
 *
 * Reads local HTML files from siteFiles/, extracts only the main body content
 * (strips header, footer, scripts, styles), and patches Sanity documents.
 *
 * The site is built with Duda CMS. The structure is:
 *   #site_content > .dmHeaderContainer (header - strip this)
 *   #site_content > #dm-outer-wrapper .dmBody (main content - keep this)
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

// Maps Sanity document IDs (or slug patterns) to local HTML files
const FILE_MAP = [
    // Homepage
    { id: 'page--home', file: 'index.html', type: 'home' },

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
    { id: 'service--diagnostics', file: 'services/engine-repairs.html', type: 'service' },
    { id: 'service--exhaust-systems', file: 'services/exhaust-systems.html', type: 'service' },
    { id: 'service--oil-changes', file: 'services/oil-changes.html', type: 'service' },
    { id: 'service--service-maintenance', file: 'services/service-maintenance.html', type: 'service' },
    { id: 'service--tires', file: 'services/tires.html', type: 'service' },
    { id: 'service--transmissions', file: 'services/transmissions.html', type: 'service' },

    // General pages
    { id: 'page--blog', file: 'blog.html', type: 'page' },
    { id: 'page--business-car-care', file: 'business-car-care.html', type: 'page' },
    { id: 'page--business-truck-suv-care', file: 'business-truck-suv-care.html', type: 'page' },
    { id: 'page--business', file: 'business.html', type: 'page' },
    { id: 'page--careers', file: 'careers.html', type: 'page' },
    { id: 'page--contact', file: 'contact.html', type: 'page' },
    { id: 'page--fleet-care', file: 'fleet-care.html', type: 'page' },
    { id: 'page--grand-opening-bash-on-saturday-july-27th', file: 'grand-opening-bash-on-saturday-july-27th.html', type: 'page' },
    { id: 'page--green-driving-tips', file: 'green-driving-tips.html', type: 'page' },
    { id: 'page--image-credits', file: 'image-credits.html', type: 'page' },
    { id: 'page--keep-cool-the-importance-of-regular-a-c-services-for-your-vehicle', file: 'keep-cool-the-importance-of-regular-a-c-services-for-your-vehicle.html', type: 'page' },
    { id: 'page--keep-your-cool-expert-a-c-services-at-green-drop-garage-in-portland-and-vancouver', file: 'keep-your-cool-expert-a-c-services-at-green-drop-garage-in-portland-and-vancouver.html', type: 'page' },
    { id: 'page--loaner-car', file: 'loaner-car.html', type: 'page' },
    { id: 'page--locations', file: 'locations.html', type: 'page' },
    { id: 'page--memberships', file: 'memberships.html', type: 'page' },
    { id: 'page--oxygen-sensors-are-critical', file: 'oxygen-sensors-are-critical.html', type: 'page' },
    { id: 'page--replace-front-axle-seal', file: 'replace-front-axle-seal.html', type: 'page' },
    { id: 'page--returns', file: 'returns.html', type: 'page' },
    { id: 'page--reviews', file: 'reviews.html', type: 'page' },
    { id: 'page--terms-conditions', file: 'terms-conditions.html', type: 'page' },
    { id: 'page--the-cheetah', file: 'the-cheetah.html', type: 'page' },
    { id: 'page--the-couve', file: 'the-couve.html', type: 'page' },
    { id: 'page--the-evaporative-emissions-control-system', file: 'the-evaporative-emissions-control-system.html', type: 'page' },
    { id: 'page--the-ultimate-30k-60k-90k-service-guide-why-your-car-needs-it', file: 'the-ultimate-30k-60k-90k-service-guide-why-your-car-needs-it.html', type: 'page' },
    { id: 'page--warranty', file: 'warranty.html', type: 'page' },
    { id: 'page--what-do-doctors-and-technicians-have-in-common', file: 'what-do-doctors-and-technicians-have-in-common.html', type: 'page' },
    { id: 'page--services', file: 'services.html', type: 'page' },
    { id: 'page--privacy', file: 'privacy.html', type: 'page' },
];

/**
 * Extracts the main body content from Duda CMS HTML.
 * Strips header, scripts, styles, and Duda system elements.
 */
function extractBodyContent(html) {
    const $ = cheerio.load(html);

    // --- Extract all inline styles from the <head> ---
    // Duda stores all layout/component CSS in <style> tags in the head.
    // We need to pull these out and inject them alongside the content.
    const headStyles = [];
    $('head style').each((i, el) => {
        const styleContent = $(el).html();
        if (styleContent && styleContent.trim().length > 10) {
            headStyles.push(styleContent.trim());
        }
    });

    // Also extract CSS variable definitions from the head which are critical for colors
    const cssVariablesStyle = $('head #cssVariables, head #criticalCss, head #forceCssIncludes, head #fontFallbacks').map((i, el) => {
        return $(el).html();
    }).get().join('\n');

    // Remove script and style tags from body processing
    $('script, noscript, link[rel="stylesheet"]').remove();

    // Remove the header container
    $('.dmHeaderContainer, .fHeader, #hcontainer, .d-header-wrapper').remove();

    // Remove Duda-specific footer
    $('.dmFooter, .dmFooterResp, .p_footer, #footer').remove();

    // Remove popup masks
    $('.dmPopupMask, .dmPopup').remove();

    // Try to find the body content wrapper. Duda wraps it in .dmBody
    let contentEl = $('.dmBody');

    if (!contentEl.length || contentEl.html().trim().length < 100) {
        // Fallback: grab #site_content
        contentEl = $('#site_content');
    }

    if (!contentEl.length || contentEl.html().trim().length < 100) {
        // Last fallback : grab #dm-outer-wrapper
        contentEl = $('#dm-outer-wrapper');
    }

    if (!contentEl.length) {
        return null;
    }

    // Fix relative image URLs to point to the CDN
    contentEl.find('img[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (src && src.startsWith('../lirp.cdn-website.com/')) {
            $(el).attr('src', 'https://' + src.replace('../', ''));
        } else if (src && src.startsWith('../irp.cdn-website.com/')) {
            $(el).attr('src', 'https://lirp.cdn-website.com/' + src.replace('../irp.cdn-website.com/', ''));
        }
    });

    // Fix background images in inline styles
    contentEl.find('[style]').each((i, el) => {
        let style = $(el).attr('style') || '';
        style = style.replace(/url\(\.\.\/lirp\.cdn-website\.com\//g, 'url(https://lirp.cdn-website.com/');
        style = style.replace(/url\(\.\.\/irp\.cdn-website\.com\//g, 'url(https://lirp.cdn-website.com/');
        $(el).attr('style', style);
    });

    let bodyHtml = contentEl.html() || '';
    bodyHtml = bodyHtml.replace(/url\(['"]?\.\.\/lirp\.cdn-website\.com\//g, "url('https://lirp.cdn-website.com/");
    bodyHtml = bodyHtml.replace(/url\(['"]?\.\.\/irp\.cdn-website\.com\//g, "url('https://lirp.cdn-website.com/");

    // Prepend ALL head styles (deduplicated) so Duda layout renders correctly
    const allStyles = headStyles.join('\n');
    const combinedCss = allStyles
        .replace(/url\(\.\.\/lirp\.cdn-website\.com\//g, 'url(https://lirp.cdn-website.com/')
        .replace(/url\(\.\.\/irp\.cdn-website\.com\//g, 'url(https://lirp.cdn-website.com/');

    // Wrap with the exact Duda DOM structure that all CSS selectors depend on.
    // Duda scopes ALL its CSS under #dmRoot, #dm, .dmDesktopBody, .dmLargeBody, .responsiveTablet.
    // Without these ancestor IDs/classes, NONE of the font, layout, or color rules will match.
    const finalHtml = `
<style>${combinedCss}</style>
<div id="dmRoot" class="dmRoot dmDesktopBody dmLargeBody responsiveTablet fix-mobile-scrolling">
  <div id="dm" class="dmwr">
    <div class="dm_wrapper standard-var5 widgetStyle-3 standard">
      <div class="standardHeaderLayout dm-bfs dm-layout-home rows-1200 dmPageBody" id="dm-outer-wrapper">
        <div class="dmOuter">
          <div class="dmInner">
            <div id="site_content">
              <div class="dmBody">
                ${bodyHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`.trim();

    return finalHtml;
}

async function run() {
    if (!process.env.SANITY_API_TOKEN) {
        console.error('FATAL: SANITY_API_TOKEN not set.');
        return;
    }

    let success = 0, errors = 0, skipped = 0;

    for (const { id, file, type } of FILE_MAP) {
        const fullPath = path.join(SITE_FILES_DIR, file);

        if (!fs.existsSync(fullPath)) {
            console.log(`⚠️ File not found, skipping: ${file}`);
            skipped++;
            continue;
        }

        const html = fs.readFileSync(fullPath, 'utf-8');
        const bodyContent = extractBodyContent(html);

        if (!bodyContent || bodyContent.length < 100) {
            console.log(`⚠️ No meaningful content extracted from ${file}`);
            skipped++;
            continue;
        }

        try {
            await sanityClient.patch(id).set({ rawHtml: bodyContent }).commit();
            console.log(`✅ [${type}] ${id} (${Math.round(bodyContent.length / 1024)}kb)`);
            success++;
        } catch (err) {
            // If patch fails, try createOrReplace for the home doc
            if (id === 'page--home') {
                try {
                    await sanityClient.createOrReplace({
                        _type: 'page',
                        _id: 'page--home',
                        title: 'Home',
                        slug: { _type: 'slug', current: 'home' },
                        rawHtml: bodyContent
                    });
                    console.log(`✅ Created [${type}] ${id}`);
                    success++;
                } catch (e2) {
                    console.error(`❌ Failed ${id}: ${e2.message}`);
                    errors++;
                }
            } else {
                console.error(`❌ Failed ${id}: ${err.message}`);
                errors++;
            }
        }
    }

    console.log(`\nDone! ✅ ${success} patched, ⚠️ ${skipped} skipped, ❌ ${errors} errors.`);
}

run();
