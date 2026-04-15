import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'faqItem',
    title: 'FAQ Item',
    type: 'object',
    fields: [
        defineField({
            name: 'question',
            type: 'string',
            validation: (Rule) => Rule.required().max(160),
        }),
        defineField({
            name: 'answer',
            type: 'text',
            rows: 4,
            validation: (Rule) => Rule.required(),
        }),
    ],
    preview: { select: { title: 'question' } },
})
