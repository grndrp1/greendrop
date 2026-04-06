
import { createClient } from '@sanity/client'
import { nanoid } from 'nanoid'

const client = createClient({
  projectId: 'i2own2jr', 
  dataset: 'production',
  useCdn: false,
  token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
  apiVersion: '2023-05-03',
})

async function createReviewsPage() {
  const pageSlug = 'reviews'
  
  // 1. Check if page exists
  const existingPage = await client.fetch(`*[_type == "page" && slug.current == "${pageSlug}"][0]`)
  
  const blocks = [
    {
      _key: nanoid(),
      _type: 'blockReviewWidget',
      locationName: 'Central Garage',
      widgetId: '0474587c-84e1-4ce4-b23a-2ad093157a8a',
      backgroundColor: 'white'
    },
    {
      _key: nanoid(),
      _type: 'blockReviewWidget',
      locationName: 'Moreland Garage',
      widgetId: '7a5356b8-e72d-4d9f-b386-01251aa261d6',
      backgroundColor: 'off-white'
    },
    {
      _key: nanoid(),
      _type: 'blockReviewWidget',
      locationName: 'MLK Garage',
      widgetId: 'aa51ec24-46f5-4add-a5ba-a285fe88229c',
      backgroundColor: 'white'
    },
    {
      _key: nanoid(),
      _type: 'blockReviewWidget',
      locationName: 'Uptown Garage',
      widgetId: 'b6c45c69-a025-4fc0-bfdb-a3f7377a3099',
      backgroundColor: 'off-white'
    },
    {
      _key: nanoid(),
      _type: 'blockReviewWidget',
      locationName: 'Vancouver Garage',
      widgetId: '467b3d30-aa97-4527-ac8f-91d662f4cf00',
      backgroundColor: 'white'
    },
    {
      _key: nanoid(),
      _type: 'blockReviewWidget',
      locationName: 'St. Johns Garage',
      widgetId: '', // Placeholder
      backgroundColor: 'off-white'
    }
  ]

  const pageDoc = {
    _type: 'page',
    title: 'Reviews',
    slug: {
      _type: 'slug',
      current: pageSlug
    },
    heroTitle: 'OUR REVIEWS',
    heroSubtitle: 'What our customers are saying about us across all 6 locations.',
    pageBuilder: blocks
  }

  if (existingPage) {
    console.log(`Updating existing Reviews page: ${existingPage._id}`)
    await client
      .patch(existingPage._id)
      .set(pageDoc)
      .commit()
    console.log('Updated successfully')
  } else {
    console.log('Creating new Reviews page...')
    await client.create(pageDoc)
    console.log('Created successfully')
  }
}

createReviewsPage().catch(console.error)
