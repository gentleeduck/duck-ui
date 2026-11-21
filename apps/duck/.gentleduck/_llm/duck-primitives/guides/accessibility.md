}>
  Every primitive implements the correct **WAI-ARIA** pattern for its component type. This guide explains what you get for free and what you still need to provide.

## What primitives handle automatically

### Dialog / Alert Dialog

* `role="dialog"` (or `role="alertdialog"`)
* `aria-labelledby` connected to Title
* `aria-describedby` connected to Description
* `aria-modal="true"` for modal dialogs
* Focus trap: <Kbd>Tab</Kbd> cycles within the dialog
* <Kbd>Escape</Kbd> closes the dialog
* `aria-hidden` on content behind the dialog
* Focus restoration to trigger on close
* Scroll lock on body

### Popover / Tooltip / Hover Card

* `aria-expanded` on trigger
* `aria-controls` linking trigger to content
* `aria-haspopup` on trigger
* Focus management (auto-focus on open, restoration on close)

### Menu / Context Menu / Menubar

* `role="menu"`, `role="menuitem"`, `role="menuitemcheckbox"`, `role="menuitemradio"`
* `role="menubar"` with `aria-orientation` on a menubar
* `aria-checked` on checkbox and radio items
* Arrow key navigation between items
* Type-ahead character search
* Submenu opening on <Kbd>ArrowRight</Kbd>, <Kbd>ArrowLeft</Kbd> right to left
* `aria-disabled` on disabled items

### Progress

* `role="progressbar"`
* `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
* `aria-valuetext` with human-readable label

***

## What you need to provide

}>
  Primitives handle the hard parts, but these items are **your responsibility**. Missing them will break the accessible experience.

### Always include Title and Description

Dialog and Alert Dialog warn in development if no Title is found. Always include them:

```tsx
<Dialog.Content>
  <Dialog.Title>Required for screen readers</Dialog.Title>
  <Dialog.Description>Optional but recommended</Dialog.Description>
</Dialog.Content>
```

If you want a visually hidden title, use CSS:

```tsx
<Dialog.Title className="sr-only">Settings dialog</Dialog.Title>
```

### Provide meaningful labels

Triggers should have descriptive text content or an `aria-label`:

```tsx
// Good: text content
<Dialog.Trigger>Open settings</Dialog.Trigger>

// Good: aria-label for icon buttons
<Dialog.Trigger aria-label="Open settings">
  <GearIcon />
</Dialog.Trigger>
```

### Respect reduced motion

}>
  Wrap animations in `prefers-reduced-motion` queries so users who are sensitive to motion have a comfortable experience.

```css
@media (prefers-reduced-motion: reduce) {
  .overlay, .content {
    animation: none !important;
  }
}
```

***

## Keyboard navigation summary

| Component | Keys |
| --- | --- |
| Dialog | <Kbd>Escape</Kbd> close, <Kbd>Tab</Kbd> / <Kbd>Shift+Tab</Kbd> cycle focus |
| Popover | <Kbd>Escape</Kbd> close, <Kbd>Tab</Kbd> move focus |
| Tooltip | <Kbd>Escape</Kbd> close, focus-triggered |
| Menu | Arrow keys navigate, <Kbd>Enter</Kbd> / <Kbd>Space</Kbd> activate, <Kbd>Escape</Kbd> close |
| Menubar | <Kbd>ArrowLeft</Kbd> / <Kbd>ArrowRight</Kbd> switch menus (<Kbd>ArrowUp</Kbd> / <Kbd>ArrowDown</Kbd> in a vertical bar), <Kbd>ArrowUp</Kbd> / <Kbd>ArrowDown</Kbd> navigate items |
| Progress | None (display-only) |