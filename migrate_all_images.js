/**
 * migrate_all_images.js
 * 
 * Performs a universal surgical recursive scan of the Sanity dataset 
 * using a refined regex to find and replace any Duda CDN URLs (cdn-website.com).
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

// Refined Regex to stop at common CSS/HTML delimiters
const DUDA_URL_REGEX = /https?:\/\/[a-zA-Z0-9.-]*cdn-website\.com\/[^\s"'>\),!]+/g;

async function uploadAsset(url) {
  try {
    // Basic cleanup of the URL
    const finalUrl = url.trim();
    
    console.log(`  Downloading: ${finalUrl}`);
    const response = await axios({
      method: 'GET',
      url: finalUrl,
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const asset = await client.assets.upload('image', response.data, {
      filename: finalUrl.split('/').pop().split('?')[0],
      contentType: response.headers['content-type'],
    });

    const assetIdPart = asset._id.replace('image-', '');
    const ext = assetIdPart.split('-').pop();
    const coreId = assetIdPart.substring(0, assetIdPart.lastIndexOf('-'));
    return `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}/${coreId}.${ext}`;
  } catch (err) {
    console.error(`  ❌ Failed to upload asset from ${url}: ${err.message}`);
    return null;
  }
}

async function migrateAllImages(targetId = null) {
  console.log('--- Starting Surgical Universal Image Migration ---');

  const query = targetId 
    ? `*[ _id == "${targetId}" || _id == "drafts.${targetId}" ]` 
    : '*[ _type != "sanity.imageAsset" && _type != "sanity.fileAsset" ] { _id, _type }';
  
  const docInfos = await client.fetch(query);
  console.log(`Found ${docInfos.length} document versions to scan.`);

  for (let i = 0; i < docInfos.length; i++) {
    const docMeta = docInfos[i];
    const _id = docMeta._id;
    const _type = docMeta._type;

    process.stdout.write(`[${i+1}/${docInfos.length}] Scanning [${_type}] ${_id}... `);

    const doc = await client.getDocument(_id);
    if (!doc) {
      console.log('Skipped (not found).');
      continue;
    }

    let hasChanges = false;
    const patches = {};

    async function recursiveScan(obj, path = '') {
      if (!obj) return;

      if (typeof obj === 'string') {
        const matches = obj.match(DUDA_URL_REGEX);
        if (matches) {
          let newString = obj;
          let docChanged = false;
          for (const match of matches) {
            const newUrl = await uploadAsset(match);
            if (newUrl) {
              newString = newString.split(match).join(newUrl);
              docChanged = true;
            }
          }
          if (docChanged) {
            patches[path] = newString;
            hasChanges = true;
          }
        }
      } else if (Array.isArray(obj)) {
        for (let j = 0; j < obj.length; j++) {
          await recursiveScan(obj[j], path ? `${path}[${j}]` : `[${j}]`);
        }
      } else if (typeof obj === 'object') {
        if (obj._type === 'image' && obj.asset?._ref) return;

        for (const [key, value] of Object.entries(obj)) {
          if (key.startsWith('_')) continue;
          await recursiveScan(value, path ? `${path}.${key}` : key);
        }
      }
    }

    await recursiveScan(doc);

    if (hasChanges) {
      try {
        await client.patch(_id).set(patches).commit();
        console.log(`  ✅ Successfully updated document.`);
      } catch (err) {
        console.log(`  ❌ Failed to patch document: ${err.message}`);
      }
    } else {
      process.stdout.write('Clean.\n');
    }
  }

  console.log('\n--- Surgical Migration Completed ---');
}

const targetDoc = process.argv[2] || null;
migrateAllImages(targetDoc);
