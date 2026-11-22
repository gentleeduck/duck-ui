---
'@gentleduck/primitives': major
---

Every primitive is reworked. Each passes the Radix tests it ports and the cases of Base UI, Ark UI, Headless UI, React Aria, cmdk, vaul, react-day-picker and input-otp that apply to it, renders less, and has a README saying where it differs from Radix and listing each fix with the test that proves it. Coverage is 100%.

**Added**

- Accordion: `onOpenChange` on an item, `hiddenUntilFound`, `Header` and `Indicator` parts, and `disabled`, `loop` and `onFocusChange` on the root.
- Dialog, Alert Dialog and Sheet: nested dialogs, `initialFocus` and `finalFocus`, and a ref as the portal's `container`. Popover takes the same focus targets, and `Title` and `Description` parts.
- Menus: `closeOnSelect` and `closeParentOnEsc`, a controlled context menu `open`, and a vertical, disabled or modal menubar.
- Select: `multiple`, `items` as data, an empty item value that clears, a function child on `Value`, and PageUp and PageDown.
- Slider: `largeStep`, `Slider.Value`, `preserveThumbOrder` and `index`. Radio group: `readOnly`, `form`, and `aria-disabled` on a disabled group. Input OTP: `autoSubmit`, `autoFocus` and `HiddenInput`.
- Tooltip: `closeDelay` and `disabled`. Hover card: `disabled`. Navigation menu: `activationMode`, `closeDelay` and `closeOnSelect` on a link.
- Command: `loop`, `keywords`, `filter`, `fuzzyFilter`, `limit`, `virtual`, a controlled highlight, `Command.Status` and `Command.Loading`. Pagination tracks its own page.
- Popper mirrors its physical sides right to left and takes `shiftCrossAxis`, `anchor` and `updateOnScroll`. `useDismissableLayer`, `useRovingFocusGroup` and `useRovingFocusItem` give a part the layer or the group without an element of their own.

**Breaking**

- Parts below a root write no `dir` they were not given; a `dir` on the root lands on the content. Element types drop their component prefix, as `IDialog.ContentElement` and `IMenu.ItemElement`.
- Triggers name their content in `aria-controls` only while it is open.
- Slot throws on a text child and joins `className` without tailwind-merge. `Mount` loses `renderOnce`, and Presence leaves at once where `getAnimations()` is missing.
- Roving focus drops `Collection` and its hooks. A radio group's `onValueChange` takes `string | null`, and a toggle group's role is `radiogroup` or `toolbar`.
- A single accordion is not collapsible by default, and progress `value` is optional, with `null` indeterminate.
- Input OTP takes a digit or a letter by default and its root needs an `aria-label`. A slider or select change made through `value` dispatches a change that does not bubble.
- Dialog Title and Description sit inside Content, and tooltip content renders its children once.
- Menubar's `h` and `l` no longer move between menus, and `Menubar.Content` drops `trapFocus`, `disableOutsidePointerEvents` and `disableOutsideScroll`. A submenu takes `forceMount` only from its own prop or portal.
- The navigation menu's viewport variables are `--gentleduck-navigation-menu-viewport-width` and `-height`.
- The command routes Enter through its root, its context drops its selected-item fields, and Ctrl+N, P, J and K move the highlight unless `vimBindings` is false.
