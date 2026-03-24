import { defineType, defineField } from 'sanity';
import { HelpCircle } from 'lucide-react';

export default defineType({
    name: 'blockWhyChooseUs',
    title: 'Why Choose Us',
    type: 'object',
    icon: HelpCircle,
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'WHY CHOOSE US',
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
            type: 'string',
            initialValue: 'Green Drop Mission, Vision, and Values',
        }),
        defineField({
            name: 'bodyRaw',
            title: 'Body Content',
            type: 'array',
            of: [{ type: 'block' }],
            description: 'The main descriptive text above the values list.',
        }),
        defineField({
            name: 'values',
            title: 'Values List',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'number',
                            title: 'Number',
                            type: 'string',
                            placeholder: '01',
                        }),
                        defineField({
                            name: 'title',
                            title: 'Value Title',
                            type: 'string',
                        }),
                        defineField({
                            name: 'description',
                            title: 'Description',
                            type: 'text',
                        }),
                    ],
                    preview: {
                        select: {
                            title: 'title',
                            number: 'number',
                        },
                        prepare({ title, number }) {
                            return {
                                title: `${number}: ${title}`,
                            };
                        },
                    },
                },
            ],
        }),
        defineField({
            name: 'showAwards',
            title: 'Show Awards Bar',
            type: 'boolean',
            initialValue: false,
            description: 'Display the purple bar with certification logos at the bottom.',
        }),
        defineField({
            name: 'mainImage',
            title: 'Main Image',
            type: 'image',
            description: 'The tall image in the background of the image cluster.',
            options: { hotspot: true }
        }),
        defineField({
            name: 'overlappingImage',
            title: 'Overlapping Image',
            type: 'image',
            description: 'The smaller landscape image overlapping the bottom right.',
            options: { hotspot: true }
        }),
        defineField({
            name: 'ctaText',
            title: 'CTA Text',
            type: 'string',
            initialValue: 'Book Service Today',
        }),
        defineField({
            name: 'ctaUrl',
            title: 'CTA URL',
            type: 'string',
            initialValue: 'https://www.greendropgarage.com/contact',
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: title || 'Why Choose Us',
                subtitle: 'Why Choose Us Section',
            };
        },
    },
});
