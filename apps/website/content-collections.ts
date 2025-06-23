import { defineCollection, defineConfig } from '@content-collections/core'

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
  }),
})

export default defineConfig({
  collections: [posts],
})
