import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockServicesHighlight',
    title: 'Services Highlight Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'Services',
        }),
        defineField({
            name: 'subtitle',
            title: 'Section Subtitle',
            type: 'string',
            initialValue: 'Expert Auto Repair in Portland & Vancouver',
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Text',
            type: 'string',
            initialValue: 'Visit Services Page',
        }),
        defineField({
            name: 'ctaUrl',
            title: 'CTA URL',
            type: 'string',
            initialValue: '/services',
        }),
        defineField({
            name: 'services',
            title: 'Highlighted Services',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'service' }],
                }
            ],
            validation: Rule => Rule.max(3),
            description: 'Select up to 3 services to highlight here.'
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'subtitle',
        },
        prepare({ title, subtitle }) {
            return {
                title: `Block: ${title || 'Services Highlight'}`,
                subtitle,
            }
        }
    }
})
