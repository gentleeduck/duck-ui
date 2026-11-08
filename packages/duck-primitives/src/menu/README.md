# Menu

The menu that Dropdown Menu, Context Menu and Menubar are built on.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/menu` |
| API docs | [`duck-primitives/api/menu.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/menu.mdx) |

What changed here reaches all three, and each of them has its own README for the rest.

## Benchmarks

<!-- benchmarks -->
Smaller than all 2.

| | gentleduck | Base UI | Ark UI |
|---|--:|--:|--:|
| Size, gzipped bytes | 29,136 | 51,013 (0.57x) | 35,225 (0.83x) |

Behind nowhere: smaller than every library here.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Base UI 1.0.0-rc.0 and Ark UI 5.40.0.

The menu every gentleduck menu is built on, sized against the same layer elsewhere. Its timings are those of Dropdown Menu, Context Menu and Menubar.
<!-- /benchmarks -->

## Tests

The stories drive the menu on its own, with a trigger built the way Dropdown Menu builds one: items, a disabled
item, an item that stays open by `closeOnSelect` or by preventing its select, `textValue` for typeahead, `loop`,
modal and not, right-to-left, checkbox items with a mixed parent, a radio group, and nested and disabled submenus
with `closeParentOnEsc` either way. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 62 | `menu.test.tsx` 62 |
| End to end | 18 | `menu.e2e.ts` 18 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>80 behaviours, one per test</summary>

**Unit, `menu.test.tsx`**

- Menu
  - starts closed without open
  - is modal without modal, hiding the rest of the page from assistive technology
  - leaves the page to assistive technology while kept mounted and closed, and hides it while open
  - gives the rest of the page back to assistive technology once it closes
- Menu.Sub
  - starts closed without open
  - does not ask an open sub menu to open again when its trigger is clicked
  - asks to close when it mounts in a closed menu, and when it unmounts
- Menu keyboard tracking
  - adds one keydown listener for every menu mounted, and removes it with the last
  - stops listening for the window losing focus once it closes
- Menu.Content
  - is a vertical menu drawn without an outline, in the direction of its root
  - stays mounted while closed under a forceMount portal, inside the portal container
  - puts a focus guard at each edge of the page while open
  - focuses itself on open, not a field inside it
  - moves focus without scrolling: to itself on open, to the first item on a keyboard open, to an item under the mouse
  - makes the item under the mouse its tab stop and highlights it, and takes both back when the mouse leaves
- Menu keys
  - moves from the content to the first or the last enabled item, taking the key
  - leaves an arrow typed in a field inside it to the field
  - leaves a letter and a jump with G typed in a field inside an item to the field
  - stops at the last item rather than wrapping
  - selects once for each Enter and Space, taking the key
  - leaves Enter and Space on a disabled item to the page
  - jumps with G to the last enabled item
- Menu typeahead
  - passes over a disabled item
  - leaves focus where it is when the match is disabled before focus moves to it
  - reads only a character typed without Ctrl, Alt or Meta
  - starts the search over after a jump with G
  - starts the search over once focus leaves the menu
  - leaves a key typed in an open sub menu to the sub menu
- Menu modal
  - keeps focus inside while open
  - lets focus leave with trapFocus false, telling onFocusOutside and staying open
  - leaves pointer events outside alone with disableOutsidePointerEvents false
  - locks scrolling outside, letting a pinch zoom over it through and leaving the scrollbar alone
  - leaves the page scrolling while closed, and with disableOutsideScroll false
- Menu items
  - selects again on a release alone after a select that keeps it open
  - keeps a disabled item rendered as a link from following it on a middle click
  - calls its own onPointerDown
  - starts a checkbox item unchecked, and toggles it on a select whose own handler keeps the menu open
  - marks the chosen radio item and shows its indicator, and chooses on a select whose own handler keeps the menu open
  - shows an indicator while its item is mixed, or always with forceMount
  - marks its label
- Menu.SubTrigger
  - opens its sub menu on Enter, Space and the arrow toward it
  - moves focus into its open sub menu on the arrow toward it, taking the key
  - opens its sub menu on a click, focusing itself, unless the click is prevented
  - names the sub menu and says whether it is open
- Menu.SubContent
  - opens to the right of its trigger, aligned to its start, whatever side and align it is given
  - leaves pointer events and scrolling outside alone in a menu that is not modal
  - closes when focus leaves it for anything but its trigger, telling onFocusOutside
  - takes an Escape typed in it, telling onEscapeKeyDown
  - leaves the arrow away from it typed in a field inside it to the field
  - stays open on the arrow away from it typed in a field portalled out of it, telling onKeyDown
- Menu sub menu on hover
  - opens 100ms after the mouse comes over its trigger, once however often it moves
  - opens again on hover after it closed
  - does not open once its trigger has unmounted
- Menu pointer grace toward a sub menu
  - keeps a sub menu flipped to the left open when the mouse jumps into it before moving over the menu
  - keeps an item inside the path to the sub menu from taking focus
  - lets that item take focus once the mouse heads away from the sub menu
  - keeps heading toward the sub menu through a move straight up or down
  - ignores the mouse moving inside a sub menu portalled out of it
  - lets the path lapse 300ms after the mouse leaves the trigger, counting from the last time it left
  - drops the path once the sub menu has closed and the mouse leaves the trigger elsewhere
  - drops the path once the sub menu has closed and the mouse comes back over the trigger
  - drops the path when the sub menu unmounts

