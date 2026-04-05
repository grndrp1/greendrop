/**
 * remove_legacy_fields.js
 * 
 * Removes legacy 'headline' and 'intro' fields from all documents.
 */

const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');

dotenv.config();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-02-27',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function removeLegacyFields() {
  console.log('--- Starting Legacy Field Removal ---');

  const query = `*[defined(headline) || defined(intro)] {
    _id,
    _type,
    headline,
    intro,
    title
  }`;

  try {
    const docs = await client.fetch(query);

    if (docs.length === 0) {
      console.log('No documents found with headline or intro fields.');
      return;
    }

    console.log(`Found ${docs.length} documents to clean up.`);

    for (const doc of docs) {
      console.log(`\nProcessing [${doc._type}] "${doc.title || doc._id}":`);

      try {
        await client
          .patch(doc._id)
          .unset(['headline', 'intro'])
          .commit();

        console.log(`  ✅ Successfully removed legacy fields.`);
      } catch (err) {
        console.error(`  ❌ Failed to update doc ${doc._id}: ${err.message}`);
      }
    }

    console.log('\n--- cleanup completed ---');
  } catch (err) {
    console.error('Script failed:', err.message);
  }
}

removeLegacyFields();
