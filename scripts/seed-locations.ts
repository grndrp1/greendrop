import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || 'i2own2jr',
  dataset: process.env.SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-02-27',
  token: process.env.SANITY_API_TOKEN,
})

const DEFAULT_SUBTITLE = 'Eco-Friendly Auto Repair in Portland & Vancouver'
const DEFAULT_IMAGE = '/images/Central+-+Header-1920w.jpg'
const DEFAULT_CTA_TEXT = 'Book an Appointment Online'
const DEFAULT_CTA_URL = 'https://www.greendropgarage.com/contact'

async function seedLocations() {
  console.log('Fetching locations...')
  const locations = await client.fetch('*[_type == "location"]')
  
  console.log(`Found ${locations.length} locations. Updating defaults...`)
  
  const transactions = locations.map((loc: any) => {
    // Determine the title based on headline or just clean the title
    let heroTitle = loc.heroTitle
    if (!heroTitle) {
      // Logic from page.tsx approx
      heroTitle = loc.title
        .replace(/^Green Drop Garage\s*–?\s*/i, '')
        .replace(/\s+(Portland|Vancouver|WA|OR)$/i, '')
        .trim()
      
      if (!heroTitle.toLowerCase().includes('garage')) {
        heroTitle = `${heroTitle} Garage`
      }
    }

    return client
      .patch(loc._id)
      .setIfMissing({
        heroTitle: heroTitle.toUpperCase(),
        heroSubtitle: DEFAULT_SUBTITLE,
        heroImageUrl: DEFAULT_IMAGE,
        heroCtaText: DEFAULT_CTA_TEXT,
        heroCtaUrl: DEFAULT_CTA_URL,
      })
      .commit()
  })

  await Promise.all(transactions)
  console.log('✅ All locations updated with default hero content!')
}

seedLocations().catch(err => {
  console.error('Error seeding locations:', err)
  process.exit(1)
})
