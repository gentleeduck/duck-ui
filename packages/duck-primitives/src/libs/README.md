# Libs

The helpers the primitives share. None is exported from the package; a primitive that hands one to its users
re-exports it, as `roving-focus` does `focusFirst` and `wrapArray`.

| Helper | What it does | Used by |
|---|---|---|
| `clamp` | Holds a number inside a range | `select`, `slider` |
| `composeEventHandlers` | Runs a part's own handler, then the primitive's unless the first prevented the default | Every interactive primitive |
| `composeRefs`, `useComposedRefs` | Hands one node to several refs, and returns a single cleanup when a React 19 callback ref returns one | Every primitive that forwards a ref, and `slot` |
| `createCollection` | Registers the items of a list and reads them back in document order | `command`, `select`, `slider` |
| `createContext` | A context whose reader throws, naming the part and its root, when it has no provider and no default | `dialog` |
| `createContextScope` | Contexts a primitive can scope, so one built of another reads its own and not those of the same primitive around it | Every primitive with parts |
| `getComponentRef` | Reads a child element's ref under React 18 and 19 without the warning either logs | `presence`, `slot` |
| `getState` | `open` or `closed`, for `data-state` | `dialog`, `popover` |
| `joinIds` | Joins id lists, dropping blanks, repeats and anything not a string | `dialog`, `slot`, `tooltip` |
| `findNextItem`, `useTypeaheadSearch`, `useTypeaheadListNavigation` | Moves to the item a typed letter or word starts | `menu`, `radio-group`, `select` |
| `getNavigationCandidates`, `useVimNavigation` | The items an arrow key, `Home` or `End` can reach, and `gg` and `G` | `menu`, `radio-group`, `select` |
| `getRootActiveElement` | The focused element of the document or shadow root a node is in | `select`, and the typeahead above |
| `wrapArray`, `focusFirst`, `isPointInPolygon` | Rotates a list to start at an index, focuses the first candidate that takes focus, read in the candidates' own document or shadow root, and tests a point against a polygon | `context-menu`, `menu`, `roving-focus`, `select`, `tooltip` |

## Tests

Each helper is tested on its own here, every line of it. The collection tests are ported from Radix's own
collection suite, the cases that apply to a collection read through a getter: document order after a move, nested
providers, two collections side by side, the same commit read from a layout effect, Suspense and a hidden
`Activity`. The primitives built on these helpers test them again through their own parts.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 92 | `associated-form.test.ts` 8, `compose-ref.test.tsx` 4, `create-collection.test.tsx` 17, `create-context.test.tsx` 9, `get-component-ref.test.ts` 4, `join-ids.test.ts` 3, `list-navigation.test.tsx` 27, `primitives-utils.test.ts` 20 |
| End to end | 0 | - |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>92 behaviours, one per test</summary>

**Unit, `primitives-utils.test.ts`**

- duck-primitives utils
  - clamp constrains numbers within an inclusive range
  - clamp preserves boundary values
  - getState returns Radix-style open and closed strings
  - composeEventHandlers preserves order and respects defaultPrevented
  - composeEventHandlers returns our handler result when it runs
  - composeEventHandlers runs our handler when the original does not prevent default
  - composeEventHandlers can ignore defaultPrevented checks when requested
- wrapArray
  - wraps from a given start index
  - wraps from index 0 returns same order
  - wraps from last index
  - empty array returns empty
- isPointInPolygon
  - point inside returns true
  - point outside returns false
  - point far outside returns false
  - point beside it, level with it, returns false
  - counts a point on its left edge as inside and one on its right edge as outside, casting its ray rightwards
  - works with triangle
- focusFirst
  - moves on past a candidate that will not take focus
  - stops at the first candidate that takes focus, and hands on preventScroll
  - leaves focus on a candidate that already has it

**Unit, `create-context.test.tsx`**

- createContext
  - hands back a null default outside its provider rather than throwing
- createContext Provider
  - is named after its root, scoped or not
  - hands its readers one value while its props stay the same, and a new one once they change
- createContext without a default
  - throws naming the part and the root it must be used within
- createContextScope
  - hands back a null default outside its provider rather than throwing
- createContextScope scopes
  - hands a provider and its readers given a scope contexts of their own, apart from those of the same root
  - keeps each context of a scope apart, and hands its readers one value while its props stay the same
  - passes the contexts of a scope it is handed down, so a part reads what its root provided
  - composes the scopes it depends on into its own, so its root can provide theirs to its parts

**Unit, `join-ids.test.ts`**

- joinIds
  - joins id lists in the order first seen, dropping blanks and repeats
  - skips a value that is not a string, such as the false a condition leaves
  - hands back nothing when there is no id

**Unit, `create-collection.test.tsx`**

- createCollection read from an event handler
  - reads the items as they are now, in document order
  - reads items in document order after React moves them
  - orders items nested at different depths by where they are in the document
  - reads no items before its collection element renders
  - reads from the nearest provider, apart from the items of the one around it
  - keeps the items of two collections apart
- createCollection ordering
  - orders an item that rendered again on its own by where it is in the document
