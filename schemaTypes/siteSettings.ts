import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Site Title',
            type: 'string',
            description: 'The global title of the site (used for SEO fallbacks)',
        }),
        defineField({
            name: 'description',
            title: 'Site Description',
            type: 'text',
            description: 'The global description for SEO fallbacks',
        }),
        defineField({
            name: 'logo',
            title: 'Site Logo',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'footerAddress',
            title: 'Global Footer Address',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'footerPhone',
            title: 'Global Footer Phone',
            type: 'string',
        }),
        defineField({
            name: 'footerEmail',
            title: 'Global Footer Email',
            type: 'string',
        }),
    ],
})
