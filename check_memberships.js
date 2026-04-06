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
client.fetch(`*[_type == "page" && slug.current == "memberships"][0]{ title, rawHtml }`).then(doc => {
  if (!doc || !doc.rawHtml) { console.log('Not found or no rawHtml'); return; }
  const html = doc.rawHtml;
  // Print the first occurence of <header, <nav, <footer tags
  const headerIdx = html.toLowerCase().indexOf('<header');
  const footerIdx = html.toLowerCase().indexOf('<footer');
  const navIdx = html.toLowerCase().indexOf('<nav');
  console.log('Has <header>:', headerIdx > -1, 'at index', headerIdx);
  console.log('Has <footer>:', footerIdx > -1, 'at index', footerIdx);
  console.log('Has <nav>:', navIdx > -1, 'at index', navIdx);
  // Find class names with "header" or "footer"
  const matches = html.match(/class="[^"]*(?:header|footer|nav)[^"]*"/gi);
  if (matches) {
    console.log('Classes with header/footer/nav:', [...new Set(matches)].slice(0, 20));
  }
  // Check for <style> tags count
  const styleCount = (html.match(/<style/gi) || []).length;
  console.log('Style tag count:', styleCount);
});
