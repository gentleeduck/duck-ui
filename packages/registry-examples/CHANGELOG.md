# @gentleduck/registry-examples

## 0.2.14

### Patch Changes

- Updated dependencies [1681854]
  - @gentleduck/calendar@0.4.1

## 0.2.13

### Patch Changes

- Updated dependencies [a157bae]
  - @gentleduck/primitives@0.3.1

## 0.2.12

### Patch Changes

- Updated dependencies [95638de]
  - @gentleduck/primitives@0.3.0
  - @gentleduck/calendar@0.4.0

## 0.2.11

### Patch Changes

- Updated dependencies [95dbbce]
  - @gentleduck/calendar@0.3.2
  - @gentleduck/primitives@0.2.14

## 0.2.10

### Patch Changes

- Updated dependencies [918b34c]
  - @gentleduck/calendar@0.3.1
  - @gentleduck/primitives@0.2.13

## 0.2.9

### Patch Changes

- Updated dependencies [b4706d3]
  - @gentleduck/primitives@0.2.12

## 0.2.8

### Patch Changes

- Updated dependencies [df57671]
  - @gentleduck/primitives@0.2.11

## 0.2.7

### Patch Changes

- Updated dependencies [7d6fb7b]
- Updated dependencies [7d6fb7b]
  - @gentleduck/calendar@0.3.0
  - @gentleduck/primitives@0.2.10

## 0.2.6

### Patch Changes

- Updated dependencies [32d0136]
- Updated dependencies [5136398]
  - @gentleduck/calendar@0.2.1
  - @gentleduck/primitives@0.2.9

## 0.2.5

### Patch Changes

- 76e824b: fix: presence animation interrupt, breadcrumb keys, theme hydration, nested buttons

  - Presence: cancel in-flight exit animation on re-mount to prevent stale animationend from unmounting re-opened content
  - Breadcrumb: move key from BreadcrumbItem to Fragment (React key warning)
  - ModeSwitcher: use stable aria-label until mounted to prevent hydration mismatch
  - PopoverTrigger: add asChild to calendar-7 and combobox-7 to prevent nested buttons

- Updated dependencies [76e824b]
  - @gentleduck/primitives@0.2.8

## 0.2.4

### Patch Changes

- Updated dependencies [58d1c61]
  - @gentleduck/calendar@0.2.0
  - @gentleduck/primitives@0.2.7

## 0.2.3

### Patch Changes

- Updated dependencies [6f0e067]
  - @gentleduck/primitives@0.2.6

## 0.2.2

### Patch Changes

- Updated dependencies [2b6e8d0]
  - @gentleduck/primitives@0.2.5

## 0.2.1

### Patch Changes

- ba8a6f3: fix: update resizable components to react-resizable-panels v4 API

  Replace deprecated ref with panelRef across resizable component and
  examples to align with react-resizable-panels v4.

## 0.2.0

### Minor Changes

- 36f9364: Add json-editor component with inline, sheet, and popover editing modes for JSON data with validation. Includes registry entries and three example demos.
