const { getCliClient } = require('sanity/cli');

const client = getCliClient();

const contentData = {
  central: {
    subheading: 'The Shop That Started It All in Portland, OR',
    content: [
      'Located in the heart of Portland, OR, our Central Garage is the original Green Drop Garage location where our eco-friendly mission began. Since 2009, we’ve been dedicated to delivering quality car care with a sustainable approach. Our garage is steeped in local history, from its days as a WWII textile factory to its transformation into an eco-conscious auto repair hub. Today, the Central Garage combines neighborhood charm with a commitment to the environment, setting the foundation for everything Green Drop Garage stands for.',
      'Green Drop Garage is not your typical auto shop. As a NAPA AutoCare Center with ASE-certified technicians, we offer a 24-month/24k-mile nationwide warranty on parts and labor, ensuring reliability and quality for every service. But what really sets us apart is our green ethos. We’re committed to using re-refined oils, biodegradable chemicals, and repurposing existing buildings for our locations, reducing our environmental impact at every turn. From Portland to Vancouver, our garages reflect our dedication to both the planet and the communities we serve.'
    ]
  },
  mlk: {
    subheading: 'Reclaiming History in the Heart of Portland',
    content: [
      'Located in the heart of Portland, OR, our MLK Garage is part of the Green Drop Garage family, bringing eco-friendly practices to reliable auto repair. Originally a Battery Exchange shop, our MLK Garage has been reclaimed and transformed into a space that reflects our commitment to sustainability and community. Here, you’ll experience the welcoming Green Drop Garage vibe, complete with local Stumptown cold brew and a straightforward approach to auto repair that prioritizes clarity and care.',
      'What sets our MLK Garage apart is our dedication to high-quality, green auto repair. As a NAPA AutoCare Center with ASE-certified technicians, we offer industry-standard service with an eco-conscious twist. From re-refined oil to low-impact cleaning chemicals, every aspect of our operations reduces environmental impact. Supported by a 24-month/24k-mile nationwide warranty on parts and labor, our work is as reliable as it is sustainable, providing you with both peace of mind and a greener choice for auto care.'
    ]
  },
  moreland: {
    subheading: 'Redefining Auto Care with Comfort and Expertise',
    content: [
      'Green Drop Garage’s Moreland location opened in 2015 with a mission to redefine auto care. Designed for a seamless and enjoyable experience, our Moreland Garage combines comfort and expertise, delivering top-quality services in a thoughtfully crafted environment. Equipped with new lifts, a welcoming lobby, and an ASE-certified team, this location offers a superior experience for car owners in the Portland area. Our services are backed by a 24-month/24k-mile nationwide warranty, ensuring you receive reliable, lasting care.',
      'At Green Drop Garage, we’re not just about fixing cars—we’re committed to sustainability in every repair. As a NAPA AutoCare Center, we adhere to high-quality standards while also minimizing our environmental impact. From reclaimed materials used in our buildings to re-refined oil and low-impact chemicals in our services, Green Drop’s eco-conscious approach makes us a top choice for drivers who value both quality and responsibility. With us, you can trust your vehicle is in capable hands that prioritize our planet.'
    ]
  },
  'st-johns': {
    subheading: 'Neighborhood Auto Care in the Heart of St. Johns',
    content: [
      'Green Drop Garage St. Johns is your neighborhood eco-friendly auto shop, located in the vibrant St. Johns community of Portland, OR. From its days as a neighborhood gas station to its rebirth as a top-tier auto repair shop, our St. Johns Garage carries on the Green Drop legacy of quality, sustainability, and community focus. Here, you’ll find the same welcoming environment and ASE-certified expertise you’ve come to expect from us, all in the heart of St. Johns.',
      'At The St. Johns Garage, we don’t just fix cars; we build relationships rooted in reliability and environmental responsibility. Our ASE-certified technicians are not only highly skilled but also dedicated to our eco-friendly mission, using re-refined oil, low-impact chemicals, and sustainable practices. As a NAPA AutoCare Center, we prioritize quality, offering every customer a nationwide warranty. Our commitment to reducing our carbon footprint makes us a unique choice for those looking for green auto care in St. Johns, Portland, OR.'
    ]
  },
  uptown: {
    subheading: 'Eco-Friendly Westside Auto Repair Since 2018',
    content: [
      'Our Uptown Garage, the newest addition to Green Drop Garage, brings eco-friendly auto repair to the westside. Since opening in 2018, we’ve stayed true to our roots, focusing on essentials like quality repairs, expert ASE-certified technicians, and a straightforward, comfortable experience. As a NAPA AutoCare Center, we back every repair with a 24-month/24k-mile nationwide warranty, giving our customers confidence and peace of mind.',
      'We’re not just an auto shop; we’re a green-focused, community-driven business. From our eco-conscious practices—like using re-refined oil and lower-impact chemicals—to our emphasis on repurposing buildings, every part of Green Drop Garage is built around sustainability. At Uptown, we offer genuine, high-quality service in a streamlined, no-frills environment, focusing on the essentials that make a difference to both our customers and the planet.'
    ]
  },
  vancouver: {
    subheading: 'Trusted, Eco-Conscious Services in the Couve',
    content: [
      'Green Drop Garage is thrilled to bring its trusted, eco-conscious auto services to Vancouver, WA, with our newest location—The Couve Garage. Conveniently located on Main Street in the Shumway neighborhood, we’re here to serve our community with the same level of care that has made Green Drop a staple in Portland since 2009. Stop by for a cold brew coffee, relax in our comfortable lobby, and let us handle your vehicle’s needs, backed by a 24-month/24k-mile nationwide warranty on parts and labor.',
      'At The Couve Garage, we don’t just fix cars; we build relationships rooted in reliability and environmental responsibility. Our ASE-certified technicians are not only highly skilled but also dedicated to our eco-friendly mission, using re-refined oil, low-impact chemicals, and sustainable practices. As a NAPA AutoCare Center, we prioritize quality, offering every customer a nationwide warranty. Our commitment to reducing our carbon footprint makes us a unique choice for those looking for green auto care in Vancouver, WA.'
    ]
  }
};

function toBlocks(paragraphs) {
  return paragraphs.map((text, i) => ({
    _key: `p${i}`,
    _type: 'block',
    children: [
      {
        _key: `c${i}`,
        _type: 'span',
        marks: [],
        text: text
      }
    ],
    markDefs: [],
    style: 'normal'
  }));
}

async function run() {
  try {
    const locations = await client.fetch('*[_type == "location"]{ _id, "slug": slug.current }');
    console.log(`Found ${locations.length} locations to patch.`);

    for (const loc of locations) {
      const data = contentData[loc.slug];
      if (!data) {
        console.warn(`No content found for slug: ${loc.slug}`);
        continue;
      }

      console.log(`Patching ${loc.slug}...`);
      await client
        .patch(loc._id)
        .set({
          aboutTitle: 'ABOUT US',
          aboutSubheading: data.subheading,
          aboutContent: toBlocks(data.content),
          aboutCtaText: 'Book Your Service',
          aboutCtaUrl: 'https://www.greendropgarage.com/contact'
        })
        .commit();
      console.log(`Successfully patched ${loc.slug}`);
    }
    console.log('\n--- ALL UPDATES COMPLETE ---');
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
  }
}

run();
