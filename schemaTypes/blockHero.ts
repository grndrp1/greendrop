import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockHero',
    title: 'Hero Block (Purple)',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Hero Title',
            type: 'string',
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'centered',
            title: 'Centered Layout',
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
                title: `Hero: ${title || 'Untitled'}`,
            }
        }
    }
})
