import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'page',
    title: 'Page',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            description: 'Used in URLs: /{slug}/ — e.g. "about", "memberships"',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'pageType',
            title: 'Page Type',
            type: 'string',
            options: {
                list: [
                    { title: 'General', value: 'general' },
                    { title: 'Membership', value: 'membership' },
                    { title: 'Business', value: 'business' },
                    { title: 'About', value: 'about' },
                    { title: 'Contact', value: 'contact' },
                    { title: 'Landing', value: 'landing' },
                ],
                layout: 'dropdown',
            },
            initialValue: 'general',
        }),
        defineField({
            name: 'headline',
            title: 'Headline (H1)',
            type: 'string',
            description: 'Override for the H1 shown on the page (defaults to title if blank).',
        }),
        defineField({
            name: 'intro',
            title: 'Intro / Subheadline',
            type: 'text',
            rows: 3,
        }),
        // ── Hero Section fields ──
        defineField({
            name: 'heroImageUrl',
            title: 'Hero Background Image URL',
            type: 'string',
            description: 'Full URL to the hero background image (CDN link).',
        }),
        defineField({
            name: 'heroTitle',
            title: 'Hero Title (H1)',
            type: 'string',
            description: 'Large heading displayed on the hero section.',
        }),
        defineField({
            name: 'heroSubtitle',
            title: 'Hero Subtitle',
            type: 'string',
            description: 'Lime-green subtitle text below the hero heading.',
        }),
        defineField({
            name: 'heroTagline',
            title: 'Hero Tagline',
            type: 'string',
            description: 'Smaller white text below the subtitle.',
        }),
        defineField({
            name: 'heroCtaText',
            title: 'Hero CTA Button Text',
            type: 'string',
        }),
        defineField({
            name: 'heroCtaUrl',
            title: 'Hero CTA Button URL',
            type: 'string',
        }),
        defineField({
            name: 'body',
            title: 'Body Content',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'rawHtml',
            title: 'Raw HTML Content',
            type: 'text',
            description: 'The raw extracted HTML from the live site.',
        }),
        defineField({
            name: 'pageBuilder',
            title: 'Page Builder',
            type: 'array',
            description: 'Add blocks here to build custom sections for this page (like the homepage).',
            of: [
                { type: 'blockCustomerReviews' },
                { type: 'blockServicesHighlight' },
                { type: 'blockWelcome' },
                { type: 'blockTrustBanner' },
                { type: 'blockPerks' },
                { type: 'blockVehiclesWeService' },
                { type: 'blockWhyChooseUs' },
                { type: 'blockFaq' },
                { type: 'blockBlog' },
                { type: 'blockNearMe' },
                { type: 'blockBusinessIncluded' },
                { type: 'blockBusinessConcierge' },
                { type: 'blockBusinessJoinCTA' },
                { type: 'blockBusinessTerms' },
                { type: 'blockEmploymentForm' },
                { type: 'blockReviewWidget' },
                { type: 'blockHero' },
                { type: 'blockHtmlEmbed' },
                { type: 'blockText' },
            ],
            options: {
                // Allows dragging to rearrange blocks
                sortable: true,
            }
        }),
        defineField({
            name: 'image',
            title: 'Hero Image',
            type: 'image',
            options: { hotspot: true },
        }),
        // Membership-specific fields (shown for membership pages)
        defineField({
            name: 'membershipTiers',
            title: 'Membership Tiers',
            type: 'array',
            hidden: ({ document }) => document?.pageType !== 'membership',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'name', title: 'Tier Name', type: 'string' }),
                        defineField({ name: 'price', title: 'Monthly Price', type: 'number' }),
                        defineField({
                            name: 'description',
                            title: 'Description',
                            type: 'text',
                            rows: 3,
                        }),
                        defineField({
                            name: 'features',
                            title: 'Features',
                            type: 'array',
                            of: [{ type: 'string' }],
                        }),
                    ],
                    preview: {
                        select: { title: 'name', subtitle: 'price' },
                        prepare({ title, subtitle }) {
                            return {
                                title,
                                subtitle: subtitle ? `$${subtitle}/mo` : '',
                            }
                        },
                    },
                },
            ],
        }),
        // Business page specific fields
        defineField({
            name: 'businessIntroSubheadline',
            title: 'Business Intro Subheadline',
            type: 'string',
            hidden: ({ document }) => document?.pageType !== 'business',
        }),
        defineField({
            name: 'businessIntroCtaText',
            title: 'Business Intro CTA Text',
            type: 'string',
            hidden: ({ document }) => document?.pageType !== 'business',
        }),
        defineField({
            name: 'businessIntroCtaUrl',
            title: 'Business Intro CTA URL',
            type: 'string',
            hidden: ({ document }) => document?.pageType !== 'business',
        }),
        defineField({
            name: 'businessPerksBannerText',
            title: 'Business Perks Banner Text',
            type: 'string',
            hidden: ({ document }) => document?.pageType !== 'business',
            description: 'The horizontal purple banner text above the perks grid.',
        }),
        defineField({
            name: 'businessPerksHeadline',
            title: 'Business Perks Headline',
            type: 'string',
            hidden: ({ document }) => document?.pageType !== 'business',
            description: 'Secondary headline above the perks grid (e.g. WHY BUSINESS OWNERS CHOOSE OUR FLEET SERVICES).',
        }),
        defineField({
            name: 'businessPerks',
            title: 'Business Perks',
            type: 'array',
            hidden: ({ document }) => document?.pageType !== 'business',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'iconName', title: 'Icon Name', type: 'string', description: 'Lucide React icon name (e.g. Crown, Cog, BadgeDollar, RefreshCw)' }),
                        defineField({ name: 'title', title: 'Perk Title', type: 'string' }),
                        defineField({ name: 'text', title: 'Perk Text', type: 'text', rows: 3 }),
                    ]
                }
            ]
        }),
        defineField({
            name: 'businessPlans',
            title: 'Business Pricing Plans',
            type: 'array',
            hidden: ({ document }) => document?.pageType !== 'business',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'vehicleIcon', title: 'Vehicle Icon Name', type: 'string', description: 'Lucide React icon name (e.g. Car, Truck, Anchor)' }),
                        defineField({ name: 'name', title: 'Plan Name', type: 'string' }),
                        defineField({ name: 'subtitle', title: 'Subtitle Text', type: 'string' }),
                        defineField({ name: 'priceText', title: 'Price Text (e.g. $27 / Month)', type: 'string' }),
                        defineField({ name: 'isButton', title: 'Render Price as Button?', type: 'boolean', description: 'If true, renders the price element as a button instead (e.g. Learn More)' }),
                    ]
                }
            ]
        }),
        defineField({
            name: 'businessStep2Headline',
            title: 'Step 2 Headline',
            type: 'string',
            hidden: ({ document }) => document?.pageType !== 'business',
        }),
        defineField({
            name: 'businessStep2Text',
            title: 'Step 2 Text',
            type: 'text',
            rows: 3,
            hidden: ({ document }) => document?.pageType !== 'business',
        }),
        defineField({
            name: 'businessStep3Headline',
            title: 'Step 3 Headline',
            type: 'string',
            hidden: ({ document }) => document?.pageType !== 'business',
        }),
        defineField({
            name: 'businessStep3Text',
            title: 'Step 3 Text',
            type: 'text',
            rows: 3,
            hidden: ({ document }) => document?.pageType !== 'business',
        }),
        // SEO
        defineField({
            name: 'seoTitle',
            title: 'SEO Title',
            type: 'string',
        }),
        defineField({
            name: 'seoDescription',
            title: 'SEO Meta Description',
            type: 'text',
            rows: 3,
            validation: (Rule) => Rule.max(160),
        }),
        defineField({
            name: 'canonicalUrl',
            title: 'Canonical URL',
            type: 'url',
        }),
        // Legacy redirect
        defineField({
            name: 'legacyUrls',
            title: 'Legacy URLs (for 301 redirects)',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Old URLs that should 301-redirect to this page.',
        }),
        defineField({
            name: 'publishedAt',
            title: 'Published At',
            type: 'datetime',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'pageType',
        },
    },
})
