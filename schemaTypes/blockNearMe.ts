import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockNearMe',
    title: 'Near Me Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'AUTO REPAIR MECHANIC NEAR ME',
        }),
        defineField({
            name: 'headline',
            title: 'Section Headline',
            type: 'string',
            initialValue: 'Providing Eco-Friendly Auto Repair and Maintenance in Portland & Vancouver and the Nearby Areas',
        }),
        defineField({
            name: 'bodyRaw',
            title: 'Body Text',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'cities',
            title: 'Cities / Areas Served',
            type: 'array',
            of: [{ type: 'string' }],
            initialValue: [
                'Portland, OR', 'Vancouver, WA', 'Tigard, OR', 'Sherwood, OR',
                'Beaverton, OR', 'Camas, WA', 'Milwaukie, OR', 'Troutdale, OR',
                'Hillsboro, OR', 'Ridgefield, WA', 'Oregon City, OR', 'Fairview, OR',
                'Gresham, OR', 'La Center, WA', 'West Linn, OR', 'Wilsonville, OR'
            ]
        }),
        defineField({
            name: 'locations',
            title: 'Garage Locations',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'location' }] }],
        }),
        defineField({
            name: 'mapImageUrl',
            title: 'Map Image URL (Placeholder)',
            type: 'string',
            description: 'Temporary URL for the map image until interactive map is integrated.',
        }),
        defineField({
            name: 'cta1Text',
            title: 'CTA 1 Text (Map)',
            type: 'string',
            initialValue: 'Find Nearest Location',
        }),
        defineField({
            name: 'cta2Text',
            title: 'CTA 2 Text (Footer)',
            type: 'string',
            initialValue: 'Book Service Now',
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: `Block: ${title || 'Near Me'}`,
            }
        }
    }
})
