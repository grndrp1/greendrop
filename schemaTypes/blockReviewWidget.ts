import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockReviewWidget',
    title: 'Review Widget',
    type: 'object',
    fields: [
        defineField({
            name: 'locationName',
            title: 'Location Name',
            type: 'string',
            description: 'e.g. "Central Garage"',
        }),
        defineField({
            name: 'widgetId',
            title: 'Elfsight Widget ID',
            type: 'string',
            description: 'The unique ID for the Elfsight reviews widget.',
        }),
        defineField({
            name: 'backgroundColor',
            title: 'Background Color',
            type: 'string',
            options: {
                list: [
                    { title: 'White', value: 'white' },
                    { title: 'Off-white', value: 'off-white' },
                ],
                layout: 'radio',
            },
            initialValue: 'white',
        }),
    ],
    preview: {
        select: {
            title: 'locationName',
            subtitle: 'widgetId',
        },
    },
})
