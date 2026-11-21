```tsx
import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
```

## Usage

```tsx
<NavigationMenu.Root>
  <NavigationMenu.List>
    <NavigationMenu.Item value="docs">
      <NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
      <NavigationMenu.Content>
        <NavigationMenu.Link href="/docs/getting-started">Getting Started</NavigationMenu.Link>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  </NavigationMenu.List>
  <NavigationMenu.Indicator />
  <NavigationMenu.Viewport />
</NavigationMenu.Root>
```

## Examples

### Basic

```tsx title="components/navigation-menu-basic.tsx"
// import from your project: import Demo from '@/components/navigation-menu-basic'
'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuBasicExample() {
  return (
    <NavigationMenu.Root className={styles.relative}>
      <NavigationMenu.List className={styles.navList}>
        <NavigationMenu.Item value="learn">
          <NavigationMenu.Trigger className={styles.menubarTrigger}>Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.navContent}>
            <NavigationMenu.Link className={styles.navLink} href="#introduction">
              Introduction
            </NavigationMenu.Link>
            <NavigationMenu.Link className={styles.navLink} href="#styling">
              Styling
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="components">
          <NavigationMenu.Trigger className={styles.menubarTrigger}>Components</NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.navContent}>
            {['Accordion', 'Dialog', 'Popover', 'Tooltip'].map((name) => (
              <NavigationMenu.Link className={styles.navLink} href={`#${name.toLowerCase()}`} key={name}>
                {name}
              </NavigationMenu.Link>
            ))}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link className={styles.menubarTrigger} href="#github">
            GitHub
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
```

### Controlled

```tsx title="components/navigation-menu-controlled.tsx"
// import from your project: import Demo from '@/components/navigation-menu-controlled'
'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function NavigationMenuControlledExample() {
  const [value, setValue] = React.useState('')

  return (
    <div className={styles.stack}>
      <NavigationMenu.Root className={styles.relative} onValueChange={setValue} value={value}>
        <NavigationMenu.List className={styles.navList}>
          {['Products', 'Pricing'].map((name) => (
            <NavigationMenu.Item key={name} value={name}>
              <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
              <NavigationMenu.Content className={styles.navContent}>
                <NavigationMenu.Link className={styles.navLink} href={`#${name.toLowerCase()}`}>
                  All {name.toLowerCase()}
                </NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          ))}
        </NavigationMenu.List>
        <NavigationMenu.Viewport className={styles.viewport} />
      </NavigationMenu.Root>
      <p className={styles.note} style={{ marginTop: '7rem' }}>
        Open item: {value || 'none'}.{' '}
        <button className={styles.button} onClick={() => setValue('Pricing')} type="button">
          Open Pricing
        </button>
      </p>
    </div>
  )
}
```

### Opened by click

```tsx title="components/navigation-menu-manual.tsx"
// import from your project: import Demo from '@/components/navigation-menu-manual'
'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuManualExample() {
  return (
    <NavigationMenu.Root activationMode="manual" className={styles.relative}>
      <NavigationMenu.List className={styles.navList}>
        {['Docs', 'Blog', 'Community'].map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.navContent}>
              <NavigationMenu.Link className={styles.navLink} href={`#${name.toLowerCase()}`}>
                Latest in {name.toLowerCase()}
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
```

### Vertical

```tsx title="components/navigation-menu-vertical.tsx"
// import from your project: import Demo from '@/components/navigation-menu-vertical'
'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuVerticalExample() {
  return (
    <NavigationMenu.Root className={styles.relative} orientation="vertical" style={{ display: 'flex', gap: '0.5rem' }}>
      <NavigationMenu.List className={styles.navList}>
        {['Overview', 'Reports', 'Settings'].map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
            <NavigationMenu.Content className={`${styles.content} ${styles.navContent}`}>
              <NavigationMenu.Link className={styles.navLink} href={`#${name.toLowerCase()}`}>
                {name} home
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
```

### A sub-menu

```tsx title="components/navigation-menu-sub.tsx"
// import from your project: import Demo from '@/components/navigation-menu-sub'
'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuSubExample() {
  return (
    <NavigationMenu.Root className={styles.relative}>
      <NavigationMenu.List className={styles.navList}>
        <NavigationMenu.Item value="guides">
          <NavigationMenu.Trigger className={styles.menubarTrigger}>Guides</NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.navContent}>
            <NavigationMenu.Sub defaultValue="react" disableToggle={false}>
              <NavigationMenu.List className={styles.navList}>
                {['react', 'vue'].map((framework) => (
                  <NavigationMenu.Item key={framework} value={framework}>
                    <NavigationMenu.Trigger className={styles.menubarTrigger}>{framework}</NavigationMenu.Trigger>
                    <NavigationMenu.Content className={styles.navContent}>
                      <NavigationMenu.Link className={styles.navLink} href={`#${framework}-setup`}>
                        Set up {framework}
                      </NavigationMenu.Link>
                    </NavigationMenu.Content>
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>
            </NavigationMenu.Sub>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
```

### Delays

```tsx title="components/navigation-menu-delays.tsx"
// import from your project: import Demo from '@/components/navigation-menu-delays'
'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuDelaysExample() {
  return (
    <NavigationMenu.Root className={styles.relative} closeDelay={600} delayDuration={500} skipDelayDuration={1000}>
      <NavigationMenu.List className={styles.navList}>
        {['Slow', 'To', 'Open'].map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.navContent}>
              <NavigationMenu.Link className={styles.navLink} href="#">
                Rest 500ms to open, then the next opens at once for a second.
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
```

### Links

```tsx title="components/navigation-menu-links.tsx"
// import from your project: import Demo from '@/components/navigation-menu-links'
'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function NavigationMenuLinksExample() {
  const [page, setPage] = React.useState('#overview')
  const [filters, setFilters] = React.useState(0)

  return (
    <NavigationMenu.Root className={styles.relative}>
      <NavigationMenu.List className={styles.navList}>
        <NavigationMenu.Item value="pages">
          <NavigationMenu.Trigger className={styles.menubarTrigger}>Pages</NavigationMenu.Trigger>
          <NavigationMenu.Content className={styles.navContent}>
            {['#overview', '#activity', '#billing'].map((href) => (
              <NavigationMenu.Link
                active={href === page}
                className={styles.navLink}
                href={href}
                key={href}
                onSelect={(event) => {
                  event.preventDefault()
                  setPage(href)
                }}>
                {href.slice(1)}
              </NavigationMenu.Link>
            ))}
            <NavigationMenu.Link
              className={styles.navLink}
              closeOnSelect={false}
              href="#"
              onSelect={(event) => {
                event.preventDefault()
                setFilters((count) => count + 1)
              }}>
              Add a filter ({filters}), keeps the menu open
            </NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
```

### Right to left

```tsx title="components/navigation-menu-rtl.tsx"
// import from your project: import Demo from '@/components/navigation-menu-rtl'
'use client'

import * as NavigationMenu from '@gentleduck/primitives/navigation-menu'
import styles from '../primitives.module.css'

export default function NavigationMenuRtlExample() {
  return (
    <NavigationMenu.Root className={styles.relative} dir="rtl">
      <NavigationMenu.List className={styles.navList}>
        {['المنتجات', 'الأسعار', 'المدونة'].map((name) => (
          <NavigationMenu.Item key={name} value={name}>
            <NavigationMenu.Trigger className={styles.menubarTrigger}>{name}</NavigationMenu.Trigger>
            <NavigationMenu.Content className={styles.navContent}>
              <NavigationMenu.Link className={styles.navLink} href="#">
                كل {name}
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
      <NavigationMenu.Viewport className={styles.viewport} />
    </NavigationMenu.Root>
  )
}
```

***

## API

### `NavigationMenu.Root`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Controlled open item value |
| `defaultValue` | `string` | `''` | Initial open item value |
| `onValueChange` | `(value: string) => void` | - | Called when open value changes |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved with `useDirection` (`dir` prop -> `DirectionProvider` -> `'ltr'`). |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Menu orientation |
| `delayDuration` | `number` | `200` | Delay before an item opens when the pointer rests on its trigger. A click on the trigger before it runs out cancels the open. Ignored in `manual` mode |
| `skipDelayDuration` | `number` | `300` | Time window to skip reopen delay. Ignored in `manual` mode |
| `closeDelay` | `number` | `150` | How long an item stays open after the pointer leaves it. Ignored in `manual` mode |
| `activationMode` | `'automatic' \| 'manual'` | `'automatic'` | `automatic` opens an item when the pointer rests on its trigger and closes it when the pointer leaves; `manual` opens and closes it only on a click |
| `...props` | `React.ComponentPropsWithoutRef<'nav'>` | - | Additional props for root nav |

### `NavigationMenu.Sub`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Controlled sub-menu value |
| `defaultValue` | `string` | `''` | Initial sub-menu value |
| `onValueChange` | `(value: string) => void` | - | Called when sub-menu value changes |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Sub-menu orientation |
| `activationMode` | `'automatic' \| 'manual'` | the root's | As on the root, for this sub-menu's items |
| `disableToggle` | `boolean` | `true` | Keeps an open item open when its trigger is clicked again. `false` closes it |

### `NavigationMenu.List`

List wrapper for menu items and indicator tracking.

### `NavigationMenu.Item`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | auto-generated | Stable item key used by trigger/content pairing |

### `NavigationMenu.Trigger`

Interactive trigger button for an item. Sets `aria-expanded` and `data-state`, and `aria-controls` while its content is open, so it never points at an element that is not rendered.

### `NavigationMenu.Content`

Content panel for an item. Supports pointer/focus outside handlers from dismissable layer props. Focus moving outside the menu closes it only when it left from inside the menu, so a dialog that focuses itself on open leaves the menu open. It carries `data-state`, `open` or `closed`, inside the viewport as well as out of it, so a force-mounted content can be hidden while closed.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Keep mounted for animation control |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - | Called on <Kbd>Escape</Kbd>. Prevent default to keep the item open |
| `onPointerDownOutside` | `(event) => void` | - | Called for a press outside the menu |
| `onFocusOutside` | `(event) => void` | - | Called when focus moves outside the menu |
| `onInteractOutside` | `(event) => void` | - | Called for any outside interaction |

It carries `data-slot="navigation-menu-content"`. While its content is closed, its links leave the tab order, and each gets its own `tabindex` back, or none if it had none, when it opens. It finds them as `FocusScope` does, so it skips what is hidden, inert or in a disabled fieldset, and a <Kbd>Tab</Kbd> from a link inside a shadow root moves on through the content.

### `NavigationMenu.Link`

Composable link slot used inside content.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `active` | `boolean` | `false` | Marks link as current page (`aria-current="page"`) |
| `onSelect` | `(event: Event) => void` | - | Called on link selection before root dismiss |
| `closeOnSelect` | `boolean` | `true` | `false` keeps the menu open once the link is selected. A click with Cmd, Ctrl, Shift or Alt held leaves it open either way, since the link opens in another tab or window, or downloads, and the page stays |

### `NavigationMenu.Indicator`

Positions an active-item indicator relative to the current trigger. Place it in `NavigationMenu.List`: it is drawn in the list's track and measured from it, so a positioned item around the trigger does not move it. It sets its `width` and `translateX` from the trigger in a horizontal menu, and its `height` and `translateY` in a vertical one.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Keep mounted for animation control |

### `NavigationMenu.Viewport`

Shared animated viewport that hosts active content. It sets `--gentleduck-navigation-menu-viewport-width` and `--gentleduck-navigation-menu-viewport-height` to the open content's size, before the first paint and again whenever the content resizes, so its styles can size and animate it. Its own children render before the content. With `asChild`, its props land on the child element and the content renders inside it:

```tsx
<NavigationMenu.Viewport asChild>
  <section className="viewport" />
</NavigationMenu.Viewport>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `true` | - | Keep viewport mounted for animation control |

### Scope

```tsx
import { createNavigationMenuScope } from '@gentleduck/primitives/navigation-menu'
```

`createNavigationMenuScope` is exported for advanced composition and nested-scoped integration.