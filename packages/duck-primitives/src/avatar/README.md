# Avatar

An image with a fallback shown until it loads or when it fails.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/avatar` |
| API docs | [`duck-primitives/api/avatar.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/avatar.mdx) |
| Styled component | [`registry-ui/src/avatar`](../../../registry-ui/src/avatar) |
| Styled docs | [`duck-ui/components/avatar.mdx`](../../../../apps/duck/content/docs/duck-ui/components/avatar.mdx) |

Base UI, Ark UI and zag offer the same three parts, a fallback delay and a status callback, so no rival feature was missing.

## Benchmarks

<!-- benchmarks -->
Smaller than all 3. Faster in 5 of 9 timed comparisons.

| | gentleduck | Radix | Base UI | Ark UI |
|---|--:|--:|--:|--:|
| Size, gzipped bytes | 2,541 | 3,108 (0.82x) | 2,694 (0.94x) | 7,180 (0.35x) |
| Mount x100, ms | 1.14 | 1.14 (0.99x) | **1.04 (1.09x)** | 2.74 (0.41x) |
| Update x100, ms | 0.873 | **0.824 (1.06x)** | **0.783 (1.11x)** | 1.76 (0.50x) |
| Unmount x100, ms | 0.360 | **0.350 (1.03x)** | 0.413 (0.87x) | 0.760 (0.47x) |

Where gentleduck is behind:

- Update x100 against Base UI: 1.11x, 0.090 ms more.
- Mount x100 against Base UI: 1.09x, 0.090 ms more.
- Update x100 against Radix: 1.06x, 0.049 ms more.
- Unmount x100 against Radix: 1.03x, 0.010 ms more.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.2.6, Base UI 1.0.0-rc.0 and Ark UI 5.40.0.
<!-- /benchmarks -->

## Tests

The stories cover an image that loads, reporting each status it passes through; one that fails; one with no
source; a fallback held back by `delayMs`; and a source that changes from broken to loaded and back. The end-to-end
suite runs each in Chromium, Firefox and WebKit.

Each test written for this module was proven by changing the code and watching a test fail. Setting `src` before
`loading` and `crossOrigin` fails no test, since React 19, which the suite runs, sets an image's `src` last itself.
The suites taken from Ark UI and Base UI run that library's own cases against this code. Each file's header names
its source and every case left out, and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 75 | `avatar.ark.test.tsx` 2, `avatar.base-ui.test.tsx` 5, `avatar.radix.test.tsx` 35, `avatar.test.tsx` 33 |
| End to end | 5 | `avatar.e2e.ts` 5 |
| registry-ui | 18 | `avatar.test.tsx` 16, `motion-avatar.test.tsx` 2 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>80 behaviours, one per test</summary>

**Unit, `avatar.ark.test.tsx`**

- Ark UI avatar
  - has no axe violations
  - shows its initials when given no src

**Unit, `avatar.base-ui.test.tsx`**

- Base UI avatar fallback delay
  - shows the fallback once its delay has passed
  - shows the fallback at once with a delay of 0
  - shows the fallback once its delay changes to 0
  - keeps a shown fallback shown when a delay is given later
  - keeps a shown fallback shown as its delay goes from a number to none and back

**Unit, `avatar.radix.test.tsx`**

- given an Avatar with fallback and no image
  - should have no accessibility violations
  - should work with SSR
- given an Avatar with fallback and an image
  - should render the fallback initially
  - should not render the image initially
  - should render the image after it has loaded
  - should have alt text on the image
  - does not leak event listeners
  - can handle changing src
  - should render the image immediately after it is cached
  - should not render image with no src
  - should not render image with empty string as src
  - should render the fallback again after a loaded image unmounts
  - should show fallback if image has no data
  - should show the fallback if a loaded image reports no natural size
- given an Avatar with fallback and an image &gt; onLoadingStatusChange
  - is called with "loaded" once the image loads
  - is called with "error" when there is no src
  - is not called with "idle" while the image is mounted
- given an Avatar with fallback and an image &gt; SSR
  - can render with working image
  - can render with no src
- given an Avatar with fallback and delayed render
  - should not render a fallback immediately
  - should render a fallback after the delay
- given an Avatar with an image that only works when referrerPolicy=no-referrer &gt; referrerPolicy=no-referrer
  - should render the fallback initially
  - should not render the image initially
  - should render the image after it has loaded
  - should have alt text on the image
- given an Avatar with an image that only works when referrerPolicy=no-referrer &gt; referrerPolicy=origin
  - should render the fallback initially
  - should never render the image
- given an Avatar with multiple images (development)
  - warns that multiple images are not supported
  - does not warn for a single image
- Avatar.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Avatar.Image
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- Avatar.Fallback
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set

**Unit, `avatar.test.tsx`**

- Avatar
  - renders with data-slot="avatar"
  - renders as a span
  - forwards ref
  - passes className through
  - hands its parts the scope it is given
  - names each part in React DevTools
- AvatarFallback
  - renders fallback with data-slot="avatar-fallback" when no image
  - renders fallback as a span
  - fallback forwards ref
  - fallback passes className
