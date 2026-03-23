import { getCliClient } from 'sanity/cli';

const client = getCliClient();

async function initSettings() {
    try {
        await client.createIfNotExists({
            _id: 'siteSettings',
            _type: 'siteSettings',
            title: 'Green Drop Garage Settings'
        });
        console.log('Successfully initialized the Site Settings document!');
    } catch (error) {
        console.error('Error initializing document:', error);
    }
}

initSettings();
