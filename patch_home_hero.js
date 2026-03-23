const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 'i2own2jr', // Assuming this is correct from prev script
    dataset: 'production',
    apiVersion: '2024-02-27',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

async function run() {
    try {
        await client.patch('page--home')
            .set({
                heroTitle: 'YOUR ECO-FRIENDLY AUTO REPAIR SHOP IN THE PACIFIC NORTHWEST',
                heroSubtitle: 'Modern Car Repair for a Greener Northwest',
                heroTagline: 'All Makes and Models Served',
                heroCtaText: 'Book Service Online'
            })
            .commit();
        console.log('Successfully patched page--home!');
    } catch (err) {
        console.error('Failed to patch', err.message);
    }
}

run();
