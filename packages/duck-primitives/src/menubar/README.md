# Menubar

A bar of menus moved between with the arrow keys.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/menubar` |
| API docs | [`duck-primitives/api/menubar.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/menubar.mdx) |
| Styled component | [`registry-ui/src/menubar`](../../../registry-ui/src/menubar) |
| Styled docs | [`duck-ui/components/menubar.mdx`](../../../../apps/duck/content/docs/duck-ui/components/menubar.mdx) |

The menu it shares with Dropdown Menu and Context Menu has its own README in [`../menu`](../menu).

## Benchmarks

<!-- benchmarks -->
Smaller than all 2. Faster in all 10 timed comparisons.

| | gentleduck | Radix | Base UI |
|---|--:|--:|--:|
| Size, gzipped bytes | 31,594 | 32,339 (0.98x) | 52,659 (0.60x) |
| Mount x100, ms | 10.4 | 20.5 (0.51x) | 52.5 (0.20x) |
| Unmount x100, ms | 1.32 | 2.37 (0.55x) | 5.49 (0.24x) |
| Unmount open x100, ms | 4.09 | 13.2 (0.31x) | 15.4 (0.27x) |
| Open, ms | 1.63 | 2.64 (0.62x) | 4.28 (0.38x) |
| Close, ms | 1.04 | 1.49 (0.70x) | 2.73 (0.38x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 1.1.24 and Base UI 1.0.0-rc.0.

Base UI's Menubar is only the bar, so its figures include the Menu each entry opens. Ark UI and React Aria ship no menubar.
<!-- /benchmarks -->

## Tests

The stories cover a bar of menus with submenus, a disabled item and typeahead, in either direction, looping or
not, with its menus in a portal or in place; checkbox items, one with `closeOnSelect={false}`, a radio group and a
submenu with `closeParentOnEsc={false}`; a controlled bar that can be disabled, vertical or modal, with a disabled
trigger and presses outside counted; and an overlay a browser extension draws over the page. The end-to-end suite
runs each in Chromium, Firefox and WebKit.

Each test written for this module was proven by changing the code and watching a test fail. The suites taken from
Base UI run that library's own cases against this code. Each file's header names its source and every case left
out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 107 | `menubar.base-ui.test.tsx` 13, `menubar.radix.test.tsx` 30, `menubar.test.tsx` 64 |
| End to end | 35 | `menubar.e2e.ts` 17, `menubar.radix.e2e.ts` 18 |
| registry-ui | 13 | `menubar-force-mount.test.tsx` 2, `menubar.test.tsx` 11 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>142 behaviours, one per test</summary>

**Unit, `menubar.base-ui.test.tsx`**

- Base UI menubar roles
  - is a menubar with its orientation, and its triggers menu items
- Base UI menubar with the mouse
  - opens a menu on a press of its trigger, and closes it on the next
  - moves to the menu the pointer enters while one is open, and opens none on hover while none is
  - closes the whole tree on one press outside once a submenu is open
- Base UI menubar keys
  - moves between triggers on the arrow keys, and to the ends on Home and End
  - moves between triggers on ArrowDown and ArrowUp when vertical
  - opens a menu on Space, moving through it with the arrow keys
  - opens a submenu on ArrowRight, and closes it on ArrowLeft, back on its trigger
  - takes the keyboard after a menu opens on a press
  - goes round from the last trigger to the first with loop true
  - goes no further than the last trigger with loop false
- Base UI menubar disabled
  - disables its triggers while disabled
  - stays reachable by Tab while its first trigger is disabled

**Unit, `menubar.radix.test.tsx`**

- aria-controls
  - should not reference a non-existent element while closed
  - should reference the rendered content while open
- Menubar.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.Group
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.Label
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.Item
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.CheckboxItem
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.RadioGroup
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.RadioItem
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.ItemIndicator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.Separator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.Arrow
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.SubTrigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Menubar.SubContent
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `menubar.test.tsx`**

- Menubar
  - renders with data-slot="menubar"
  - renders triggers with data-slot="menubar-trigger"
  - triggers have role="menuitem"
  - triggers have aria-haspopup="menu"
  - triggers start closed
  - triggers have type="button"
  - opens on Enter key
  - opens on Space key
  - opens on ArrowDown key
  - forwards ref
  - marks the trigger that has focus as highlighted
- Menubar keyboard direction
  - moves to the next menu with ArrowRight in LTR
  - moves to the next menu with ArrowLeft in RTL
  - moves to the previous menu with ArrowRight in RTL
  - opens a submenu with ArrowLeft in RTL without leaving the menu
  - places the submenu on the left in RTL
  - closes a submenu with ArrowRight in RTL without leaving the menu
  - closes a submenu with ArrowLeft in LTR without leaving the menu
- Menubar trigger pointer
  - opens its menu on a primary press and claims only the opening press, so the next one closes it
  - opens nothing on a ctrl-click or a secondary press
  - leaves focus in the open menu when the pointer comes back over its trigger
  - switches to the menu whose trigger the pointer enters while one is open
  - focuses the trigger the pointer enters, even one with no menu to take focus
  - opens nothing when the pointer enters a trigger while every menu is closed
- Menubar content outside focus and interaction
  - stays open when focus moves to another menubar trigger
  - returns focus to its trigger when Escape closes it
  - closes when focus moves out of the menubar, and leaves focus there
  - leaves focus where the user clicked outside
  - returns focus to its trigger on Escape after an earlier close by a click outside
- Menubar content
  - opens below its trigger and aligned to its start, labelled by it, with the popper sizes handed on
  - opens a submenu its defaultOpen names, with the popper sizes handed on
- Menubar tab stop
  - moves to the menu a press or an arrow key opens
  - stays on the menu the back arrow closes, when closing it focuses nothing
- Menubar trigger keys
  - closes its open menu on Enter or Space at its trigger
  - opens only its own menu when no menu is given a value
  - focuses no item in a menu the arrow keys reach, though its trigger opened it from the keyboard before
  - keeps its menu open on the key that opens it, and claims the key
- Menubar without loop
  - stops at the first and the last menu
- Menubar first and last menu keys
  - opens the last menu on A and the first on I
  - leaves an A or I typed with Caps Lock, or with Shift and another modifier, to the menu
  - swaps the two keys right to left
- Menubar menu keys
  - types ahead to an item that starts with l
  - types ahead to an item that starts with h
  - leaves the arrows and the I and A keys to a field inside an item
  - closes only a submenu on Escape and focuses its trigger when it keeps its parent open
  - opens a submenu on ArrowRight when its sub-trigger carries its own data-slot
  - opens a nested submenu on ArrowRight without leaving the menu
- MenubarMenu onOpenChange
  - reports only the changes to its open state
- Menubar vertical orientation
  - tells assistive tech the bar is vertical
  - moves between menus with ArrowDown and ArrowUp without opening one
  - opens a menu on ArrowRight, and on ArrowLeft right to left
  - places the menu beside the bar, on the left right to left
  - closes the menu back to its trigger on ArrowLeft, and on ArrowRight right to left
  - stays in the menu on the arrow pointing away from the bar
  - opens the top menu on I and the bottom on A, right to left too
- Menubar disabled
  - opens no menu from the pointer or the keyboard
  - keeps the open menu when the pointer moves onto a disabled trigger
  - takes a trigger given through asChild out of the tab order once the bar is disabled, its own tabIndex too
  - takes a disabled bar out of the tab order, and marks its triggers
- Menubar modal
  - locks the page while a menu is open, leaving the menu and the bar usable
  - keeps the page locked while the pointer moves to another menu
  - gives the page back when the menu closes
  - moves between menus from the keyboard
  - leaves the page alone by default

**End to end, `menubar.e2e.ts`**

- Menubar opened from the keyboard
  - opens on Enter with the first item focused
  - opens on Space with the first item focused
  - opens on ArrowDown with the first item focused
  - skips a disabled item, and gives focus back to the trigger on Escape
- Menubar checkable items
  - toggles a checkbox item and closes, or stays open when closeOnSelect is off
  - checks only the chosen radio item, inside its named group
  - closes only a submenu that keeps its menu open on Escape, then the menu
  - ignores a click on a disabled item
- Menubar controlled, disabled, vertical and modal
  - opens the menu its value names, and reports the menu a click or a key opens
  - passes over a disabled trigger, and wraps from the last trigger to the first
  - opens the last menu on Shift+A and the first on Shift+I, passing over a disabled one
  - keeps the open menu when the pointer moves onto a disabled trigger
  - opens no menu while the bar is disabled
  - in a vertical bar, moves between triggers on the up and down arrows and opens on the right one
  - lets a click outside a menu reach the page, and closes
  - closes on a second press of the trigger that opened it
  - keeps a click outside a modal bar from reaching the page, and closes

**End to end, `menubar.radix.e2e.ts`**

- Menubar &gt; given a pointer user
  - should open menu when pointer moves between triggers and not focus first item
  - should maintain the open state when pointer moves away from a trigger
  - should not close open submenu when moving pointer to submenu and back to parent trigger
  - should close open submenu when moving pointer to any item in parent menu
  - should close unassociated submenus when moving pointer back to the root trigger
  - should close all menus when clicking item in any menu, or clicking outside
- Menubar &gt; given a keyboard user
  - should move to next menu using right arrow and previous menu with left arrow
  - should not open submenu when moving focus to sub trigger
  - should not open submenu when moving focus to sub trigger (again)
  - should open submenu and focus first item when pressing right arrow, enter or space key
  - should close only the focused submenu when pressing left arrow key
  - should focus first item when pressing right arrow key after opening submenu with pointer
  - should close all menus when pressing escape, enter or space key on any item
  - should scope typeahead behaviour to the active menu
- Menubar &gt; given a keyboard user &gt; with portals enabled
  - should move to next menu using right arrow and previous menu with left arrow
- Menubar &gt; given a keyboard user &gt; with RTL enabled
  - should move to next menu using right arrow and previous menu with left arrow
  - should open submenu and focus first item when pressing left arrow key but close when pressing right arrow key
- Menubar extension overlay interactions
  - should close when an external overlay stops later mouse events

</details>
<!-- /behaviour -->

## Beyond Radix

- `orientation` makes a vertical bar, as Base UI allows. `ArrowUp` and `ArrowDown` move between menus,
  `ArrowRight` opens one beside the bar and `ArrowLeft` closes it, mirrored right to left. The root sets
  `aria-orientation`.
- `disabled` on the root disables every trigger.
- `modal`, off by default as in Radix and on by default in Base UI, makes each menu modal while open: the
  page stops scrolling and takes no pointer events, and the bar keeps its own so the pointer still moves
  between menus.
- `Shift+I` and `Shift+A` open the first and last menus. Each needs Shift and no other modifier, so a capital
  typed with Caps Lock goes to typeahead and a shortcut such as `Ctrl+Shift+I` to the page.
- `closeOnSelect` and `closeParentOnEsc`, from the shared menu.

## Fixed

- Passes every Radix menubar test, and the shared menu fixes in `../menu`.
- Typeahead reaches every letter, `h` and `l` included.
- `ArrowRight` on a sub-trigger opens its submenu even when it carries its own `data-slot`, and on a
  nested one, instead of moving to the next menu.
- A field inside an item keeps its arrow keys.
- `MenubarMenu`'s `onOpenChange` fires only when its menu opens or closes, where it fired on mount and on
  every render that passed a new callback.
- The pointer moving onto a trigger that has no menu content still focuses it.
- The pointer moving onto a disabled trigger while a menu is open leaves that menu open. Radix switches the bar
  to the disabled trigger, which closes the open menu.
- A disabled trigger given through `asChild` as a link leaves the tab order, which a disabled button does on its own.

## Smaller and faster

- The nine pass-through parts, from `Item` to `Separator`, come from the factory the three menus share.
- The content's custom properties are one object built once, where each render built them again.
- A trigger takes its tab stop and keys from `useRovingFocusItem`, where it wrapped its button in
  `RovingFocusGroup.Item`.
- The root renders its own element through `useRovingFocusGroup` and reads its triggers from the group, where it
  kept a collection of its own, with a provider and a slot around the bar and a slot around each trigger.

## Breaking changes

- `h` and `l` no longer move between menus. They were undocumented and kept those letters from typeahead.
- `Menubar.Content` no longer takes `trapFocus`, `disableOutsidePointerEvents` or
  `disableOutsideScroll`; the root's `modal` decides all three for every menu.
- The root carries a `dir` attribute, written by the roving focus group it renders through. A bar inside an element
  with `dir="rtl"` but no `DirectionProvider` now runs its triggers left to right, as its arrow keys already read
  them. Give it `dir="rtl"` or a provider.

## registry-ui

- `Menubar` takes `orientation`, `disabled` and `modal`. A vertical bar is a column with its menus opening
  beside it.
- A disabled trigger, or every trigger in a disabled bar, is dimmed.
- A menu or submenu taller than the space left scrolls.
- `MenubarSub` is the primitive itself, and `MenubarMenu`, `MenubarGroup` and `MenubarPortal` stop
  reassigning `displayName`.
- The closing-animation classes that never ran are gone.
- `MotionMenubarContent` animates once, with the spring, from its trigger, where a CSS zoom and the spring
  ran at once.
- `MenubarContent` and `MotionMenubarContent` take `container`, handed to its portal, so the menu renders into an
  element of your own, such as one carrying another theme. It always portalled to `document.body`, so the
  `container` documented on `MenubarPortal` could not reach it. Their props are `IMenubarContentProps`.
- A new example portals each menu into a dark panel.

## Later

Nothing parked.
