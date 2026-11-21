# Dropdown Menu

A menu opened from a button.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/dropdown-menu` |
| API docs | [`duck-primitives/api/dropdown-menu.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/dropdown-menu.mdx) |
| Styled component | [`registry-ui/src/dropdown-menu`](../../../registry-ui/src/dropdown-menu) |
| Styled docs | [`duck-ui/components/dropdown-menu.mdx`](../../../../apps/duck/content/docs/duck-ui/components/dropdown-menu.mdx) |

The menu it shares with Context Menu and Menubar has its own README in [`../menu`](../menu).

## Benchmarks

<!-- benchmarks -->
Smaller than all 5. Faster in all 22 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI | Headless UI |
|---|--:|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 30,891 | 31,764 (0.97x) | 51,013 (0.61x) | 52,023 (0.59x) | 35,423 (0.87x) | 33,023 (0.94x) |
| Mount x100, ms | 3.66 | 4.56 (0.80x) | 9.84 (0.37x) | 7.65 (0.48x) | 5.08 (0.72x) | 16.5 (0.22x) |
| Unmount x100, ms | 0.634 | 0.758 (0.84x) | 1.41 (0.45x) | 1.12 (0.57x) | 0.957 (0.66x) | 2.55 (0.25x) |
| Unmount open x100, ms | 4.24 | 12.8 (0.33x) | 12.8 (0.33x) | 18.7 (0.23x) | 908 (0.00x) | - |
| Open, ms | 1.94 | 3.05 (0.64x) | 3.93 (0.49x) | 4.10 (0.47x) | 2.74 (0.71x) | - |
| Close, ms | 1.09 | 1.49 (0.73x) | 2.31 (0.47x) | 2.00 (0.55x) | 1.48 (0.74x) | - |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. The hundred copies mount and unmount closed, Unmount open tears them down once every one shows, and Open and Close time a single copy. Versions: Radix 2.1.24, Base UI 1.0.0-rc.0, React Aria 1.22.1, Ark UI 5.40.0 and Headless UI 2.2.10.

Headless UI has no controlled open state, so its copies are timed mounting and unmounting closed, and no more.
<!-- /benchmarks -->

## Tests

The stories cover submenus, one disabled, in either direction; checkbox and radio items, one with
`closeOnSelect={false}`; a modal and a non-modal menu with presses outside, the page's scroll and a disabled
trigger; an item that opens a dialog, with focus handed back to the trigger through `finalFocus`; items that are
links, one disabled; a list longer than the space below it; every side and alignment, and content as wide as the
trigger; a trigger inside a tooltip trigger; an exit animation; a menu inside a dialog; and an overlay a browser
extension draws over the page. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test written for this module was proven by changing the code and watching a test fail. The suites taken from
Ark UI, Base UI, Headless UI and React Aria run that library's own cases against this code. Each file's header
names its source and every case left out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 173 | `dropdown-menu.ark.test.tsx` 7, `dropdown-menu.base-ui.test.tsx` 4, `dropdown-menu.headless.test.tsx` 44, `dropdown-menu.radix.test.tsx` 40, `dropdown-menu.react-aria.test.tsx` 3, `dropdown-menu.test.tsx` 75 |
| End to end | 50 | `dropdown-menu.e2e.ts` 33, `dropdown-menu.radix.e2e.ts` 17 |
| registry-ui | 15 | `dropdown-menu-force-mount.test.tsx` 1, `dropdown-menu.test.tsx` 14 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>223 behaviours, one per test</summary>

**Unit, `dropdown-menu.ark.test.tsx`**

- Ark UI menu
  - has no axe violations while open
  - marks a disabled item for assistive technology, and runs nothing on a click of it
  - gives a group the group role, named by its label
  - follows an owner that controls it, mounting its content only while open
  - opens on a context menu event
  - opens a submenu from its trigger
  - checks the radio item picked

**Unit, `dropdown-menu.base-ui.test.tsx`**

- Base UI menu nested
  - closes every level on a press outside the deepest submenu
- Base UI menu nested &gt; opening a submenu on hover
  - opens a submenu once the pointer moves over its trigger
- Base UI menu checkbox and radio items
  - checks a checkbox item on a click, telling onCheckedChange
  - gives a radio group the group role, and checks the radio item clicked

**Unit, `dropdown-menu.headless.test.tsx`**

- Headless UI menu safe guards
  - renders closed without crashing
