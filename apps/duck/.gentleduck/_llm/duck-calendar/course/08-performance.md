}>
  **Lesson 8 of 8**: how `@gentleduck/calendar` compares to other React calendar libraries, plus optimization tips.

## Bundle size

We replaced `react-day-picker` with `@gentleduck/calendar`. Comparison against the major React calendar libraries:

### Bundle size across all competitors

| Library | Bundle (gzipped) | Source |
| :--- | :--- | :--- |
| **@gentleduck/calendar** (`useCalendar` + `NativeAdapter`) | **5.9 KB** | Measured |
| **@gentleduck/primitives** Calendar | **10.0 KB** | Measured |
| React Aria Calendar | 36.9 KB | Measured |
| Ark UI DatePicker, inline | 43.3 KB | Measured |
| react-day-picker v10, date-fns included | 20.0 KB | Measured |
| react-calendar | 15.0 KB | Published |
| react-datepicker | 32.0 KB | Published |

The hook draws nothing, so the like-for-like row is the primitives Calendar: 10.0 KB against 20.0 KB for
react-day-picker, 36.9 KB for React Aria and 43.3 KB for Ark UI. Those are measured by `bun run benchmark` in
`packages/duck-primitives`; the last two are bundlephobia's published sizes.

### Dependencies

| Library | Runtime Dependencies |
| :--- | :--- |
| **@gentleduck/calendar** | **0** |
| react-calendar | 4 |
| react-day-picker | 2 (date-fns, @date-fns/tz) |
| react-datepicker | 3 |
| react-aria-components | 8 |
| @ark-ui/react | 69, one per component |

***

## Render performance

Core function benchmarks (average of 2000 iterations):

| Operation | Time |
| :--- | :--- |
| `buildCalendarMonth` | ~7 us |
| `buildMultiMonth(3)` | ~18 us |
| `buildMultiMonth(12)` | ~69 us |
| `applySelection` | ~10 us |

Generate benchmarks locally:

```bash
cd packages/duck-calendar && bun run benchmark
```

***

## Package quality

| Tool | Result |
| :--- | :--- |
| publint | All good |
| attw (are-the-types-wrong) | Types correct for node10, node16, bundler |
| ESM | Pure ESM, `"type": "module"` |

***

## Optimizations

These keep the hook at 5.9 KB gzipped:

* **Intl.DateTimeFormat caching**: formatters cached per locale+options, avoiding expensive re-instantiation.
* **Stable keyboard callback**: `configRef` pattern, zero recreation cost.
* **Pre-computed time field orders**: 4 static arrays replace `Array.filter()` on every keystroke.
* **Frozen selection constants**: one `UNSELECTED` object shared across unselected days.
* **Dev JSX elimination**: production build uses `createElement` directly, no `jsxDEV` metadata.

***

## Why it's fast

* **Pure functions**: grid building and selection allocate no closures and hold no subscriptions.
* **No date library dependency**: `NativeAdapter` uses native `Date` and `Intl.DateTimeFormat`.
* **Tree-shakeable**: import only what you need; if it's just `buildCalendarMonth`, the rest goes.
* **Minimal React overhead**: hooks use `useMemo` to avoid rebuilding grids on every render.
* **No CSS runtime**: no CSS-in-JS overhead, no stylesheet injection.

***

## Optimization tips

}>
  * Wrap day cells in `React.memo` to skip re-renders on unchanged days.
  * Use `numberOfMonths: 1` unless you need multi-month views.
  * Use `fixedWeeks: false` to render fewer day cells.
  * Memoize the adapter instance outside the component, since it's stateless.