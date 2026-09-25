import { Badge } from '@gentleduck/registry-ui/badge'
import { Button } from '@gentleduck/registry-ui/button'
import { Code2, FileJson2, Fingerprint, Package, ShieldCheck, Workflow } from 'lucide-react'
import Link from 'next/link'
import { codeToHtml } from 'shiki'
import { CopyButton } from '~/components/copy-button'
import { OpenSourceSection } from '~/components/layouts/open-source-section'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '~/components/layouts/page-header'

export const dynamic = 'force-static'
export const revalidate = false

const title = '@gentleduck/error'
const description =
  'Typed, registry-driven error classes for TypeScript. Branded codes, secret-safe serialization, framework-agnostic, zero dependencies.'

const features = [
  {
    icon: Workflow,
    title: 'Registry-driven',
    description:
      'One error class per subsystem, built from a plain object literal mapping codes to HTTP status numbers.',
    bg: 'bg-red-500/10',
    color: 'text-red-500',
  },
  {
    icon: Code2,
    title: 'Fully typed',
    description:
      'Which codes exist, what metadata each carries, and whether metadata is required — all inferred, no separate declarations.',
    bg: 'bg-blue-500/10',
    color: 'text-blue-500',
  },
  {
    icon: ShieldCheck,
    title: 'Secret-safe by default',
    description:
      '`toJSON()` decides what metadata is safe to serialize, so secrets never leak into logs or API responses.',
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-500',
  },
  {
    icon: Package,
    title: 'Zero dependencies',
    description: 'Framework-agnostic and isomorphic. Works the same in Node, edge runtimes, and the browser.',
    bg: 'bg-violet-500/10',
    color: 'text-violet-500',
  },
  {
    icon: Fingerprint,
    title: 'Branded types',
    description:
      '`detail()` and `fault()` brand a plain status number, so a code from one kit can never satisfy another.',
    bg: 'bg-orange-500/10',
    color: 'text-orange-500',
  },
  {
    icon: FileJson2,
    title: 'Framework integrations',
    description: 'Drop-in error handlers for Express, Fastify, Hono, NestJS, and Next.js Route Handlers.',
    bg: 'bg-sky-500/10',
    color: 'text-sky-500',
  },
]

const INSTALL_CODE = `# Install
bun add @gentleduck/error

# Define a kit
import { createErrorKit, fault } from '@gentleduck/error'

export const AppError = createErrorKit('AppError', {
  NOT_FOUND: fault<{ id: string }>(404),
})`

export default async function DuckErrorPage() {
  const highlightedCode = await codeToHtml(INSTALL_CODE, {
    lang: 'typescript',
    themes: {
      dark: 'catppuccin-mocha',
      light: 'github-light',
    },
    defaultColor: 'dark',
    transformers: [
      {
        pre(node) {
          node.properties.class =
            'no-scrollbar min-w-0 overflow-x-auto px-4 py-3.5 outline-none !bg-transparent text-sm font-mono'
        },
      },
    ],
  })

  return (
    <div className="container pt-24 pb-8">
      <PageHeader>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <PageHeaderHeading className="max-w-none">{title}</PageHeaderHeading>
        </div>
        <PageHeaderDescription>{description}</PageHeaderDescription>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/duck-error/introduction">Get Started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/duck-error/core-concepts">Core Concepts</Link>
          </Button>
        </div>
      </PageHeader>
      <div className="relative space-y-20">
        <div>
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Typed errors
              </Badge>
            </div>
            <h2 className="mb-3 font-semibold text-2xl leading-tight tracking-tight sm:text-3xl">
              One registry. One class. Fully typed.
            </h2>
            <p className="mx-auto max-w-lg text-base text-muted-foreground leading-relaxed">
              Build one error class per subsystem from a registry literal. No separate type declarations to keep in
              sync, no secrets leaking into a response.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description, bg, color }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="mb-1 font-mono font-semibold text-sm">{title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-8 flex flex-col items-center gap-1 text-center">
            <h2 className="font-semibold text-xl leading-tight tracking-tight">Install</h2>
            <p className="text-muted-foreground text-sm">One import, no dependencies.</p>
          </div>
          <div className="relative mx-auto max-w-2xl">
            <CopyButton value={INSTALL_CODE} variant="ghost" className="absolute top-3 right-3" />
            <div
              className="overflow-hidden rounded-lg border border-border/50 bg-muted/30 [&_pre]:bg-transparent!"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </div>
        </div>

        <OpenSourceSection className="!px-0" />
      </div>
    </div>
  )
}
