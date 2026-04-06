const { createClient } = require('@sanity/client');

const client = createClient({
    projectId: 'i2own2jr',
    dataset: 'production',
    useCdn: false,
    token: 'skbFEl5mycsiIJuPFMPQ5ycJUU91UvuuOkrSpP2AI3vPnTWdc0eSXJjdf1VjG2cUVpEmVgzk8KBCYcN5BCw0mq7mLX7vIJUwtzaPAEE9XduGmV3YyUcbCno4Qsmh2KCOeue129RsNpUb2EbjUv1IovmPfVOvucBicBfqcr8QmE5gTrffyrjQ',
    apiVersion: '2023-05-03',
});

async function patchLoanerCars() {
    const loanerCarsPage = {
        _type: 'page',
        _id: 'page-loaner-cars',
        title: 'Loaner Cars',
        slug: { _type: 'slug', current: 'loaner-cars' },
        pageType: 'about',
        pageBuilder: [
            {
                _key: 'hero-1',
                _type: 'blockHero',
                title: 'LOANER CARS',
                centered: true,
            },
            {
                _key: 'text-1',
                _type: 'blockText',
                title: 'LOANER CAR RELEASE FORM',
                alignment: 'center',
                bodyRaw: [
                    {
                        _key: 'p1',
                        _type: 'block',
                        style: 'normal',
                        children: [
                            {
                                _key: 'c1',
                                _type: 'span',
                                text: 'Green Drop members can apply for the use of a loaner car. We gladly loan a car, when available, from our small fleet to Green Drop members who are current with their dues, have a valid driver’s license, and proper insurance coverage.',
                            }
                        ],
                    }
                ],
            },
            {
                _key: 'embed-1',
                _type: 'blockHtmlEmbed',
                label: 'Loaner Car Form',
                htmlCode: '<!-- PASTE YOUR FORM EMBED CODE HERE -->\n<div style="text-align: center; padding: 40px; border: 2px dashed #ccc; color: #666; font-weight: bold;">[ FORM WILL APPEAR HERE ]</div>',
            }
        ],
    };

    try {
        console.log('Cleaning up old page...');
        await client.delete('page-loaner-cars');
        console.log('Creating refreshed Loaner Cars page...');
        await client.create(loanerCarsPage);
        console.log('Successfully created Loaner Cars page!');
    } catch (err) {
        console.error('Error creating page:', err.message);
    }
}

patchLoanerCars();
