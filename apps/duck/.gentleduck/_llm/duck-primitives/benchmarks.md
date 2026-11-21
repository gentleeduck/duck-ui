Every number on this page is measured, none is looked up. Each module has one bench file,
`packages/duck-primitives/src/<module>/__benches__/<module>.bench.tsx`, which names what every library ships for it
and the tree each one draws. The drivers in `src/__benches__` size and time those, then write each module's own
README, which carries that module's tables and where gentleduck is behind. An API page that asks for the table, as
the accordion's does, gets the same one.

```bash
cd packages/duck-primitives
bun run build
bun run benchmark          # gzipped sizes, then every table
bun run benchmark:runtime  # timings in headless Chromium, then every table
bun run benchmark:render   # redraw the README and docs tables from the last results
```

`bun run benchmark:check` fails when a module has grown past its pinned size. `bun run benchmark:runtime select
tooltip` times those modules alone and keeps the last numbers of the rest.

***

## Library Overview

| | gentleduck | Radix UI | Base UI | React Aria | Ark UI | Headless UI |
|---|---|---|---|---|---|---|
| **Maintainer** | gentleduck | WorkOS | MUI | Adobe | Chakra | Tailwind Labs |
| **Package model** | Single package | One package per component | Single package | Single package | Single package | Single package |
| **State** | React state and context | React state and context | React state and context | React Stately hooks | zag.js state machines | React state |
| **Composition** | `asChild` | `asChild` | `render` prop | Render props and slots | `asChild` | `as` prop |
| **Calendar** | Yes, 4 calendar systems | No | No | Yes, 13 calendar systems | Inside DatePicker, 13 systems | No |
| **Command palette** | Yes | No | Inline Autocomplete | Autocomplete | No | No |

### Totals

One bundle per library over every component it is compared on, beside gentleduck over the same components, so
code the components share counts once.

{/* benchmarks:totals */}

| Library | Compared on | Its bundle | gentleduck over the same |
|---|--:|--:|--:|
| Radix | 18 components | 69 KB | 64 KB |
| Base UI | 19 components | 105 KB | 67 KB |
| React Aria | 16 components | 107 KB | 67 KB |
| Ark UI | 21 components | 124 KB | 72 KB |
| Headless UI | 6 components | 48 KB | 44 KB |

gentleduck's whole library, all 36 modules, is 79 KB. Over the components each library is compared on, gentleduck's bundle is the smaller in all 5.

{/* /benchmarks:totals */}

***

## Component Coverage

| Component | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Accordion | Yes | Yes | Yes | DisclosureGroup | Yes | - |
| Alert Dialog | Yes | Yes | Yes | Via Dialog | Via Dialog | Via Dialog |
| Avatar | Yes | Yes | Yes | - | Yes | - |
| Calendar | Yes | - | - | Yes | Via DatePicker | - |
| Checkbox | Indicator hook | Yes | Yes | Yes | Yes | Yes |
| Collapsible | - | Yes | Yes | Disclosure | Yes | Disclosure |
| Color Picker | - | - | - | Yes | Yes | - |
| Combobox | - | - | Yes | Yes | Yes | Yes |
| Command | Yes | - | Inline Autocomplete | Autocomplete | - | - |
| Context Menu | Yes | Yes | Yes | - | Via Menu | - |
| Dialog | Yes | Yes | Yes | Yes | Yes | Yes |
| Dropdown Menu | Yes | Yes | Yes | Yes | Yes | Yes |
| Hover Card | Yes | Yes | Yes | PreviewTrigger | Yes | - |
| Input OTP | Yes | Preview | - | - | Pin Input | - |
| Menu | Yes | - | Yes | Yes | Yes | Yes |
| Menubar | Yes | Yes | Yes | - | - | - |
| Navigation Menu | Yes | Yes | Yes | - | Yes | - |
| Pagination | Yes | - | - | - | Yes | - |
| Popover | Yes | Yes | Yes | Yes | Yes | Yes |
| Progress | Yes | Yes | Yes | ProgressBar | Yes | - |
| Radio Group | Yes | Yes | Yes | Yes | Yes | Yes |
| Select | Yes | Yes | Yes | Yes | Yes | Listbox |
| Sheet | Yes | - | - | Yes | Drawer | - |
| Slider | Yes | Yes | Yes | Yes | Yes | - |
| Switch | Indicator hook | Yes | Yes | Yes | Yes | Yes |
| Tabs | - | Yes | Yes | Yes | Yes | Yes |
| Toast | - | Yes | Yes | Yes | Yes | - |
| Toggle | Yes | Yes | Yes | ToggleButton | Yes | - |
| Toggle Group | Yes | Yes | Yes | ToggleButtonGroup | Yes | - |
| Tooltip | Yes | Yes | Yes | Yes | Yes | - |

