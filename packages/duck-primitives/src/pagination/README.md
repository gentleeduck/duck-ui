# Pagination

Page state and the controls that move it.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/pagination` |
| API docs | [`duck-primitives/api/pagination.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/pagination.mdx) |
| Styled component | [`registry-ui/src/pagination`](../../../registry-ui/src/pagination) |
| Styled docs | [`duck-ui/components/pagination.mdx`](../../../../apps/duck/content/docs/duck-ui/components/pagination.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than Ark UI. Faster in 1 of 3 timed comparisons.

| | gentleduck | Ark UI |
|---|--:|--:|
| Size, gzipped bytes | 3,506 | 8,317 (0.42x) |
| Mount x100, ms | 12.0 | **10.5 (1.14x)** |
| Update x100, ms | 8.02 | 9.12 (0.88x) |
| Unmount x100, ms | 1.98 | **1.45 (1.36x)** |

Where gentleduck is behind:

- Unmount x100 against Ark UI: 1.36x, 0.528 ms more.
- Mount x100 against Ark UI: 1.14x, 1.46 ms more.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Ark UI 5.40.0.

Page 3 to page 5 of 10, with first, previous, the page range, next and last.
<!-- /benchmarks -->

## Tests

The stories cover buttons that track their own page; links that open on the page in the address; links a
client router follows without a reload; no pages at all; a compact pager with only Previous and Next; a page
controlled from outside, with its count, window and direction changed at runtime; and a range drawn by a
function with its own labels. The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test written for this module was proven by changing the code and watching a test fail. One change has no test
to fail: `getPaginationRange` returns every page at `2 * (boundaryCount + siblingCount) + 3` pages or fewer, and
returning them only below that count gives the same list, since the folded list at that count holds every page. The
suites taken from Ark UI run that library's own cases against this code. Each file's header names its source and
every case left out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 55 | `controls.test.tsx` 31, `pagination.ark.test.tsx` 5, `pagination.test.tsx` 7, `range.test.ts` 12 |
| End to end | 12 | `pagination.e2e.ts` 12 |
| registry-ui | 12 | `pagination-links.test.tsx` 4, `pagination-pages.test.tsx` 5, `pagination.test.tsx` 3 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>67 behaviours, one per test</summary>

**Unit, `controls.test.tsx`**

- Pagination pages
  - marks the page it starts on
  - starts on the first page
  - moves to a clicked page and reports it
  - folds the pages it cannot fit into ellipses
  - draws the window the root asks for
  - hands the range to a render function
- Pagination triggers
  - steps forward and back
  - jumps to either end
  - disables the triggers that would leave the range
  - stays inert until it knows how many pages there are
  - draws no pages and disables every trigger with no pages
  - moves nowhere with a page count that is not a number
  - marks each part with its slot
  - hands each part its element through a ref
  - does not submit the form it sits in
  - takes a label in place of its own
  - does not move when the handler prevents it
- Pagination outside the range
  - disables a page past either end, staying where it is and reporting nothing
  - gives a page link past either end no address
- Pagination controlled
  - asks for the page and waits for it
  - follows the page it is given
  - shows the first page for a page before it
  - shows the last page when the count shrinks below the page
- Pagination links
  - renders every control as a link to its page
  - keeps a link that would leave the range a link, with no address and no effect
  - moves to the page a link points at
  - runs no click handler on a link with nowhere to go, as a disabled button runs none
  - runs no click handler of a slotted link with nowhere to go
  - stays on its page when a click opens the link somewhere else
  - moves when a client router prevents the browser from following the link
- Pagination scope
  - reads the root its scope names over a nearer one

**Unit, `pagination.ark.test.tsx`**

- Ark UI pagination
  - has no axe violations, as buttons and as links
  - moves to the page clicked
  - moves to the next and the previous page from its triggers
  - renders its pages and triggers as buttons by default, and as links given an address for each page
  - takes anchor attributes on a trigger rendered as a link

**Unit, `pagination.test.tsx`**

- Pagination
  - renders with data-slot="pagination"
  - renders as a nav element
  - has default aria-label="pagination"
  - accepts custom aria-label
  - forwards ref
  - defaults to ltr direction
  - accepts rtl direction

**Unit, `range.test.ts`**

- getPaginationRange
  - lists every page when they all fit
  - lists every page when they all fit a wider window
  - folds as soon as one page does not fit
  - folds the far end into an ellipsis on the first page
  - folds both ends around a page in the middle
  - folds the near end into an ellipsis on the last page
  - shows the one page an ellipsis would hide
  - keeps the same number of items on every page, so the controls do not shift
  - widens the window with more siblings and boundary pages
  - leaves the ends out with no boundary pages
  - treats a page past either end as that end
  - has nothing to list with no pages

**End to end, `pagination.e2e.ts`**

- Pagination
  - keeps Next under the pointer while it pages through
  - follows a page link and opens on that page
  - leaves a link that goes nowhere out of the tab order
- Pagination client routing
  - moves to the page a client router opens, without a reload
- Pagination empty
  - draws no pages and leaves every trigger disabled
- Pagination compact
  - steps through the pages with only Previous and Next
- Pagination controlled
  - reports a click and follows a page set from outside
  - shows the last page when the count drops below the current one, with the triggers past it disabled
  - widens the window around the page and drops the end pages
  - lays the controls out right to left, Next before Previous
  - moves with the keyboard: Tab reaches a page and Enter goes to it
- Pagination custom range
  - draws the range its own way, with its labels, and keeps a disabled trigger inert

</details>
<!-- /behaviour -->

## Beyond what it had

- The root tracks its page: `pageCount`, `page`, `defaultPage` and `onPageChange`, with `siblingCount` and
  `boundaryCount` for how many pages show around the current one and at each end, as Ark's does. A page past
  either end shows as that end.
- `Pagination.Pages` draws those pages with an ellipsis per gap, and shows a gap of one page as the page.
  The list is the same length on every page, so the controls never move under the pointer.
- `Pagination.Page`, `First`, `Previous`, `Next` and `Last` move between pages, disable themselves at
  either end and get a default label.
- With `getPageHref` every control is a link, and one with nowhere to go loses its address and its tab
  stop. A child given through `asChild` keeps its own `href`, since `Slot` lets a child's props win, though a
  click on it does nothing.
- A control rendered as a link takes the link's own `target`, `rel`, `download` and `referrerPolicy`.
- `Content` and `Item` put the controls in a `ul` of `li`s inside the `nav`. Ark has no list parts.
- `getPaginationRange` returns the same list for code that does not mount the root.
- A disabled page or trigger runs no click handler, link or button, a slotted child's included, as a disabled
  button never does.
- A click with a modifier key opens a link somewhere else, so it leaves the page where it is.
- On a link, a click handler that prevents the browser following it, as a client router does to navigate
  itself, still moves the page. Only a button reads `preventDefault` as staying put.
- A `Pagination.Page` given a `value` outside `1` to `pageCount` is disabled, as Ark refuses it, so it
  neither moves the page nor links anywhere.

## Smaller and faster

- `Content` and `Item` read no context and write no `dir`, which the list takes from the nav. Each item
  skipped a context lookup.

## Breaking changes

- `Pagination.Content` and `Pagination.Item` carry no `dir` attribute, and render outside a root where they
  threw.
- `IPagination.IContext` has no `dir`.

## registry-ui

- `Pagination` takes the primitive's page props and `getPageHref`.
- `PaginationPages` draws the pages as `PaginationPage` buttons, each ellipsis the size of a page.
- `PaginationFirstTrigger`, `PaginationPreviousTrigger`, `PaginationNextTrigger` and
  `PaginationLastTrigger` disable themselves at either end and flip their chevrons right to left.
- The parts stop setting the `data-slot` the primitive already sets.
- The example that tracks its page puts each trigger in a `PaginationItem`, where its buttons sat straight
  in the list. New examples show links, a wider window drawn by a function, and `PaginationWrapper` wired to
  a page count.
- The existing links and `PaginationWrapper` are unchanged.

## Later

- Consolidate the registry-ui pagination parts.
- `PaginationLinkProps`, an alias of `IPaginationLinkProps`. Removing it is breaking.
- Ark's `count` and `pageSize` in place of `pageCount`, with `slice` for the current page's rows, and its
  page labels, "page 3" and "last page, page 10", where a page here is named by its number.
- Mounting and unmounting take longer than Ark's, as the benchmarks table shows: each pager here draws 24
  elements to Ark's 12, a list item around every control, which Ark leaves out.
