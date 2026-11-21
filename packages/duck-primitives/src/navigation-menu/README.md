# Navigation Menu

A site navigation bar whose items open panels of links.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/navigation-menu` |
| API docs | [`duck-primitives/api/navigation-menu.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/navigation-menu.mdx) |
| Styled component | [`registry-ui/src/navigation-menu`](../../../registry-ui/src/navigation-menu) |
| Styled docs | [`duck-ui/components/navigation-menu.mdx`](../../../../apps/duck/content/docs/duck-ui/components/navigation-menu.mdx) |

## Benchmarks

<!-- benchmarks -->
Smaller than all 3. Faster in all 9 timed comparisons.

| | gentleduck | Radix | Base UI | Ark UI |
|---|--:|--:|--:|--:|
| Size, gzipped bytes | 10,048 | 12,837 (0.78x) | 39,429 (0.25x) | 19,523 (0.51x) |
| Mount x100, ms | 23.3 | 48.7 (0.48x) | 188 (0.12x) | 45.1 (0.52x) |
| Update x100, ms | 15.9 | 42.2 (0.38x) | 108 (0.15x) | 86.6 (0.18x) |
| Unmount x100, ms | 3.07 | 7.41 (0.41x) | 9.86 (0.31x) | 4.40 (0.70x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.2.22, Base UI 1.0.0-rc.0 and Ark UI 5.40.0.
<!-- /benchmarks -->

## Tests

The stories cover a horizontal and a vertical menu, right to left, manual activation, content inline and in
the viewport, links that keep the menu open, and every part force mounted; the three delays; the viewport's own
children, with and without `asChild`; and a sub-menu in each activation mode, closing on a second click or not.
The end-to-end suite runs each in Chromium, Firefox and WebKit.

Each test written for this module was proven by changing the code and watching a test fail. One change has no test
to fail: the viewport dropping the element of a content that has unmounted. When another item opens, the viewport
moves to that item's element, so a stale one is never measured in place of a live one, and dropping it only lets it
be collected. When the open item unmounts and a controlled `value` keeps naming it, nothing replaces the old
element, and the viewport keeps measuring it until the value changes. The suites taken from Base UI run that
library's own cases against this code. Each file's header names its source and every case left out, and not every
case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 160 | `navigation-menu.base-ui.test.tsx` 14, `navigation-menu.radix.test.tsx` 40, `navigation-menu.test.tsx` 106 |
| End to end | 25 | `navigation-menu.e2e.ts` 25 |
| registry-ui | 7 | `navigation-menu.test.tsx` 7 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>185 behaviours, one per test</summary>

**Unit, `navigation-menu.base-ui.test.tsx`**

- Base UI navigation menu &gt; roles
  - puts no aria-orientation on its list or its root
- Base UI navigation menu &gt; opening
  - opens on a mouse hover, and not on a touch one
  - opens on a click, whatever the pointer
  - moves to another item on a click of its trigger, staying open
  - waits for its delay before opening on hover, and its close delay before closing
  - opens by no means while its trigger is disabled
- Base UI navigation menu &gt; value
  - starts on its defaultValue, and tells onValueChange each item opened
  - follows a controlled value
- Base UI navigation menu &gt; focus
  - gives focus back to its trigger when Escape closes it
  - leaves focus where it is when the pointer leaving closes it
- Base UI navigation menu &gt; links
  - marks an active link as the current page, and no other
  - closes the menu on a click of a link, and keeps it open with closeOnSelect off
  - stays open when a link loses focus to nothing, as the window does
- Base UI navigation menu &gt; list
  - moves on from the focused trigger once an item before it is removed

**Unit, `navigation-menu.radix.test.tsx`**

- aria-controls
  - should not reference a non-existent element while closed
  - should reference the rendered content while open
- NavigationMenu activationMode &gt; "automatic" activationMode
  - opens the item on pointer enter
  - toggles item on click
- NavigationMenu activationMode &gt; "manual" activationMode
  - does not open on pointer enter
  - toggles item on click
- NavigationMenuSub activationMode &gt; "automatic" activationMode
  - opens the item on pointer enter
- NavigationMenuSub activationMode &gt; "manual" activationMode
  - does not open on pointer enter
  - opens the item on click
- NavigationMenuSub activationMode &gt; inheritance
  - inherits "manual" from the parent NavigationMenu
  - inherits "automatic" from the parent NavigationMenu
  - overrides inherited "manual" with activationMode="automatic"
  - overrides inherited "automatic" with activationMode="manual"
- NavigationMenuSub disableToggle
  - does not close an open item when clicking its trigger by default
  - keeps an open item open on click in manual mode by default
  - closes an open item when clicking its trigger with disableToggle={false}
  - closes an open item on click with disableToggle={false} in manual mode
- NavigationMenu ref stability
  - keeps a stable composed ref on the root
  - keeps a stable composed ref on viewport content
- focus outside
  - should not dismiss an open menu when focus moves between elements outside the menu
  - should dismiss an open menu when focus actually leaves the menu
- NavigationMenu.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- NavigationMenu.Sub
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- NavigationMenu.List
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- NavigationMenu.Item
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- NavigationMenu.Trigger
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- NavigationMenu.Link
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- NavigationMenu.Content
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- NavigationMenu.Indicator
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- NavigationMenu.Viewport
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
  - renders the active content inside the child element when `asChild` is set

**Unit, `navigation-menu.test.tsx`**

- NavigationMenu
  - renders with data-slot="navigation-menu"
  - renders as a nav element
  - renders list with data-slot="navigation-menu-list"
  - renders link with data-slot="navigation-menu-link"
  - renders open content with data-slot="navigation-menu-content", in the item and in the viewport
  - link sets data-active when active
  - forwards ref to nav
  - passes className
  - list renders as ul element
  - link without active has no data-active
  - renders multiple items
- NavigationMenu pointer
  - opens 200ms after the pointer rests on a trigger by default
  - closes 150ms after the pointer leaves the trigger by default
  - waits closeDelay after the pointer leaves before it closes
  - stays open when the pointer moves from the trigger into the content
  - opens the next item at once while one is open
  - keeps the next item open past the close the last one started
  - keeps an item that waited out its delay open past the close the last one started
  - cancels every close still to come once the pointer reaches the content
  - opens on time while the pointer keeps moving over the trigger
  - opens nothing when the pointer leaves the trigger before the open delay runs out
  - opens only the trigger the pointer reached last when leaving the first was prevented
  - changes nothing once it unmounts with an open or a close still to come
  - closes once a mouse leaves the content in its item, and stays open when a touch does
  - closes once a mouse leaves the content in the viewport, and stays open when a touch does
  - keeps an open item when the pointer comes back to its trigger before it closes
  - stays shut under the pointer after a click closes it, and opens again once the pointer comes back
  - stays shut under the pointer after Escape closes it, and opens again once the pointer comes back
  - leaves the open item for its trigger when another trigger is pressed
  - closes on a press outside the menu
  - stays open on a press on the viewport around the content
  - leaves focus where it was when a menu the pointer opened closes
  - ties the open trigger and its content together by id
  - renders no focus proxy and nothing owning a content while every item is closed
  - leaves an item a double-click closed shut once the open delay the pointer started runs out
- NavigationMenu link select
  - closes the menu once a link is selected
  - stays open when onSelect prevents the default
  - selects and closes when the link prevents its own click, as a client-side router does
  - commits what onSelect sets together with the close
  - stays open after a link is selected with closeOnSelect={false}
  - stays open after a link is clicked with Cmd held, which opens it outside the page
  - stays open after a link is clicked with Ctrl held, which opens it outside the page
  - stays open after a link is clicked with Shift held, which opens it outside the page
  - stays open after a link is clicked with Alt held, which opens it outside the page
- NavigationMenu manual activation
  - drops an open the pointer scheduled once the menu turns manual
  - keeps a clicked item open after the pointer leaves its trigger and the viewport
- NavigationMenu viewport size
  - takes the size of the open content, not of another one kept mounted
  - measures once for several resizes reported in one frame
  - drops a measure still to come for a content another one replaced
  - takes a later resize of the open content a frame after it is reported
- NavigationMenu keyboard
  - moves focus into open content on ArrowDown
  - enters vertical content on the arrow pointing away from the start edge
  - moves between triggers with the arrows, Home and End, in the key press, keeping the page still
  - moves to the next trigger on ArrowDown while the trigger is closed
  - reads ArrowLeft as the next trigger right to left
- NavigationMenu content tab order
  - tabs through its links and hands the last Tab to the focus proxy
  - hands a Tab from a link inside a shadow root on to the focus proxy, not back to the first link
  - tabs backwards through its links with Shift+Tab
  - takes its links out of the tab order when focus moves back to the trigger
  - takes the links of a content kept mounted out of the tab order when Escape closes it
  - enters the content at its first link when focus comes to the proxy from the trigger
  - gives a link back its place in the tab order without leaving a tabindex behind
  - enters the content at its last link when focus comes back to the proxy from the next trigger
- NavigationMenu vertical indicator
  - stays drawn, as hidden, once its item closes when force mounted
  - keeps following the trigger it left once its item closes, when force mounted
  - measures height and slides down the track
  - moves with its trigger when only the track reports a resize
  - measures the open trigger from the track, through a positioned item around it
- NavigationMenu content opened under focus
  - moves into content a click opened on the focused trigger with ArrowDown
- NavigationMenu skip delay
  - waits out the open delay again once the skip delay has passed since an item closed
  - opens the next item at once inside the skip delay after one closed
  - keeps skipping the open delay once an item opens inside the skip delay
- NavigationMenu sub menu
  - tells onValueChange which sub item a click opened
  - keeps both open on a press in the top content outside the sub content
  - hands focus straight to the top trigger when a link in a sub content is chosen
  - closes the whole menu on Escape in a sub content opened after the top one
  - moves from a link in the top content to the sub triggers with the arrows
  - takes pointer events from a closed content kept mounted, but not from a closed sub content
  - closes the whole menu on Escape inside a sub menu and hands focus to the top trigger
- NavigationMenu items without a value
  - opens only the item pressed when no item names a value
- NavigationMenu motion
  - horizontal and ltr, moving back an item slides the contents the way the row runs on screen
  - vertical and ltr, moving back an item slides the contents the way the row runs on screen
  - vertical and rtl, moving back an item slides the contents the way the row runs on screen
  - horizontal and rtl, moving back an item slides the contents the way the row runs on screen
  - leaves the slide on a content neither opening nor closing
  - slides nothing out when the whole menu closes
- NavigationMenu pointer types
  - leaves a touch moving over a trigger to the press
- NavigationMenu disabled trigger
  - marks only the disabled trigger with data-disabled
  - keeps the open item when the pointer leaves a disabled trigger
- NavigationMenu skip delay off
  - waits out the open delay between items when skipDelayDuration is 0
- NavigationMenu keyboard edges
  - keeps focus on the first trigger on Home
  - passes over a link whose element never takes the ref
  - stays on an open trigger that has no content on ArrowDown
  - leaves Ctrl+Tab in the content to the browser
  - leaves Alt+Tab in the content to the browser
  - leaves Cmd+Tab in the content to the browser
  - lets focus leave a content whose element never takes the ref
  - lets something in the content move focus out of it as the content unmounts
- NavigationMenu viewport contents
  - drops the content of an item that leaves, under StrictMode
  - marks which content in the viewport is open, so one kept mounted can be hidden
  - keeps the content it closed while force mounted, closed to the pointer
  - keeps the element of a content in the viewport on its ref while other items open
  - closes once on Escape under StrictMode
- NavigationMenu orientation and direction
  - marks every part with the orientation and direction it runs in
- NavigationMenu parts that cannot reach an element
  - leaves focus on a link outside any list when an arrow key is pressed on it
  - moves to another content beside a trigger slotted onto a component that drops its ref

**End to end, `navigation-menu.e2e.ts`**

- NavigationMenu
  - opens on hover, sizes the viewport to the open content, and moves to the next item at once
  - draws the indicator under the open trigger, not under the first one
  - closes once a link is chosen
  - stays open after a link is clicked with Shift held, which opens it outside the page
  - stays open after a link is chosen when asked to keep open on select
  - force mounted, keeps every content in the document and shows only the open one
  - tabs from a trigger through its links and on to the next trigger, and Escape returns to the trigger
  - passes over a disabled trigger with the arrows, and opens nothing under the pointer
  - in manual mode opens on a click only, and stays open once the pointer leaves
  - without a viewport, draws the content in its item
  - vertical, moves between triggers on the up and down arrows and enters content on the right one
  - right to left, moves to the next trigger on ArrowLeft
- NavigationMenu timing
  - waits delayDuration before it opens the item under the pointer
  - keeps an item open for closeDelay after the pointer leaves it
  - leaves an item a double-click closed shut once the open delay the pointer started runs out
  - with no skipDelayDuration, waits out the open delay again from one item to the next
- NavigationMenu viewport children
  - draws its own children before the content
  - with asChild, is its child element and draws the content inside it, sized to the content
- NavigationMenu sub menu
  - opens the sub item under the pointer in place of its default
  - in manual mode, opens a sub item on a click only
  - takes the root's manual mode unless given its own
  - opens the sub item under the pointer when given automatic under a manual root
  - keeps the open sub item when its trigger is clicked again
  - closes the open sub item when its trigger is clicked again, when asked to
  - closes the whole menu on Escape inside the sub menu and hands focus to the top trigger

</details>
<!-- /behaviour -->

## Beyond Radix

- `activationMode` on the root and on `NavigationMenu.Sub`: `automatic` opens an item when the pointer rests
  on its trigger, `manual` only on a click. A sub-menu takes the root's mode unless given its own.
- `disableToggle={false}` on a sub-menu closes an open item when its trigger is clicked again.
- `closeDelay` on the root, as in Base UI and Ark: how long an item stays open after the pointer leaves
  it. It defaults to `150`, the delay Radix hardcodes.
- `closeOnSelect={false}` on a link keeps the menu open once the link is selected, as on a menu item.
- The viewport renders its own children before the content, and with `asChild` it renders the content
  inside the child element.

## Fixed

- Passes every Radix navigation-menu test.
- The trigger sets `aria-controls` only while its content is open.
- Focus moving outside the menu closes it only when focus left from inside the menu, so a dialog that
  focuses itself on open leaves the menu open.
- Content finds its tabbable links with the same function `FocusScope` uses, so it skips what is hidden,
  inert or in a disabled fieldset.
- Content carries `data-slot="navigation-menu-content"`, where it carried its focus group's
  `navigation-menu-group`.
- A link taken out of the tab order while its content is closed gets its own `tabindex` back, or none if
  it had none, where it was left with an empty `tabindex` and a `data-tabindex` copy.
- A Tab from a link inside a shadow root moves on through the content, where the content read the shadow host as
  focused, found no link, and sent focus back to the first one.
- Turning `activationMode` to `manual` drops an open or close a hover had already scheduled.
- A link clicked with Ctrl, Shift or Alt held leaves the menu open, as one clicked with Cmd did, since it
  opens in another tab or window, or downloads, and the page stays.
- A click on a trigger cancels the open its pointer started, so an item a double-click closed no longer
  opens again once the delay runs out.
- Content in the viewport carries `data-state`, as content outside it did, so a force-mounted content can
  be hidden while closed.

## Smaller and faster

- The viewport writes its size variables onto its node rather than keeping the size in state, so a resize
  rerenders none of the content, and it takes the size from the resize observer's first report, before the
  first paint, rather than forcing a layout while React commits.
- Each content in the viewport keeps its ref while other items open, where every viewport render detached and
  reattached it and reset the layers inside.
- Choosing a link commits what `onSelect` sets together with the close, where `flushSync` forced a commit for
  each.
- The arrow keys, Home and End move focus during the key press, where focus moved a task later.
- Whether the next item skips its open delay is a ref, so the skip delay running out rerenders nothing.
- Layers hold no state and share one listener per event type, so unmounting 100 open menus takes 0.42 of
  Radix's time.
- The part props live in `INavigationMenu`, and each element is typed as its DOM element.
- Triggers and links register in a set a key press sorts into document order, where two collections wrapped
  each trigger in two slots and each link in one.

## Breaking changes

- Children passed to `NavigationMenu.Viewport` render, where they were dropped.
- The viewport's size variables are `--gentleduck-navigation-menu-viewport-width` and
  `--gentleduck-navigation-menu-viewport-height`, where they were `--radix-`.
- `INavigationMenu.NavigationMenuElement`, `NavigationMenuTriggerElement`, `NavigationMenuContentImplElement` and
  `NavigationMenuViewportElement` are `RootElement`, `TriggerElement`, `ContentImplElement` and `ViewportElement`.
- `INavigationMenu.IProviderPrivateProps` is gone. Its props are `INavigationMenu.IProviderProps`, which
  extended it and added nothing.
- Triggers and links carry no `data-collection-item` attribute, and `INavigationMenu.FocusGroupItemElement` is
  gone.

## registry-ui

- `NavigationMenuLink` draws an `active` link highlighted. Its classes matched `data-active="true"`, which
  the primitive never sets.
- `NavigationMenuViewport` sizes itself from the renamed variables.
- The exported prop types are the primitive's own, so `closeDelay` and `closeOnSelect` reach the styled
  parts, and the parts stop repeating the `data-slot` the primitive already sets.
- `MotionNavigationMenu` renders `NavigationMenu` inside its animation rather than a copy of it.
- `MotionNavigationMenu` keeps the viewport mounted until its exit spring settles, where a short exit from the
  motion provider removed it mid-animation.
- The sidebar examples size their dropdown menus from `--gentleduck-dropdown-menu-trigger-width`, where
  they read a Radix variable nothing sets.

## Later

- Base UI's `onOpenChangeComplete` and `actionsRef`.
- The registry-ui `NavigationMenu*Props` names are now plain aliases of the primitive's props. Removing
  them is breaking.
- A content given a new `ref` keeps handing its element to the first one until it mounts again, because
  `Presence` keeps one ref for the life of a node.
- With a viewport, a content open on mount renders in its item for one commit before it moves into the
  viewport, as in Radix, so its refs attach twice and its layers mount twice. Nothing paints in between.