gentleduck's Checkbox and Switch are the `checkers` hook, which draws the indicator over a native input; the
registry's `checkbox` and `switch` are built on it. Radix's one-time code field is a preview package,
`@radix-ui/react-one-time-password-field`.

***

## Bundle Size

Each module against what every other library ships for it, in gzipped KB. Bold is the smallest in the row.

{/* benchmarks:size */}

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI | Other |
|---|--:|--:|--:|--:|--:|--:|---|
| Accordion | **4.8** | 8.6 | 9.0 | 14.4 | 11.7 | - | - |
| Alert Dialog | 14.0 | **13.8** | 24.5 | 28.2 | 21.2 | 16.5 | - |
| Avatar | **2.5** | 3.0 | 2.6 | - | 7.0 | - | - |
| Calendar | **9.9** | - | - | 36.9 | 43.3 | - | react-day-picker 20.0 |
| Checkers | 1.0 | - | - | - | - | - | - |
| Command | **7.5** | - | 47.6 | 43.3 | - | - | cmdk 18.4 |
| Context Menu | **30.3** | 31.3 | 50.6 | - | 34.6 | - | - |
| Dialog | 13.5 | **13.4** | 24.6 | 28.2 | 21.2 | 20.3 | - |
| Dropdown Menu | **30.0** | 31.0 | 49.8 | 50.8 | 34.6 | 32.2 | - |
| Hover Card | **17.3** | 17.4 | 26.4 | 31.5 | 24.4 | - | - |
| Input OTP | **3.9** | 10.8 | - | - | 11.1 | - | input-otp 4.0 |
| Menu | **28.9** | - | 49.8 | - | 34.4 | - | - |
| Menubar | **30.7** | 31.6 | 51.4 | - | - | - | - |
| Mount | 0.5 | - | - | - | - | - | - |
| Navigation Menu | **9.8** | 12.5 | 38.5 | - | 19.1 | - | - |
| Pagination | **3.4** | - | - | - | 8.1 | - | - |
| Popover | 24.0 | **23.8** | 40.8 | 31.5 | 31.7 | 30.2 | - |
| Progress | **2.4** | 2.8 | 2.9 | 4.5 | 8.1 | - | - |
| Radio Group | **7.3** | 10.1 | 11.6 | 17.5 | 11.1 | 11.7 | - |
| Select | **30.3** | 30.9 | 45.1 | 57.7 | 34.5 | 34.2 | - |
| Sheet | **13.5** | - | - | 32.0 | 31.3 | - | vaul 19.5 |
| Slider | **6.6** | 9.5 | 12.2 | 14.0 | 14.6 | - | - |
| Toggle | **1.8** | 2.9 | 4.3 | 11.9 | 6.0 | - | - |
| Toggle Group | **4.9** | 8.2 | 8.4 | 15.3 | 8.9 | - | - |
| Tooltip | **18.8** | 18.9 | 32.3 | 19.4 | 22.6 | - | - |

gentleduck is the smallest in 20 of the 23 modules another library ships. The share of each library's size it saves, from its closest component to its furthest: Radix -2% to 64%, Base UI 6% to 84%, React Aria 3% to 85%, Ark UI 12% to 77%, Headless UI 7% to 37%, cmdk 59%, input-otp 3%, vaul 31% and react-day-picker 50%.

