# Focus Scope

Keeps focus inside a container while it is trapped, loops Tab from its last stop to its first while it loops,
focuses its first field on mount and gives focus back on unmount.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/focus-scope` |
| API docs | [`duck-primitives/api/focus-scope.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/focus-scope.mdx) |
| Used by | `dialog`, `alert-dialog`, `sheet`, `popover`, `select` and every `menu`; a `tooltip` registers as a branch, and `navigation-menu` finds its tab stops with the same function |

It has no styled component of its own. registry-ui reaches it through the components above.

## Tests

The stories cover a scope that traps and loops, traps without looping, or does neither, with its mount and
unmount focus each prevented and its own `onKeyDown`; a focused element removed from a trapped scope; two groups
of native radios at its edges; hidden, invisible, inert and disabled elements and those out of the tab order; a
focusable `svg` at its end; a scope opened over another, which renders another element while open; a registered
branch beside a portal that is not one; a scope holding a shadow root; and a scope in an iframe and one in a
shadow root. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 78 | `branches.test.tsx` 5, `focus-scope.radix.test.tsx` 19, `focus-scope.test.tsx` 54 |
| End to end | 24 | `focus-scope.e2e.ts` 24 |
| registry-ui | 0 | - |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>102 behaviours, one per test</summary>

**Unit, `focus-scope.test.tsx`**

- FocusScope
  - renders children
  - renders as a div
  - forwards ref
  - passes className through
- FocusScope onKeyDown
  - hands each key to its own onKeyDown
  - loops no Tab its onKeyDown prevented, since that handler runs first
- FocusScope trapped with nothing visible to tab to
  - keeps Tab on the container when its only tabbable is hidden
- FocusScope trapped when the focused element goes
  - takes focus back to the container
  - leaves focus alone when content is only added while nothing has focus
  - leaves focus where it is when another element inside goes
- FocusScope among other trapped scopes
  - traps again once a scope opened inside it closes
  - leaves focus going outside both to the scope opened inside it, never taking it to its own element
  - keeps the scope under it paused after it renders another element
  - leaves a scope opened after it in charge when it renders another element
  - keeps trapping after the element it renders is replaced
- FocusScope rendering another element
  - neither gives focus back nor reports an unmount until it unmounts, then gives it to what had it first
- FocusScope whose element goes and comes back
  - gives focus back on unmount to what had it when the element came back
- FocusScope focusing an input
  - selects its text on mount and again when focus comes back to it
  - leaves the caret where it is when a Tab loops back onto the input it is in
- FocusScope where the browser has checkVisibility
  - skips what it reports as invisible, asking for the visibility property under both names
  - falls back to computed styles while the scope itself is invisible
- FocusScope looping past native radios
  - loops on a Tab from either end of an unchecked group that ends it, since Tab leaves the group from each
  - loops on a Shift+Tab from either end of an unchecked group that starts it
  - loops onto the checked radio of the group that starts it, as Tab into a group does
  - loops back onto the checked radio of the group that ends it
  - leaves the Tab to the browser when the next group is still inside
  - reads checkboxes sharing a name as a stop each
  - reads each radio without a name as a group of its own
  - reads radios of the same name in two forms as two groups
- FocusScope on mount
  - moves on to the next element when the first will not take focus
  - passes over a link to focus the first element after it
  - focuses its own element when nothing inside takes focus
  - leaves focus where it is when an element inside already has it
- FocusScope trapped
  - lets focus go outside a scope that has never held it, with nothing to send it back to
  - holds Tab on the last element and Shift+Tab on the first without loop
  - leaves a Tab to the browser from an element Tab cannot reach when nothing inside can be tabbed to
- FocusScope leaving Tab to the browser
  - when it neither loops nor traps
  - with Alt, Ctrl or Meta held, which the browser and the system keep for their own shortcuts
  - while a scope opened after it holds the keyboard
- FocusScope and a focusable svg
  - reads a focusable svg at the end as the last stop
- FocusScope skipping what cannot take focus
  - loops past an element at the end hidden by its visibility
  - loops past the end when what follows is inert
  - loops past the end when what follows is a hidden input
  - loops past the end when what follows is in a disabled fieldset
  - focuses past the content of a hidden element on mount
- FocusScope in an iframe
  - focuses its first element on mount and loops Tab from its last, in the frame document
  - focuses its own element when nothing inside takes focus, in the frame document
  - takes focus back from outside it, in the frame document
  - takes focus to its own element when the focused element goes, in the frame document
  - gives focus back to what had it in the frame document on unmount
- FocusScope holding a shadow root
  - gives focus back to the field inside it, not to its host
- FocusScope in a shadow root
  - focuses its first element on mount and loops Tab from its last
  - takes focus back from outside it, and from outside its shadow root
  - gives focus back to what had it inside the shadow root on unmount

**Unit, `branches.test.tsx`**

- useFocusScopeBranchRegistry
  - keeps its list when a node is added twice or a stranger is removed
  - holds the same registry across renders
- useFocusScopeBranch
  - registers with the nearest host and leaves it on unmount
  - passes through a provider without a registry to the host above it
  - does nothing without a host

**Unit, `focus-scope.radix.test.tsx`**

