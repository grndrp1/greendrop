
import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: 'i2own2jr', // Correct Project ID
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-03-01',
})

async function debugHome() {
  console.log('--- Debugging Home Page ---')
  const home = await client.fetch('*[_type == "page" && title == "Home"][0]')
  
  if (home) {
    console.log('Found Home document:', home._id)
    console.log('All available keys:', Object.keys(home))
    if (home.rawHtml) {
      console.log('rawHtml value found (length):', home.rawHtml.length)
    } else {
      console.log('rawHtml is NOT present on this document object.')
    }
  } else {
    console.log('Could not find a page with title "Home"')
  }
}

debugHome()

async function cleanupRawHtml() {
  console.log('--- Starting Site-Wide Raw HTML Cleanup ---')

  // Fetch both published and draft versions of our main types
  const query = '*[_type in ["page", "service", "location", "serviceLocation"]]'
  const docs = await client.fetch(query)

  // Filter for docs that actually have the field
  const docsToClean = docs.filter((doc: any) => 'rawHtml' in doc)

  console.log(`Found ${docsToClean.length} total documents (including drafts) with legacy 'rawHtml' data.`)
  if (docsToClean.length > 0) {
    docsToClean.forEach((doc: any) => console.log(`- Detected in: ${doc._id} (${doc._type})`))
  }

  if (docsToClean.length === 0) {
    console.log('No documents found to clean up! Everything is already tidy.')
    return
  }

  const transaction = client.transaction()

  docsToClean.forEach((doc: any) => {
    transaction.patch(doc._id, {
      unset: ['rawHtml']
    })
  })

  try {
    console.log(`Committing transaction for ${docsToClean.length} documents...`)
    await transaction.commit()
    console.log('Success! Removed "rawHtml" from all documents.')
    console.log('Your Sanity Studio warnings should now be gone after a refresh.')
  } catch (err) {
    console.error('Cleanup failed:', err)
  }
}

cleanupRawHtml()
