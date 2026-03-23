import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'serviceLocation',
    title: 'Service × Location Page',
    type: 'document',
    fields: [
        // References
        defineField({
            name: 'service',
            title: 'Service',
            type: 'reference',
            to: [{ type: 'service' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'reference',
            to: [{ type: 'location' }],
            validation: (Rule) => Rule.required(),
        }),
        // Slug used for this page
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'e.g. "brakes-central"',
            options: { maxLength: 200 },
        }),
        // Canonical and legacy paths (from import data)
        defineField({
            name: 'canonicalPath',
            title: 'Canonical Path',
            type: 'string',
            description: 'e.g. "/services/brakes/central/"',
        }),
        defineField({
            name: 'legacyPath',
            title: 'Legacy Path (for 301 redirect)',
            type: 'string',
            description: 'e.g. "/location/central/brakes/"',
        }),
        // Localised content
        defineField({
            name: 'headline',
            title: 'Headline (H1)',
            type: 'string',
        }),
        defineField({
            name: 'intro',
            title: 'Intro Text',
            type: 'text',
            rows: 4,
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
            title: 'Page Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'localOffer',
            title: 'Local Offer / Pricing Note',
            type: 'text',
            rows: 3,
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
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
        }),
    ],
    preview: {
        select: {
            serviceTitle: 'service.title',
            locationTitle: 'location.title',
            path: 'canonicalPath',
        },
        prepare({ serviceTitle, locationTitle, path }) {
            return {
                title: `${serviceTitle ?? 'Service'} – ${locationTitle ?? 'Location'}`,
                subtitle: path ?? 'Service × Location',
            }
        },
    },
})
