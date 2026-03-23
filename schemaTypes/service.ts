import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'service',
    title: 'Service',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Service Name',
            type: 'string',
            description: 'e.g. "Oil Changes", "Brakes", "Tires"',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'Used in URLs: /services/{slug}/ — keep lowercase & hyphenated.',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'shortDescription',
            title: 'Short Description',
            type: 'text',
            rows: 3,
        }),
        // ── Hero Section fields ──
        defineField({
            name: 'heroImageUrl',
            title: 'Hero Background Image URL',
            type: 'string',
            description: 'Full CDN URL to the hero background image.',
        }),
        defineField({
            name: 'heroTitle',
            title: 'Hero Title (H1)',
            type: 'string',
        }),
        defineField({
            name: 'heroSubtitle',
            title: 'Hero Subtitle',
            type: 'string',
        }),
        defineField({
            name: 'heroCtaText',
            title: 'Hero CTA Button Text',
            type: 'string',
        }),
        defineField({
            name: 'heroCtaUrl',
            title: 'Hero CTA Button URL',
            type: 'string',
        }),
        defineField({
            name: 'body',
            title: 'Body Content',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'rawHtml',
            title: 'Raw HTML Content',
            type: 'text',
            description: 'The raw extracted HTML from the live site.',
        }),
        defineField({
            name: 'image',
            title: 'Service Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'icon',
            title: 'Icon',
            type: 'image',
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Maintenance', value: 'maintenance' },
                    { title: 'Repair', value: 'repair' },
                    { title: 'Tires', value: 'tires' },
                    { title: 'Membership', value: 'membership' },
                    { title: 'Other', value: 'other' },
                ],
                layout: 'dropdown',
            },
        }),
        defineField({
            name: 'featured',
            title: 'Featured Service?',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'legacySlugs',
            title: 'Legacy Slugs (for 301 redirects)',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'e.g. ["oil-change", "maintenance"]',
        }),
        // SEO
        defineField({
            name: 'seoTitle',
            title: 'SEO Title',
            type: 'string',
        }),
        defineField({
            name: 'seoDescription',
            title: 'SEO Meta Description',
            type: 'text',
            rows: 3,
            validation: (Rule) => Rule.max(160),
        }),
        defineField({
            name: 'canonicalUrl',
            title: 'Canonical URL',
            type: 'url',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'category',
            media: 'image',
        },
    },
})
