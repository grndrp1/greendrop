import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockBlog',
    title: 'Blog Highlights Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'OUR LATEST NEWS',
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Text',
            type: 'string',
            initialValue: 'See More of Our Blog',
        }),
        defineField({
            name: 'ctaUrl',
            title: 'CTA URL',
            type: 'string',
            initialValue: '/blog',
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: `Block: ${title || 'Blog Highlights'}`,
            }
        }
    }
})
