import {defineField, defineType} from 'sanity'

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
      options: {hotspot: true},
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
    defineField({
      name: 'defaultReviewsImage',
      title: 'Master Review Image',
      type: 'image',
      description: 'The image (e.g. shop dog) shown next to reviews when using defaults.',
      options: {hotspot: true},
    }),
    defineField({
      name: 'defaultReviews',
      title: 'Master Reviews List',
      type: 'array',
      description: 'The default reviews seen across the entire site.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'author', title: 'Author Name', type: 'string'}),
            defineField({name: 'text', title: 'Review Text', type: 'text'}),
            defineField({name: 'stars', title: 'Stars', type: 'number', initialValue: 5}),
          ],
        },
      ],
    }),
    defineField({
      name: 'tagline',
      title: 'Site Tagline',
      type: 'string',
      initialValue: 'Eco-Friendly Auto Maintenance & Repairs in the Pacific Northwest',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'string',
      initialValue: '© 2026 Green Drop Garage. All Rights Reserved',
    }),
    defineField({
      name: 'manageText',
      title: 'Management Text',
      type: 'string',
      initialValue: 'Website managed by Tekmetric',
    }),
    defineField({
      name: 'manageUrl',
      title: 'Management URL',
      type: 'url',
      initialValue: 'https://www.tekmetric.com/',
    }),
    defineField({
      name: 'privacyUrl',
      title: 'Privacy Policy URL',
      type: 'string',
      initialValue: '/privacy-policy',
    }),
    defineField({
      name: 'creditsUrl',
      title: 'Image Credits URL',
      type: 'string',
      initialValue: '/image-credits',
    }),
    defineField({
      name: 'globalWhyUs',
      title: 'Global Why Us (3 bullets — ultimate fallback for service×location pages)',
      type: 'array',
      of: [{type: 'whyUsBullet'}],
      validation: (Rule) => Rule.required().length(3),
    }),
  ],
})
