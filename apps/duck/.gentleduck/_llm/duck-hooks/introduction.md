}>
  Reusable React hooks for the **@gentleduck** ecosystem.

## Philosophy

Each hook solves one problem: media queries, copy-to-clipboard, intersection observer, timing. They are typed, tested, and importable individually so you pull in only what you use.

***

## Installation

```bash
npm install @gentleduck/hooks
```

## Available Hooks

* `use-composed-refs` - Merge multiple refs into one. Also exports `composeRefs`.
* `schedule-transition-timeout` - Read an element's CSS transition duration and fire a callback when it ends. Exports `scheduleTransitionTimeout` (a plain timer factory, not a hook).
* `use-copy-to-clipboard` - Copy text with a configurable reset timeout, plus optional `onCopy` and `onError` callbacks.
* `use-debounce` - Debounce a callback as a real React hook with stable identity and unmount cleanup. Also exports `debounce` for non-React use.
* `use-is-mobile` - True when the viewport is below 768px.
* `use-media-query` - Subscribe to a CSS media query and get a boolean. It answers `false` where there is no `matchMedia`, on the server or in jsdom.
* `use-on-open-change` - Manage open/close state with scroll locking and CSS transition timing.
* `use-stable-id` - SSR-safe ID built on `React.useId` with an optional prefix.

## Usage

Import each hook from its own entry:

```tsx
import { useDebounce } from '@gentleduck/hooks/use-debounce';

function MyComponent() {
  const [value, setValue] = useState('');
  const debouncedSearch = useDebounce((query: string) => {
    console.log('Searching for:', query);
  }, 500);

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```