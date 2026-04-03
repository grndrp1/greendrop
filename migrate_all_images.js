/**
 * migrate_all_images.js
 * 
 * Performs a universal recursive scan of the Sanity dataset document by document
 * to find any remaining Duda CDN URLs and migrate them to internal Sanity Assets.
 */

const { createClient } = require('@sanity/client');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-02-27',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function uploadAsset(url) {
  try {
    // Normalize relative URLs
    let finalUrl = url;
    if (finalUrl.includes('cdn-website.com') && !finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl.replace(/^(\.\.\/)+/, '');
    }

    const response = await axios({
      method: 'GET',
      url: finalUrl,
      responseType: 'arraybuffer',
    });

    const asset = await client.assets.upload('image', response.data, {
      filename: finalUrl.split('/').pop().split('?')[0],
      contentType: response.headers['content-type'],
    });

    return asset._id;
  } catch (err) {
    console.error(`  ❌ Failed to upload asset from ${url}: ${err.message}`);
    return null;
  }
}

async function migrateAllImages() {
  console.log('--- Starting Universal Recursive Image Migration (Batched) ---');

  // 1. Get all document IDs and types
  const query = '*[ _type != "sanity.imageAsset" && _type != "sanity.fileAsset" ] { _id, _type }';
  const docInfos = await client.fetch(query);

  console.log(`Found ${docInfos.length} documents to scan.`);

  for (let i = 0; i < docInfos.length; i++) {
    const { _id, _type } = docInfos[i];
    process.stdout.write(`[${i+1}/${docInfos.length}] Scanning [${_type}] ${_id}... `);

    // 2. Fetch the full document
    const doc = await client.getDocument(_id);
    if (!doc) {
      console.log('Skipped (not found).');
      continue;
    }

    let hasChanges = false;
    const patches = {};

    // 3. Helper to recursively find and replace Duda URLs
    async function scanAndReplace(obj, path = '') {
      if (!obj) return;

      if (typeof obj === 'string') {
        if (obj.includes('cdn-website.com')) {
          console.log(`\n  Found Duda URL at ${path}: ${obj}`);
          const assetId = await uploadAsset(obj);
          if (assetId) {
            // Determine if we should set it as an 'image' object or a 'url' string
            // For now, if the path contains 'image' (case insensitive), we assume it's an image object
            const lastSegment = path.split('.').pop().split('[')[0];
            if (lastSegment.toLowerCase().includes('image')) {
              patches[path] = {
                _type: 'image',
                asset: { _type: 'reference', _ref: assetId }
              };
            } else {
              // Just replace with the new Sanity CDN URL
              const assetIdPart = assetId.replace('image-', '');
              const ext = assetIdPart.split('-').pop();
              const coreId = assetIdPart.substring(0, assetIdPart.lastIndexOf('-'));
              const newUrl = `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}/${coreId}.${ext}`;
              patches[path] = newUrl;
            }
            hasChanges = true;
          }
        }
      } else if (Array.isArray(obj)) {
        for (let j = 0; j < obj.length; j++) {
          await scanAndReplace(obj[j], path ? `${path}[${j}]` : `[${j}]`);
        }
      } else if (typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          if (key.startsWith('_')) continue;
          await scanAndReplace(value, path ? `${path}.${key}` : key);
        }
      }
    }

    await scanAndReplace(doc);

    if (hasChanges) {
      try {
        await client.patch(_id).set(patches).commit();
        console.log(`  ✅ Successfully updated.`);
      } catch (err) {
        console.log(`  ❌ Failed to patch: ${err.message}`);
      }
    } else {
      process.stdout.write('Done.\n');
    }
  }

  console.log('\n--- Universal Migration Completed ---');
}

migrateAllImages();