Versions: Radix 0.2.1 to 2.3.7, Base UI 1.0.0-rc.0, React Aria 1.22.1, Ark UI 5.40.0, Headless UI 2.2.10, cmdk 1.1.1, input-otp 1.5.0, vaul 1.1.2 and react-day-picker 10.0.1.

{/* /benchmarks:size */}

### All components

Every primitive from gentleduck, Radix and Base UI side by side. 0 KB means the library doesn't ship that component.

### Module sizes and totals

***

## Runtime

Every library renders the same controlled tree from the module's bench file, and each value is the median in
milliseconds. Bold is the fastest in the row.

A value is the main thread's work, read from a Chromium trace, from the step until two frames after its result
shows, less the harness's own work for each of those frames. Work a library leaves to an effect, a later task or the
next frame counts, and so do the style, layout and paint of the frame that shows the result. Idle time between them
does not.

* **x100** is a hundred copies rendered at once. A non-overlay mounts, then updates to its second state, then
  unmounts. Command has every input typed into instead, timed until every copy shows only the match.
* An overlay's hundred copies mount and unmount closed. **Unmount open** tears down a hundred once every one shows.
  Headless UI's Menu, Popover and Listbox have no controlled open state, so they are timed closed only.
* **Open** and **Close** time a single overlay, 20 times a round.

{/* benchmarks:runtime */}

Measured in chromium 153.0.8010.12 with React 19.2.6 on Apple M4, over 12 rounds.

### Mount x100

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI | Other |
|---|--:|--:|--:|--:|--:|--:|---|
| Accordion | **10.2** | 21.6 | 25.3 | 34.7 | 17.9 | - | - |
| Alert Dialog | **2.24** | 2.70 | 6.22 | 5.95 | 5.42 | 3.67 | - |
| Avatar | 1.05 | **0.884** | 0.928 | - | 2.64 | - | - |
| Calendar | **55.4** | - | - | 249 | 94.2 | - | react-day-picker 97.8 |
| Command | **22.4** | - | 41.1 | 160 | - | - | cmdk 23.1 |
| Context Menu | **2.82** | 3.21 | 8.38 | - | 4.90 | - | - |
| Dialog | **1.89** | 2.04 | 5.71 | 5.40 | 4.95 | 3.40 | - |
| Dropdown Menu | **3.42** | 4.28 | 9.09 | 6.79 | 4.88 | 14.9 | - |
| Hover Card | **2.51** | 2.79 | 6.32 | 6.46 | 4.62 | - | - |
| Input OTP | **6.18** | 28.7 | - | - | 15.7 | - | input-otp 17.1 |
| Menubar | **9.91** | 19.8 | 51.8 | - | - | - | - |
| Navigation Menu | **24.1** | 51.2 | 185 | - | 44.8 | - | - |
| Pagination | 12.0 | - | - | - | **10.5** | - | - |
| Popover | **2.50** | 2.82 | 6.85 | 5.51 | 6.61 | 17.5 | - |
| Progress | 1.13 | **1.00** | 1.51 | 1.87 | 3.63 | - | - |
| Radio Group | **5.96** | 37.9 | 20.5 | 47.5 | 28.7 | 15.1 | - |
| Select | **9.70** | 58.5 | 13.9 | 33.9 | 15.3 | 17.8 | - |
| Sheet | **1.91** | - | - | 6.45 | 5.58 | - | vaul 2.94 |
| Slider | **7.07** | 10.4 | 11.3 | 12.3 | 13.1 | - | - |
| Toggle | **1.20** | 1.31 | 1.47 | 4.40 | 2.04 | - | - |
| Toggle Group | **5.51** | 12.6 | 9.98 | 19.5 | 8.10 | - | - |
| Tooltip | **3.04** | 3.72 | 6.42 | 5.61 | 4.19 | - | - |

