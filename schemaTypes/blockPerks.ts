import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockPerks',
    title: 'Perks Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'OUR PERKS',
        }),
        defineField({
            name: 'tagline',
            title: 'Section Tagline',
            type: 'string',
            initialValue: "We're Shifting the Car Care Experience",
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Text',
            type: 'string',
            initialValue: 'Book Visit Now',
        }),
        defineField({
            name: 'ctaUrl',
            title: 'CTA URL',
            type: 'string',
            initialValue: 'https://www.greendropgarage.com/contact',
        }),
        defineField({
            name: 'perks',
            title: 'Perks',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'perk',
                    fields: [
                        defineField({
                            name: 'title',
                            title: 'Perk Title',
                            type: 'string',
                        }),
                        defineField({
                            name: 'description',
                            title: 'Perk Description',
                            type: 'text',
                            rows: 3,
                        }),
                        defineField({
                            name: 'icon',
                            title: 'Icon (Optional Emoji or Lucide Name)',
                            type: 'string',
                        }),
                    ],
                }
            ],
            validation: Rule => Rule.min(1).max(3),
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: `Block: ${title || 'Perks Section'}`,
            }
        }
    }
})
