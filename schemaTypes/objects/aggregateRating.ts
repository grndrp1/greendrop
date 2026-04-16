import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'aggregateRating',
  title: 'Aggregate Rating',
  type: 'object',
  description:
    'Star rating summary displayed in hero star bar. Typically sourced from Google Business Profile; update periodically.',
  fields: [
    defineField({
      name: 'value',
      title: 'Rating Value',
      type: 'number',
      description: 'e.g. 4.7 (out of 5)',
      validation: (Rule) => Rule.required().min(0).max(5).precision(1),
    }),
    defineField({
      name: 'count',
      title: 'Review Count',
      type: 'number',
      description: 'Total number of reviews this rating is based on.',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Where this rating was sourced from.',
      initialValue: 'google',
      options: {
        list: [
          { title: 'Google Business Profile', value: 'google' },
          { title: 'Yelp', value: 'yelp' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'Aggregated (multi-source)', value: 'aggregated' },
          { title: 'Manual override', value: 'manual' },
        ],
      },
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      description:
        'When the rating was last refreshed. Helpful for knowing when to pull a fresh snapshot.',
    }),
  ],
  preview: {
    select: { value: 'value', count: 'count', source: 'source' },
    prepare({ value, count, source }) {
      return {
        title:
          value != null && count != null
            ? `${value} ★ · ${count.toLocaleString()} reviews`
            : 'Rating not set',
        subtitle: source || undefined,
      }
    },
  },
})
