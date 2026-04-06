
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'i2own2jr',
  dataset: 'production',
  useCdn: false,
  token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
  apiVersion: '2023-05-03'
});

async function patchCareersForm() {
    console.log('Fetching careers page...');
    const careersPage = await client.fetch('*[_type == "page" && slug.current == "careers"][0]');

    const employmentBlock = {
        _type: 'blockEmploymentForm',
        _key: 'employment-form-01',
        title: 'EMPLOYMENT APPLICATION',
        subtitle: 'Use the form below to inquire about employment opportunities with our company.',
        successMessage: 'Thank you for your application! We will be in touch soon.'
    };

    if (careersPage) {
        console.log(`Found careers page (ID: ${careersPage._id}). Patching...`);
        // Append to existing pageBuilder or create it
        const pageBuilder = careersPage.pageBuilder || [];
        // Only add if it doesn't already exist
        if (!pageBuilder.some(b => b._type === 'blockEmploymentForm')) {
            await client.patch(careersPage._id)
                .set({ pageBuilder: [...pageBuilder, employmentBlock] })
                .commit();
            console.log('Successfully added employment form to the careers page.');
        } else {
            console.log('Employment form already exists on the careers page.');
        }
    } else {
        console.log('Careers page not found. Creating a new one...');
        await client.create({
            _id: 'page--careers',
            _type: 'page',
            title: 'Careers',
            slug: { _type: 'slug', current: 'careers' },
            pageType: 'general',
            pageBuilder: [employmentBlock]
        });
        console.log('Successfully created Careers page with employment form.');
    }
}

patchCareersForm().catch(console.error);
