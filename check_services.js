const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2022-06-06',
});

client.fetch('*[_type == "service"]{_id, title}').then(res => {
  console.log(JSON.stringify(res, null, 2));
}).catch(err => {
  console.error(err);
});
