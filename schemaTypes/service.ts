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
        // ── Dynamic Service Sections ──
        defineField({
            name: 'serviceSection1',
            title: 'Service Section 1 (Badge + Text + Image)',
            type: 'object',
            fields: [
                defineField({ name: 'badge', title: 'Badge', type: 'string', initialValue: 'Services' }),
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] }),
                defineField({ name: 'ctaText', title: 'Button Text', type: 'string' }),
                defineField({ name: 'ctaUrl', title: 'Button URL', type: 'string' }),
                defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
            ]
        }),
        defineField({
            name: 'serviceSection2',
            title: 'Service Section 2 (Title + Text — Dark BG)',
            type: 'object',
            fields: [
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] }),
            ]
        }),
        defineField({
            name: 'serviceSection3',
            title: 'Service Section 3 (Title + Text + Button)',
            type: 'object',
            fields: [
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] }),
                defineField({ name: 'ctaText', title: 'Button Text', type: 'string' }),
                defineField({ name: 'ctaUrl', title: 'Button URL', type: 'string' }),
            ]
        }),
        defineField({
            name: 'serviceSection4',
            title: 'Service Section 4 (Title + Text)',
            type: 'object',
            fields: [
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'content', title: 'Content', type: 'array', of: [{ type: 'block' }] }),
            ]
        }),
        // ── Block Sections ──
        defineField({
            name: 'customerReviews',
            title: 'Customer Reviews Section',
            type: 'blockCustomerReviews',
            description: 'Optionally override the default reviews for this service.',
        }),
        defineField({
            name: 'perks',
            title: 'Perks Section',
            type: 'blockPerks',
            description: 'Optionally override the default perks (badges) for this service.',
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
