```tsx title="components/pagination-1.tsx"
// import from your project: import Demo from '@/components/pagination-1'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@gentleduck/registry-ui/pagination'

export default function Demo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
```

## Philosophy

Pagination is a navigation pattern, not a data-fetching pattern. We provide the visual components (page buttons, next/previous, ellipsis) and let you wire them to your data layer. This separation means the same pagination UI works whether you're paginating a client-side array, an API, or a database cursor. Under the hood, this component composes `@gentleduck/primitives/pagination` for semantic structure and direction-aware behavior.

Give the root a `pageCount` and it can also track the page for you: `PaginationPages` draws the pages around the current one, and the trigger parts move between them and disable themselves at either end. Every page draws the same number of items, so the triggers never move under the pointer.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add pagination
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives
```

Add the `Button` component to your project.

The `Pagination` component uses the [`Button`](/duck-ui/components/button) component. Make sure you have it installed in your project.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
```

```tsx showLineNumbers
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

## Examples

### Tracking the page

Pass `pageCount` to the root, and either `defaultPage` or a controlled `page` with `onPageChange`. `PaginationPages` renders a `PaginationItem` per page or gap, so it sits straight in `PaginationContent`. Put each trigger in a `PaginationItem` of its own, since the list holds only list items.

```tsx title="components/pagination-5.tsx"
// import from your project: import Demo from '@/components/pagination-5'
'use client'

import {
  Pagination,
  PaginationContent,
  PaginationFirstTrigger,
  PaginationItem,
  PaginationLastTrigger,
  PaginationNextTrigger,
  PaginationPages,
  PaginationPreviousTrigger,
} from '@gentleduck/registry-ui/pagination'
import * as React from 'react'

export default function Demo() {
  const [page, setPage] = React.useState(6)

  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination onPageChange={setPage} page={page} pageCount={20}>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirstTrigger />
          </PaginationItem>
          <PaginationItem>
            <PaginationPreviousTrigger />
          </PaginationItem>
          <PaginationPages />
          <PaginationItem>
            <PaginationNextTrigger />
          </PaginationItem>
          <PaginationItem>
            <PaginationLastTrigger />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <p className="text-muted-foreground text-sm">Page {page} of 20</p>
    </div>
  )
}
```

```tsx showLineNumbers
const [page, setPage] = React.useState(1)

<Pagination page={page} onPageChange={setPage} pageCount={20}>
  <PaginationContent>
    <PaginationItem>
      <PaginationFirstTrigger />
    </PaginationItem>
    <PaginationItem>
      <PaginationPreviousTrigger />
    </PaginationItem>
    <PaginationPages />
    <PaginationItem>
      <PaginationNextTrigger />
    </PaginationItem>
    <PaginationItem>
      <PaginationLastTrigger />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Links

To render links rather than buttons, give the root `getPageHref`, which returns the address of a page. A trigger with nowhere to go keeps its place as a link with no address, `aria-disabled` and no tab stop. Read the page back from the address, with `defaultPage` or `page`, so a reload opens on it. A client router's link, or a click handler that prevents the browser from following the link to navigate itself, still moves the page and calls `onPageChange`.

```tsx title="components/pagination-6.tsx"
// import from your project: import Demo from '@/components/pagination-6'
'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNextTrigger,
  PaginationPages,
  PaginationPreviousTrigger,
} from '@gentleduck/registry-ui/pagination'

export default function Demo() {
  return (
    <Pagination getPageHref={(page) => `#results-page-${page}`} pageCount={12}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPreviousTrigger />
        </PaginationItem>
        <PaginationPages />
        <PaginationItem>
          <PaginationNextTrigger />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
