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
client.fetch(`*[_type == "page" && slug.current == "business"][0]{ title, rawHtml }`).then(doc => {
  if (!doc) console.log('DOC NOT FOUND');
  else {
    const text = doc.rawHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log(text.trim());
  }
});
