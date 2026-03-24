import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'location',
    title: 'Location',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Location Name',
            type: 'string',
            description: 'e.g. "Central", "MLK", "Moreland"',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'Used in URLs: /locations/{slug}/',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        // Address
        defineField({
            name: 'address',
            title: 'Address',
            type: 'object',
            fields: [
                defineField({ name: 'street', title: 'Street', type: 'string' }),
                defineField({ name: 'city', title: 'City', type: 'string' }),
                defineField({ name: 'state', title: 'State', type: 'string' }),
                defineField({ name: 'zip', title: 'ZIP Code', type: 'string' }),
            ],
        }),
        defineField({
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
        }),
        // Operating Hours
        defineField({
            name: 'hours',
            title: 'Operating Hours',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'day', title: 'Day', type: 'string' }),
                        defineField({ name: 'open', title: 'Open Time', type: 'string' }),
                        defineField({ name: 'close', title: 'Close Time', type: 'string' }),
                        defineField({
                            name: 'closed',
                            title: 'Closed All Day',
                            type: 'boolean',
                            initialValue: false,
                        }),
                    ],
                    preview: {
                        select: { title: 'day', subtitle: 'open' },
                    },
                },
            ],
        }),
        defineField({
            name: 'coordinates',
            title: 'GPS Coordinates',
            type: 'geopoint',
        }),
        defineField({
            name: 'googleMapsUrl',
            title: 'Google Maps URL',
            type: 'url',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 4,
        }),
        // ── Hero Section fields ──
        defineField({
            name: 'heroImageUrl',
            title: 'Hero Background Image URL',
            type: 'string',
            description: 'Full CDN URL to the location hero background image.',
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
            title: 'Location Image',
            type: 'image',
            options: { hotspot: true },
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
        // Social Links
        defineField({
            name: 'facebookUrl',
            title: 'Facebook URL',
            type: 'url',
        }),
        defineField({
            name: 'instagramUrl',
            title: 'Instagram URL',
            type: 'url',
        }),
        defineField({
            name: 'linkedinUrl',
            title: 'LinkedIn URL',
            type: 'url',
        }),
        defineField({
            name: 'yelpUrl',
            title: 'Yelp URL',
            type: 'url',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'address.city',
        },
    },
})
