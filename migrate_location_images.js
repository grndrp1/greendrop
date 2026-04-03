/**
 * migrate_location_images.js
 * 
 * Performs a recursive scan for ALL location documents to migrate Duda 
 * images to Sanity Assets. 
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
    let finalUrl = url;
    if (finalUrl.includes('cdn-website.com') && !finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl.replace(/^(\.\.\/)+/, '');
    }

    console.log(`  Downloading: ${finalUrl}`);
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
    console.error(`  ❌ Failed to upload asset: ${err.message}`);
    return null;
  }
}

async function migrateLocations(onlyOneId = null) {
  console.log(`--- Starting Location Migration ${onlyOneId ? '(Single: ' + onlyOneId + ')' : '(All Locations)'} ---`);

  const query = onlyOneId ? `*[ _id == "${onlyOneId}" || _id == "drafts.${onlyOneId}" ]` : '*[ _type == "location" ]';
  const docs = await client.fetch(query);

  console.log(`Found ${docs.length} documents.`);

  for (const doc of docs) {
    console.log(`\nScanning ${doc._id} [${doc.title}]...`);
    let hasChanges = false;
    const patches = {};

    async function scanAndReplace(obj, path = '') {
      if (!obj) return;

      if (typeof obj === 'string') {
        // Skip huge HTML strings, we only want actual URLs
        if (obj.length > 500) return;

        if (obj.includes('cdn-website.com')) {
          console.log(`  Found Duda URL at ${path}: ${obj}`);
          const assetId = await uploadAsset(obj);
          if (assetId) {
            const lastSegment = path.split('.').pop().split('[')[0];
            if (lastSegment.toLowerCase().includes('image')) {
              patches[path] = {
                _type: 'image',
                asset: { _type: 'reference', _ref: assetId }
              };
            } else {
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
        if (obj._type === 'image' && obj.asset?._ref) return;

        for (const [key, value] of Object.entries(obj)) {
          if (key.startsWith('_')) continue;
          await scanAndReplace(value, path ? `${path}.${key}` : key);
        }
      }
    }

    await scanAndReplace(doc);

    if (hasChanges) {
      try {
        await client.patch(doc._id).set(patches).commit();
        console.log(`  ✅ Successfully updated ${doc._id}.`);
      } catch (err) {
        console.error(`  ❌ Failed to patch ${doc._id}: ${err.message}`);
      }
    } else {
      console.log('  No Duda URLs found.');
    }
  }
}

const targetId = process.argv[2] || null;
migrateLocations(targetId);
