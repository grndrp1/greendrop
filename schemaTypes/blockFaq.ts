import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockFaq',
    title: 'FAQ Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'FREQUENTLY ASKED QUESTIONS',
        }),
        defineField({
            name: 'tagline',
            title: 'Section Tagline',
            type: 'string',
        }),
        defineField({
            name: 'faqs',
            title: 'FAQs',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'question', title: 'Question', type: 'string' }),
                        defineField({ name: 'answerRaw', title: 'Answer', type: 'array', of: [{ type: 'block' }] }),
                    ]
                }
            ],
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Text',
            type: 'string',
            initialValue: 'Book Your Visit',
        }),
        defineField({
            name: 'ctaUrl',
            title: 'CTA URL',
            type: 'string',
            initialValue: 'https://www.greendropgarage.com/contact',
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: `Block: ${title || 'FAQ'}`,
            }
        }
    }
})
