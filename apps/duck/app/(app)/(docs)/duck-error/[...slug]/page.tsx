import {
  DashboardTableOfContents,
  DocsCopyPage,
  DocsPagerBottom,
  DocsPagerTop,
  DocsPathBreadcrumb,
  DocsSidebarNav,
  Mdx,
} from '@gentleduck/docs/client'
import { cn } from '@gentleduck/libs/cn'
import { badgeVariants } from '@gentleduck/registry-ui/badge'
import { Button } from '@gentleduck/registry-ui/button'
import { Separator } from '@gentleduck/registry-ui/separator'
import { ArrowDownIcon, ArrowUpIcon, ExternalLinkIcon, SquareArrowOutUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PackageStatusBadge } from '~/components/package-status-badge'
import { SLUG_METADATA } from '~/config/metadata'
import { getPackageLifecycleStatusFromHref } from '~/config/package-status'
import { duckErrorSidebar } from '~/config/sidebars'
import { absoluteUrl } from '~/lib'
import { duckError } from '../../../../../.gentleduck'
export const dynamic = 'force-static'
export const dynamicParams = false
export const revalidate = false

const PKG_PREFIX = 'duck-error'
const sidebar = duckErrorSidebar
const packageStatus = getPackageLifecycleStatusFromHref(`/${PKG_PREFIX}`)

function getDocFromSlug(slug: string[]) {
  const permalink = `${PKG_PREFIX}/${slug.join('/')}`
  return duckError.find((doc) => [permalink, `${permalink}/index`].includes(doc.permalink)) ?? null
}

export async function generateStaticParams() {
  return duckError.map((doc) => {
    const rest = doc.permalink.slice(PKG_PREFIX.length + 1).replace(/\/index$/, '')
    return { slug: rest.split('/') }
  })
}

export async function generateMetadata(props: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const params = await props.params
  const doc = getDocFromSlug(params.slug)
  if (!doc) return {}

  const base = SLUG_METADATA(doc)
  const slugPath = `/${params.slug.join('/')}`
  return {
    ...base,
    alternates: {
      canonical: absoluteUrl(`/${PKG_PREFIX}${slugPath}`),
    },
    openGraph: {
      ...base.openGraph,
      url: absoluteUrl(`/${PKG_PREFIX}${slugPath}`),
    },
  }
}

const PackagePage = async ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const _params = await params
  const doc = getDocFromSlug(_params.slug)

  if (!doc) {
    notFound()
  }

  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[270px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10">
      <aside
        aria-label="Documentation sidebar"
        className="hidden shrink-0 border-grid border-r md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)]">
        <nav aria-label="Duck Error sections" className="h-full overflow-y-auto overflow-x-hidden pt-10 pb-8">
          <DocsSidebarNav config={sidebar} />
        </nav>
      </aside>
      <main className="relative py-6 pr-4 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]" id="top">
        <article className="relative mx-auto mt-20 w-full min-w-0 max-w-2xl">
          <header className="space-y-4">
            <div className="flex h-8 items-center gap-4">
              <div className="min-w-0 flex-1">
                <DocsPathBreadcrumb basePath="" segments={[PKG_PREFIX, ..._params.slug]} />
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <DocsCopyPage page={doc.content} url={absoluteUrl(doc.slug)} />
                <DocsPagerTop config={sidebar} doc={doc} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className={cn('scroll-m-20 font-bold text-2xl tracking-tight sm:text-3xl')}>{doc.title}</h1>
                {packageStatus && <PackageStatusBadge status={packageStatus} />}
              </div>
              {doc.description && <p className="text-base text-muted-foreground">{doc.description}</p>}
            </div>
            {doc.links ? (
              <nav aria-label="External references" className="flex items-center space-x-2 pt-4">
                {doc.links?.doc && (
                  <Link
                    className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1')}
                    href={doc.links.doc}
                    rel="noreferrer"
                    target="_blank">
                    Docs
                    <ExternalLinkIcon aria-hidden="true" className="h-3 w-3" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Link>
                )}
                {doc.links?.api && (
                  <Link
                    className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1')}
                    href={doc.links.api}
                    rel="noreferrer"
                    target="_blank">
                    API Reference
                    <ExternalLinkIcon aria-hidden="true" className="h-3 w-3" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Link>
                )}
              </nav>
            ) : null}
          </header>
          <section className="pt-8 pb-12">
            <Mdx code={doc.body as any} />
          </section>
          <footer>
            <DocsPagerBottom config={sidebar} doc={doc} />
            <div aria-hidden="true" id="bottom" />
          </footer>
        </article>
        {doc.toc && (
          <aside aria-label="On this page" className="hidden text-sm xl:block">
            <div className="sticky top-16 -mt-10 flex h-[calc(100vh-3.5rem)] flex-col py-12">
              <DashboardTableOfContents toc={doc.toc} />
              <Separator className="my-4 shrink-0" />
              <nav aria-label="Page actions" className="flex shrink-0 flex-col gap-1">
                <Button asChild className="justify-start" size="sm" variant="link">
                  <a
                    href={`https://github.com/gentleeduck/gentleduck/blob/master/apps/duck/content/${PKG_PREFIX}/${_params.slug.join('/')}.mdx`}
                    rel="noreferrer"
                    target="_blank">
                    <SquareArrowOutUpRight aria-hidden="true" className="size-3.5" />
                    Edit this page on GitHub
                  </a>
                </Button>
                <Button asChild className="justify-start" size="sm" variant="link">
                  <a href="#top">
                    <ArrowUpIcon aria-hidden="true" className="size-3.5" />
                    Scroll to top
                  </a>
                </Button>
                <Button asChild className="justify-start" size="sm" variant="link">
                  <a href="#bottom">
                    <ArrowDownIcon aria-hidden="true" className="size-3.5" />
                    Scroll to bottom
                  </a>
                </Button>
              </nav>
            </div>
          </aside>
        )}
      </main>
    </div>
  )
}

export default PackagePage
