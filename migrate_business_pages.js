const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
dotenv.config();

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-02-27',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function migrate() {
    const slugs = ['business', 'business-car-care', 'business-truck-suv-care', 'fleet-care'];
    
    const pages = await client.fetch(`*[_type == "page" && slug.current in $slugs]`, { slugs });

    for (const page of pages) {
        console.log(`Migrating ${page.slug.current}...`);
        
        let heroTitle = page.title;
        if (page.slug.current === 'business') heroTitle = 'BUSINESS CARE';
        else if (page.slug.current === 'business-car-care') heroTitle = 'BUSINESS CAR CARE';
        else if (page.slug.current === 'business-truck-suv-care') heroTitle = 'BUSINESS TRUCK+SUV CARE';
        else if (page.slug.current === 'fleet-care') heroTitle = 'FLEET CARE';

        await client.patch(page._id)
            .set({
                pageType: 'business',
                title: heroTitle,
                businessIntroHeadline: 'COMMERCIAL VEHICLE MAINTENANCE MADE EASY',
                businessIntroText: "You depend on you vehicle for business, so keep it in great shape with a Green Drop membership. Whether you're driving for Lyft, Uber, or you're bringing supplies to the jobsite, we have a plan for keeping your ride running. Bring your vehicle in anytime with your annual subscription billed monthly. That's how we make auto maintenance simple and hassle-free.",
                businessPerks: [
                    {
                        _key: 'perk1',
                        iconName: 'Crown',
                        title: 'Freebies',
                        text: 'Free oil changes, fluid top offs, bulb and fuse replacements, wiper blades, engine air filter replacements, tire rotations, and more!'
                    },
                    {
                        _key: 'perk2',
                        iconName: 'Leaf',
                        title: 'EV Loaners',
                        text: 'When available we have loaner vehicles for extended vehicle stays.'
                    },
                    {
                        _key: 'perk3',
                        iconName: 'BadgeDollarSign',
                        title: 'Discounts & Specials',
                        text: 'You’re saving by being a member through free oil changes. Get member discounts on mount and balance services and seasonal specials.'
                    },
                    {
                        _key: 'perk4',
                        iconName: 'RefreshCw',
                        title: '2% Back',
                        text: 'Get an annual 2% back on what you invest in keeping your car maintained!'
                    }
                ],
                businessPlans: [
                    {
                        _key: 'plan1',
                        vehicleIcon: 'Car',
                        name: 'BUSINESS CAR CARE',
                        subtitle: 'For commercial use cars.',
                        priceText: '$27 / Month',
                        isButton: false
                    },
                    {
                        _key: 'plan2',
                        vehicleIcon: 'Truck',
                        name: 'BUSINESS TRUCK/SUV CARE',
                        subtitle: 'For commercial use trucks and SUVs.',
                        priceText: '$37 / Month',
                        isButton: false
                    },
                    {
                        _key: 'plan3',
                        vehicleIcon: 'Network',
                        name: 'FLEET CARE',
                        subtitle: 'For commercial fleets with 3 or more vehicles.',
                        priceText: 'Learn More',
                        isButton: true
                    }
                ],
                businessStep2Headline: 'Hassle-Free Maintenance Begins',
                businessStep2Text: "We want to see you and your car as soon as possible. Get a FREE green oil change and a safety inspection as part of your membership.\n\nFrom day one, your membership entitles you to as many visits, oil changes, and inspections as you need. Get a flat? We fix yours for free. Burnt out bulb or fuse? No extra charge – we’ll take care of it. And that’s just the beginning of great auto care that’s as green as it gets.",
                businessStep3Headline: 'Get Special Rewards and Deep Discounts',
                businessStep3Text: "We offer deep seasonal discounts to members in thanks for helping us do the right thing for the environment while doing the right thing for them. We make it as easy as possible to maintain your car using eco-friendly methods."
            })
            // Remove rawHtml so the new native layout appears normally
            .unset(['rawHtml'])
            .commit();
            
        console.log(`Successfully migrated ${page.slug.current}`);
    }
}

migrate().catch(console.error);
