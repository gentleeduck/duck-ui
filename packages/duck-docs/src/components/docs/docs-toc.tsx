'use client'

import type { ITocEntry } from '@duck-docs/context'
import { useMounted } from '@duck-docs/hooks/use-mount'
import { scrollIntoViewWithin } from '@duck-docs/lib/scroll-into-view-within'
import { cn } from '@gentleduck/libs/cn'
import { BookOpenText } from 'lucide-react'
import * as React from 'react'

interface ITocProps {
  toc: ITocEntry[]
}

interface IFlatTocItem {
  url: string
  title: string
  depth: number
}

const HEADING_OFFSET_PX = 80
const ACTIVE_HEADING_THRESHOLD_PX = 100
const AT_BOTTOM_THRESHOLD_PX = 50
const SCROLL_LOCK_FALLBACK_MS = 2000

function flattenToc(toc: ITocEntry[], depth = 1): IFlatTocItem[] {
  const result: IFlatTocItem[] = []
  for (const entry of toc) {
    result.push({ url: entry.url, title: entry.title, depth })
    if (entry.items && depth < 2) {
      result.push(...flattenToc(entry.items, depth + 1))
    }
  }
  return result
}

function lineOffset(depth: number): number {
  return depth >= 2 ? 12 : 0
}

function itemPadding(depth: number): number {
  return depth >= 2 ? 28 : 16
}

function findActiveHeading(ids: string[]): string | null {
  // At the bottom of the page, the last "scrolled past" heading may never reach
  // the active threshold, so fall back to any heading still in the viewport.
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - AT_BOTTOM_THRESHOLD_PX
  if (atBottom) {
    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i]
      if (!id) continue
      const el = document.getElementById(id)
      if (el && el.getBoundingClientRect().top < window.innerHeight) {
        return id
      }
    }
  }

  let best: string | null = null
  for (const id of ids) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= ACTIVE_HEADING_THRESHOLD_PX) {
      best = id
    }
  }
  return best
}

/**
 * Lock `id` against scroll-listener overrides while a smooth scroll is in
 * flight. Releases on `scrollend` or after `SCROLL_LOCK_FALLBACK_MS`
 * (whichever fires first; `scrollend` doesn't fire when already at target).
 */
function lockHeading(id: string, lockedIdRef: React.MutableRefObject<string | null>) {
  lockedIdRef.current = id
  function unlock() {
    if (lockedIdRef.current === id) lockedIdRef.current = null
    window.removeEventListener('scrollend', unlock)
  }
  window.addEventListener('scrollend', unlock, { once: true })
  setTimeout(() => {
    if (lockedIdRef.current === id) lockedIdRef.current = null
  }, SCROLL_LOCK_FALLBACK_MS)
}

function useActiveItem(itemIds: (string | undefined)[]) {
  const [activeId, setActiveId] = React.useState<string>('')
  const lockedIdRef = React.useRef<string | null>(null)
  const hasInitialized = React.useRef(false)

  const setFromClick = React.useCallback((id: string) => {
    setActiveId(id)
    lockHeading(id, lockedIdRef)
  }, [])

  React.useEffect(() => {
    const validIds = itemIds.filter(Boolean) as string[]
    if (!validIds.length) return

    let pending = false
    function onScroll() {
      if (pending) return
      pending = true
      requestAnimationFrame(() => {
        pending = false
        if (lockedIdRef.current) return
        const active = findActiveHeading(validIds)
        if (active) setActiveId(active)
      })
    }

    // First mount: if URL carries a hash, scroll it ourselves with offset
    // (browser default jams it to viewport top) and lock against scroll updates.
    if (!hasInitialized.current) {
      hasInitialized.current = true
      const hash = window.location.hash.replace('#', '')

      if (hash && validIds.includes(hash)) {
        setActiveId(hash)
        lockedIdRef.current = hash

        requestAnimationFrame(() => {
          const heading = document.getElementById(hash)
          if (!heading) {
            lockedIdRef.current = null
            return
          }
          const top = heading.getBoundingClientRect().top + window.scrollY - HEADING_OFFSET_PX
          window.scrollTo({ top, behavior: 'smooth' })
          lockHeading(hash, lockedIdRef)
        })
      } else {
        onScroll()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [itemIds])

  return [activeId, setFromClick] as const
}

function useTocThumb(containerRef: React.RefObject<HTMLDivElement | null>, activeItem: string): [number, number] {
  const [pos, setPos] = React.useState<[number, number]>([0, 0])

  React.useEffect(() => {
    const container = containerRef.current
    if (!activeItem || !container || container.clientHeight === 0) {
      setPos([0, 0])
      return
    }

    const el = container.querySelector<HTMLElement>(`a[href="#${activeItem}"]`)
    if (!el) {
      setPos([0, 0])
      return
    }

    const styles = getComputedStyle(el)
    const top = el.offsetTop + parseFloat(styles.paddingTop)
    const bottom = el.offsetTop + el.clientHeight - parseFloat(styles.paddingBottom)
    setPos([top, bottom - top])
  }, [activeItem, containerRef])

  return pos
}

// Single SVG path joining every TOC link so depth-change corners draw with
// one continuous stroke (avoids anti-alias seams at fractional offsets).
function useTocSvg(containerRef: React.RefObject<HTMLDivElement | null>, items: IFlatTocItem[]) {
  const [svg, setSvg] = React.useState<{ path: string; width: number; height: number } | null>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container || container.clientHeight === 0) return

    function compute() {
      if (!container) return
      let w = 0
      let h = 0
      const d: string[] = []
      let previousOffset = 0
      let previousBottom = 0
      let hasStarted = false

      for (const item of items) {
        const el = container.querySelector<HTMLElement>(`a[href="${item.url}"]`)
        if (!el) continue

        const styles = getComputedStyle(el)
        const offset = lineOffset(item.depth) + 1
        const top = el.offsetTop + parseFloat(styles.paddingTop)
        const bottom = el.offsetTop + el.clientHeight - parseFloat(styles.paddingBottom)

        w = Math.max(offset, w)
        h = Math.max(h, bottom)

        if (!hasStarted) {
          d.push(`M${offset} ${top}`)
          d.push(`L${offset} ${bottom}`)
          hasStarted = true
        } else {
          if (top !== previousBottom || offset !== previousOffset) {
            d.push(`L${offset} ${top}`)
          }
          d.push(`L${offset} ${bottom}`)
        }

        previousOffset = offset
        previousBottom = bottom
      }

      setSvg(d.length > 0 ? { path: d.join(' '), width: w + 1, height: h } : null)
    }

    const observer = new ResizeObserver(compute)
    compute()
    observer.observe(container)
    return () => observer.disconnect()
  }, [items, containerRef])

  return svg
}

