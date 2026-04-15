import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'whyUsBullet',
    title: 'Why Us Bullet',
    type: 'object',
    fields: [
        defineField({
            name: 'icon',
            title: 'Icon (lucide-react name)',
            type: 'string',
            description: 'e.g. ShieldCheck, Award, Leaf',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'label',
            title: 'Short label',
            type: 'string',
            validation: (Rule) => Rule.required().max(40),
        }),
        defineField({
            name: 'detail',
            title: 'One-line detail',
            type: 'string',
            validation: (Rule) => Rule.required().max(120),
        }),
    ],
    preview: { select: { title: 'label', subtitle: 'detail' } },
})