### Update x100

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI | Other |
|---|--:|--:|--:|--:|--:|--:|---|
| Accordion | **10.4** | 18.1 | 16.3 | 34.3 | 41.5 | - | - |
| Avatar | 0.778 | **0.724** | 0.782 | - | 1.71 | - | - |
| Calendar | 37.9 | - | - | 113 | 74.3 | - | react-day-picker **28.4** |
| Command, typed | **9.15** | - | 31.8 | 31.3 | - | - | cmdk 14.5 |
| Input OTP | **4.38** | 13.7 | - | - | 13.1 | - | input-otp 18.9 |
| Navigation Menu | **16.1** | 36.4 | 99.7 | - | 71.5 | - | - |
| Pagination | **8.02** | - | - | - | 9.12 | - | - |
| Progress | 0.546 | **0.506** | 1.21 | 1.49 | 3.10 | - | - |
| Radio Group | **5.76** | 13.6 | 12.5 | 20.2 | 20.4 | 7.11 | - |
| Slider | **3.19** | 3.30 | 4.69 | 6.90 | 6.97 | - | - |
| Toggle | **0.492** | 0.584 | 0.770 | 3.67 | 1.35 | - | - |
| Toggle Group | **2.59** | 8.63 | 3.82 | 15.9 | 6.07 | - | - |

### Unmount x100

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI | Other |
|---|--:|--:|--:|--:|--:|--:|---|
| Accordion | **1.80** | 3.04 | 2.92 | 4.78 | 2.58 | - | - |
| Alert Dialog | **0.412** | 0.443 | 0.910 | 0.877 | 0.841 | 0.451 | - |
| Avatar | 0.375 | **0.314** | 0.387 | - | 0.685 | - | - |
| Calendar | **3.45** | - | - | 17.1 | 6.49 | - | react-day-picker 4.47 |
| Command | **1.98** | - | 3.43 | 5.99 | - | - | cmdk 2.12 |
| Context Menu | **0.510** | 0.608 | 0.980 | - | 0.905 | - | - |
| Dialog | **0.377** | 0.410 | 1.08 | 0.919 | 0.917 | 0.476 | - |
| Dropdown Menu | **0.541** | 0.719 | 1.39 | 1.08 | 0.882 | 2.30 | - |
| Hover Card | **0.502** | 0.590 | 0.818 | 1.08 | 0.764 | - | - |
| Input OTP | **0.802** | 2.22 | - | - | 1.41 | - | input-otp 0.921 |
| Menubar | **1.23** | 2.16 | 5.08 | - | - | - | - |
| Navigation Menu | **2.87** | 6.39 | 8.32 | - | 3.79 | - | - |
| Pagination | 1.98 | - | - | - | **1.45** | - | - |
| Popover | **0.459** | 0.587 | 1.09 | 0.909 | 0.736 | 2.58 | - |
| Progress | **0.281** | 0.285 | 0.387 | 0.591 | 0.583 | - | - |
| Radio Group | **1.39** | 2.91 | 2.71 | 4.84 | 1.72 | 1.47 | - |
| Select | **0.879** | 3.83 | 1.22 | 3.24 | 1.57 | 2.76 | - |
| Sheet | **0.366** | - | - | 0.914 | 0.980 | - | vaul 0.737 |
| Slider | **1.00** | 1.04 | 1.23 | 1.35 | 1.06 | - | - |
| Toggle | **0.333** | 0.367 | 0.392 | 0.660 | 0.513 | - | - |
| Toggle Group | 1.09 | 1.76 | 1.34 | 1.91 | **1.05** | - | - |
| Tooltip | **0.649** | 0.774 | 1.27 | 0.849 | 0.760 | - | - |

### Unmount open x100

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI | Other |
|---|--:|--:|--:|--:|--:|--:|---|
| Alert Dialog | **3.25** | 5.83 | 3.91 | 4.08 | 1177 | 19.0 | - |
| Context Menu | **3.63** | 10.2 | 9.47 | - | 785 | - | - |
| Dialog | **3.24** | 5.17 | 4.08 | 4.03 | 1187 | 19.0 | - |
| Dropdown Menu | **3.82** | 10.6 | 12.2 | 16.1 | 811 | - | - |
| Hover Card | **1.49** | 3.45 | 1.86 | 2.81 | 756 | - | - |
| Menubar | **3.99** | 12.5 | 14.0 | - | - | - | - |
| Popover | **1.95** | 3.99 | 6.65 | 4.94 | 780 | - | - |
| Select | **6.78** | 10.8 | 10.7 | 15.9 | 829 | - | - |
| Sheet | **3.16** | - | - | 5.62 | 1277 | - | vaul 5.32 |
| Tooltip | 1.48 | 4.51 | 3.17 | **1.29** | 1.66 | - | - |

