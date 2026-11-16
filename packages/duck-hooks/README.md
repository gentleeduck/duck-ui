<p align="center">
  <img src="../../public/logo-dark.svg" alt="@gentleduck/hooks" width="120"/>
</p>

<h1 align="center">@gentleduck/hooks</h1>

<p align="center">
  React hooks for Duck UI.
</p>

<p align="center">
  <a href="../../LICENSE">MIT</a> -
  <a href="../../CHANGELOG.md">Changelog</a> -
  <a href="../../CONTRIBUTING.md">Contributing</a> -
  <a href="https://gentleduck.org/duck-ui">Docs</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@gentleduck/hooks"><img src="https://img.shields.io/npm/v/@gentleduck/hooks.svg" alt="npm"/></a>
  <a href="https://www.npmjs.com/package/@gentleduck/hooks"><img src="https://img.shields.io/npm/dm/@gentleduck/hooks.svg" alt="downloads"/></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/npm/l/@gentleduck/hooks.svg" alt="MIT"/></a>
</p>

---

React utility hooks.

## Quick Start

```bash
bun add @gentleduck/hooks
```

```tsx
import { useState } from 'react'
import { useDebounce } from '@gentleduck/hooks/use-debounce'

function Search() {
  const [value, setValue] = useState('')

  // useDebounce takes a CALLBACK (not a value). The returned function is
  // stable across renders, debounced by 300ms, and auto-cancelled on unmount.
  const debouncedSearch = useDebounce((q: string) => {
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
  }, 300)

  return (
    <input
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        debouncedSearch(e.target.value)
      }}
    />
  )
}
```

## Hooks

| Hook | Import | Description |
| --- | --- | --- |
| `useComposedRefs` | `@gentleduck/hooks/use-composed-refs` | Merge multiple refs into one |
| `scheduleTransitionTimeout` | `@gentleduck/hooks/schedule-transition-timeout` | Schedule a callback after a CSS transition (timer factory, not a hook) |
| `useCopyToClipboard` | `@gentleduck/hooks/use-copy-to-clipboard` | Copy text to clipboard |
| `useDebounce` | `@gentleduck/hooks/use-debounce` | Debounce a callback (real hook with unmount cleanup) |
| `useIsMobile` | `@gentleduck/hooks/use-is-mobile` | Detect mobile viewport |
| `useMediaQuery` | `@gentleduck/hooks/use-media-query` | Subscribe to media queries; `false` where there is no `matchMedia` |
| `useOnOpenChange` | `@gentleduck/hooks/use-on-open-change` | Handle open/close state with body scroll-lock |
| `useStableId` | `@gentleduck/hooks/use-stable-id` | Generate a stable, SSR-safe ID with a prefix |

Each hook is tree-shakeable via its own subpath export.

### `useOnOpenChange` and the `scroll-locked` class

`useOnOpenChange` toggles a `scroll-locked` class on `document.body` while
the controlled element is open. Style this in your global CSS:

```css
body.scroll-locked {
  overflow: hidden;
}
```

Consumers that need a different class should fork the hook.

## License

MIT
