import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockCustomerReviews',
    title: 'Customer Reviews Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'Customer Reviews',
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Text',
            type: 'string',
            initialValue: 'See All Reviews',
        }),
        defineField({
            name: 'ctaUrl',
            title: 'CTA URL',
            type: 'string',
            initialValue: 'https://g.page/greendropgarage',
        }),
        defineField({
            name: 'image',
            title: 'Featured Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'useDefaults',
            title: 'Use Default Reviews?',
            type: 'boolean',
            description: 'If checked, this section will pull reviews from Global Site Settings.',
            initialValue: true,
        }),
        defineField({
            name: 'reviews',
            title: 'Review Items',
            type: 'array',
            description: 'Provide custom reviews for this page. (Will be ignored if "Use Default Reviews" is checked above).',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'author', title: 'Author Name', type: 'string' }),
                        defineField({ name: 'text', title: 'Review Text', type: 'text' }),
                        defineField({ name: 'stars', title: 'Stars', type: 'number', initialValue: 5 }),
                    ]
                }
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: `Block: ${title || 'Customer Reviews'}`,
            }
        }
    }
})
