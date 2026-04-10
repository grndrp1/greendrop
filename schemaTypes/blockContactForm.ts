import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'blockContactForm',
    title: 'Contact Form',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Section Main Title',
            type: 'string',
            initialValue: 'Contact Us',
        }),
        defineField({
            name: 'successMessage',
            title: 'Success Message',
            type: 'string',
            initialValue: 'Thank you for contacting us. We will get back to you as soon as possible.',
        }),
        defineField({
            name: 'options',
            title: 'Dropdown Options',
            description: "The options for the 'What's on your mind?' dropdown.",
            type: 'array',
            of: [{ type: 'string' }],
            initialValue: [
                'Past Service Questions',
                'Car Trouble/Diagnosis Help',
                'Service Availability',
                'Membership Questions',
                'Pricing & Quotes',
                'Feedback',
                'Something Else'
            ],
        }),
    ],
    preview: {
        select: { title: 'title' },
        prepare({ title }) {
            return { title: `Form: ${title || 'Contact Form'}` }
        }
    }
})
