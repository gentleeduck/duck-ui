# Command

A search input over a list of items it filters as you type, with the highlight moved by the arrow keys.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/command` |
| API docs | [`duck-primitives/api/command.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/command.mdx) |
| Styled component | [`registry-ui/src/command`](../../../registry-ui/src/command) |
| Styled docs | [`duck-ui/components/command.mdx`](../../../../apps/duck/content/docs/duck-ui/components/command.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 3. Faster in all 9 timed comparisons.

| | gentleduck | Base UI | React Aria | cmdk |
|---|--:|--:|--:|--:|
| Size, gzipped bytes | 7,479 | 48,724 (0.15x) | 44,329 (0.17x) | 18,812 (0.40x) |
| Mount x100, ms | 21.4 | 40.2 (0.53x) | 147 (0.15x) | 22.4 (0.96x) |
| Type x100, ms | 8.76 | 32.0 (0.27x) | 30.1 (0.29x) | 14.7 (0.60x) |
| Unmount x100, ms | 2.08 | 3.17 (0.66x) | 5.50 (0.38x) | 2.16 (0.97x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Base UI 1.0.0-rc.0, React Aria 1.22.1 and cmdk 1.1.1.

Timed by typing, not by a prop: cmdk copies a controlled search into its store in an effect, so a redraw would time half its work. Each copy's input gets `item-1` and its input event, and the time runs until every copy shows only the match. React Aria's is its Autocomplete over a Menu, and Base UI's its Autocomplete drawn inline.
<!-- /benchmarks -->

## Tests

The stories cover groups with a separator, keywords and a disabled item; a list that loops; a custom filter
ranking a controlled highlight beside a forced "Create" item; a search the consumer runs itself, with loading
and a status; `fuzzyFilter`, alone and under a `limit`; a long list that scrolls; a list the pointer does not
highlight; a thousand rows drawn by a virtualizer; items rendered as links; a right-to-left command; a
`defaultValue`; the vim keys turned off; and a forced group. The end-to-end suite runs each in Chromium,
Firefox and WebKit.

Each test was proven by changing the code and watching a test fail.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 167 | `command.test.tsx` 167 |
| End to end | 22 | `command.e2e.ts` 22 |
| registry-ui | 14 | `command.test.tsx` 14 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>189 behaviours, one per test</summary>

**Unit, `command.test.tsx`**

- Command
  - renders with data-slot="command"
  - renders input with data-slot="command-input"
  - renders list with data-slot="command-list"
  - renders items with data-slot="command-item"
  - renders group with data-slot="command-group"
  - renders empty with data-slot="command-empty"
  - input has placeholder
  - items have role="option"
  - forwards ref
  - input has role="combobox"
  - input has aria-expanded="true"
  - input has aria-autocomplete="list"
  - input has aria-controls pointing to list
  - group has role="group"
  - group heading renders with data-slot="command-group-heading"
  - group has aria-labelledby pointing to heading
  - leaves a group without a heading unlabelled
  - items have data-value attribute
  - disabled item has aria-disabled and data-disabled
  - items are li elements
  - renders separator with data-slot="command-separator"
  - passes className to root
- Command keyboard
  - highlights the first item once the list mounts
  - moves down past disabled items and stops at the last
  - moves up past disabled items and stops at the first
  - jumps to the last and first items with End and Home
  - starts from the first item going down and the last going up when nothing is highlighted
  - selects the highlighted item on Enter
  - selects the item the mouse highlighted on Enter
  - leaves the keys to an input method that is composing text
  - lets Tab and Shift+Tab leave, so an inline command traps no keyboard user
  - selects nothing on the Enter Safari sends after composition, with keyCode 229
  - leaves Enter on a button inside it to the button
  - moves down on Ctrl+N and Ctrl+J and up on Ctrl+P and Ctrl+K
  - leaves Ctrl+N, Ctrl+J, Ctrl+P and Ctrl+K to the input with vimBindings off, and N to typing
  - jumps to the first item of the next group on Alt+ArrowDown and of the group before on Alt+ArrowUp
  - takes the items outside a group as a group of their own, and Alt+ArrowUp from inside a group to its start
  - jumps to the last item on Cmd+ArrowDown and the first on Cmd+ArrowUp
  - jumps to the last item on PageDown and the first on PageUp when the list does not scroll
  - moves a page of the list on PageDown and PageUp when it scrolls
  - does nothing on navigation keys when no item is visible
- Command filtering
  - hides the items that do not match and highlights the first that does
  - hides a group left with no match, and the separator after it, until the search clears
  - shows the empty state for a list with no items
  - shows the empty state only when nothing matches
  - hides nothing while shouldFilter is off, leaving the filtering to the caller
- Command item
  - highlights an item the mouse moves over and selects it on pointer up, once
  - leaves the highlight where it is as the mouse moves with disablePointerSelection, and still selects on a click
  - selects a touched item on the click, not the pointer up
  - selects an item a screen reader clicks after the mouse moved over it
  - leaves the highlight where it is when a touch moves over an item
  - highlights an item that takes focus
  - hands focus back to the input when the pointer leaves the focused item
  - keeps the highlight when the pointer leaves an item without focus
  - selects a focused item on Space, and keeps Space from scrolling
  - selects a focused item once on Enter
  - never selects a disabled item from its own keys
  - leaves Space to a typeahead a consumer is running
  - takes its search text from a text part when one names it, leaving the rest unsearched
  - is found by all it shows once its text part unmounts
  - is found by the text it shows now, not the text it first showed
  - is found by the text its text part shows now
  - is found by its textValue rather than what it shows
  - selects with an empty value when it names none
- Command input state
  - keeps every item when a controlled search refuses an edit
  - filters again when a controlled search is cleared without typing
  - names the highlighted option as the active descendant of the input
  - highlights the first match before the keystroke that filtered returns
- Command loop
  - stops at the ends without loop
  - wraps from one end to the other with loop
- Command.Item keywords
  - matches a search against its keywords as well as its text
- Command highlight value
  - tells onValueChange the value of each item the highlight moves to
  - stays quiet when the highlight moves between items of the same value
  - highlights the defaultValue item first, and the first item when it names none shown
  - highlights the item a controlled value names, and moves only once the owner takes the change
  - leaves the highlight empty when the owner clears it to an empty value
  - asks for the first match when a search hides the controlled item, and for none when nothing matches
  - asks for the first match on a search, keeping the controlled item highlighted until the owner moves it
  - asks for the first item when a controlled value names none, and highlights nothing for an empty one
- Command ranking
  - orders the matches by a custom filter, hides the ones it scores 0, and puts them back once the search clears
  - passes the filter the text, the search and the keywords
  - orders the groups by their best item, leaving each heading, separator and the empty state where they were
  - moves the highlight through the items in their ranked order
  - puts an item added under a ranked search back in its own place once the search clears
  - puts the items back in order when the filter is taken away under a search
- Command forceMount
  - shows a forced item whatever the search, beside the empty state, since it is no match
  - shows a forced group with its heading when none of its items match, until it stops forcing
- Command items changing
  - filters an item added under a search, and counts it for the empty state
  - filters again when an item is renamed under a search
  - moves the highlight to the first item when the highlighted one unmounts
  - keeps the highlight on its item while other items come and go
- Command input default
  - filters by the text an uncontrolled input starts with
- Command shouldFilter off
  - shows the empty state, and hides the group, once the caller renders no item
  - shows again the items a search hid once filtering is turned off
  - leaves an item the caller hides hidden
  - shows an empty state that mounts once a search of its own has settled on nothing
- Command renders
  - mounts in one render, with the first item highlighted
  - moves the highlight without rendering anything
  - filters as you type without rendering the items
  - writes the direction on the root alone, which the parts inherit
- useCommandSearch
  - reads the text typed into the input
  - names the highlighted item on an input drawn after the list
- Command matching
  - matches a search whatever its case and the accents on its letters
- fuzzyFilter
  - scores 1 an empty search, which every item matches
  - scores 0 a search whose letters the text does not hold in order
  - scores a match at the start over one at a word start, and that over one inside a word
  - scores letters side by side over letters spread apart, and the whole text over a part of it
  - finds the best of the places a search could start
  - matches by the best of the text and its keywords, ignoring case and accents
  - ranks the items of a command by how well they match
- Command.Loading
  - is a progress bar named Loading, at the progress it is given or with none
- Command list height
  - leaves the variable unset where there is no ResizeObserver
  - writes the height of the rows the list shows to --gentleduck-command-list-height as they change
- useCommandState
  - settles on a selector that returns a new object, where each read made a fresh one
  - reads the search, the highlighted value and how many items match
  - renders a reader only when what it picks changes
- Command.Status
  - tells a screen reader how many items match, through a function child
  - draws children that are not a function as they are
- Command limit
  - shows no more than limit matches, the best ranked first, and counts only those
  - shows a forced item beside the limit, and counts it only when it matches
  - leaves the items alone with shouldFilter off
- Command virtual list
  - moves past the rows drawn, bringing each one in through scrollToIndex
  - leaves Enter alone once the highlighted row has scrolled out of the DOM
  - stops asking a virtual list to scroll once it unmounts
  - wraps by index with loop
  - stops at the ends without loop
  - skips a disabled row whether it is drawn or brought in
  - jumps to the edges on PageDown and PageUp when nothing scrolls
  - keeps the highlight on a row scrolled out of the DOM, and draws it again when the row comes back
  - places each row in the whole list for a screen reader, and counts the rows not drawn
  - starts from the first row on ArrowDown and the last on ArrowUp when nothing is highlighted
  - stays where it is when every row past it is disabled
  - pages by the rows the scrolling box shows, past the rows drawn
  - pages one row at least when the box shows no more than the highlighted one
  - jumps to the last row on Meta with ArrowDown, and the first on Meta with ArrowUp
  - goes forward from a disabled first row on Home
  - asks for no row past the end when every row after the highlight is disabled
  - starts on the row defaultValue names
  - forgets a row it asked for once a search runs, controlled
- Command store
  - tells its readers of a change only, and nothing once they unsubscribe
- Command parts
  - carries the direction of a provider it is portalled out of
  - points the input at the list it controls
  - runs the root's own onKeyDown
  - lets the props on an item win over its own attributes
  - runs an item's own onClick
  - takes a disabled item out of the focus order
  - draws a separator a screen reader passes over
  - renders the empty state hidden on the server, as a status, since only the list in the browser knows what matches
- Command highlight marking
  - marks only the highlighted item selected
  - leaves the highlighted item alone when the list runs again with the same highlight
  - reports nothing when the pointer moves onto the value it already holds
  - starts on defaultValue, and on the first match once a search runs
  - keeps the highlight where the keys moved it when an item comes in under a search
  - moves the highlight off an item once it is disabled
- Command keys
  - moves only on Control with a vim key, so typing j or n reaches the search
  - keeps Enter from the page only when it picks an item
  - gives focus back to the input without scrolling when the pointer reaches a disabled item
- Command filtering again
  - filters again only when an item changes what it shows, not each time it renders
  - filters again when an item changes its keywords under a search
  - shows a group once it starts forcing, under a search none of its items match
  - leaves the order and the count alone with a filter while shouldFilter is off
- Command ranking order
  - ranks a group by its best match, not its last
  - puts tied matches back in their own order after a search that moved them
  - leaves the items in the order React gives them once a search that moved them clears
- fuzzyFilter scoring
  - scores a letter at the start of a word over one inside a word
  - keeps the best of the places the search could start
  - gives up at once on a long text missing a letter of the search

**End to end, `command.e2e.ts`**

- Command
  - filters as you type, and hides a group and shows the empty state once nothing matches
  - finds an item by a keyword it does not show
  - moves the highlight with the arrow keys, Home and End, past a disabled item, and names it to the input
  - moves on Ctrl+N, Ctrl+P, Ctrl+J and Ctrl+K, by group on Alt and to an end on Meta
  - writes the height of the rows it shows to --gentleduck-command-list-height
  - selects the highlighted item on Enter, and an item on a click
  - highlights the item under the mouse
  - wraps the highlight from one end to the other with loop
  - orders the matches by their score, and keeps a Create item beside the empty state
  - moves a controlled highlight through its owner
  - highlights the results of its own search as they arrive, and shows the empty state without them
  - finds an item by letters in order, best first, whatever their case and accents
  - shows the best few matches up to its limit, and announces how many
  - moves a page of a scrolling list on PageDown and PageUp, keeping the item in view
  - leaves the highlight where it is under the mouse with disablePointerSelection, and still selects a click
  - moves through a virtual list past the rows drawn, placing each in the whole list
  - keeps a virtual row highlighted while it is scrolled away, and draws it again when it is back
  - follows a link item on Enter
  - writes the direction on the root alone, which the parts inherit
  - highlights the item defaultValue names first, and the best match once a search starts
  - leaves Ctrl+N to the input with vimBindings off, and still moves on the arrows
  - keeps a forceMount group and its heading through any search, beside the empty state

</details>
<!-- /behaviour -->

## Beyond what it had

| Feature | Where | As in |
|---|---|---|
| Wrap the highlight from the last item to the first and back | `loop` on the root | cmdk |
| More words an item is found by, such as aliases | `keywords` on `Command.Item` | cmdk |
| Score, rank and sort the matches | `filter` on the root | cmdk |
| Find by the letters of the search in order, closest first | `fuzzyFilter`, passed as `filter` | cmdk's command-score |
| Ignore case and accents when matching | the default filter and `fuzzyFilter` | Base UI's collator |
| Control the highlight by value | `value`, `defaultValue`, `onValueChange` on the root | cmdk |
| Show an item or group whatever the search | `forceMount` on `Command.Item` and `Command.Group` | cmdk |
| Read the search | `useCommandSearch()` | cmdk's `useCommandState` |
| Read the search, the highlight and the count by a selector | `useCommandState(selector)` | cmdk |
| Announce how many match | `Command.Status` | Base UI's `Combobox.Status` |
| Mark the list as loading | `Command.Loading` | cmdk |
| Show only the best matches | `limit` on the root | Base UI |
| Ctrl+N and Ctrl+J down, Ctrl+P and Ctrl+K up | `vimBindings` on the root, on by default | cmdk |
| Alt+Arrow to the next or previous group | the root's keys | cmdk |
| Meta+Arrow to the last or first item | the root's keys | cmdk |
| PageUp and PageDown | the root's keys | React Aria |
| Leave the highlight where it is as the mouse moves | `disablePointerSelection` on the root | cmdk |
| The height of the rows shown, to animate the list | `--gentleduck-command-list-height` on `Command.List` | cmdk's `--cmdk-list-height` |
| Draw only the rows in view | `virtual` on `Command.List`, `index` on `Command.Item` | Base UI's `virtualized` combobox |

- `loop` on the root moves the highlight from the last item to the first and back, as in cmdk.
- `keywords` on an item are more words a search matches it by, such as aliases, as in cmdk.
- `filter` on the root scores each item against the search: 0 hides it, and a higher score sorts it first,
  as in cmdk. Items and groups trade the places they hold among their parent's children, so a heading, a
  separator or `Command.Empty` stays put and a group moves by its best item. Clearing the search puts every
  item back in its own place, one added under the search included.
- `value`, `defaultValue` and `onValueChange` on the root control the highlight by the items' `value`, as in
  cmdk. Under `value` the command asks for each move and makes it once the owner passes it back.
- `forceMount` on an item or a group shows it whatever the search, as in cmdk. A forced item is no match, so
  `Command.Empty` shows beside a "Create" item.
- `useCommandSearch` reads the search from anywhere in the command, for a list that renders its own matches
  under `shouldFilter={false}`.
- `fuzzyFilter` finds an item by the letters of the search in order, so "apl" finds "Apple". It ranks a match
  at the start of the text first, then at the start of a word, then letters side by side, and a shorter text
  over a longer one. It is opt-in, where cmdk scores this way by default, so a command that does not import
  it does not ship it.
- The default filter and `fuzzyFilter` ignore case and accents, so "cafe" finds "Caf&eacute;".
- `useCommandState(selector)` reads `search`, the highlighted `value` and `count`, the matches shown, and
  renders again only when what the selector picks changes. `Command.Status` announces `count` in a polite,
  atomic `status` region, its children a node or a function of the count.
- `Command.Loading` is a `progressbar` named "Loading", with `progress` from 0 to 100 as its value.
- `limit` caps the matches the list shows, the best ranked first. A `forceMount` item shows beside them, and
  `count` is of the matches shown.
- Ctrl+N and Ctrl+J move the highlight down and Ctrl+P and Ctrl+K up unless `vimBindings={false}`.
  Alt+ArrowDown goes to the first item of the next group, and Alt+ArrowUp to the first item of the
  highlighted one's group, or from there of the group before; items outside a group count as one group.
  Meta+ArrowDown and Meta+ArrowUp go to the last and first item. PageDown and PageUp move by the height of the
  nearest box that scrolls the items, or to the last and first item when nothing scrolls.
- `disablePointerSelection` leaves the highlight where it is as the mouse moves. A click still selects.
- `Command.List` writes the height of the rows it shows to `--gentleduck-command-list-height`, measuring the
  rows rather than the list so the list's own height can follow it. A DOM with no `ResizeObserver` leaves it
  unset.
- `virtual={{ count, scrollToIndex }}` on `Command.List` is for a list a virtualizer draws a few rows of.
  Each item takes its `index`, written as `aria-posinset` with `count` as `aria-setsize`. The keys move by
  index, and a row they reach that is not drawn is brought in through `scrollToIndex` and highlighted once it
  mounts, passing over a disabled one. A page is as many rows as the scrolling box shows, and Alt+Arrow moves
  one row, since no group is known past the rows drawn. A highlighted row scrolled out of the DOM stays
  highlighted, without `aria-activedescendant` while it is gone. The caller filters, under
  `shouldFilter={false}`, and `count` is `virtual.count`.

## Fixed

- Tab and Shift+Tab leave the command, which cancelled both, so a keyboard user could not get past an inline
  palette. A dialog around one still holds focus inside it.
- The Enter Safari sends to confirm an input method's text, after `compositionend` with `keyCode` 229, selects
  nothing, and Enter on a button or a field inside the command is left to it.
- A controlled input searches by the value its owner commits, so an edit the owner refuses no longer filters the
  list on text the input does not show. An owner clearing the highlight to `''` keeps none highlighted.
- `useCommandState` keeps what its selector returned until the state changes, so a selector returning an object no
  longer makes a fresh one on every read, which React reads as a store that never settles.
- A virtual row scrolled out of the DOM is not clicked by Enter, and a virtual list that unmounts takes its
  virtualizer and its pending move with it.
- The input names the highlighted option in `aria-activedescendant`. Focus stays in the input, so a screen
  reader announced nothing as the arrow keys moved.
- A controlled `value` on the input filters the list whenever it changes. Clearing it from outside the input
  left the list filtered on the old text.
- An uncontrolled input filters the list by the text its `defaultValue` gives it. The list showed every item
  until the first keystroke.
- A focused item is selected once on Enter. The item selected it and the root then clicked it again. The
  root owns Enter and clicks the highlighted item, so an item rendered as a link follows it.
- Enter selects the item the mouse highlighted, and a screen reader's click, which has no pointer behind it,
  selects too. A mouse hover left an item ignoring every click but its own pointer up.
- While an input method is composing text, the command leaves every key to it, so the Enter that confirms a
  word selects nothing.
- The filter reads the text an item shows now, or its text part's, and the `textValue` it has now. An item
  kept the first text it rendered, so a renamed one was found only by its old name, and a changed
  `textValue` was ignored.
- A list with no items shows `Command.Empty`, which stayed hidden.
- The highlight moves to the first match in the commit that filters the list. The list set it in a render of
  its own in a later task, so the input's `aria-activedescendant` could name an item the filter had just
  hidden, and about fifty commands typed into in one task ran past React's limit on nested updates and threw.
- The list filters again when an item mounts, unmounts or changes its text, `value`, `keywords`, `disabled` or
  `forceMount`. It filtered only when the search changed, so an item added under a search showed until the
  next keystroke, and with `shouldFilter` off `Command.Empty` never showed.
- Turning `shouldFilter` off shows the items a search had hidden, and leaves alone an item its owner hides.
- A highlighted item that unmounts hands the highlight to the first item, where it left none.
- `Command.Empty` mounted after the list, as `{!loading && <Command.Empty>}`, shows when nothing matches. It
  mounted hidden and stayed hidden until an item changed.

## Smaller and faster

- The filter lowercases the search once per pass rather than once per item.
- An item drops a blur handler that did nothing and a second Enter path.
- An item mounts in one render, where storing its search text in state from a ref took two more.
- A command mounts in one render. The first item's highlight was state the list set once it had collected its
  items, which took a second render in a later task. The highlight is now written to the DOM: moving it sets
  `data-highlighted` and `aria-selected` on the two items it leaves and reaches, and the input's
  `aria-activedescendant`, and renders nothing. A hundred mount in 0.96 of cmdk's time and filter as you type
  in 0.60, with every feature above.
- The direction is written on the root alone, which the parts inherit, where every part wrote it again.

## Breaking changes

- Enter on a focused item goes through the root, so a root `onKeyDown` that prevents Enter's default keeps
  the item from being selected.
- The root context drops `selectedItem`, `selectedValue`, `selectedText`, `setSelectedItem`, `search` and
  `dir`. The search is `useCommandSearch()`, the highlighted item `highlightedRef.current`, and
  `highlight(item)` moves it.
- `Command.Root` takes `value` and `defaultValue` as the highlighted item's value, where they fell through
  to the `div`.
- Ctrl+N, Ctrl+P, Ctrl+J and Ctrl+K in the input move the highlight, where they reached the input. Pass
  `vimBindings={false}` to leave them to it.

## registry-ui

- `Command`, `CommandDialog` and `MotionCommandDialog` take `loop`; `CommandItem` and `MotionCommandItem`
  take `keywords`.
- `MotionCommandDialog` is exported. It was written but unreachable, and takes `title` and `description` as
  `CommandDialog` does. Both share `ICommandDialogProps`.
- The parts stop setting the `data-slot` the primitive already sets. `CommandList` drops a `command-list`
  slot its scroll area overwrote.
- Breaking: the input wrapper's slot is `command-input-wrapper`, where it repeated the input's
  `command-input`.
- `CommandDialog` and `MotionCommandDialog` take `filter`, `value`, `defaultValue` and `onValueChange`.
- Breaking: `useCommandListContext` is gone. It returned the root's context under the list's name, and its
  one use read the search, which is `useCommandSearch()`, exported in its place.
- Two examples: a ranked palette with a "Create" item and a controlled highlight, and a palette whose
  results come from a search of its own.
- `CommandDialog` and `MotionCommandDialog` take `vimBindings`, `disablePointerSelection` and `limit`.
- `CommandLoading` draws `Command.Loading` as a muted row. `CommandStatus` draws `Command.Status` as
  `sr-only`, and a class such as `not-sr-only` shows it.
- `useCommandState` and `fuzzyFilter` are exported.
- `MotionCommandItem` keeps `index` as its entrance delay and does not pass it on, so a virtual list uses
  `CommandItem`.
- The search example shows `CommandLoading` and `CommandStatus`, and a new one ranks by `fuzzyFilter` with
  a `limit` of four.
