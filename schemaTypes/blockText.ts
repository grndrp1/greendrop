import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockText',
    title: 'Text Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Block Title (Optional)',
            type: 'string',
        }),
        defineField({
            name: 'bodyRaw',
            title: 'Content',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'alignment',
            title: 'Alignment',
            type: 'string',
            options: {
                list: [
                    { title: 'Left', value: 'left' },
                    { title: 'Center', value: 'center' },
                ],
                layout: 'radio',
            },
            initialValue: 'left',
        }),
        defineField({
            name: 'maxWidth',
            title: 'Max Width',
            type: 'string',
            options: {
                list: [
                    { title: 'Standard (4xl)', value: 'max-w-4xl' },
                    { title: 'Narrow (2xl)', value: 'max-w-2xl' },
                    { title: 'Wide (6xl)', value: 'max-w-6xl' },
                    { title: 'Full', value: 'max-w-none' },
                ],
            },
            initialValue: 'max-w-4xl',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            alignment: 'alignment',
        },
        prepare({ title, alignment }) {
            return {
                title: `Text: ${title || 'Untitled'} (${alignment})`,
            }
        }
    }
})
