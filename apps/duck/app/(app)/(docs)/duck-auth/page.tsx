import { Badge } from '@gentleduck/registry-ui/badge'
import { Button } from '@gentleduck/registry-ui/button'
import { Cookie, Database, Fingerprint, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { codeToHtml } from 'shiki'
import { CopyButton } from '~/components/copy-button'
import { OpenSourceSection } from '~/components/layouts/open-source-section'
import { PageHeader, PageHeaderDescription, PageHeaderHeading } from '~/components/layouts/page-header'
import { PackageStatusBadge } from '~/components/package-status-badge'

export const dynamic = 'force-static'
export const revalidate = false

const title = 'Duck Auth'
const description =
  'Faceted, framework-agnostic, transport-pluggable authentication for modern TypeScript apps. Password, magic-link, OAuth, passkey, API keys, SAML — wired with one root.'

const features = [
  {
    icon: ShieldCheck,
    title: 'One AuthEngine',
    description:
      'One typed root exposes sessions, identities, flows, providers, hijack policy and anomaly detection, plus passwords, MFA, passkeys, API keys and orgs once registered.',
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-500',
  },
  {
    icon: Cookie,
    title: 'Cookie + Bearer + JWT',
    description:
      'Pluggable transports: HttpOnly __Host- cookies, opaque bearer tokens, stateless JWT with key rotation, all bindable to a client public key via DPoP (RFC 9449).',
    bg: 'bg-blue-500/10',
    color: 'text-blue-500',
  },
  {
    icon: KeyRound,
    title: 'Every sign-in shape',
    description:
      'Password, magic-link, six OAuth providers (Google / GitHub / LinkedIn / Microsoft / Discord / Apple), WebAuthn passkeys, API keys, SAML — all on the same provider interface.',
    bg: 'bg-violet-500/10',
    color: 'text-violet-500',
  },
  {
    icon: Mail,
    title: 'Your mailer',
    description:
      'Magic links, password resets and verification links go to one deliver function you write, so mail goes out through whatever your app already uses.',
    bg: 'bg-pink-500/10',
    color: 'text-pink-500',
  },
  {
    icon: Fingerprint,
    title: 'Production posture',
    description:
      'strict() rejects insecure config at boot — no in-memory limiter, store or event bus, no insecure cookies. Compliance presets for GDPR / SOC2 / HIPAA / FIPS.',
    bg: 'bg-orange-500/10',
    color: 'text-orange-500',
  },
  {
    icon: Database,
    title: 'Your database',
    description:
      'Drizzle tables for Postgres, MySQL and SQLite beside your own, and Redis or Valkey for limiters, events and single-use tokens.',
    bg: 'bg-sky-500/10',
    color: 'text-sky-500',
  },
]

const INSTALL_CODE = `# Install
bun add @gentleduck/auth

# Wire on Express
import { mountSignIn } from '@gentleduck/auth/server/express'
app.post('/auth/signin', mountSignIn(auth))`

export default async function DuckAuthPage() {
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
          <PackageStatusBadge status="wip" />
        </div>
        <PageHeaderDescription>{description}</PageHeaderDescription>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/duck-auth/introduction">Get Started</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/duck-auth/core">Core Concepts</Link>
          </Button>
        </div>
      </PageHeader>
      <div className="relative space-y-20">
        <div>
          <div className="mb-10 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Framework-agnostic
              </Badge>
            </div>
            <h2 className="mb-3 font-semibold text-2xl leading-tight tracking-tight sm:text-3xl">
              Authentication that doesn’t lock you into a framework.
            </h2>
            <p className="mx-auto max-w-lg text-base text-muted-foreground leading-relaxed">
              One engine, every transport. Wire it into Express, Hono, Next.js, Fastify, Koa, Elysia, NestJS, gRPC, or
              any Web-Fetch runtime — one adapter import.
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
            <p className="text-muted-foreground text-sm">Install the package, then mount a route.</p>
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
