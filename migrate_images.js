/**
 * migrate_images.js
 * 
 * Downloads images from external Duda URLs (heroImageUrl) and uploads them
 * as Sanity Assets, then updates the document to use the internal asset.
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

async function migrateImages() {
  console.log('--- Starting Full Image Migration ---');

  // Find all documents that have a heroImageUrl from Duda but no native image asset
  const query = `*[defined(heroImageUrl) && heroImageUrl match "*cdn-website.com*" && !defined(image.asset)] {
    _id,
    _type,
    heroImageUrl,
    title
  }`;

  try {
    const docs = await client.fetch(query);

    if (docs.length === 0) {
      console.log('No documents found that require migration.');
      return;
    }

    console.log(`Found ${docs.length} documents for testing.`);

    for (const doc of docs) {
      const { _id, _type, heroImageUrl, title } = doc;
      console.log(`\nProcessing [${_type}] "${title || _id}":`);
      console.log(`  Source URL: ${heroImageUrl}`);

      try {
        // Normalize the URL if it's relative
        let finalUrl = heroImageUrl;
        if (finalUrl.includes('cdn-website.com') && !finalUrl.startsWith('http')) {
          // Remove leading ../ or similar and prepend https://
          finalUrl = 'https://' + finalUrl.replace(/^(\.\.\/)+/, '');
        }

        console.log(`  Normalizing to: ${finalUrl}`);

        // 1. Download the image
        const response = await axios({
          method: 'GET',
          url: finalUrl,
          responseType: 'arraybuffer',
        });

        // 2. Upload to Sanity
        const asset = await client.assets.upload('image', response.data, {
          filename: heroImageUrl.split('/').pop().split('?')[0],
          contentType: response.headers['content-type'],
        });

        console.log(`  Successfully uploaded asset: ${asset._id}`);

        // 3. Patch the document
        // - Set 'image' field to the new asset
        // - Clear 'heroImageUrl' field as requested
        await client
          .patch(_id)
          .set({
            image: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: asset._id,
              },
            },
          })
          .unset(['heroImageUrl'])
          .commit();

        console.log(`  ✅ Successfully migrated and updated document.`);
      } catch (err) {
        console.error(`  ❌ Failed to migrate doc ${_id}: ${err.message}`);
      }
    }

    console.log('\n--- Migration Test Completed ---');
  } catch (err) {
    console.error('Migration failed:', err.message);
  }
}

migrateImages();
