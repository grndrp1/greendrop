
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'i2own2jr', 
  dataset: 'production',
  useCdn: false,
  token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
  apiVersion: '2023-05-03',
})

async function patchTruckSuvExtras() {
  const query = `*[_type == "page" && slug.current == "business-truck-suv-care"][0]`
  const page = await client.fetch(query)
  
  if (!page) {
    console.error('Page not found')
    return
  }

  const blocks = [
    {
      _type: 'blockBusinessIncluded',
      _key: 'included-grid-1',
      title: "WHAT'S INCLUDED IN YOUR TRUCK & SUV CARE MEMBERSHIP",
      items: [
        { label: "FREE Oil Changes", iconName: "Droplets" },
        { label: "FREE Safety Inspections", iconName: "ClipboardCheck" },
        { label: "FREE Wiper Replacements", iconName: "Eraser" }, // Using Eraser for wipers
        { label: "FREE Trouble Code Scans", iconName: "Car" },
        { label: "FREE Tire Rotations", iconName: "Disc" },
        { label: "FREE Engine Air Filter Replacements", iconName: "FileText" },
        { label: "FREE Bulb & Fuse Replacements", iconName: "Lightbulb" },
        { label: "FREE Fluid Top Offs", iconName: "FlaskConical" },
        { label: "FREE Flat Repair", iconName: "Wrench" },
        { label: "Tire Discounts", iconName: "Tags" },
        { label: "Annual 2% Back", iconName: "Percent" },
        { label: "Weekend Service Availability", iconName: "Calendar" },
      ]
    },
    {
      _type: 'blockBusinessConcierge',
      _key: 'concierge-1',
      title: 'INTRODUCING THE CONCIERGE UPGRADE',
      subtitle: 'Upgrade Your Membership with Concierge Service',
      description: "We make vehicle maintenance so easy! Experience the convenience and peace of mind that our concierge service offers. Book your appointment and concierge pick up. We'll do the rest. Sit back, relax, and let us take care of your vehicle while you focus on what matters most.",
      bannerText: 'Need a little more? Upgrade anytime and get these added benefits to your vehicle maintenance membership.',
      plans: [
        { 
          title: "CONCIERGE 5 (5 MILE RADIUS)", 
          description: "Activate Concierge 5 for an additional $9 per month with your Truck & SUV Care membership.",
          buttonText: "Truck & SUV Care + Concierge 5",
          buttonUrl: "https://www.greendropgarage.com/truck-suv-concierge-5"
        },
        { 
          title: "CONCIERGE 10 (10 MILE RADIUS)", 
          description: "Activate Concierge 10 for an additional $15 per month with your Truck & SUV Care membership.",
          buttonText: "Truck & SUV Care + Concierge 10",
          buttonUrl: "https://www.greendropgarage.com/truck-suv-concierge-10"
        }
      ]
    },
    {
      _type: 'blockBusinessJoinCTA',
      _key: 'join-cta-1',
      title: 'JOIN TODAY & SAVE',
      subtitle: 'Unlimited Visits. One Fixed Price.',
      description: "As a member, we want you to bring your truck or SUV in every 90 days. This gives us a chance to inspect, tighten up, and otherwise keep your vehicle in tip-top condition.",
      ctaText: 'Subscribe Now',
      ctaUrl: 'https://www.greendropgarage.com/truck-suv-checkout'
    },
    {
      _type: 'blockBusinessTerms',
      _key: 'terms-1',
      title: 'TERMS & CONDITIONS',
      content: [
        {
          _type: 'block',
          _key: 't1',
          style: 'h3',
          children: [{ _type: 'span', text: 'Truck & SUV Care Use' }]
        },
        {
          _type: 'block',
          _key: 't2',
          style: 'normal',
          children: [{ _type: 'span', text: 'ANNUAL COMMITMENT: The Truck & SUV Care membership is a minimum 12-month commitment, billed automatically monthly.' }]
        }
      ]
    }
  ]

  await client
    .patch(page._id)
    .set({ pageBuilder: blocks })
    .commit()

  console.log('Successfully patched business-truck-suv-care with modular sections.')
}

patchTruckSuvExtras().catch(console.error)