- Headless UI menu opening from the keyboard
  - opens on Enter with its first item active
  - stays closed on Enter while its trigger is disabled
  - opens on Enter with no item active when it has none
  - opens on Enter on its first item that is not disabled, past several that are
  - opens on Enter with no item active when every item is disabled
  - opens on Space with its first item active
  - stays closed on Space while its trigger is disabled
  - opens on Space with no item active when it has none
  - opens on Space on its first item that is not disabled, past several that are
  - opens on Space with no item active when every item is disabled
  - opens on ArrowDown with its first item active
  - stays closed on ArrowDown while its trigger is disabled
  - opens on ArrowDown with no item active when it has none
  - opens on ArrowDown on its first item that is not disabled, past several that are
  - opens on ArrowDown with no item active when every item is disabled
- Headless UI menu keys while open
  - runs the active item on Enter and closes, giving focus back to its trigger
  - runs the active item on Space and closes, giving focus back to its trigger
  - closes on Escape, giving focus back to its trigger
  - moves down on ArrowDown and up on ArrowUp, past disabled items
  - stays on its one item that is not disabled on ArrowUp and ArrowDown
  - moves to the last item on End, past disabled items
  - stays on the one item that is not disabled on End
  - moves to the last item on PageDown, past disabled items
  - stays on the one item that is not disabled on PageDown
  - moves to the first item on Home, past disabled items
  - stays on the one item that is not disabled on Home
  - moves to the first item on PageUp, past disabled items
  - stays on the one item that is not disabled on PageUp
- Headless UI menu typeahead
  - moves to the item a whole word names
  - moves to the item the start of a word names
  - takes a search with a space in it
  - passes over a disabled item
  - matches whatever the case
  - moves on to the next match on the same letter typed again
  - stays on its item while the letters typed still match it
- Headless UI menu with the mouse
  - opens on a press of its trigger, and closes on the next
  - stays closed on a right press, and while its trigger is disabled
  - closes on a press outside it, and does nothing on one while closed
  - closes and opens another on a press of that menu trigger
  - makes the item the pointer moves over active, and none once it leaves, passing over a disabled item
  - runs an item clicked and closes, and does nothing on a click of a disabled item
  - makes an item active when it takes focus
- Headless UI menu items changing
  - keeps the order of its items after one is taken out and put back

**Unit, `dropdown-menu.radix.test.tsx`**

- aria-controls
  - should not reference a non-existent element while closed
  - should reference the rendered content while open
- closing on window blur
  - should close the menu and any open submenus when the window loses focus
- keys from focusable descendants
  - does not intercept Space/Enter typed into a portaled focusable descendant
  - still selects the item via Space/Enter when the item itself is focused
- pointer movement while closing
  - does not take focus when the pointer leaves an item
  - does not focus an item the pointer moves over
  - does not take focus when the pointer leaves an item in a closed submenu
  - does not focus an item the pointer moves over in a closed submenu
- given a DropdownMenu with `asChild` on the Content
  - forwards content props and the ref to the child (modal: true)
  - forwards content props and the ref to the child (modal: false)
- ref stability
  - keeps a stable composed ref on the Trigger
  - keeps a stable composed ref on the SubTrigger
- DropdownMenu.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - forwards props to the child element when `asChild` is set on a non-modal menu
- DropdownMenu.Group
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.Label
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.Item
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.CheckboxItem
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.RadioGroup
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.RadioItem
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.ItemIndicator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.Separator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.Arrow
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.SubTrigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- DropdownMenu.SubContent
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `dropdown-menu.react-aria.test.tsx`**

- React Aria menu submenus
  - closes the whole menu on Escape in a submenu, giving focus back to the root trigger
  - stays open on a click on an element inside a submenu that is not an item
- React Aria menu presses
  - runs the item a press of the trigger is dragged onto and released over

**Unit, `dropdown-menu.test.tsx`**

- DropdownMenu
  - renders trigger with data-slot="dropdown-menu-trigger"
  - trigger has type="button"
  - trigger has aria-haspopup="menu"
  - trigger starts closed
  - trigger opens on Enter key
  - trigger opens on Space key
  - trigger opens on ArrowDown key
  - leaves a key it does not use to the page
  - keeps the browser from acting on Enter, Space and ArrowDown, which it uses
  - closes on Enter or Space at its trigger while the menu leaves focus there
  - opens on no key while disabled, even rendered as an element that still takes focus
  - disabled trigger has data-disabled and disabled attr
  - calls onOpenChange
  - forwards ref to trigger
  - trigger has aria-controls when open
  - trigger has no aria-controls when closed
  - passes className through to trigger
- DropdownMenu direction
  - sets dir on portaled content from DirectionProvider
  - opens the submenu to the left with ArrowLeft in RTL and closes it with ArrowRight
  - opens the submenu to the right with ArrowRight in LTR
  - puts a dir given to the root on the menu and leaves the trigger to the page
  - gives the menu the direction of &lt;html dir&gt; when nothing else sets one
