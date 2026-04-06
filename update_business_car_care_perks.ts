
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'i2own2jr', 
  dataset: 'production',
  useCdn: false,
  token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
  apiVersion: '2023-05-03',
})

async function updateBusinessCarCare() {
  const query = `*[_type == "page" && slug.current == "business-car-care"][0]`
  const doc = await client.fetch(query)
  
  if (doc) {
    console.log(`Found document: ${doc._id}`)
    
    // We want to replace the perks with the new set
    const newPerks = [
      {
        _key: 'vip-events',
        title: "VIP Events",
        iconName: "Crown",
        text: "We like to say thank you to our members as often as we can. A sweet perk of your membership is receiving invitations to exclusive events with our awesome partners."
      },
      {
        _key: 'ev-loaners',
        title: "EV Loaners",
        iconName: "Leaf",
        text: "When available we have loaner vehicles for extended vehicle stays."
      },
      {
        _key: 'discounts-specials',
        title: "Discounts & Specials",
        iconName: "CoinsHand",
        text: "You’re saving by being a member through free eco-friendly oil changes. Get member discounts on mount and balance services and seasonal specials."
      }
    ]

    await client
      .patch(doc._id)
      .set({
        businessPerks: newPerks
      })
      .commit()
    console.log('Updated business-car-care perks successfully')
  } else {
    console.log('Document not found')
  }
}

updateBusinessCarCare()
