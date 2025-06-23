import { cn } from '@gentleduck/libs/cn'
import { badgeVariants } from '@gentleduck/registry-ui-duckui/badge'
import { ChevronRightIcon, ExternalLinkIcon } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { Mdx } from '~/components/mdx/mdx'
import { DocsPager } from '~/components/pager'
import { DashboardTableOfContents } from '~/components/toc'
import { SLUG_METADATA } from '~/config/metadata'
import { docs } from '../../../../.velite'

interface DocPageProps {
  params: {
    slug: string[]
  }
}

async function getDocFromParams({ params }: DocPageProps) {
  const slug = params.slug
  const doc = docs.find((doc) => slug.includes(doc.permalink))

  if (!doc) {
    return null
  }

  return doc
}

type Props = {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const doc = await getDocFromParams({ params })

  if (!doc) {
    return {}
  }
  return SLUG_METADATA(doc)
}

const PostLayout = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const _param = await params
  const doc = docs.find((post) => {
    return _param.slug.includes(post?.title)
  })

  if (!doc) {
    notFound()
  }

  return (
    <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
      <div className="mx-auto w-full min-w-0 max-w-2xl" style={{ contain: 'paint' }}>
        <div className="mb-4 flex items-center space-x-1 text-sm leading-none text-muted-foreground">
          <div className="truncate">Docs</div>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <div className="text-foreground">{doc.title}</div>
        </div>
        <div className="space-y-2">
          <h1 className={cn('scroll-m-20 text-3xl font-bold tracking-tight capitalize')}>
            {doc.title.split('-').join(' ')}
          </h1>
          {doc.description && (
            <p className="text-base text-muted-foreground">
              {
                // <Balancer>{doc.description}</Balancer>
              }
              {doc.description}
            </p>
          )}
        </div>
        {doc.links ? (
          <div className="flex items-center space-x-2 pt-4">
            {doc.links?.doc && (
              <Link
                href={doc.links.doc}
                target="_blank"
                rel="noreferrer"
                className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1')}>
                Docs
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            )}
            {doc.links?.api && (
              <Link
                href={doc.links.api}
                target="_blank"
                rel="noreferrer"
                className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1')}>
                API Reference
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            )}
          </div>
        ) : null}
        <div className="pb-12 pt-8">
          <Mdx code={doc.body} />
        </div>
        {<DocsPager doc={doc} />}
      </div>
      {doc.toc && (
        <div className="hidden text-sm xl:block">
          <div className="sticky top-16 -mt-10 pt-4">
            <div className="show-scroll-hover overflow-y-auto pb-10 sticky top-16 -mt-10 h-[calc(100vh-3.5rem)] py-12">
              <DashboardTableOfContents toc={doc.toc} />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default PostLayout
