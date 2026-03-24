import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2022-06-06',
})

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
      .set({ pageBuilder: [
        {
          _type: 'blockCustomerReviews',
          _key: 'block-reviews-main',
          title: 'Customer Reviews',
          reviews: [
            {
              _key: 'r1',
              author: 'Sarah M.',
              text: 'The best auto repair experience I have ever had. Eco-friendly and no pushy sales!',
              stars: 5
            },
            {
              _key: 'r2',
              author: 'John D.',
              text: 'Honest, fast, and local. Love that they use re-refined oil.',
              stars: 5
            },
            {
              _key: 'r3',
              author: 'Emily K.',
              text: 'Six locations makes it so convenient. The concierge service is a lifesaver.',
              stars: 5
            }
          ]
        },
        {
          _type: 'blockServicesHighlight',
          _key: 'block-services-main',
          title: 'Services',
          subtitle: 'Expert Auto Repair in Portland & Vancouver',
          services: [
            { _type: 'reference', _ref: 'service--ac-service', _key: 's1' },
            { _type: 'reference', _ref: 'service--auto-repair', _key: 's2' },
            { _type: 'reference', _ref: 'service--brakes', _key: 's3' }
          ]
        },
        {
          _type: 'blockWelcome',
          _key: 'block-welcome-main',
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
          _type: 'blockPerks',
          _key: 'block-perks-main',
          title: 'OUR PERKS',
          tagline: "We're Shifting the Car Care Experience"
        },
        {
          _type: 'blockVehiclesWeService',
          _key: 'block-vehicles-main',
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
          _type: 'blockWhyChooseUs',
          _key: 'block-whychooseus-main',
          title: 'WHY CHOOSE US',
          subtitle: 'Green Drop Mission, Vision, and Values',
          showAwards: true,
          bodyRaw: [
            {
              _type: 'block',
              _key: 'bw1',
              children: [{ _type: 'span', _key: 's1', text: 'Our culture is one of commitment to customers and the environment. We are your neighbors and friends – and we’re on the road with you. Our mission and values keep us aligned with our goal of service.' }],
              style: 'normal'
            }
          ],
          values: [
            {
              _type: 'object',
              _key: 'v1',
              number: '01',
              title: 'DO THE RIGHT THING',
              description: "We consider the impact of every decision we make. We strive to do right by our clients, our team, and our environment. If we make a mistake, we own it and fix it – even if (and especially if) nobody is watching."
            },
            {
              _type: 'object',
              _key: 'v2',
              number: '02',
              title: 'GET IT DONE',
              description: "We take pride in what we do – we exceed expectations, produce at high levels, and push our comfort zones to grow. We don’t accept limitations; if there is a better way of doing something, we’ll find it."
            },
            {
              _type: 'object',
              _key: 'v3',
              number: '03',
              title: 'SOLVE PROBLEMS',
              description: "At Green Drop, it’s never just, “Your car is broken,” but, “Here’s what we can do to fix it.” We are committed to the outcome of our work together, and tackle every challenge with a solutions mindset. We listen closely, interpret carefully, and deliver thoughtful solutions – every time."
            }
          ]
        },
        {
          _type: 'blockFaq',
          _key: 'block-faq-main',
          title: 'FREQUENTLY ASKED QUESTIONS',
          faqs: [
            {
              _key: 'f1',
              question: 'What are your business hours?',
              answerRaw: [
                { _type: 'block', _key: 'a1', style: 'normal', children: [{ _type: 'span', text: 'Our hours vary slightly by location:' }] },
                { _type: 'block', _key: 'a2', style: 'normal', children: [{ _type: 'span', text: 'Portland Locations:', marks: ['strong'] }] },
                { _type: 'block', _key: 'a3', style: 'normal', children: [{ _type: 'span', text: '• St. Johns location: Monday through Friday, 8:00 am to 5:00 pm.' }] },
                { _type: 'block', _key: 'a4', style: 'normal', children: [{ _type: 'span', text: '• Other locations: Monday through Friday, 8:00 am to 5:00 pm, and Saturday, 9:00 am to 5:00 pm.' }] },
                { _type: 'block', _key: 'a5', style: 'normal', children: [{ _type: 'span', text: 'Vancouver Location:', marks: ['strong'] }] },
                { _type: 'block', _key: 'a6', style: 'normal', children: [{ _type: 'span', text: '• Monday through Friday, 8:00 am to 5:00 pm.' }] }
              ]
            },
            {
              _key: 'f2',
              question: 'Where are you located?',
              answerRaw: [
                { _type: 'block', _key: 'a1', style: 'normal', children: [{ _type: 'span', text: 'We have six convenient locations across Portland, OR, and Vancouver, WA. Visit our Locations page to find the shop nearest you.' }] }
              ]
            },
            {
              _key: 'f3',
              question: 'What types of vehicles do you work on?',
              answerRaw: [
                { _type: 'block', _key: 'a1', style: 'normal', children: [{ _type: 'span', text: 'We service a wide range of vehicles, from compact cars to light trucks, ensuring that no matter your vehicle type, we’ve got the expertise to keep it running smoothly.' }] }
              ]
            },
            {
              _key: 'f4',
              question: 'Can I book an appointment online?',
              answerRaw: [
                { _type: 'block', _key: 'a1', style: 'normal', children: [{ _type: 'span', text: 'Yes, we offer easy online booking to help you schedule your service at a time that works best for you.' }] }
              ]
            },
            {
              _key: 'f5',
              question: 'Are Your Services Cost-Effective?',
              answerRaw: [
                { _type: 'block', _key: 'a1', style: 'normal', children: [{ _type: 'span', text: 'Absolutely! We provide high-quality, dealership-level services at more competitive prices, helping you save on essential vehicle care without compromising quality.' }] }
              ]
            },
            {
              _key: 'f6',
              question: 'What is the mission of Green Drop?',
              answerRaw: [
                { _type: 'block', _key: 'a1', style: 'normal', children: [{ _type: 'span', text: 'Our culture is one of commitment to customers and the environment. We are your neighbors and friends — and we’re on the road with you. Our mission and values keep us aligned with our goal of service.' }] }
              ]
            },
            {
              _key: 'f7',
              question: 'Can I check on the status of my car at the shop?',
              answerRaw: [
                { _type: 'block', _key: 'a1', style: 'normal', children: [{ _type: 'span', text: 'Yes, we make it easy to stay updated on your car’s progress. Our team is available to provide updates during your service.' }] }
              ]
            },
            {
              _key: 'f8',
              question: 'Are you hiring?',
              answerRaw: [
                { _type: 'block', _key: 'a1', style: 'normal', children: [{ _type: 'span', text: 'We’re always looking for skilled, passionate people to join our team. Check our Careers page for current opportunities.' }] }
              ]
            }
          ]
        },
        {
          _type: 'blockBlog',
          _key: 'block-blog-main',
          title: 'OUR LATEST NEWS'
        },
        {
          _type: 'blockNearMe',
          _key: 'block-nearme-main',
          title: 'AUTO REPAIR MECHANIC NEAR ME',
          headline: 'Providing Eco-Friendly Auto Repair and Maintenance in Portland & Vancouver and the Nearby Areas',
          cities: [
            'Portland, OR', 'Vancouver, WA', 'Tigard, OR', 'Sherwood, OR',
            'Beaverton, OR', 'Camas, WA', 'Milwaukie, OR', 'Troutdale, OR',
            'Hillsboro, OR', 'Ridgefield, WA', 'Oregon City, OR', 'Fairview, OR',
            'Gresham, OR', 'La Center, WA', 'West Linn, OR', 'Wilsonville, OR'
          ],
          locations: [
            { _type: 'reference', _ref: 'location--central', _key: 'l1' },
            { _type: 'reference', _ref: 'location--mlk', _key: 'l2' },
            { _type: 'reference', _ref: 'location--vancouver', _key: 'l3' },
            { _type: 'reference', _ref: 'location--moreland', _key: 'l4' },
            { _type: 'reference', _ref: 'location--uptown', _key: 'l5' },
            { _type: 'reference', _ref: 'location--st-johns', _key: 'l6' }
          ]
        }
      ]})
      .commit()

    console.log('Successfully patched the Home page with default blocks!')
  } catch (err) {
    console.error('Error patching home page:', err)
  }
}

patchHomePage()
