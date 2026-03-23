import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockTrustBanner',
    title: 'Trust Banner Block',
    type: 'object',
    fields: [
        defineField({
            name: 'logos',
            title: 'Logos',
            type: 'array',
            of: [
                {
                    type: 'image',
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative text',
                        }
                    ]
                }
            ],
            description: 'Upload certification logos (e.g., ASE, NAPA)',
        }),
    ],
    preview: {
        prepare() {
            return {
                title: 'Block: Trust Banner (Logos)',
            }
        }
    }
})
