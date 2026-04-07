import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'headerNav',
    title: 'Header Navigation',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Menu Title',
            type: 'string',
            initialValue: 'Main Menu',
            description: 'Internal reference name',
        }),
        defineField({
            name: 'items',
            title: 'Menu Items',
            type: 'array',
            of: [
                // Single Link
                {
                    type: 'object',
                    name: 'navItem',
                    title: 'Single Link',
                    fields: [
                        { name: 'label', type: 'string', title: 'Label' },
                        { name: 'href', type: 'string', title: 'URL (e.g. /services or https://...)' },
                        { name: 'isHighlighted', type: 'boolean', title: 'Highlight as Button?', initialValue: false },
                    ]
                },
                // Dropdown Section
                {
                    type: 'object',
                    name: 'navSection',
                    title: 'Dropdown Section',
                    fields: [
                        { name: 'label', type: 'string', title: 'Label' },
                        { name: 'href', type: 'string', title: 'Main Link (Optional)', description: 'Where to go if the main label is clicked' },
                        {
                            name: 'children',
                            type: 'array',
                            title: 'Dropdown Links',
                            of: [
                                {
                                    type: 'object',
                                    fields: [
                                        { name: 'label', type: 'string', title: 'Label' },
                                        { name: 'href', type: 'string', title: 'URL' },
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }),
    ],
})