- DropdownMenu trigger pointer
  - toggles the menu on a primary pointer down
  - stops the opening pointer down from moving focus, and lets the closing one through
  - ignores a secondary button, a control click and a disabled trigger
- DropdownMenu focus on close
  - returns focus to the trigger after a primary click outside a modal menu
  - leaves focus alone after a right click outside, which may be opening another menu
  - leaves focus alone after a control click outside
  - leaves focus where the user put it after any click outside a non-modal menu
  - gives focus back to the trigger on Escape after an earlier click outside closed the menu
- DropdownMenu content keyboard
  - moves focus to the item a typed letter starts
  - starts the search again from the last letter when the letters typed so far match nothing
  - cancels a pending gg when a modified key comes between the two presses
  - moves focus to the last item on G and back to the first on gg
  - moves focus from the content to the last item on End and the first on Home
- DropdownMenu item pointer
  - selects an item released on after a press that started elsewhere
  - leaves selection to the click when the press started on the item
  - hands focus back to the content when the mouse moves onto a disabled item
  - follows no link a disabled item renders, and still follows an enabled one
- DropdownMenu sub menu
  - names its trigger with its own data-slot
  - starts open in a menu that leaves focus alone, and reports each change to its open state
  - opens after the mouse rests on its trigger
  - opens nothing when the mouse leaves its trigger first
  - closes the whole menu on Escape inside it
  - closes only itself on Escape and focuses its trigger when it keeps its parent open
  - stays shut when ArrowRight is typed into an input portalled out of its trigger
- DropdownMenu keyboard tracking
  - still moves focus into a submenu opened from the keyboard after another menu unmounts
  - leaves focus on the trigger of a submenu the mouse opens after the keyboard was used
  - starts a menu mounted after every other one unmounted from the pointer, whatever was typed before
- DropdownMenu content style
  - names the popper's measurements under the dropdown menu's own variables, beside the style it was given
- DropdownMenu pointer grace area
  - keeps an item the mouse crosses on the way to the sub menu from taking focus
  - lets an item outside the path to the sub menu take focus
  - drops the grace area after 300ms
- DropdownMenu opened by the pointer after typing
  - focuses the menu rather than its first item
- DropdownMenu closeOnSelect
  - keeps the menu open after an item with closeOnSelect={false} is selected
  - keeps the menu open while a checkbox item with closeOnSelect={false} toggles
- DropdownMenu radio item outside a radio group
  - selects and closes with no group to report to
- DropdownMenu giving the page back on close
  - removes the content before it gives the page back its pointer events
- DropdownMenu checkbox item, indeterminate
  - reads as mixed and checks on select
- DropdownMenu content keyboard, from the menu itself
  - moves focus to the first item on ArrowDown when the menu opened without the keyboard
  - leaves a key that moves to no item to the browser
  - keeps Tab from leaving a menu that does not trap focus
- DropdownMenu items whose child never takes the ref
  - are passed over by Home and End from the menu
  - are passed over by Shift+G from the menu
  - leave focus where it is when a typed letter matches one
- DropdownMenu space typed as part of a search
  - does not select the item it lands on
  - does not open the sub menu whose trigger it lands on
- DropdownMenu touch
  - leaves focus alone when a touch moves over an item
- DropdownMenu disabled sub menu trigger
  - stays shut when clicked
  - stays shut when the mouse rests on it
- DropdownMenu open sub menu
  - stays open on a key inside it that is not its close key
- DropdownMenu pointer grace area, crossing other items
  - keeps the path when the mouse crosses another sub menu trigger on the way
  - keeps the path to a sub menu opened to the left, in a right-to-left menu
- DropdownMenu typeahead text
  - searches an item by its textValue rather than what it shows
  - finds an item by the label it shows now, not the one it mounted with

**End to end, `dropdown-menu.e2e.ts`**

- DropdownMenu opened from the keyboard
  - opens on Enter with the first item focused
  - opens on Space with the first item focused
  - opens on ArrowDown with the first item focused
  - skips a disabled item, and gives focus back to the trigger on Escape
- DropdownMenu checkable items
  - toggles a checkbox item and closes, or stays open when closeOnSelect is off
  - checks only the chosen radio item
  - ignores a click on a disabled item
- DropdownMenu modal and disabled
  - keeps a click outside a modal menu from reaching the page, and closes
  - lets a click outside a non-modal menu reach the page, and closes
  - gives focus back to the trigger after a press outside a modal menu
  - leaves focus where a press outside a non-modal menu put it
  - keeps the page from scrolling under a modal menu
  - lets the page scroll under a non-modal menu
  - opens a non-modal menu on ArrowDown without scrolling the page
  - takes focus into a non-modal menu the pointer opened, so ArrowDown reaches its items
  - closes a non-modal menu on a second press of its trigger
  - closes a modal menu on a press where its trigger is, and focuses the trigger
  - opens nothing on a right press or a control press of its trigger
  - opens no menu from a disabled trigger