```

```tsx
<Pagination pageCount={20} defaultPage={page} getPageHref={(page) => `/posts?page=${page}`}>
```

### The window and its drawing

`siblingCount` sets how many pages show on either side of the current one, and `boundaryCount` how many always show at each end, `0` for none. Give `PaginationPages` a function to draw the range yourself: it gets each page number and `'start-ellipsis'` or `'end-ellipsis'` for a gap. Children replace a trigger's icon, and an `aria-label` replaces its name.

```tsx title="components/pagination-7.tsx"
// import from your project: import Demo from '@/components/pagination-7'
'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNextTrigger,
  PaginationPage,
  PaginationPages,
  PaginationPreviousTrigger,
} from '@gentleduck/registry-ui/pagination'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Demo() {
  return (
    <Pagination aria-label="Search results" boundaryCount={0} defaultPage={9} pageCount={40} siblingCount={2}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPreviousTrigger aria-label="Newer results" className="w-auto gap-1 px-3">
            <ArrowLeft aria-hidden="true" className="rtl:rotate-180" />
            Newer
          </PaginationPreviousTrigger>
        </PaginationItem>
        <PaginationPages>
          {(items) =>
            items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === 'number' ? (
                  <PaginationPage aria-label={`Results page ${item}`} value={item} />
                ) : (
                  <PaginationEllipsis text={item === 'start-ellipsis' ? 'Newer pages' : 'Older pages'} />
                )}
              </PaginationItem>
            ))
          }
        </PaginationPages>
        <PaginationItem>
          <PaginationNextTrigger aria-label="Older results" className="w-auto gap-1 px-3">
            Older
            <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
          </PaginationNextTrigger>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
```

### Wrapper

`PaginationWrapper` lays out first, previous, next and last buttons with nothing between them, for a table footer. It holds no page, so wire each button's `onClick` and `disabled` yourself.

```tsx title="components/pagination-8.tsx"
// import from your project: import Demo from '@/components/pagination-8'
'use client'

import { PaginationWrapper } from '@gentleduck/registry-ui/pagination'
import * as React from 'react'

const pageCount = 8

export default function Demo() {
  const [page, setPage] = React.useState(1)
  const first = page === 1
  const last = page === pageCount

  return (
    <div className="flex items-center gap-4">
      <p className="text-muted-foreground text-sm">
        Page {page} of {pageCount}
      </p>
      <PaginationWrapper
        left={{ disabled: first, onClick: () => setPage(page - 1) }}
        maxLeft={{ disabled: first, onClick: () => setPage(1) }}
        maxRight={{ disabled: last, onClick: () => setPage(pageCount) }}
        right={{ disabled: last, onClick: () => setPage(page + 1) }}
        wrapper={{ 'aria-label': 'Invoices' }}
      />
    </div>
  )
}
```

### Next.js

By default the `<PaginationLink />` component will render an `<a />` tag.

To use the Next.js `<Link />` component, make the following updates to `pagination.tsx`.

```diff showLineNumbers /typeof Link/ {1}
+ import Link from "next/link"

- type PaginationLinkProps = ... & React.ComponentPropsWithoutRef<"a">
+ type PaginationLinkProps = ... & React.ComponentProps<typeof Link>

const PaginationLink = ({...props }: ) => (
  <PaginationItem>
-   <a>
+   <Link>
      // ...
-   </a>
+   </Link>
  </PaginationItem>
)

