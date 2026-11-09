# Context Menu

A menu opened at the pointer by a right click or a long press.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/context-menu` |
| API docs | [`duck-primitives/api/context-menu.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/context-menu.mdx) |
| Styled component | [`registry-ui/src/context-menu`](../../../registry-ui/src/context-menu) |
| Styled docs | [`duck-ui/components/context-menu.mdx`](../../../../apps/duck/content/docs/duck-ui/components/context-menu.mdx) |

The menu it shares with Dropdown Menu and Menubar has its own README in [`../menu`](../menu).

## Benchmarks

<!-- benchmarks -->
Smaller than all 3. Faster in all 15 timed comparisons.

| | gentleduck | Radix | Base UI | Ark UI |
|---|--:|--:|--:|--:|
| Size, gzipped bytes | 30,523 | 32,057 (0.95x) | 51,777 (0.59x) | 35,423 (0.86x) |
| Mount x100, ms | 2.77 | 3.34 (0.83x) | 8.60 (0.32x) | 4.85 (0.57x) |
| Unmount x100, ms | 0.497 | 0.662 (0.75x) | 0.886 (0.56x) | 0.866 (0.57x) |
| Unmount open x100, ms | 3.44 | 10.1 (0.34x) | 9.27 (0.37x) | 775 (0.00x) |
| Open, ms | 1.72 | 2.64 (0.65x) | 2.91 (0.59x) | 1.74 (0.99x) |
| Close, ms | 0.859 | 1.24 (0.69x) | 1.74 (0.49x) | 1.30 (0.66x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 2.3.7, Base UI 1.0.0-rc.0 and Ark UI 5.40.0.

Ark UI's context menu is its Menu opened from a `ContextTrigger`.
<!-- /benchmarks -->

## Tests

The stories cover submenus in either direction, opened by the pointer, the keyboard and a long touch; checkbox
items, one with `closeOnSelect={false}`, radio items and a disabled item; a modal and a non-modal menu with presses
outside and a trigger that can be disabled; a menu inside a dialog; and an overlay a browser extension draws over
the page. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 114 | `context-menu.radix.test.tsx` 56, `context-menu.test.tsx` 58 |
| End to end | 25 | `context-menu.e2e.ts` 6, `context-menu.radix.e2e.ts` 19 |
| registry-ui | 12 | `context-menu-force-mount.test.tsx` 1, `context-menu.test.tsx` 11 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>139 behaviours, one per test</summary>

**Unit, `context-menu.test.tsx`**

- ContextMenu
  - renders trigger with data-slot="context-menu-trigger"
  - trigger renders as a span
  - trigger starts with data-state="closed"
  - opens on right-click (contextmenu event)
  - disabled trigger does not open on right-click
  - disabled trigger has data-disabled
  - forwards ref to trigger
  - trigger changes data-state to open when right-clicked
  - passes className to trigger
  - puts a dir passed to the root on the menu and leaves the trigger to the page
  - trigger renders children as text
- ContextMenu trigger props
  - lets the props on a trigger win over its own attributes
  - turns off the touch callout, beside the style it was given
  - runs the trigger's own handlers, {"disabled":false}
  - runs the trigger's own handlers, {"disabled":true}
- ContextMenu scope
  - hands its parts the scope it is given
- ContextMenu right-click while open
  - closes the menu rather than reopening it
  - closes the menu on a control-click, which also fires contextmenu
  - closes a modal menu too, whose press lands on the page because the page takes no pointer events
  - opens from the keyboard after a right click elsewhere closed it
  - reopens the menu on a right-click after a left click closed it
- ContextMenu right-click mark
  - opens on the next right click after one closed it, when the trigger stops the contextmenu going further
  - moves to a right click on its trigger that onPointerDownOutside kept from closing it
  - moves to a right click on its trigger that onInteractOutside kept from closing it
  - opens on a right click after a control press elsewhere closed it without a contextmenu, as on Windows
  - clears the mark when a right click elsewhere lands on the root element, as it does under a modal menu
  - leaves no listener behind once the contextmenu after a right click lands
  - hands a press outside to the content's own onPointerDownOutside
- ContextMenu long press
  - opens when the finger drifts 10px while it holds
  - cancels once the finger moves further than 10px
  - keeps a held finger when a mouse moves away or lifts over the trigger
  - closes the open menu when a finger presses the trigger again, and opens it once that finger holds
  - cancels when the finger lifts or the browser takes the gesture
  - waits the whole 700ms before it opens
  - counts from the last press when a finger presses again
  - drops a held press once the browser opens the menu, so closing it then sticks
  - drops a held press when its trigger leaves the page
  - drops a held press when its trigger is disabled
- ContextMenu open before interaction
  - warns once, even when strict mode runs its effects twice
- ContextMenu direction
  - opens to the right of the pointer in LTR
  - opens to the left of the pointer and sets dir in RTL
- ContextMenu parts
  - renders its arrow, separator and the indicator of a checked item
- ContextMenu focus on close
  - returns focus to where it was when a modal menu closes on Escape
  - returns focus to where it was when a modal menu closes on a click outside
  - returns focus to where it was on Escape after a click outside that was kept from closing it
  - leaves focus where the user clicked when a non-modal menu closes on a click outside
- ContextMenu content placement
  - opens 2px to the right of the pointer, its top at the pointer
  - keeps that placement when a caller without the types passes its own
  - opens a menu kept mounted while closed where the right click lands
- ContextMenu close focus
  - runs the content's own onCloseAutoFocus
  - kept mounted, gives focus back on unmount when its last opening closed on Escape
- ContextMenu sub menu
  - closes only itself on Escape and focuses its trigger when it keeps its parent open
- ContextMenu sub menu state
  - marks its sub trigger with data-slot="context-menu-subtrigger"
  - opens a sub menu by open
  - opens a sub menu by defaultOpen when it mounts into a menu already open
  - reports a sub menu opening to onOpenChange
- ContextMenu content style
  - names the popper's measurements under the context menu's own variables, beside the style it was given
  - keeps its own measurement variables over ones the style names

**Unit, `context-menu.radix.test.tsx`**

- rendering and opening
  - keeps the content closed by default
  - opens the content on right click
  - re-anchors the content when re-triggered in a new location while open
  - closes the content when pressing escape
  - has no accessibility violations when open
- disabled trigger
  - does not open the menu on right click
- items
  - calls `onSelect` and closes the menu when an item is selected
  - does not select a disabled item
  - keeps the menu open when `onSelect` prevents default
- groups and labels
  - renders grouped items with a label
- checkbox items
  - toggles a checkbox item and reflects the checked state
  - marks a disabled checkbox item as disabled
- radio items
  - selects a radio item and calls `onValueChange`
- submenus
  - opens a submenu via keyboard
  - associates the sub trigger with its content via `aria-controls` only while open
  - does not open a disabled submenu
- modality
  - disables pointer events on the body while a modal menu is open
  - does not disable pointer events on the body for a non-modal menu
- controlled `open` state
  - opens on right click and reflects the open state via `onOpenChange`
  - respects a controlled `open={false}` value and does not open on right click
  - can be closed programmatically while controlled
  - calls `onOpenChange` with `false` when dismissed via Escape
- controlled `open` state &gt; dev warning when opened before interaction
  - warns when `open` is `true` before the user has interacted with the trigger
  - does not warn for an uncontrolled menu
  - does not warn when the menu is opened through user interaction
- prop spreading &gt; ContextMenu.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - forwards props to the child element when `asChild` is set on a non-modal menu
- prop spreading &gt; ContextMenu.Group
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.Label
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.Item
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.CheckboxItem
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.RadioGroup
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.RadioItem
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.ItemIndicator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.Separator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.Arrow
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.SubTrigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- prop spreading &gt; ContextMenu.SubContent
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- touch long press with nested triggers
  - opens only the innermost menu on a touch long press
  - opens only the innermost menu when the platform fires contextmenu during the long press
  - opens the menu on a touch long press
  - opens the outer menu when the inner trigger is disabled

**End to end, `context-menu.e2e.ts`**

- ContextMenu items
  - toggles a checkbox item and closes, or stays open for one with closeOnSelect off
  - checks the one radio item chosen and unchecks the rest
  - passes over a disabled item on the keyboard and ignores a click on it
- ContextMenu modal and disabled
  - keeps a press outside from the page while modal, and closes either way
  - closes on a right click at the trigger while open, modal or not
  - opens nothing from a disabled trigger

**End to end, `context-menu.radix.e2e.ts`**

- ContextMenu &gt; given submenu user &gt; when using pointer
  - should close open submenus and the root menu when right clicking trigger
  - should open the root menu with a long touch interaction
  - should close open submenus and reopen the root menu when long touching trigger
  - should open submenu and not focus first item when moving pointer over trigger
  - should not close when moving pointer to submenu and back to parent trigger
  - should close open submenu when moving pointer to any item in parent menu
  - should close unassociated submenus when moving pointer back to the root trigger
  - should close all menus when clicking item in any menu, or clicking outside
- ContextMenu &gt; given submenu user &gt; when using pointer &gt; at a narrow viewport
  - should close submenu when moving pointer away but remain open when moving towards
- ContextMenu &gt; given submenu user &gt; When using keyboard
  - should not open submenu when moving focus to trigger
  - should open submenu and focus first item when pressing right arrow, enter or space key
  - should close only the focused submenu when pressing left arrow key
  - should focus first item when pressing right arrow key after opening submenu with mouse
  - should close all menus when pressing escape, enter or space key on any item
  - should scope typeahead behaviour to the active menu
- ContextMenu &gt; given submenu user &gt; When using pointer in RTL
  - should close submenu when pointer moves away but remain open when moving towards
- ContextMenu &gt; given submenu user &gt; When using keyboard in RTL
  - should open submenu and focus first item when pressing left arrow key but close when pressing right arrow key
- ContextMenu extension overlay interactions
  - should close when an external overlay stops later mouse events
- ContextMenu nested in Dialog
  - dismisses only the context menu when clicking inside dialog outside menu

</details>
<!-- /behaviour -->

## Beyond Radix

- A controlled `open`. Setting it to `true` before any right click warns once in development, since the
  menu has no pointer position to open at.
- A long press survives the finger drifting up to 10px, as in Base UI, where any move cancelled it.
- `closeOnSelect` and `closeParentOnEsc`, from the shared menu.
- A right click or control-click on the trigger while the menu is open closes it, modal or not, where Radix
  opens it again at the pointer.

## Fixed

- Passes every Radix context-menu test, and the shared menu fixes in `../menu`.
- The guard against a right click reopening the open menu follows that gesture rather than a one-frame
  window, so a right click straight after a left click closed the menu opens it again.
- With triggers nested inside each other, a long press opens only the innermost.
- A long press while the menu is open closes it and any submenu, then opens it again where you pressed.
- A right click on a menu that is still mounted moves it to where the click landed: one kept by `forceMount`, or one
  open whose press the page stopped inside the trigger. The menu stayed where it was first placed. One that
  `onInteractOutside` kept open moves too.
- A right click on the trigger opens the menu after a Control press elsewhere closed it, which on Windows sends no
  `contextmenu` and left the trigger thinking the next right click was the one that closed it.
- A non-modal menu kept mounted with `forceMount` forgets a press outside when it opens again, where one on the
  page while it was closed, or the one that closed it, kept focus from going back to where it was once the menu
  unmounted.

## Smaller and faster

- The root no longer resolves its direction, which the menu does.
- The trigger drops a branch per pointer handler for a disabled trigger, which starts no long press to cancel.
- Layers hold no state and share one listener per event type, so unmounting 100 open menus takes 0.43 of
  Radix's time.

## Breaking changes

- `ContextMenu.Trigger` carries no `dir` attribute; a `dir` passed to the root lands on the menu. The
  context has no `dir` field.

## registry-ui

- `MotionContextMenu` hands a controlled `open` to its animation, so the content animates when the parent
  sets it.
- `MotionContextMenuContent` grows from the corner at the cursor whichever way the menu flips, where it
  always grew from its top-left corner.
- Submenus scroll when taller than the space they have.

## Later

- Opening the menu from code at a point the caller gives (Base UI's positioner `anchor`, Ark's
  `positioning.getAnchorRect`), which would replace the warning a code-set `open` gives.
- A submenu with `defaultOpen` that mounts with its menu closes at once, as in Radix: the menu takes focus as it
  opens, which the submenu reads as focus leaving it. One mounted into a menu already open stays open.
