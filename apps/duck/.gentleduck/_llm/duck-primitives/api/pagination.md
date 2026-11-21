```tsx
import * as Pagination from '@gentleduck/primitives/pagination'
```

## Anatomy

```tsx
<Pagination.Root>
  <Pagination.Content>
    <Pagination.Item>
      <Pagination.First />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Previous />
    </Pagination.Item>
    <Pagination.Pages />
    <Pagination.Item>
      <Pagination.Next />
    </Pagination.Item>
    <Pagination.Item>
      <Pagination.Last />
    </Pagination.Item>
  </Pagination.Content>
</Pagination.Root>
```

`Pagination.Pages` renders an `Item` holding a `Page` for each page and one holding an `Ellipsis` for each gap. The list is the same length on every page, so the triggers never move under the pointer. Give an ellipsis the width of a page and nothing shifts at all.

## Usage

```tsx
const [page, setPage] = React.useState(1)

<Pagination.Root page={page} onPageChange={setPage} pageCount={20}>
  <Pagination.Content className="flex items-center gap-1">
    <Pagination.Item>
      <Pagination.Previous />
    </Pagination.Item>
    <Pagination.Pages />
    <Pagination.Item>
      <Pagination.Next />
    </Pagination.Item>
  </Pagination.Content>
</Pagination.Root>
```

With `getPageHref`, every page and trigger is a link to the address it returns, so the page survives a reload and opens in a new tab:

```tsx
<Pagination.Root pageCount={20} defaultPage={page} getPageHref={(page) => `/posts?page=${page}`}>
```

A client router's link prevents the browser from following it so it can navigate itself. The page still moves and `onPageChange` still fires, so a handler that does the same works:

```tsx
const navigate = (event: React.MouseEvent<HTMLElement>) => {
  event.preventDefault()
  router.push(event.currentTarget.getAttribute('href'))
}

<Pagination.Page value={item} onClick={navigate} />
```

## Examples

### Basic

```tsx title="components/pagination-basic.tsx"
// import from your project: import Demo from '@/components/pagination-basic'
'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import styles from '../primitives.module.css'

export default function PaginationBasicExample() {
  return (
    <Pagination.Root className={styles.pages} defaultPage={6} pageCount={12}>
      <Pagination.Content className={styles.pages}>
        <Pagination.Item>
          <Pagination.First />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Previous />
        </Pagination.Item>
        <Pagination.Pages />
        <Pagination.Item>
          <Pagination.Next />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Last />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}
```

### Controlled

```tsx title="components/pagination-controlled.tsx"
// import from your project: import Demo from '@/components/pagination-controlled'
'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import * as React from 'react'
import styles from '../primitives.module.css'

const ITEMS = Array.from({ length: 47 }, (_, index) => `Order #${1000 + index}`)
const PER_PAGE = 5

export default function PaginationControlledExample() {
  const [page, setPage] = React.useState(1)
  const shown = ITEMS.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className={styles.stack}>
      <ul className={styles.note} style={{ margin: 0, paddingInlineStart: '1rem' }}>
        {shown.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Pagination.Root onPageChange={setPage} page={page} pageCount={Math.ceil(ITEMS.length / PER_PAGE)}>
        <Pagination.Content className={styles.pages}>
          <Pagination.Item>
            <Pagination.Previous />
          </Pagination.Item>
          <Pagination.Pages />
          <Pagination.Item>
            <Pagination.Next />
          </Pagination.Item>
        </Pagination.Content>
      </Pagination.Root>
    </div>
  )
}
```

### Siblings and boundaries

```tsx title="components/pagination-sibling-boundary.tsx"
// import from your project: import Demo from '@/components/pagination-sibling-boundary'
'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PaginationSiblingBoundaryExample() {
  const [siblingCount, setSiblingCount] = React.useState(1)
  const [boundaryCount, setBoundaryCount] = React.useState(1)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setSiblingCount((value) => (value + 1) % 3)} type="button">
          siblingCount {siblingCount}
        </button>
        <button className={styles.button} onClick={() => setBoundaryCount((value) => (value + 1) % 3)} type="button">
          boundaryCount {boundaryCount}
        </button>
      </div>
      <Pagination.Root boundaryCount={boundaryCount} defaultPage={10} pageCount={20} siblingCount={siblingCount}>
        <Pagination.Content className={styles.pages}>
          <Pagination.Pages />
        </Pagination.Content>
      </Pagination.Root>
      <p className={styles.note}>
        The list keeps one length on every page, so the controls never move under the pointer.
      </p>
    </div>
  )
}
```

### As links

```tsx title="components/pagination-links.tsx"
// import from your project: import Demo from '@/components/pagination-links'
'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import styles from '../primitives.module.css'

export default function PaginationLinksExample() {
  return (
    <div className={styles.stack}>
      <Pagination.Root defaultPage={2} getPageHref={(page) => `?page=${page}`} pageCount={6}>
        <Pagination.Content className={styles.pages}>
          <Pagination.Item>
            <Pagination.Previous />
          </Pagination.Item>
          <Pagination.Pages />
          <Pagination.Item>
            <Pagination.Next rel="next" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Last rel="noopener" target="_blank">
              Last, in a new tab
            </Pagination.Last>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination.Root>
      <p className={styles.note}>
        getPageHref makes every control a link, with a link's own target and rel. One with nowhere to go loses its
        address.
      </p>
    </div>
  )
}
```

### Your own pages

```tsx title="components/pagination-custom-pages.tsx"
// import from your project: import Demo from '@/components/pagination-custom-pages'
'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import styles from '../primitives.module.css'

