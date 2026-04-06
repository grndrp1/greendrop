
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'i2own2jr', 
  dataset: 'production',
  useCdn: false,
  token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
  apiVersion: '2023-05-03',
})

async function findAndPatch() {
  const query = `*[_type == "page" && slug.current == "business-truck-suv-care"][0]`
  const doc = await client.fetch(query)
  
  if (doc) {
    console.log(`Found document: ${doc._id}`)
    await client
      .patch(doc._id)
      .set({
        businessIntroHeadline: "BUSINESS TRUCK+SUV CARE MEMBERSHIP",
        businessIntroSubheadline: "Take Care of Business and Get Basic Commercial Vehicle Maintenance at Just $37 per Month",
        businessIntroText: "We make routine commercial care affordable so you can extend the life of your ride. Our 12-month Business Truck+SUV Care membership is for commercial-use trucks and SUVs. Protect your investment with regular maintenance for just $37 per month.\n\nGet annual business truck and SUV care to protect your investment with routine basic maintenance for your commercial-use vehicle that takes between 6 - 15 quarts of oil."
      })
      .commit()
    console.log('Updated successfully')
  } else {
    console.log('Document not found')
  }
}

findAndPatch()
