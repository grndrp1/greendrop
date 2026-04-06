
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockBusinessTerms',
    title: 'Business Terms & Conditions',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Main Title',
            type: 'string',
            initialValue: 'TERMS & CONDITIONS',
        }),
        defineField({
            name: 'content',
            title: 'Terms Content',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                    ],
                    lists: [{ title: 'Bullet', value: 'bullet' }],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                            { title: 'Underline', value: 'underline' },
                        ],
                    },
                },
            ],
        }),
    ],
    preview: {
        select: { title: 'title' },
        prepare({ title }) {
            return { title: `Business Block: ${title || 'Terms & Conditions'}` }
        }
    }
})
