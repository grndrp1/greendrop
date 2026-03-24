import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2022-06-06',
})

async function createPosts() {
  const posts = [
    {
      _type: 'post',
      _id: 'post--brake-system',
      title: "How to Optimize Your Vehicle's Brake System with Green Drop Garage",
      slug: { _type: 'slug', current: 'understanding-brake-service-essential-tips-from-green-drop-garage' },
      publishedAt: '2026-03-21T09:00:00Z',
      author: 'Green Drop Garage',
      excerpt: 'Get expert brake services at Green Drop Garage in Portland, OR & Vancouver, WA. We ensure your safety with top-notch care. Schedule an online appointment now!',
      body: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          children: [{ _type: 'span', _key: 's1', text: 'Brakes are one of the most critical safety components of your vehicle...' }]
        }
      ]
    },
    {
      _type: 'post',
      _id: 'post--service-intervals',
      title: "Understanding the Importance of 30k/60k/90k Service Intervals: Your Guide by Green Drop Garage",
      slug: { _type: 'slug', current: 'the-ultimate-30k-60k-90k-service-guide-why-your-car-needs-it' },
      publishedAt: '2026-02-22T10:00:00Z',
      author: 'Green Drop Garage',
      excerpt: 'Explore the importance of 30k/60k/90k service intervals with Green Drop Garage, your local auto experts in Portland and Vancouver. Schedule an appointment today!',
      body: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          children: [{ _type: 'span', _key: 's1', text: 'Regular maintenance intervals are key to ensuring your car lasts for years to come...' }]
        }
      ]
    }
  ]

  for (const post of posts) {
    console.log(`Creating post: ${post.title}`)
    await client.createOrReplace(post)
  }
  console.log('Successfully created posts!')
}

createPosts().catch(console.error)
