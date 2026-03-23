const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const baseUrl = 'https://www.greendropgarage.com';
const destDir = path.join(__dirname, '../greendrop-web/public/images');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

async function downloadImage(url, filename) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });

        const localPath = path.join(destDir, filename);
        const writer = fs.createWriteStream(localPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log(`Successfully downloaded: ${filename}`);
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading ${url}:`, error.message);
    }
}

async function scrapeImages() {
    console.log('Starting Puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        console.log(`Navigating to ${baseUrl}...`);
        await page.goto(baseUrl, { waitUntil: 'networkidle2' });

        console.log('Extracting image URLs...');
        // Extract background images and standard images
        const imageUrls = await page.evaluate(() => {
            const urls = new Set();

            // Get all img tags
            document.querySelectorAll('img').forEach(img => {
                if (img.src) urls.add(img.src);
            });

            // Get background images from all elements
            document.querySelectorAll('*').forEach(el => {
                const bg = window.getComputedStyle(el).backgroundImage;
                if (bg && bg !== 'none') {
                    // Extract URL from url("...")
                    const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
                    if (match && match[1]) {
                        urls.add(match[1]);
                    }
                }
            });

            return Array.from(urls);
        });

        console.log(`Found ${imageUrls.length} unique images. Downloading...`);

        let count = 0;
        for (let u of imageUrls) {
            if (u.startsWith('data:')) continue; // Skip inline base64 images

            let url = u;
            if (url.startsWith('/')) {
                url = baseUrl + url;
            }

            const filename = path.basename(url.split('?')[0]);
            if (filename) {
                await downloadImage(url, filename);
                count++;
            }
        }

        console.log(`Finished processing ${count} images from homepage.`);

    } catch (error) {
        console.error("Scraping failed:", error);
    } finally {
        await browser.close();
    }
}

scrapeImages();
