import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockWelcome',
    title: 'Welcome Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'Welcome to Green Drop Garage',
        }),
        defineField({
            name: 'bodyRaw',
            title: 'Body Text',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Text',
            type: 'string',
        }),
        defineField({
            name: 'ctaUrl',
            title: 'CTA URL',
            type: 'string',
        }),
        defineField({
            name: 'mainImage',
            title: 'Main Image (Tall)',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'overlappingImage',
            title: 'Overlapping Image (Square)',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'showTrustBadges',
            title: 'Show Trust Badges (B-Corp)',
            type: 'boolean',
            initialValue: true,
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: `Block: ${title || 'Welcome Section'}`,
            }
        }
    }
})