function TocSkeleton({ toc }: ITocProps) {
  const skeletonItems = React.useMemo(() => {
    const items: { key: string; level: number; width: string }[] = []
    for (const entry of toc) {
      const chars = entry.title.length
      items.push({
        key: entry.url,
        level: 1,
        width: `${Math.min(Math.max(chars * 8, 80), 200)}px`,
      })
      if (entry.items) {
        for (const sub of entry.items) {
          const subChars = sub.title.length
          items.push({
            key: sub.url,
            level: 2,
            width: `${Math.min(Math.max(subChars * 7, 64), 160)}px`,
          })
        }
      }
    }
    return items
  }, [toc])

  return (
    <ul className="m-0 list-none">
      {skeletonItems.map((item) => (
        <li key={item.key} className={cn('mt-0 pt-2', { 'pl-4': item.level > 1 })}>
          <div className="h-3.5 animate-pulse rounded-full bg-muted/70" style={{ width: item.width }} />
        </li>
      ))}
    </ul>
  )
}

function TocTree({
  items,
  activeItem,
  onItemClick,
}: {
  items: IFlatTocItem[]
  activeItem: string
  onItemClick?: (id: string) => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const thumb = useTocThumb(containerRef, activeItem)
  const svg = useTocSvg(containerRef, items)

  React.useEffect(() => {
    const container = containerRef.current
    if (!activeItem || !container) return

    const el = container.querySelector<HTMLElement>(`a[href="#${activeItem}"]`)
    if (!el) return

    scrollIntoViewWithin(el, container.closest<HTMLElement>('[class*="overflow-y"]') ?? container.parentElement)
  }, [activeItem])

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, item: IFlatTocItem) => {
      const id = item.url.split('#')[1]
      if (!id) return

      const heading = document.getElementById(id)
      if (!heading) return

      // Default hash-jump would slam the heading to viewport top; scroll
      // manually with offset so it sits below the sticky header.
      e.preventDefault()
      onItemClick?.(id)
      // pushState rather than setting location.hash, which would re-trigger scroll.
      window.history.pushState(null, '', `#${id}`)

      const top = heading.getBoundingClientRect().top + window.scrollY - HEADING_OFFSET_PX
      window.scrollTo({ top, behavior: 'smooth' })
    },
    [onItemClick],
  )

  return (
    <div ref={containerRef} className="relative">
      {svg ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute start-0 top-0"
          height={svg.height}
          style={{ width: svg.width }}
          viewBox={`0 0 ${svg.width} ${svg.height}`}
          width={svg.width}>
          <path
            d={svg.path}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            className="text-muted-foreground/20"
          />
        </svg>
      ) : null}

      {items.map((item) => {
        return (
          <a
            key={item.url}
            href={item.url}
            onClick={(e) => handleClick(e, item)}
            className={cn(
              'relative block py-1.5 no-underline transition-colors [overflow-wrap:break-word]',
              item.url === `#${activeItem}`
                ? 'font-medium text-primary'
                : 'text-muted-foreground text-sm hover:text-foreground',
            )}
            style={{ paddingInlineStart: `${itemPadding(item.depth)}px` }}>
            {item.title}
          </a>
        )
      })}

      {svg ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute start-0 top-0"
          style={{
            width: svg.width,
            height: svg.height,
            maskImage: `url("data:image/svg+xml,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svg.width} ${svg.height}"><path d="${svg.path}" stroke="black" stroke-width="2" fill="none" /></svg>`,
            )}")`,
          }}>
          <div
            className="bg-primary transition-all duration-300 ease-out"
            style={{
              marginTop: thumb[0],
              height: thumb[1],
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

export function DashboardTableOfContents({ toc }: ITocProps) {
  const flatItems = React.useMemo(() => flattenToc(toc), [toc])
  const itemIds = React.useMemo(() => flatItems.map((item) => item.url.split('#')[1]).filter(Boolean), [flatItems])
  const [activeHeading, setActiveHeading] = useActiveItem(itemIds)
  const mounted = useMounted()

  if (!toc.length) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex shrink-0 items-center gap-2">
        <BookOpenText aria-hidden="true" className="size-4" />
        <p className="font-medium">On This Page</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {mounted ? (
          <TocTree activeItem={activeHeading} items={flatItems} onItemClick={setActiveHeading} />
        ) : (
          <TocSkeleton toc={toc} />
        )}
      </div>
    </div>
  )
}