export default function PaginationCustomPagesExample() {
  return (
    <Pagination.Root defaultPage={4} pageCount={9}>
      <Pagination.Content className={styles.pages}>
        <Pagination.Pages>
          {(items) =>
            items.map((item) => (
              <Pagination.Item key={item}>
                {typeof item === 'number' ? (
                  <Pagination.Page aria-label={`Page ${item}`} value={item}>
                    {String(item).padStart(2, '0')}
                  </Pagination.Page>
                ) : (
                  <Pagination.Ellipsis>...</Pagination.Ellipsis>
                )}
              </Pagination.Item>
            ))
          }
        </Pagination.Pages>
      </Pagination.Content>
    </Pagination.Root>
  )
}
```

### Right to left

```tsx title="components/pagination-rtl.tsx"
// import from your project: import Demo from '@/components/pagination-rtl'
'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import styles from '../primitives.module.css'

export default function PaginationRtlExample() {
  return (
    <Pagination.Root defaultPage={3} dir="rtl" pageCount={8}>
      <Pagination.Content className={styles.pages}>
        <Pagination.Item>
          <Pagination.Previous>السابق</Pagination.Previous>
        </Pagination.Item>
        <Pagination.Pages />
        <Pagination.Item>
          <Pagination.Next>التالي</Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}
```

***

## API

### `Pagination.Root`

Renders a semantic `<nav>` container (`aria-label="pagination"` by default).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pageCount` | `number` | `1` | Number of pages. Until it is set there is one, so the triggers stay disabled. |
| `page` | `number` | - | The current page, when you control it. A page past either end shows as that end. |
| `defaultPage` | `number` | `1` | The page to start on, when the root tracks it |
| `onPageChange` | `(page: number) => void` | - | Called with the page a trigger or page asks for. A page outside `1` to `pageCount` is refused and never reported |
| `siblingCount` | `number` | `1` | Pages shown on either side of the current one |
| `boundaryCount` | `number` | `1` | Pages always shown at each end |
| `getPageHref` | `(page: number) => string` | - | Renders every page and trigger as a link to the address it returns |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved with `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `...props` | `React.ComponentPropsWithoutRef<'nav'>` | - | Additional props for the root nav element |

### `Pagination.Content`

Renders a `<ul>`. Its direction is the nav's.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<'ul'>` | - | Additional props for the list element |

### `Pagination.Item`

Renders a `<li>`. Its direction is the nav's.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<'li'>` | - | Additional props for the list item element |

### `Pagination.Pages`

Renders the window of pages around the current one. A gap of one page shows that page instead of an ellipsis.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `(items: (number \| 'start-ellipsis' \| 'end-ellipsis')[]) => React.ReactNode` | - | Draws the items yourself |

### `Pagination.Page`

A button, or a link under `getPageHref`, that moves to its page. Its label is the page number unless it has children.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | - | The page it moves to |
| `disabled` | `boolean` | `false` | Disables the page |
| `asChild` | `boolean` | `false` | Renders its child in place of the button or link |
| `...props` | `React.HTMLAttributes<HTMLElement>` | - | Additional props for the button or link |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-page"` |
| `[data-selected]` | Present on the current page, which also carries `aria-current="page"` |
| `[data-disabled]` | Present when disabled |

### `Pagination.First`, `Pagination.Previous`, `Pagination.Next`, `Pagination.Last`

A button, or a link under `getPageHref`, that moves to the first, previous, next or last page. Each is disabled when it has nowhere to go: a button gets `disabled`, and a link loses its address and gets `aria-disabled`, so it leaves the tab order. Each is labelled "First page", "Previous page", "Next page" or "Last page" unless it has an `aria-label`.

On a button, a click handler that calls `event.preventDefault()` keeps the page where it is. On a link it only stops the browser following the link, and the page still moves. A disabled page or trigger runs no click handler, link or button.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disables the trigger whatever the page |
| `asChild` | `boolean` | `false` | Renders its child in place of the button or link |
| `...props` | `React.HTMLAttributes<HTMLElement>` | - | Additional props for the button or link |

| Data attribute | Values |
| --- | --- |
| `[data-slot]` | `"pagination-first"`, `"pagination-previous"`, `"pagination-next"` or `"pagination-last"` |
| `[data-disabled]` | Present when disabled |

### `Pagination.Ellipsis`

Renders a `<span>` for a gap, with `data-slot="pagination-ellipsis"`. It holds an ellipsis character unless it has children.

### `getPaginationRange`

```ts
getPaginationRange(page: number, pageCount: number, siblingCount = 1, boundaryCount = 1)
```

The items `Pagination.Pages` draws, for a table or a server render that does not mount the root. `getPaginationRange(5, 10)` is `[1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10]`.