import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import { schemaTypes } from './schemaTypes'

// Custom structure to make Site Settings a singleton
const myStructure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Our Singleton Site Settings
      S.listItem()
        .title('Site Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site Settings')
        ),
      S.divider(),
      // Render all other document types automatically
      ...S.documentTypeListItems().filter(
        (listItem: any) => !['siteSettings'].includes(listItem.getId())
      ),
    ])

export default defineConfig({
  name: 'default',
  title: 'Green Drop',

  projectId: 'i2own2jr',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: myStructure
    }),
    visionTool(),
    presentationTool({
      previewUrl: {
        origin: 'https://greendrop-web.vercel.app',
        previewMode: {
          enable: `/api/draft-mode/enable?secret=${process.env.SANITY_STUDIO_PREVIEW_SECRET}`,
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