### Open

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI | Other |
|---|--:|--:|--:|--:|--:|--:|---|
| Alert Dialog | **1.50** | 1.66 | 2.17 | 2.11 | 2.20 | 1.80 | - |
| Context Menu | 1.68 | 2.52 | 2.73 | - | **1.59** | - | - |
| Dialog | **1.09** | 1.19 | 1.80 | 1.53 | 1.57 | 1.46 | - |
| Dropdown Menu | **1.71** | 2.73 | 3.49 | 3.58 | 2.48 | - | - |
| Hover Card | **1.12** | 1.31 | 1.68 | 1.50 | 1.89 | - | - |
| Menubar | **1.57** | 2.43 | 3.73 | - | - | - | - |
| Popover | **1.35** | 1.56 | 2.95 | 1.97 | 2.35 | - | - |
| Select | **2.21** | 2.91 | 2.73 | 3.35 | 2.55 | - | - |
| Sheet | **1.10** | - | - | 1.83 | 1.98 | - | vaul 1.91 |
| Tooltip | **1.05** | 1.40 | 2.02 | 1.11 | 1.87 | - | - |

### Close

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI | Other |
|---|--:|--:|--:|--:|--:|--:|---|
| Alert Dialog | **1.05** | 1.08 | 1.74 | 1.24 | 1.71 | 1.15 | - |
| Context Menu | **0.850** | 1.20 | 1.64 | - | 1.15 | - | - |
| Dialog | **0.796** | 0.848 | 1.33 | 0.930 | 1.23 | 1.00 | - |
| Dropdown Menu | **0.962** | 1.36 | 2.09 | 1.75 | 1.34 | - | - |
| Hover Card | **0.524** | 0.588 | 0.717 | 0.714 | 0.847 | - | - |
| Menubar | **1.00** | 1.38 | 2.44 | - | - | - | - |
| Popover | **0.778** | 0.780 | 1.57 | 0.943 | 1.07 | - | - |
| Select | **1.22** | 1.67 | 1.95 | 2.01 | 1.48 | - | - |
| Sheet | **0.805** | - | - | 1.00 | 1.44 | - | vaul 19.0 |
| Tooltip | **0.501** | 0.567 | 0.966 | 0.588 | 0.788 | - | - |

gentleduck is the fastest in 75 of these 86 rows.

{/* /benchmarks:runtime */}

***

## Where gentleduck is behind

{/* benchmarks:behind */}

gentleduck loses 15 comparisons, in 14 cases. Each row is one case, worst first, with every library that beats it and gentleduck's figure as a multiple of that library's.

| Module | Case | Behind |
|---|---|---|
| Pagination | Unmount x100 | Ark UI 1.36x, +0.528 ms |
| Calendar | Update x100 | react-day-picker 1.34x, +9.55 ms |
| Avatar | Mount x100 | Radix 1.19x, +0.170 ms; Base UI 1.14x, +0.126 ms |
| Avatar | Unmount x100 | Radix 1.19x, +0.061 ms |
| Tooltip | Unmount open x100 | React Aria 1.15x, +0.196 ms |
| Pagination | Mount x100 | Ark UI 1.14x, +1.46 ms |
| Progress | Mount x100 | Radix 1.13x, +0.127 ms |
| Progress | Update x100 | Radix 1.08x, +0.040 ms |
| Avatar | Update x100 | Radix 1.07x, +0.054 ms |
| Context Menu | Open | Ark UI 1.05x, +0.085 ms |
| Toggle Group | Unmount x100 | Ark UI 1.04x, +0.042 ms |
| Alert Dialog | Size | Radix 1.02x, +216 bytes |
| Dialog | Size | Radix 1.01x, +140 bytes |
| Popover | Size | Radix 1.01x, +191 bytes |

