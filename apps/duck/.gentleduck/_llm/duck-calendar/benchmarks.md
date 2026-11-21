## Bundle Size + Dependencies

***

## Per-Library Comparisons

Feature-by-feature tables against each competitor:

***

## Internal Breakdown

Module sizes, core engine performance, and adapter benchmarks:

***

## Methodology

* **gentleduck**: `useCalendar` with the `NativeAdapter`, and each module of `packages/duck-calendar/dist/`, bundled
  and minified by `Bun.build` with `react` external, then gzipped
* **React Aria and Ark UI**: measured by the primitives benchmark, the parts an inline single-month calendar draws.
  See [the primitives benchmarks](/duck-primitives/benchmarks) for the runtime comparison
* **react-day-picker**: measured by the primitives benchmark, its one `DayPicker` component with the date-fns it requires
* **react-datepicker and react-calendar**: bundlephobia's published sizes, not measured
* **Performance**: average of 2,000 iterations per operation
* Sizes are **minified + gzipped**

Regenerate, after the primitives benchmark:

```bash
cd packages/duck-primitives && bun run build && bun run benchmark
cd ../duck-calendar && bun run build && bun run benchmark
```