- createCollection consumers
  - hands its consumers one function that keeps its identity as items change
  - renders no consumer again when its items change
- createCollection read from a layout effect
  - reads an item mounted in the same commit
  - leaves out an item unmounted in the same commit
  - reads items moved in the same commit in document order
  - reads the data an item was given in the same commit
- createCollection with React hiding its items
  - leaves out the items a Suspense boundary hides when it suspends again
  - leaves out the items of a hidden Activity, and reads them again once it shows
- createCollection slots
  - renders the collection element and each item as its child, with no element of its own, and hands it the ref
  - registers each item once under strict mode, and drops it on unmount

**Unit, `associated-form.test.ts`**

- getAssociatedForm
  - finds the form around the control when no form is named
  - finds the form a name points to over the one around the control
  - finds no form when the name points to an element that is not one
  - finds no form for an empty name, not even the one around the control
  - looks the name up in the control's own shadow root
  - finds no form without a control
  - looks the name up in the control's own document, such as an iframe's
  - finds a form from another window, such as the one around a control in an iframe

**Unit, `compose-ref.test.tsx`**

- composeRefs
  - sets every ref and hands back nothing when no ref has a cleanup
  - hands back one cleanup that runs the callback cleanup and nulls the other refs
- useComposedRefs
  - runs a callback ref cleanup on unmount and nulls the object ref beside it
  - keeps one callback while its refs stay the same, and hands the node to a ref that replaces one

**Unit, `get-component-ref.test.ts`**

- getComponentRef
  - reads element.ref, never the props.ref that warns under React 18
  - reads props.ref, never the element.ref that warns under React 19, even with no ref given
  - reads props.ref off an element with no ref field of its own, as React has once it drops element.ref
  - reads the ref off an element React made

**Unit, `list-navigation.test.tsx`**

- findNextItem
  - takes a letter to the next item after the current one that it starts, as Radix does
  - takes a letter the current item starts on to the next item it starts, round to the top
  - takes a letter to the first item it starts when there is no current item
  - cycles through the items a letter typed again starts
  - stays on the current item while a longer search still matches it, whatever its case
  - takes a longer search to the first item it matches from the current one on
  - finds nothing for a letter no item starts
- useTypeaheadSearch
  - starts the search over once it is reset
  - keeps building while each key comes within a second of the last
  - keeps its search in a ref it is handed, so two lists can share one
  - builds on the search for a second, then starts over
  - still starts over a second after a key typed before strict mode replays the mount effects
- useTypeaheadListNavigation
  - takes a letter typed afresh to the next item it starts after the focused one
  - counts from the item focused inside a shadow root, of which the page names only the host
  - forgets the item it last matched once it is reset, so the next letter counts from focus
  - counts from the item it last matched while focus has not followed it
  - matches an item by its text without the spaces around it, and passes over one that is only spaces
  - counts from the item it is told is current, where focus is not
  - stays on the focused item while it still matches what was typed
  - keeps no search when no item has text, so a space typed next is not taken as part of one
  - falls back to the last key when nothing matches what was typed
- getNavigationCandidates
  - lists the items after the active one for ArrowDown and those before it, nearest first, for ArrowUp
  - lists every item from the top for Home and from the bottom for End, wherever focus is
  - lists every item for an arrow when no item is active
- useVimNavigation
  - takes G to the last item and gg to the first, after the keydown, and claims both keys
  - takes no gg whose second g comes too late, after another key, or with a modifier between
  - leaves a G typed without Shift, and any key with no items, to the list

</details>
<!-- /behaviour -->

## Beyond Radix

Against the same helpers in Radix, as `@radix-ui/react-collection` 1.1.15 and the menus and select built on it
ship them.

- A collection's items register in a layout effect, before any parent's, so a list reads its items from a layout
  effect in the commit that rendered them. Both of Radix's collections register them in a passive effect, after
  every layout effect of that commit.
- When the letters typed match no item, and the focused one does not start with them, typeahead starts again from
  the last letter, so typing `c` then `b` reaches the first item `b` starts. Radix keeps the search that matches
  nothing until its second runs out.
- Typeahead counts from the item it last matched while focus has not followed it there yet, so two letters typed
  in one task land where they should.
- `gg` and `G` move to the first and last item of a menu, a select and a radio group.
- A letter typed before strict mode replays a list's mount effects is still forgotten a second later. Radix clears
  its timer in that replay and sets no new one, so the next letter, however late, builds on the old search.

## Fixed

- Typeahead counts from the item focused inside an iframe or a shadow root, in a menu, a select and a radio group
  alike. It read the top document, which names only the iframe or the shadow host, so a letter went to the first
  item it starts instead of the next one after the focused item, as Radix's menu and select still do.
- `joinIds` leaves out a list that is not a string, such as the `false` a condition leaves for
  `aria-describedby`, so `Slot`, `Tooltip.Trigger` and `Dialog.Content` no longer write an id named `false`.

## Smaller and faster

- A scope composed of others is built without a `useMemo` that recomputed on every render, since the object it
  watched is new on every render.
