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
  const html = doc.rawHtml;
  const styles = [];
  const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
      styles.push(match[1]);
  }
  const css = styles.join('\n');
  const tagRegex = /(?:^|\s|\})([a-z0-9_-]+)(?=\s*\{)/gi;
  const genericTags = new Set();
  let tagMatch;
  while ((tagMatch = tagRegex.exec(css)) !== null) {
      genericTags.add(tagMatch[1].trim());
  }
  console.log('Generic tags styled by Duda:', Array.from(genericTags).filter(t => ['header', 'footer', 'nav', 'body', 'html', 'img', 'svg'].includes(t.toLowerCase())));
  
  // also let's dump out any rule that has header or footer
  const rules = css.split('}').map(r => r + '}');
  const problematicRules = rules.filter(r => r.match(/(?:^|\s|,|>)(header|footer|nav|svg|img)\b[^{]*\{/i));
  console.log('\nProblematic Rules:');
  console.log(problematicRules.slice(0, 10).join('\n'));
});