- DropdownMenu item that opens a dialog
  - moves focus into the dialog, and back to the menu trigger once it closes
  - opens the dialog from the keyboard, and acts on its own button
- DropdownMenu link items
  - follows a link on a click, and closes
  - follows a link on Enter, and closes
  - follows no disabled link
- DropdownMenu with more items than fit
  - fits the space below its trigger, and scrolls to the item the keyboard reaches
  - scrolls to the item a typed name finds
- DropdownMenu placement
  - takes its trigger's width
  - opens above its trigger, its end edge on the end of the trigger
  - opens to the right of its trigger, centred on it
- DropdownMenu trigger inside a tooltip trigger
  - opens the menu and hides the tooltip the hover opened
  - shows the tooltip when Escape gives focus back to the trigger
  - shows no tooltip when an item chosen with the pointer gives focus back to the trigger
- DropdownMenu with an exit animation
  - stays until its animation ends, then gives focus back to the trigger

**End to end, `dropdown-menu.radix.e2e.ts`**

- DropdownMenu &gt; given submenu user &gt; when using pointer
  - should open submenu and not focus first item when moving pointer over trigger
  - should not close when moving pointer to submenu and back to parent trigger
  - should close open submenu when moving pointer to any item in parent menu
  - should close unassociated submenus when moving pointer back to the root trigger
  - should close all menus when clicking item in any menu, or clicking outside
- DropdownMenu &gt; given submenu user &gt; when using pointer &gt; at a narrow viewport
  - should close submenu when moving pointer away but remain open when moving towards
  - should select an item in a collision-flipped submenu after a single pointer move
- DropdownMenu &gt; given submenu user &gt; When using keyboard
  - should not open submenu when moving focus to trigger
  - should open submenu and focus first item when pressing right arrow, enter or space key
  - should close only the focused submenu when pressing left arrow key
  - should focus first item when pressing right arrow key after opening submenu with mouse
  - should close all menus when pressing escape, enter or space key on any item
  - should scope typeahead behaviour to the active menu
- DropdownMenu &gt; given submenu user &gt; When using pointer in RTL
  - should close submenu when pointer moves away but remain open when moving towards
- DropdownMenu &gt; given submenu user &gt; When using keyboard in RTL
  - should open submenu and focus first item when pressing left arrow key but close when pressing right arrow key
- DropdownMenu extension overlay interactions
  - should close when an external overlay stops later mouse events
- DropdownMenu nested in Dialog
  - dismisses only the menu when clicking inside dialog outside menu

</details>
<!-- /behaviour -->

## Beyond Radix

- `closeOnSelect` and `closeParentOnEsc`, from the shared menu.

## Fixed

- Passes every Radix dropdown-menu test, and the shared menu fixes in `../menu`.
- `DropdownMenu.Trigger` keeps one composed ref across renders.
- A disabled item rendered as a link no longer follows the link on a click.
- A trigger inside a tooltip trigger no longer shows the tooltip when an item chosen with the pointer gives
  focus back to it. Escape still does.

## Smaller and faster

- The root no longer resolves its direction, which the menu does.
- Unmounting many open menus no longer grows with the cube of their number, and 100 take 0.39 of Radix's time.
- The page gets its pointer events and scroll back once the content has left.
- With 2,000 elements on the page a Dropdown Menu closes in 1.75ms against Radix's 2.68.

## Breaking changes

- `DropdownMenu.Trigger` carries no `dir` attribute; a `dir` passed to the root lands on the menu. The
  context has no `dir` field.

## registry-ui

- `MotionDropdownMenuContent` draws the same surface as `DropdownMenuContent` and defines
  `--dropdown-menu-border-color`, with its items scrolling in a wrapper, so a `DropdownMenuArrow` shows
  where the content's overflow clipped it.
- `DropdownMenuContent` sets the variable with a class.
- The items scroll inside whatever height the content is held to, a `max-h` given to it included, where they
  overflowed a content held shorter than the space it had.
- `DropdownMenuContent` with `asChild` renders the caller's element as the menu, where the scroll wrapper took
  its place. With no wrapper, that element scrolls its own items when they run past its height.
- Submenus, plain and motion, scroll when taller than the space they have, where they were cut off.
- A new example has a submenu that closes on its own on Escape, with `closeParentOnEsc`.
- New examples open a dialog from an item, handing focus back to the trigger through `finalFocus`, and render
  items as links, one disabled.

## Later

- Base UI's `openOnHover` with `delay` and `closeDelay`, `highlightItemOnHover`, `onOpenChangeComplete`
  and `actionsRef`.
