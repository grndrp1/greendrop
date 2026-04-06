
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'i2own2jr', 
  dataset: 'production',
  useCdn: false,
  token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
  apiVersion: '2023-05-03',
})

async function findAndPatch() {
  const query = `*[_type == "page" && slug.current == "business-car-care"][0]`
  const doc = await client.fetch(query)
  
  if (doc) {
    console.log(`Found document: ${doc._id}`)
    await client
      .patch(doc._id)
      .set({
        businessIntroHeadline: "BUSINESS CAR CARE MEMBERSHIP",
        businessIntroText: "We make routine commercial car care affordable so you can extend the life of your car. Our Business Care program is an annual membership billed monthly and is intended for commercial-use cars.\n\nIf you use your car for business, you need regular maintenance to protect your investment. Get peace of mind all year long with routine basic maintenance for your commercial-use car for just $27 per month."
      })
      .commit()
    console.log('Updated successfully')
  } else {
    console.log('Document not found')
  }
}

findAndPatch()