{/* /benchmarks:behind */}

***

## Calendar

Radix and Base UI have no calendar, so the calendar is measured against the two headless libraries that do and
against react-day-picker.

| | gentleduck | React Aria | Ark UI | react-day-picker |
|---|---|---|---|---|
| **What was measured** | The calendar module and `NativeAdapter` | The calendar parts of `react-aria-components` | The DatePicker parts an inline calendar draws | `DayPicker` with the date-fns it requires |
| **Calendar systems** | 4: Gregorian, Islamic, Persian, Hebrew | 13, through `@internationalized/date` | 13, through `@internationalized/date` | Gregorian, or another through a `dateLib` you supply |
| **Date values** | Your own: native `Date`, date-fns, dayjs or Luxon through an adapter | `CalendarDate` from `@internationalized/date` | `DateValue` from `@internationalized/date` | Native `Date` |
| **Typed date field** | No | `DateField` | `DateInput` | No |

Its size and timings are the Calendar rows in the tables above.

***

## Where each library wins

The measured cases a library wins are in **Where gentleduck is behind**, above. These are what a benchmark does
not show.

### gentleduck

* **Size**: the smallest bundle on most components it shares with another library on this page; the tables above bold
  the few where it is not.
* **Calendar**: works on the date type an app already uses, through an adapter, in four calendar systems.
* **One package** with Calendar, Command, Input OTP, Pagination and Sheet.

### Radix

* **Maturity**: years in production at thousands of companies.
* **Ecosystem**: shadcn/ui and many design systems are built on it.
* **Coverage**: Collapsible, Tabs, Toast, Scroll Area, Separator and Toolbar primitives, and a whole Checkbox and
  Switch where gentleduck has an indicator hook.

### Base UI

* **Forms**: Field, Fieldset, Form, Number Field and Combobox.

### React Aria

* **Calendar systems**: 13 against gentleduck's 4.
* **Date entry**: a typed, locale-aware `DateField` and `DatePicker`.

### Ark UI

* **Breadth**: 50+ components, including Color Picker, Date Input, File Upload, Tree View and Tour.
* **Calendar systems**: 13, from the same `@internationalized/date` React Aria uses.
* **Frameworks**: the same zag.js machines drive its React, Vue, Solid and Svelte packages.

### Headless UI

* **Tailwind integration**: an API designed around Tailwind CSS.

***

## Methodology

* **Sizes**: an entry re-exporting what the bench file names, bundled and minified by esbuild with `react`,
  `react-dom` and `react/jsx-runtime` external, then gzipped. gentleduck is its built module from
  `packages/duck-primitives/dist/`. Radix, Base UI, Ark UI, cmdk, input-otp and vaul are their whole package or
  subpath; React Aria, Headless UI and react-day-picker ship one entry for everything, so they are the named parts
  the component draws. The versions are listed under the size table. The build writes the same `dist/` for the
  same source, so a size moves only when code does.
* **Totals**: one bundle of every part a total covers, so code shared between components counts once.
  gentleduck's own total is its whole library; each other library's total is the components it is compared on,
  beside gentleduck over the same ones.
* **Calendar**: gentleduck's whole calendar module with its `NativeAdapter`. React Aria and Ark ship their calendar
  inside a larger module, so only the parts an inline single-month calendar draws are taken; Ark's calendar is its
  DatePicker drawn inline.
* **Runtime**: production React in headless Chromium, served cross-origin isolated for a 5 microsecond clock, with a
  garbage collection forced before each timed phase. The libraries are interleaved and their order alternates per
  round; the first rounds are a warmup and are dropped. After a mount and after an update the page settles, until
  two frames pass with nothing changed, so the next timed step does not pay for effects and tasks the last one left.
  Whatever a run leaves in the document is removed before the next, so no case measures on a page another case
  grew. React Aria's calendar leaves 102 elements a run, and the bench prints each run that leaves any.

Output goes to `packages/duck-primitives/public/benchmarks/` and
`apps/duck/public/data/benchmarks/primitives.json`.