import { defineType, defineField } from 'sanity';
import { Truck } from 'lucide-react';

export default defineType({
    name: 'blockVehiclesWeService',
    title: 'Vehicles We Service',
    type: 'object',
    icon: Truck,
    fields: [
        defineField({
            name: 'title',
            title: 'Section Title',
            type: 'string',
            initialValue: 'Vehicles We Service',
        }),
        defineField({
            name: 'bodyRaw',
            title: 'Body Content',
            type: 'array',
            of: [{ type: 'block' }],
            description: 'The main descriptive text on the left.',
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
            initialValue: 'Book Your Service',
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
                title: title || 'Vehicles We Service',
                subtitle: 'Vehicles We Service Section',
            };
        },
    },
});
