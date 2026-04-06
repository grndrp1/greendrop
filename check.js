const fs = require('fs');
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
client.fetch(`*[_type == "page" && slug.current == "memberships"][0]{ rawHtml }`).then(doc => {
  if (!doc) return;
  const html = doc.rawHtml.replace(/<style[\s\S]*?<\/style>/gi, '');
  const lines = html.split('\n').filter(l => l.trim().length > 0).slice(0, 30);
  console.log(lines.join('\n'));
});
