
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockBusinessConcierge',
    title: 'Business Concierge Upgrade',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Main Title',
            type: 'string',
            initialValue: 'INTRODUCING THE CONCIERGE UPGRADE',
        }),
        defineField({
            name: 'subtitle',
            title: 'Section Subtitle',
            type: 'string',
            initialValue: 'Upgrade Your Membership with Concierge Service',
        }),
        defineField({
            name: 'description',
            title: 'Section Description',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'bannerText',
            title: 'Green Banner Text',
            type: 'string',
            initialValue: 'Need a little more? Upgrade anytime and get these added benefits to your vehicle maintenance membership.',
        }),
        defineField({
            name: 'plans',
            title: 'Concierge Plans',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'title', title: 'Plan Title', type: 'string' }),
                        defineField({ name: 'description', title: 'Plan Description', type: 'text', rows: 2 }),
                        defineField({ name: 'buttonText', title: 'Button Text', type: 'string' }),
                        defineField({ name: 'buttonUrl', title: 'Button URL', type: 'string' }),
                    ]
                }
            ],
            validation: Rule => Rule.min(1).max(2),
        }),
    ],
    preview: {
        select: { title: 'title' },
        prepare({ title }) {
            return { title: `Business Block: ${title || 'Concierge Upgrade'}` }
        }
    }
})