**End to end, `menu.e2e.ts`**

- Menu
  - opened from the keyboard, walks its items past the disabled one
  - moves to the item a typed letter starts, read from its textValue
  - takes a letter the focused item starts to the next item it starts
  - selects an item with Enter and closes, and returns focus to the trigger
  - stays open for an item that asks to, by prop or by preventing its select
  - never selects a disabled item
  - closes on Escape
  - wraps from the last item to the first only with loop
  - closes on a press outside, which a modal menu keeps from the page
  - closes on a second press of the trigger
- Menu checkable items
  - toggles a checkbox item and keeps the parent mixed until every one is on
  - turns a mixed checkbox item on, not off
  - checks one radio item in its group
- Menu submenus
  - opens a submenu with ArrowRight and closes it with ArrowLeft in ltr
  - opens a submenu with ArrowLeft and closes it with ArrowRight in rtl
  - opens nested submenus on hover and selects from the deepest
  - never opens a disabled submenu
  - closes every menu on Escape, or only the submenu when it says so

</details>
<!-- /behaviour -->

## Beyond Radix

- `closeOnSelect={false}` on an item, a checkbox item or a radio item keeps the menu open once selected,
  as Ark, React Aria and Base UI allow, where Radix needs `event.preventDefault()` in `onSelect`.
- `closeParentOnEsc={false}` on a `Sub`, as in Base UI, makes Escape inside a submenu close only that
  submenu and focus its sub-trigger, as the WAI-ARIA menu pattern describes. Closing the whole menu stays
  the default.

## Fixed

- The menu closes, with any open submenu, when the window loses focus.
- A key typed into a focusable element inside an item or a sub-trigger, even one portalled out of it, is
  left to that element. A letter, a jump with `G` and the arrow that closes a submenu, typed into a field inside
  the menu, are left to it too, where typeahead moved focus to a matching item.
- A modal menu kept mounted with `forceMount` leaves the page to screen readers while it is closed, where it hid
  the page as soon as its content attached.
- A menu that is closing but still mounted no longer lets its items take focus under the pointer.
- A submenu flipped to the left stays open when the pointer moves straight into it in one jump, where
  the click landed on the parent's item underneath. It stays open too when the pointer jumps into it before it
  has moved over the menu at all, which read as moving right.
- A sub-trigger sets `aria-controls` only while its submenu is open.
- A disabled item rendered as a link with `asChild` no longer follows the link on a click or a middle click.
- Typing the focused item's name keeps focus on it.
- Every `SubTrigger` keeps one composed ref across renders, so a ref that sets state no longer loops.
- Typeahead searches the label an item shows now, where it searched the one the item mounted with, and a match
  disabled before focus moves to it leaves focus where it was.
- In development under StrictMode, a letter typed before React ran the menu's mount effects stayed in the
  search, so the next letter, however much later, searched for both. The replayed cleanup cleared the
  timer that empties the search.

## Smaller and faster

- The nine pass-through parts, from `Item` to `Separator`, come from one factory the three menus share. A
  page using all three loads 209 fewer bytes.
- Every menu on the page shares one listener telling keyboard use from pointer use, where each root added
  its own.
- An item renders once on mount, where reading its own label took a second render.
- Layers read their order in the stack once per change, where closing many at once grew with the cube of
  their number.
- Items, item indicators, separators, labels and groups stop reading the root's direction, which they only
  wrote to a `dir` attribute the menu around them already carries.
- The root no longer keeps its content in state. Only a submenu reads its content, and it keeps its own.
- A modal menu hides the rest of the page from a ref as its content attaches, where it kept the content in state
  for an effect and rendered the whole content a second time as it opened.
- An item takes its tab stop and keys from `useRovingFocusItem`, where it wrapped its element in
  `RovingFocusGroup.Item`.
- The content takes its items from the roving focus group and renders the group's element through
  `useRovingFocusGroup`, where a collection gave it a provider and a slot, each item a slot of its own, and the
  group a component and a slot. An item renders its element directly, where `MenuItemImpl` and `Primitive.div`
  added two components to each.

## Breaking changes

- `IMenu.MenuContentElement`, `IMenu.MenuItemElement` and `IMenu.MenuSubTriggerElement` are `IMenu.ContentElement`,
  `IMenu.ItemElement` and `IMenu.SubTriggerElement`.
- Items of every kind, sub-triggers, item indicators, separators, labels and groups carry no `dir` attribute. They
  take the direction of the menu around them, so a style matching `[dir="rtl"]` on the part itself should match
  the menu or use `:dir(rtl)`.
- `IMenu.IContext` drops `content` and `onContentChange`, which are on `IMenu.ISubContext`.

## Later

- Focus moves a task after an arrow key, as in Radix, so on a busy page an Enter or a submenu key pressed straight
  after an arrow reaches the item focus is leaving. Two arrows in a row count from the item the first is taking
  focus to; any other key does not. Focusing inside the keydown instead would batch every item's blur and focus
  handlers into it, which is the React bug (facebook/react#20332) the deferral avoids.
- A `Sub` with `defaultOpen` closes as its menu opens, as in Radix, since the menu focusing its own content reads
  as focus leaving the submenu. It holds in a menu that leaves focus alone. The pointer leaving a sub-trigger
  focuses the content too, and that should close the submenu, so a fix has to tell the two apart.
