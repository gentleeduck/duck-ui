<p align="center">
  <img src="../../public/logo-dark.svg" alt="@gentleduck/primitives" width="120"/>
</p>

<h1 align="center">@gentleduck/primitives</h1>

<p align="center">
  Unstyled, accessibility-first UI primitives for React.
</p>

<p align="center">
  <a href="../../LICENSE">MIT</a> -
  <a href="../../CHANGELOG.md">Changelog</a> -
  <a href="../../CONTRIBUTING.md">Contributing</a> -
  <a href="https://gentleduck.org/duck-primitives">Docs</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@gentleduck/primitives"><img src="https://img.shields.io/npm/v/@gentleduck/primitives.svg" alt="npm"/></a>
  <a href="https://www.npmjs.com/package/@gentleduck/primitives"><img src="https://img.shields.io/npm/dm/@gentleduck/primitives.svg" alt="downloads"/></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/npm/l/@gentleduck/primitives.svg" alt="MIT"/></a>
</p>

---

Unstyled, accessibility-first UI primitives for React.

## Why primitives

- **Smaller than Radix for most components** - 15 of the 18 both ship are smaller gzipped, by up to 64%: Input OTP 3.9 KB vs 10.8 KB, Accordion 4.9 KB vs 8.6 KB, Slider 6.6 KB vs 9.5 KB. Popover, Dialog and Alert Dialog are within 2.4% of Radix's and do more. Shared internals (Slot, Presence, Popper, focus scope) load once instead of being duplicated per package. Every module's README carries its measured table.
- **Full keyboard navigation + ARIA compliance out of the box** - every component ships with correct roles, states, and keyboard interactions so you don't have to wire them yourself.
- **Compound component pattern** - compose `Root`, `Trigger`, `Content`, and friends to build exactly the UI you need without prop drilling.
- **Compatible with Radix API** - same naming, same `asChild` pattern, same `data-state` attributes. Migration from Radix is a namespace change in your imports.

## Components

| Primitive | Description |
| --- | --- |
| `accordion` | Stacked items whose triggers open and close their content |
| `alert-dialog` | Modal dialog that requires user acknowledgment |
| `arrow` | Positioning arrow for floating elements |
| `avatar` | User avatar with image and fallback support |
| `calendar` | Date grid with keyboard navigation and multi-view support |
| `checkers` | Hooks for a native checkbox or switch: icons drawn from SVG, and a form kept in step with `checked` |
| `command` | Command palette with search filtering |
| `context-menu` | Right-click context menu with submenus |
| `dialog` | Modal and non-modal dialog windows |
| `direction` | RTL/LTR direction provider |
| `dismissable-layer` | Layer that dismisses on outside interaction |
| `dropdown-menu` | Dropdown menu with submenus, checkboxes, and radio items |
| `focus-scope` | Traps and manages focus within a boundary |
| `hooks` | Controllable state, ids, size, escape key, previous value and the other hooks the parts share |
| `hover-card` | Card triggered by hover with open/close delay |
| `input-otp` | One-time password input with slots and separators |
| `menu` | Base menu primitive used by dropdown, context, and menubar |
| `menubar` | Horizontal or vertical menu bar with keyboard navigation |
| `mount` | Keeps children mounted for a fixed time, or until an element's CSS transitions end, after closing |
| `navigation-menu` | Site navigation with animated indicator and viewport |
| `pagination` | Page navigation controls |
| `popover` | Floating content anchored to a trigger |
| `popper` | Low-level floating element positioning via Floating UI |
| `portal` | Renders children into a DOM portal |
| `presence` | Keeps content mounted until its CSS exit animations finish |
| `primitive-elements` | Base `Primitive` element factory (`asChild` support) |
| `libs` | Shared helpers: scoped context, collections, typeahead, composed handlers and refs |
| `progress` | Determinate and indeterminate progress indicator |
| `radio-group` | Radio button group with roving focus |
| `roving-focus` | Roving tabindex focus management for groups |
| `select` | Listbox-style select with typeahead and scroll buttons |
| `sheet` | Slide-out panel (re-exports dialog internals) |
| `slider` | Range slider with single or multiple thumbs |
| `slot` | Merges props and ref onto a child element (`asChild` engine) |
| `toggle` | Two-state toggle button |
| `toggle-group` | Single or multi-select group of toggles |
| `tooltip` | Accessible tooltip with provider-level delay |
| `visibility-hidden` | Visually hidden element for screen readers |

## Quick Start

```bash
npm install @gentleduck/primitives
```

```tsx
import * as Dialog from '@gentleduck/primitives/dialog'

function Demo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Title>Heading</Dialog.Title>
          <Dialog.Description>Body text here.</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

## Features

- **`asChild` / Slot**  -  render any primitive as your own element via the `asChild` prop, powered by the `Slot` utility.
- **`createContextScope`**  -  scoped React context factory that prevents cross-instance state leaks.
- **`forwardRef` everywhere**  -  every component forwards refs for imperative access and composition.
- **`data-slot` attributes**  -  every component root emits a `data-slot` for style targeting without class names.
- **Presence animations**  -  the `Presence` primitive lets you animate enter/exit transitions before unmounting.
- **Focus trapping**  -  `FocusScope` locks focus inside modals, dialogs, and popovers with configurable loop behavior.
- **Dismiss layers**  -  `DismissableLayer` handles outside clicks, Escape key, and nested layer stacking.

## Documentation

[gentleduck.org/duck-primitives](https://gentleduck.org/duck-primitives)

## License

[MIT](./LICENSE)
