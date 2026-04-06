
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockBusinessJoinCTA',
    title: 'Business Join CTA',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Main Title (e.g. JOIN TODAY & SAVE)',
            type: 'string',
            initialValue: 'JOIN TODAY & SAVE',
        }),
        defineField({
            name: 'subtitle',
            title: 'Section Subtitle',
            type: 'string',
            initialValue: 'Unlimited Visits. One Fixed Price.',
        }),
        defineField({
            name: 'description',
            title: 'Section Description',
            type: 'text',
            rows: 4,
        }),
        defineField({
            name: 'ctaText',
            title: 'Button Text',
            type: 'string',
            initialValue: 'Subscribe Now',
        }),
        defineField({
            name: 'ctaUrl',
            title: 'Button URL',
            type: 'string',
        }),
    ],
    preview: {
        select: { title: 'title' },
        prepare({ title }) {
            return { title: `Business Block: ${title || 'Join CTA'}` }
        }
    }
})