- Avatar (composition)
  - renders avatar with children
  - sets dir on avatar
  - takes any dir an element takes, auto included, since it reads none
  - leaves the direction to the document when no dir is passed
- AvatarImage loading
  - starts the download from the server HTML
  - renders no image without a src or srcSet
  - marks the image with data-slot="avatar-image"
  - keeps the style it was given on a loading image
  - says nothing about two images in production
  - keeps a loading image laid out, so a lazy one near the viewport still loads
  - shows the image once it loads, with the style it was given
  - keeps the image hidden and the fallback shown when it fails
  - shows an image that loaded before the page hydrated
  - ignores a load that arrives while the image is not complete, as one for a replaced request does
  - hides the image again while a new src loads, though the old image still reports complete
  - hides the image again while a new srcSet loads under the same src
  - shows the fallback while a src that went away and came back loads again
  - shows a new src at once when the browser already has it
  - loads and shows an image that has only a srcSet
  - still calls the onLoad and onError it was given
  - does not warn about two images when one replaces another
- AvatarFallback delay
  - shows the fallback after a delay of 0
  - starts the wait over when the delay changes before it ends

**End to end, `avatar.e2e.ts`**

- Avatar
  - shows the image once it loads, with no fallback, and reports loading then loaded
  - shows the fallback when the image fails, and keeps the broken image out of sight
  - renders no image and shows the fallback when there is no source
  - holds the fallback back for delayMs
  - follows a source that changes, from broken to loaded and back

</details>
<!-- /behaviour -->

## Beyond Radix

- The `<img>` is in the server's HTML, so the download starts while the browser parses the page rather
  than after hydration. Radix and Base UI load a hidden copy of the image from an effect first.
- The file is fetched once, with the `srcSet`, `sizes`, `crossOrigin`, `referrerPolicy` and `loading` the
  `<img>` has. An image with only a `srcSet` loads.
- The image carries `data-state` of `loading`, `loaded` or `error`, and the status type is exported as
  `IAvatar.ImageLoadingStatus`.
- A fallback with `delayMs={0}` shows in the first render, as Base UI's does, where Radix waits a timer for it and
  draws a blank frame first.

## Fixed

- Passes every Radix avatar test.
- The hidden copy ignored `srcSet` and `sizes`, so a 2x candidate meant two downloads, and it set
  `referrerPolicy` after its request had started, so that request could send the page's address to the
  image host.
- An image that loaded before the page hydrated shows at once, and a load or error for a request since
  replaced is ignored.
- Each source gets its own `<img>`, so a new one shows only once its own request loads. An img reports its last
  image as complete until the next request starts, which read as the new source having loaded.
- An image that loads with a natural width of 0 counts as an error, so the fallback shows instead of an
  empty box.
- The fallback renders again when the image unmounts, and a second `Avatar.Image` in one root logs a
  warning in development.
- `dir` takes any value an element takes, `auto` included. It was typed `'ltr' | 'rtl'`, though the root only
  writes it to the attribute.

## Smaller and faster

- No hidden copy of the image, and no `avatar.libs.ts` with its hydration store and status resolver.
- Stops resolving its direction, which it only wrote to the `dir` attribute the page already passes down.

## Breaking changes

- The `<img>` is in the DOM while it loads and after it fails, hidden with an inline `position: absolute`,
  a 1px size and `visibility: hidden`, so `loading="lazy"` still works. Code that took its presence to
  mean it had loaded should check `[data-state="loaded"]`, and a mount animation on it should key on that
  too.
- Without a `dir` prop the root carries no `dir` attribute, where it carried `dir="ltr"`.

## registry-ui

- `AvatarGroup` and `MotionAvatarGroup` name each fallback by its `alt`, so a screen reader hears the same
  name before and after the photo loads, where it heard the two letters of the fallback until then.
- Their `+N` counter is one element instead of two, named `N more` for a screen reader, or by
  `getOverflowLabel` in another language. A screen reader read "plus N".
- The group's fallback takes the first two letters a reader sees, so a flag, an emoji sequence or a letter
  with a combining mark stays whole, where it took two UTF-16 units and cut them in half.
- `MotionAvatarGroup` enters every avatar at once under reduced motion, where each still waited its turn.
- `AvatarImage` carries the primitive's `data-slot="avatar-image"`, where it set `avatar-img` (breaking for
  a style matching the old slot), and the parts stop setting the `data-slot` the primitive already sets.
- `IAvatarGroupProps` moves to `avatar.types.ts`. The examples give each image a name for its `alt`, where
  they used initials.

## Later

- Mounting and updating take about 1.1 times Radix's time. What is left after the direction went is the
  `data-slot` attributes Radix does not set.
- `imgs` would read better as `people` or `items`; renaming it is breaking.
- A run of the suite under React 18, the only version where the order that sets `src` last shows.
- `dir` on the root is typed `'ltr' | 'rtl'`, as on `Toggle` and `Progress`, so `dir="auto"` does not
  type-check.
