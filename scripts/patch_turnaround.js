const { getCliClient } = require('sanity/cli');

const client = getCliClient();

const contentData = {
  central: { name: 'Central Garage', cityState: 'Portland, OR' },
  mlk: { name: 'MLK Garage', cityState: 'Portland, OR' },
  moreland: { name: 'Moreland Garage', cityState: 'Portland, OR' },
  'st-johns': { name: 'St. Johns Garage', cityState: 'Portland, OR' },
  uptown: { name: 'Uptown Garage', cityState: 'Portland, OR' },
  vancouver: { name: 'The Couve Garage', cityState: 'Vancouver, WA' }
};

const commonP1 = 'At Green Drop Garage, we believe in making vehicle maintenance both responsible and reliable. Our eco-friendly practices—such as recycling, energy-efficient techniques, and green products—ensure that each service meets high environmental standards. Our ASE-certified technicians continuously train to stay updated on best practices, so your car receives expert care while we uphold our sustainable mission.';

function getP2(name, cityState) {
  return `Looking for a refreshing, eco-conscious approach to auto care? Schedule your service at ${name} today, where you can relax with a coffee while we care for your vehicle. With our green practices, skilled team, and 24-month/24k-mile warranty, you'll experience auto repair with a purpose. Call us or visit online to make an appointment—we're excited to welcome you into the Green Drop family in ${cityState}!`;
}

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
      if (!data) continue;

      console.log(`Patching Quick Turnaround for ${loc.slug}...`);
      await client
        .patch(loc._id)
        .set({
          quickTurnaroundHeading: 'QUICK TURNAROUND',
          quickTurnaroundSubheading: 'Our Values: Driving with Purpose',
          quickTurnaroundContent: toBlocks([commonP1, getP2(data.name, data.cityState)])
        })
        .commit();
      console.log(`Success: ${loc.slug}`);
    }
    console.log('\n--- ALL UPDATES COMPLETE ---');
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
  }
}

run();
