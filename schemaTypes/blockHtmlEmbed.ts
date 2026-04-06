import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockHtmlEmbed',
    title: 'HTML Embed / Form',
    type: 'object',
    fields: [
        defineField({
            name: 'label',
            title: 'Internal Label',
            type: 'string',
            description: 'A label for internal reference in Sanity.',
        }),
        defineField({
            name: 'htmlCode',
            title: 'HTML Embed Code',
            type: 'text',
            rows: 10,
            description: 'Paste your form or widget embed code here (e.g. from JotForm, Google Forms, etc.)',
        }),
    ],
    preview: {
        select: {
            title: 'label',
            subtitle: 'htmlCode',
        },
        prepare({ title, subtitle }) {
            return {
                title: `HTML Embed: ${title || 'Untitled'}`,
                subtitle: subtitle ? subtitle.substring(0, 50) + '...' : 'No code provided',
            }
        }
    }
})
