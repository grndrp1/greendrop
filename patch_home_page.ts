import { getCliClient } from 'sanity/cli'

const client = getCliClient()

async function patchHomePage() {
  try {
    const home = await client.fetch('*[_type == "page" && slug.current == "home"][0]')
    
    if (!home) {
      console.log('No home page found to patch.')
      return
    }

    console.log(`Found home page: ${home._id}. Patching...`)

    await client
      .patch(home._id)
      .setIfMissing({ pageBuilder: [] })
      .insert('after', 'pageBuilder[-1]', [
        {
          _type: 'blockWelcome',
          _key: `welcome-${Math.random().toString(36).substring(2, 9)}`,
          title: 'Welcome to Green Drop Garage',
          bodyRaw: [
            {
              _type: 'block',
              _key: 'b1',
              children: [{ _type: 'span', _key: 's1', text: 'Eco-Friendly, Full-Service Auto Care' }],
              style: 'h3'
            },
            {
              _type: 'block',
              _key: 'b2',
              children: [{ _type: 'span', _key: 's2', text: 'Welcome to Green Drop Garage, your go-to eco-conscious, full-service auto repair shop in the Portland, OR, and Vancouver, WA areas. With six locations across Portland and Vancouver, Green Drop Garage is committed to keeping your vehicle in top shape while protecting the environment. Our ASE-certified technicians handle all makes and models with precision and care, and as a proud NAPA AutoCare Center, we back our work with a 24-month/24k-mile nationwide warranty on parts and labor. When you step into Green Drop Garage, expect a warm welcome with a Stumptown cold brew in hand, an attentive ear to your car concerns, and absolutely no pushy upsells—just genuine service.' }],
              style: 'normal'
            },
            {
              _type: 'block',
              _key: 'b3',
              children: [{ _type: 'span', _key: 's3', text: 'Sustainable Practices, Community Focused' }],
              style: 'h3'
            },
            {
              _type: 'block',
              _key: 'b4',
              children: [{ _type: 'span', _key: 's4', text: 'Green Drop Garage was founded on eco-friendly principles, beginning with converting diesel engines to run on vegetable oil and evolving into a full-scale green auto care facility. From recycling buildings for our shops to using re-refined oils and low-impact chemicals, every aspect of our service is designed to reduce our environmental footprint. We even provide eco-friendly loaner cars and a convenient concierge service, ensuring a seamless and green experience for you. By choosing Green Drop Garage, you’re not only ensuring the safety and reliability of your vehicle, but also supporting a sustainable approach to car care that benefits our community and the planet.' }],
              style: 'normal'
            }
          ]
        },
        {
          _type: 'blockVehiclesWeService',
          _key: `vehicles-${Math.random().toString(36).substring(2, 9)}`,
          title: 'Vehicles We Service',
          bodyRaw: [
            {
              _type: 'block',
              _key: 'v1',
              children: [{ _type: 'span', _key: 's1', text: 'Servicing All Makes and Models with Expert Precision in Portland & Vancouver' }],
              style: 'h3'
            },
            {
              _type: 'block',
              _key: 'v2',
              children: [{ _type: 'span', _key: 's2', text: 'At Green Drop Garage, we believe that every vehicle deserves quality care, which is why our ASE-certified technicians are equipped to service all makes and models, from daily drivers and family SUVs to eco-conscious hybrids and electric vehicles. Our team’s expertise spans a wide range of vehicle types, so whether you’re driving a classic sedan, a rugged truck, or a high-efficiency hybrid, you can count on Green Drop Garage to handle your maintenance and repairs with precision. We’re committed to delivering consistent, reliable results across our six locations in Portland, OR, and Vancouver, WA.' }],
              style: 'normal'
            },
            {
              _type: 'block',
              _key: 'v3',
              children: [{ _type: 'span', _key: 's3', text: 'We approach every vehicle with the same eco-conscious commitment that defines Green Drop Garage. Our services use re-refined oils, lower-impact chemicals, and sustainable practices to ensure that our work protects the environment as much as it protects your vehicle. By servicing all vehicle makes and models while incorporating environmentally friendly techniques, we make it easier for our community to choose green auto care without compromising on quality or safety.' }],
              style: 'normal'
            }
          ]
        },
        {
          _type: 'blockPerks',
          _key: `perks-${Math.random().toString(36).substring(2, 9)}`,
          title: 'OUR PERKS',
          tagline: "We're Shifting the Car Care Experience"
        }
      ])
      .commit()

    console.log('Successfully patched the Home page with default blocks!')
  } catch (err) {
    console.error('Error patching home page:', err)
  }
}

patchHomePage()
