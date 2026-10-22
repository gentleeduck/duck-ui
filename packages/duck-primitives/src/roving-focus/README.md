# Roving Focus

Moves focus through a group of items with the arrow keys and keeps one of them in the tab order, the WAI-ARIA
roving tabindex pattern.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/roving-focus` |
| API docs | [`duck-primitives/api/roving-focus.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/roving-focus.mdx) |
| Used by | `toggle-group`, `radio-group`, `menubar` and every `menu` |

It has no styled component of its own. registry-ui reaches it through the components above.

## Tests

The stories cover a toolbar entered with Tab and left with Tab and Shift+Tab; the arrow keys, Home, End, PageUp
and PageDown moving past an item that cannot take focus, stopping at the ends or looping; a vertical group; a
right-to-left group; entry on the active item, then on the item focus left; a consumer preventing the entry focus;
Tab entering after a click that moved no focus; a function child told whether its item is the tab stop; and a
group inside an iframe and inside a shadow root. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

Radix has no roving focus tests of its own. A group that is the first thing a dialog focuses, Radix issue 3077, is
covered by `toggle-group.radix.e2e.ts`.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 30 | `roving-focus.test.tsx` 30 |
| End to end | 10 | `roving-focus.e2e.ts` 10 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>40 behaviours, one per test</summary>

**Unit, `roving-focus.test.tsx`**

- RovingFocusGroup
  - renders children
  - renders group as a div by default
  - items render with tabindex
  - forwards ref to group
  - calls a function child with whether its item is the tab stop and whether the group has one
  - accepts orientation prop
- RovingFocusGroup pointer and tabbing
  - prevents a mouse down on an item that cannot take focus
  - makes the item a mouse down lands on the tab stop
  - takes the group out of the tab order on Shift+Tab before any microtask, which Firefox automation runs after moving focus
  - moves focus to the last focusable item on End
  - leaves focus on the group when a click focused it
- RovingFocusGroup keyboard entry
  - hands focus to the active item before the first one
  - hands focus to the first focusable item when none is active
  - hands focus on to an item after a mouse down that moved no focus, as on the item that had it
  - leaves focus on the group when a consumer prevents the entry focus
- RovingFocusGroup arrow keys
  - counts a press made before the last one has moved focus from where that one is taking it
  - counts a press that lands between two moves from the later one
  - skips an item that cannot take focus moving forward and back
  - stops at the last item without loop and wraps with it
  - reads ArrowLeft as forward in a right-to-left group
  - lays its items out the way it reads their keys, writing its direction as dir
  - moves only along its orientation, leaving the other arrows to the page
  - reads ArrowDown as forward in a right-to-left group too
  - moves focus to the first focusable item on Home
  - leaves an arrow key held with a modifier, and a key it does not use, to the page
  - leaves an arrow key pressed inside an item to what was pressed
  - passes over an item whose element it cannot reach, by arrow and on entry
- RovingFocusGroup tab order
  - leaves the tab order once no item can take focus
- RovingFocusGroup in another root
  - moves one item at a time inside a shadow root
  - moves one item at a time inside an iframe

**End to end, `roving-focus.e2e.ts`**

- RovingFocusGroup
  - Tab enters on the first item and leaves past the rest, and Shift+Tab comes back to the item it left
  - arrow keys move one item at a time past one that cannot take focus, stopping at the ends unless looping
  - a vertical group moves on the up and down arrows only
  - given its own right-to-left dir, it lays the items out the way it reads the arrow keys
  - enters on the active item first, then on the item focus left
  - a consumer preventing the entry focus keeps focus on the group
  - after a click that moved no focus, Tab still enters on an item
  - tells a function child whether its item is the tab stop and whether the group has one
- RovingFocusGroup in another root
  - moves one item at a time inside an iframe
  - moves one item at a time inside a shadow root

</details>
<!-- /behaviour -->

## Beyond Radix

Against `@radix-ui/react-roving-focus` 1.1.19, the version Radix's menu, radio group, toggle group, tabs and
toolbar ship. 1.2.1, the latest, behaves the same.

- An arrow key, Home or End pressed before the last one has moved focus counts from the item that one is moving
  to, so two quick presses move two items. Radix counts both from the same item and moves one.
- `useRovingFocusItem` returns an item's tab stop, keys and ref as props to spread onto the element that takes
  focus, so a part built on the group renders no component for each item. Radix's item is always a component.

## Fixed

- A group writes its direction as `dir`, so a right-to-left group lays its items out the way its arrow keys read
  them. It read `dir` for the keys and wrote nothing, so a group given `dir="rtl"` on a left-to-right page moved
  forward on `ArrowLeft` while its items ran left to right, as Radix's still does.
- The arrow keys move one item at a time inside an iframe or a shadow root. The check that an item took focus
  read the top document, which names only the iframe or the shadow host, so every arrow key went on to the last
  item, as Radix's still does.
- Tab into the group enters on an item after a mouse down that moved no focus, as on the item that already had
  it, or on a button in Safari. That mouse down left the group thinking the next focus came from the pointer, so
  the next Tab stopped on the group itself. Radix's does the same, and its Tabs hit it in every browser since they
  focus their trigger on mouse down (Radix issue 4224).
- Shift+Tab leaves the group in Firefox under Playwright. The group left the tab order in a microtask, which
  Firefox automation runs only after the browser has moved focus, so focus landed on the group and went back to
  the item. Radix's has the same gap.
- `RovingFocusGroup.Item` takes a function as its children, called with `isCurrentTabStop` and `hasTabStop`, as
  Radix's does. It took only nodes.

## Smaller and faster

- The module is 4,236 bytes against Radix's 7,594, each minified and gzipped with everything it imports but React.
- The group keeps its items in a set it sorts into document order on a key press, where a collection gave the
  group two components and each item a slot of its own.
- `useRovingFocusGroup` returns the group's context and the props for an element of the caller's own, so Radio
  Group renders the group's element itself, with no group component and no slot around it.
- The group writes its tab stop to its element when the first item that can take focus mounts or the last one
  goes, so mounting items never renders the group again. It counted them in state, which rendered the group a
  second time after every mount.

## Breaking changes

- The group element carries a `dir` attribute, and so does a `Menubar` root, which the group renders through. A
  group inside an element with `dir="rtl"` but no `DirectionProvider` now runs its items left to right, as its
  arrow keys already read them. Give it `dir="rtl"` or a provider.
- The group writes its `tabindex` to its element after React commits rather than rendering it, so server markup
  carries none. A `tabIndex` given to the group is still left alone.
- `IRovingFocus.IContext` adds an item with `register`, which returns what removes it, in place of
  `onFocusableItemAdd` and `onFocusableItemRemove`. `IRovingFocus.IGroupImplProps` is gone.
- `Collection`, `useCollection` and `createCollectionScope` are gone, and an item carries no
  `data-collection-item` attribute. `IRovingFocus.IItemData` is `IRovingFocus.IItem`, which holds the item's ref,
  and the context gains `items`.

## Later

- Focus moves a task after the key, as in Radix, so on a busy page an Enter pressed straight after an arrow can
  still reach the item focus is leaving. Moving focus inside the keydown would run every item's blur and focus
  handlers inside it, the React bug (facebook/react#20332) the wait avoids.
- It moves along one line only. Base UI's composite also moves through a grid by rows and columns.
