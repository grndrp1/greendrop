
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'i2own2jr', 
  dataset: 'production',
  useCdn: false,
  token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
  apiVersion: '2023-05-03',
})

async function patchBusinessExtras() {
  const query = `*[_type == "page" && slug.current == "business-car-care"][0]`
  const page = await client.fetch(query)
  
  if (!page) {
    console.error('Page not found')
    return
  }

  console.log(`Found page: ${page.title}`)

  const blocks = [
    {
      _type: 'blockBusinessIncluded',
      _key: 'included-grid-1',
      title: "WHAT'S INCLUDED IN YOUR BUSINESS CAR CARE MEMBERSHIP",
      items: [
        { label: "FREE Oil Changes", iconName: "Droplets" },
        { label: "FREE Safety Inspections", iconName: "ClipboardCheck" },
        { label: "FREE Wiper Replacements", iconName: "Windshield" },
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
          description: "Activate Concierge 5 for an additional $9 per month with your Business Car Care membership.",
          buttonText: "Business Car Care + Concierge 5",
          buttonUrl: "https://www.greendropgarage.com/business-care-concierge-5"
        },
        { 
          title: "CONCIERGE 10 (10 MILE RADIUS)", 
          description: "Activate Concierge 10 for an additional $15 per month with your Business Car Care membership.",
          buttonText: "Business Car Care + Concierge 10",
          buttonUrl: "https://www.greendropgarage.com/business-care-concierge-10"
        }
      ]
    },
    {
      _type: 'blockBusinessJoinCTA',
      _key: 'join-cta-1',
      title: 'JOIN TODAY & SAVE',
      subtitle: 'Unlimited Visits. One Fixed Price.',
      description: "As a member, we want you to bring your car in every 90 days. This gives us a chance to inspect, tighten up, and otherwise keep your car in tip-top condition. Don't have time for the full treatment each visit? No problem – but you always have the option for us to do a little more.",
      ctaText: 'Subscribe Now',
      ctaUrl: 'https://www.greendropgarage.com/business-care-checkout'
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
          children: [{ _type: 'span', text: 'Business Car Care Use' }]
        },
        {
          _type: 'block',
          _key: 't2',
          style: 'normal',
          children: [{ _type: 'span', text: 'ANNUAL COMMITMENT: The Business Car Care membership is a minimum 12-month commitment, billed automatically monthly. Memberships automatically renew for another one-year term on the anniversary of the membership sign-up. One car per membership.' }]
        },
        {
          _type: 'block',
          _key: 't3',
          style: 'h3',
          children: [{ _type: 'span', text: 'WANT TO CANCEL EARLY?' }]
        },
        {
          _type: 'block',
          _key: 't4',
          style: 'normal',
          children: [{ _type: 'span', text: 'You can cancel your membership at any time. We simply ask that you pay the difference between the membership discounts received and the amount paid in membership dues.' }]
        },
        {
          _type: 'block',
          _key: 't5',
          style: 'normal',
          children: [{ _type: 'span', text: 'Questions? Contact us at membership@greendropgarage.com' }]
        }
      ]
    }
  ]

  await client
    .patch(page._id)
    .set({ pageBuilder: blocks })
    .commit()

  console.log('Successfully patched business-car-care with modular sections.')
}

patchBusinessExtras().catch(console.error)
