
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'i2own2jr', 
  dataset: 'production',
  useCdn: false,
  token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
  apiVersion: '2023-05-03',
})

async function findAndPatch() {
  const query = `*[_type == "page" && slug.current == "fleet-care"][0]`
  const doc = await client.fetch(query)
  
  if (doc) {
    console.log(`Found document: ${doc._id}`)
    await client
      .patch(doc._id)
      .set({
        businessIntroHeadline: "FLEET CARE MEMBERSHIP",
        businessIntroSubheadline: "YOUR BUSINESS NEVER STOPS. NEITHER SHOULD YOUR VEHICLES.",
        businessIntroText: "Green Drop Garage is Portland and Vancouver's premier eco-friendly fleet maintenance partner, with six convenient locations to keep your business moving. As the nation's only B-Corp certified auto repair shop, we deliver exceptional care for your vehicles while upholding the highest standards of social and environmental responsibility.",
        businessIntroCtaText: "Contact Us",
        businessIntroCtaUrl: "mailto:membership@greendropgarage.com",
        businessPerksHeadline: "WHY BUSINESS OWNERS CHOOSE OUR FLEET SERVICES",
        businessPerks: [
          {
            _key: 'perk1',
            title: "Complete Management, Zero Hassle",
            text: "We handle everything—from scheduling and maintenance tracking to comprehensive repairs—so you can focus on running your business, not your vehicles."
          },
          {
            _key: 'perk2',
            title: "Minimize Downtime, Maximize Productivity",
            text: "Our priority scheduling works around your operational needs with extended hours, loaner vehicles, and technicians dedicated to getting your fleet back on the road quickly."
          },
          {
            _key: 'perk3',
            title: "One Partner, All Services",
            text: "Stop juggling multiple vendors. From oil changes and tire services to major repairs and state inspections, everything happens under one roof with one point of contact."
          },
          {
            _key: 'perk4',
            title: "Predictable Costs, Better Budgeting",
            text: "With our 20% labor discount, free routine maintenance, and transparent recommendations, you'll eliminate surprise expenses and reduce your total fleet operating costs."
          }
        ]
      })
      .commit()
    console.log('Updated successfully')
  } else {
    console.log('Document not found')
  }
}

findAndPatch()
