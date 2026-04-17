import {defineType, defineField} from 'sanity'

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
      to: [{type: 'service'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'reference',
      to: [{type: 'location'}],
      validation: (Rule) => Rule.required(),
    }),
    // Slug used for this page
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'e.g. "brakes-central"',
      options: {maxLength: 200},
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
    // Hero
    defineField({
      name: 'heroValueProp',
      title: 'Hero value prop (1 line)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'neighborhoodsServed',
      title: 'Neighborhoods served (chips, min 3)',
      type: 'array',
      of: [{type: 'string'}],
      validation: (Rule) => Rule.required().min(3),
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
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'serviceDetails',
      title: 'Service details (main body, Portable Text)',
      type: 'array',
      of: [{type: 'block'}],
      description:
        'Renders inside the branded detail card. Will replace legacy "body" field after migration.',
    }),
    defineField({
      name: 'bulletPoints',
      title: 'Bullet points (5–7)',
      type: 'array',
      of: [{type: 'string'}],
      
    }),
    defineField({
      name: 'image',
      title: 'Page Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'localOffer',
      title: 'Local Offer / Pricing Note',
      type: 'text',
      rows: 3,
    }),
    // Overrides
    defineField({
      name: 'whyUsOverride',
      title: 'Why Us override (optional — 3 bullets)',
      type: 'array',
      of: [{type: 'whyUsBullet'}],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'uniqueFaq',
      title: 'Unique FAQ (1 per page for SEO uniqueness)',
      type: 'faqItem',
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
    prepare({serviceTitle, locationTitle, path}) {
      return {
        title: `${serviceTitle ?? 'Service'} – ${locationTitle ?? 'Location'}`,
        subtitle: path ?? 'Service × Location',
      }
    },
  },
})