- FocusScope &gt; given a default FocusScope
  - should focus the next element in the scope on tab
  - should focus the last element in the scope on shift+tab from the first element in scope
  - should focus the first element in scope on tab from the last element in scope
  - should wrap focus on a plain shift+tab keydown from the first element in scope
  - should leave a tab that belongs to an IME composition to the input method
  - should leave a tab the IME processed (keyCode 229) to the input method
- FocusScope &gt; given a FocusScope where the first focusable has a negative tabindex
  - should skip the element with a negative tabindex on tab
  - should skip the element with a negative tabindex on shift+tab
- FocusScope &gt; given a trapped FocusScope with branches
  - reclaims focus moved into an unregistered outside node
  - keeps focus when it moves into a registered branch
- FocusScope &gt; given a FocusScope with internal focus handlers
  - should properly blur the last element in the scope before cycling back
- FocusScope &gt; ref stability
  - keeps a stable composed ref (no infinite render loop)
- FocusScope &gt; unmount timer
  - does not read realm globals after the environment has been torn down
  - still restores focus and honours `preventDefault` after unmount
- FocusScope &gt; given a FocusScope with hidden elements
  - should skip elements with display: none when looping backward
  - should skip elements with visibility: hidden when looping forward
- FocusScope.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - forwards props to the child element when `asChild` is set on a trapped, looping scope

**End to end, `focus-scope.e2e.ts`**

- FocusScope
  - focuses its first element that is not a link on mount, with its text selected, and gives focus back on unmount
  - leaves focus alone on mount and on unmount when their handlers prevent it
  - loops Tab from its last element to its first, and Shift+Tab from its first to its last
  - hands each key to its own onKeyDown
  - holds Tab on its last element and Shift+Tab on its first when trapped without looping
  - lets Tab leave its last element when it neither traps nor loops
  - takes focus back from outside while trapped, and lets it go once it is not
  - takes focus back from an element outside that keeps its focus events from the page
- FocusScope trapped when the focused element goes
  - takes focus to its own element
- FocusScope skipping what is not a stop
  - loops past hidden, invisible, inert and disabled elements and those out of the tab order
  - reads a focusable svg at its end as its last stop
- FocusScope looping past native radios
  - loops from any radio of the group that ends it onto the checked radio of the group that starts it
  - loops back from any radio of the group that starts it onto the checked radio of the group that ends it
- FocusScope nested
  - leaves the outer scope alone while the inner one is open, and traps again once it closes
  - lets Tab move focus inside the inner scope while the outer one is paused
  - keeps the outer scope paused once the inner one renders another element
- FocusScope with branches
  - lets focus into a registered branch, and takes it back from a portal that is not one
- FocusScope holding a shadow root
  - gives focus back to the field inside it, not to its host
- FocusScope in an iframe
  - focuses its first element on mount and gives focus back on unmount
  - loops Tab and Shift+Tab at its edges
  - takes focus back from outside
- FocusScope in a shadow root
  - focuses its first element on mount and gives focus back on unmount
  - loops Tab and Shift+Tab at its edges
  - takes focus back from outside

</details>
<!-- /behaviour -->

## Beyond Radix

Against Radix 1.1.16, the version `@radix-ui/react-dialog` 1.1.23 ships.

- A scope inside an iframe traps, loops and gives focus back in the iframe's document, and selects a field's text
  there. Radix listens for focus and reads the focused element in the page's own document, so in an iframe it
  never looped, let focus leave and gave focus back to the iframe element, and it checks for an input with the
  page's `HTMLInputElement`, which an iframe's input is not.
- A scope inside a shadow root reads the element focused inside each open shadow root, takes each focus event's
  target from its composed path, and listens on the shadow root as well as the document, since focus moving
  between two elements of one shadow root never reaches the document. Radix reads the document's focused element,
  which is the shadow host, and listens only on the document. A trapped scope holding a shadow root, such as a
  custom element with a field inside, gives focus back to that field, where Radix focuses its host.
- The scope calls the `onKeyDown` it is given before its own handler, and loops no Tab that handler prevented.
  Radix drops the prop.
- A scope whose element changes, as with `asChild` when its child changes type, carries on as the same scope.
  Radix acts as if it had closed: it gives focus back to what had it before the scope opened, calls
  `onUnmountAutoFocus`, and leaves the stack of open scopes, so the scope under it takes focus back while this one
  is still open.
- A looping scope counts a group of native radios as one stop, as the browser does, and looping into a group lands
  on its checked radio. Radix counts each radio, so a Tab from a radio of the group that ends the scope left it or
  stuck.
- Nothing inside an `inert` element or a disabled `<fieldset>` is a stop. Radix checks only an element's own
  `disabled`.
- A Tab while an input method is composing text is left to the input method.
- `branches` names nodes outside the scope's DOM that focus may move into, such as a nested layer's portalled
  content, and `FocusScopeBranchProvider`, `useFocusScopeBranchRegistry` and `useFocusScopeBranch` register them.
  Radix has no branches.

## Smaller and faster

- The first and last visible stops are found with `checkVisibility` where the browser has it, one native check
  per element instead of a computed style for each of its ancestors.

## Later

- The walk for stops does not enter a shadow root inside the scope, so a field inside a custom element at the
  scope's edge is not its first or last stop.
