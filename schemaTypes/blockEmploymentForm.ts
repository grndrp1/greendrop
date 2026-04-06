
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockEmploymentForm',
    title: 'Employment Application Form',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Main Title',
            type: 'string',
            initialValue: 'EMPLOYMENT APPLICATION',
        }),
        defineField({
            name: 'subtitle',
            title: 'Section Subtitle',
            type: 'string',
            initialValue: 'Use the form below to inquire about employment opportunities with our company.',
        }),
        defineField({
            name: 'successMessage',
            title: 'Success Message',
            type: 'string',
            initialValue: 'Thank you for your application! We will be in touch soon.',
        }),
    ],
    preview: {
        select: { title: 'title' },
        prepare({ title }) {
            return { title: `Form: ${title || 'Employment Application'}` }
        }
    }
})
