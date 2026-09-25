import { defineSidebar } from './types'

export const duckErrorSidebar = defineSidebar([
  {
    title: '',
    items: [
      { title: 'Introduction', href: '/duck-error/introduction' },
      { title: 'Getting Started', href: '/duck-error/getting-started' },
    ],
  },
  {
    title: 'Core',
    items: [
      { title: 'Core Concepts', href: '/duck-error/core-concepts' },
      { title: 'Branded Types', href: '/duck-error/branded-types' },
      { title: 'Type Narrowing', href: '/duck-error/type-narrowing' },
      { title: 'Error Codes & Status Design', href: '/duck-error/error-codes-and-status-design' },
    ],
  },
  {
    title: 'Guides',
    items: [
      { title: 'Secret Redaction', href: '/duck-error/secret-redaction' },
      { title: 'Wrapping Unknown Errors', href: '/duck-error/wrapping-unknown-errors' },
      { title: 'Extending', href: '/duck-error/extending' },
      { title: 'Testing', href: '/duck-error/testing' },
      { title: 'Browser & Isomorphic Usage', href: '/duck-error/browser-and-isomorphic-usage' },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { title: 'Overview', href: '/duck-error/integrations/overview' },
      { title: 'Express', href: '/duck-error/integrations/express' },
      { title: 'Fastify', href: '/duck-error/integrations/fastify' },
      { title: 'Hono', href: '/duck-error/integrations/hono' },
      { title: 'NestJS', href: '/duck-error/integrations/nestjs' },
      { title: 'Next.js', href: '/duck-error/integrations/nextjs' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'API Reference', href: '/duck-error/api-reference' },
      { title: 'API / Types', href: '/duck-error/api' },
      { title: 'API / Generated Reference', href: '/duck-error/api/generated/README' },
      { title: 'FAQ', href: '/duck-error/faq' },
    ],
  },
])
