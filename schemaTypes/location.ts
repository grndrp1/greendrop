import {defineType, defineField} from 'sanity'

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
        defineField({name: 'street', title: 'Street', type: 'string'}),
        defineField({name: 'city', title: 'City', type: 'string'}),
        defineField({name: 'state', title: 'State', type: 'string'}),
        defineField({name: 'zip', title: 'ZIP Code', type: 'string'}),
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
            defineField({name: 'day', title: 'Day', type: 'string'}),
            defineField({name: 'open', title: 'Open Time', type: 'string'}),
            defineField({name: 'close', title: 'Close Time', type: 'string'}),
            defineField({
              name: 'closed',
              title: 'Closed All Day',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {title: 'day', subtitle: 'open'},
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
    defineField({
      name: 'neighborhoodsServed',
      title: 'Neighborhoods served',
      description:
        'List of neighborhoods this shop serves. Inherited by all service×location pages for this shop unless overridden on a specific serviceLocation doc.',
      type: 'array',
      of: [{type: 'string'}],
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
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'image',
      title: 'Location Image',
      type: 'image',
      options: {hotspot: true},
    }),
    // ── About Section fields ──
    defineField({
      name: 'aboutTitle',
      title: 'About Title',
      type: 'string',
      initialValue: 'ABOUT US',
    }),
    defineField({
      name: 'aboutSubheading',
      title: 'About Subheading',
      type: 'string',
    }),
    defineField({
      name: 'aboutContent',
      title: 'About Content',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'aboutImage',
      title: 'About Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'aboutCtaText',
      title: 'About CTA Button Text',
      type: 'string',
      initialValue: 'Book Your Service',
    }),
    defineField({
      name: 'aboutCtaUrl',
      title: 'About CTA Button URL',
      type: 'string',
      initialValue: '/contact',
    }),
    // ── Quick Turnaround Section fields ──
    defineField({
      name: 'quickTurnaroundHeading',
      title: 'Quick Turnaround Heading',
      type: 'string',
      initialValue: 'QUICK TURNAROUND',
    }),
    defineField({
      name: 'quickTurnaroundSubheading',
      title: 'Quick Turnaround Subheading',
      type: 'string',
      initialValue: 'Our Values: Driving with Purpose',
    }),
    defineField({
      name: 'quickTurnaroundContent',
      title: 'Quick Turnaround Content',
      type: 'array',
      of: [{type: 'block'}],
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
    defineField({
      name: 'aggregateRating',
      title: 'Aggregate Rating',
      type: 'aggregateRating',
      description:
        'Rating summary shown in the location hero star bar. If unset, falls back to siteSettings.aggregateRating.',
    }),
    // ── Block Sections ──
    defineField({
      name: 'customerReviews',
      title: 'Customer Reviews Section',
      type: 'blockCustomerReviews',
      description: 'Optionally override the default reviews for this location.',
    }),
    defineField({
      name: 'whyChooseUs',
      title: 'Why Choose Us Section',
      type: 'blockWhyChooseUs',
      description: 'Optionally override the standard values section.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'address.city',
    },
  },
})