```

} className="mt-6">
  **Note:** We are making updates to the cli to automatically do this for you.

### Link sizes and the wrapper

```tsx title="components/pagination-9.tsx"
// import from your project: import Demo from '@/components/pagination-9'
'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationWrapper,
} from '@gentleduck/registry-ui/pagination'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <Pagination>
        <PaginationContent>
          {(['sm', 'icon', 'default'] as const).map((size, index) => (
            <PaginationItem key={size}>
              <PaginationLink href="#" isActive={index === 1} size={size}>
                {size}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
      <PaginationWrapper content={{ className: 'gap-4' }} item={{ className: 'rounded-full' }} />
    </div>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the pagination mirrors itself: keep markup in logical order (`Previous`, pages, `Next`) and the chevrons flip automatically. Use the `text` and `aria-label` props on `PaginationPrevious`, `PaginationNext`, and `PaginationEllipsis` to translate the labels.

```tsx title="components/pagination-2.tsx"
// import from your project: import Demo from '@/components/pagination-2'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@gentleduck/registry-ui/pagination'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Pagination aria-label="التنقل بين الصفحات">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious aria-label="الانتقال إلى الصفحة السابقة" href="#" text="السابق" />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink href="#">١</PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationLink href="#" isActive>
              ٢
            </PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationLink href="#">٣</PaginationLink>
          </PaginationItem>

          <PaginationItem>
            <PaginationEllipsis text="صفحات أخرى" />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext aria-label="الانتقال إلى الصفحة التالية" href="#" text="التالي" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionPagination` with `MotionPaginationLink`, `MotionPaginationPrevious`, and `MotionPaginationNext` for staggered entrance animations and tap feedback powered by [motion](https://motion.dev). Each link fades, scales and sharpens in with a bouncy spring, staggered by 50ms via the `index` prop, and scales to 0.97 on tap. A link scales in on `scaleX` and `scaleY`, so `scale` keeps the 15ms tap tween and a press releases at once.

```tsx title="components/pagination-4.tsx"
// import from your project: import Demo from '@/components/pagination-4'
'use client'

import {
  MotionPagination,
  MotionPaginationLink,
  MotionPaginationNext,
  MotionPaginationPrevious,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@gentleduck/registry-ui/pagination'

export default function Demo() {
  return (
    <MotionPagination>
      <PaginationContent>
        <PaginationItem>
          <MotionPaginationPrevious href="#" index={0} />
        </PaginationItem>
        <PaginationItem>
          <MotionPaginationLink href="#" index={1}>
            1
          </MotionPaginationLink>
        </PaginationItem>
        <PaginationItem>
          <MotionPaginationLink href="#" isActive index={2}>
            2
          </MotionPaginationLink>
        </PaginationItem>
        <PaginationItem>
          <MotionPaginationLink href="#" index={3}>
            3
          </MotionPaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <MotionPaginationNext href="#" index={4} />
        </PaginationItem>
      </PaginationContent>
    </MotionPagination>
  )
}
```

`MotionPagination` animates on its own. Around the plain parts, the nav scales in as one piece and the links keep no tap feedback.

```tsx title="components/pagination-3.tsx"
// import from your project: import Demo from '@/components/pagination-3'
import {
  MotionPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@gentleduck/registry-ui/pagination'

export default function Demo() {
  return (
    <MotionPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </MotionPagination>
  )
}
```

}>
  Requires the `motion` package. Use the `Motion*` variants instead of the base components. Same props plus `index` for stagger delay. The regular components are perfectly fine - this is an optional enhancement.

## API Reference

### Pagination

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pageCount` | `number` | `1` | Number of pages. Until it is set there is one, so the triggers stay disabled. |
| `page` | `number` | - | The current page, when you control it. A page past either end shows as that end. |
| `defaultPage` | `number` | `1` | The page to start on, when the root tracks it. |
| `onPageChange` | `(page: number) => void` | - | Called with the page a trigger or page asks for |
| `siblingCount` | `number` | `1` | Pages shown on either side of the current one |
| `boundaryCount` | `number` | `1` | Pages always shown at each end |
| `getPageHref` | `(page: number) => string` | - | Renders every page and trigger as a link to the address it returns |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | `--` | Additional CSS classes for the `nav` element |
| `...props` | `React.ComponentPropsWithoutRef<'nav'>` | - | Additional props to spread to the nav element |

### PaginationContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the `ul` element |
| `...props` | `React.ComponentPropsWithoutRef<'ul'>` | - | Additional props to spread to the ul element |

### PaginationItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the `li` element |
| `...props` | `React.ComponentPropsWithoutRef<'li'>` | - | Additional props to spread to the li element |

### PaginationLink

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `isActive` | `boolean` | - | Marks the link as active/current page (adds `aria-current="page"` and styles) |
| `size` | `'icon' \| 'default' \| 'sm'` | `'icon'` | Size variant for the button style |
| `...props` | `React.ComponentPropsWithoutRef<'a'>` | - | Additional props to spread to the a element |

### PaginationPrevious

Extends `PaginationLink` with `aria-label="Go to previous page"`, left arrow icon, and text "Previous". Uses `'default'` size.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `'Previous'` | Visible label text. Override for i18n / RTL support. |
| `className` | `string` | `--` | Additional CSS classes for the previous link |
| `...props` | `React.ComponentPropsWithoutRef<typeof PaginationLink>` | - | Additional props inherited from `PaginationLink`. |

### PaginationNext

Extends `PaginationLink` with `aria-label="Go to next page"`, text "Next", and right arrow icon. Uses `'default'` size.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `'Next'` | Visible label text. Override for i18n / RTL support. |
| `className` | `string` | `--` | Additional CSS classes for the next link |
| `...props` | `React.ComponentPropsWithoutRef<typeof PaginationLink>` | - | Additional props inherited from `PaginationLink`. |

### PaginationEllipsis

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `'More pages'` | Screen-reader label text. Override for i18n / RTL support. |
| `className` | `string` | `--` | Additional CSS classes for the ellipsis element |
| `...props` | `React.ComponentPropsWithoutRef<'span'>` | - | Additional props to spread to the span element |

### PaginationPages

Draws the pages around the current one: a `PaginationItem` holding a `PaginationPage` for each page, and one holding a `PaginationEllipsis` for each gap. A gap of one page shows that page instead.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `(items: (number \| 'start-ellipsis' \| 'end-ellipsis')[]) => React.ReactNode` | - | Draws the items yourself |

### PaginationPage

A ghost icon button, or a link under `getPageHref`, that moves to its page. The current page carries `aria-current="page"`, `data-selected` and an outlined style.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | - | The page it moves to. Also its label, unless it has children. |
| `asChild` | `boolean` | `false` | Renders its child in place of the button |
| `...props` | `React.HTMLAttributes<HTMLElement>` | - | Additional props to spread to the button or link |

### PaginationFirstTrigger, PaginationPreviousTrigger, PaginationNextTrigger, PaginationLastTrigger

Ghost icon buttons, or links under `getPageHref`, that move to the first, previous, next or last page. Each is disabled when it has nowhere to go and labelled "First page", "Previous page", "Next page" or "Last page". The chevrons flip in right-to-left.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | chevron icon | Replaces the icon |
| `disabled` | `boolean` | `false` | Disables the trigger whatever the page |
| `asChild` | `boolean` | `false` | Renders its child in place of the button |
| `...props` | `React.HTMLAttributes<HTMLElement>` | - | Additional props to spread to the button or link. An `aria-label` replaces the default. |

### PaginationWrapper

Four outline icon buttons labelled "Go to first page", "Go to previous page", "Go to next page" and "Go to last page". Each takes the `Button` props, an `icon` among them.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `wrapper` | `React.ComponentPropsWithoutRef<typeof Pagination>` | - | Props for the pagination container |
| `content` | `React.ComponentPropsWithoutRef<typeof PaginationContent>` | - | Props for the content list |
| `item` | `React.ComponentPropsWithoutRef<typeof PaginationItem>` | - | Props for each pagination item |
| `right` | `React.ComponentPropsWithoutRef<typeof Button>` | - | Props for the "Next" button |
| `maxRight` | `React.ComponentPropsWithoutRef<typeof Button>` | - | Props for the "Last" button |
| `left` | `React.ComponentPropsWithoutRef<typeof Button>` | - | Props for the "Previous" button |
| `maxLeft` | `React.ComponentPropsWithoutRef<typeof Button>` | - | Props for the "First" button |

The wrapper follows `DirectionProvider` (or `<html dir>`) like the other parts. Pass `dir` through `wrapper` only to override it locally:

```tsx
<PaginationWrapper wrapper={{ dir: 'rtl' }} />
```

### MotionPagination

`scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition on mount. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `PaginationProps` | - | All props from `Pagination` are supported |

### MotionPaginationLink

Staggered `scaleIn` entrance plus `whileTap` press feedback (scale 0.97) that `useMotionPreset`'s `tap` releases at once. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Stagger delay index (50ms per index) for entrance animation |
| `...props` | `PaginationLinkProps` | - | All props from `PaginationLink` are supported |

### MotionPaginationPrevious

Uses `MotionPaginationLink` internally with preset icon and label. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Stagger delay index (50ms per index) for entrance animation |
| `text` | `string` | `'Previous'` | Label text shown alongside the chevron |
| `...props` | `PaginationLinkProps` | - | All other props from `PaginationLink` are supported |

### MotionPaginationNext

Uses `MotionPaginationLink` internally with preset icon and label. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Stagger delay index (50ms per index) for entrance animation |
| `text` | `string` | `'Next'` | Label text shown alongside the chevron |
| `...props` | `PaginationLinkProps` | - | All other props from `PaginationLink` are supported |