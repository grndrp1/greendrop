
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockBusinessIncluded',
    title: 'Business Included Grid',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: "WHAT'S INCLUDED IN YOUR MEMBERSHIP",
        }),
        defineField({
            name: 'items',
            title: 'Included Items',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'label',
                            title: 'Label (e.g. FREE Oil Changes)',
                            type: 'string',
                        }),
                        defineField({
                            name: 'iconName',
                            title: 'Icon Name (Lucide React name)',
                            type: 'string',
                        }),
                    ],
                }
            ],
            validation: Rule => Rule.min(1).max(20),
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: `Business Block: ${title || 'Included Grid'}`,
            }
        }
    }
})
