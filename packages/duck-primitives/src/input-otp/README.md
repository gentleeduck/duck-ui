# Input OTP

A one-time code typed into a row of single-character slots.

| Part | Where |
|---|---|
| Primitive | `@gentleduck/primitives/input-otp` |
| API docs | [`duck-primitives/api/input-otp.mdx`](../../../../apps/duck/content/docs/duck-primitives/api/input-otp.mdx) |
| Styled component | [`registry-ui/src/input-otp`](../../../registry-ui/src/input-otp) |
| Styled docs | [`duck-ui/components/input-otp.mdx`](../../../../apps/duck/content/docs/duck-ui/components/input-otp.mdx) |

Its Radix rival is the one-time-password-field preview, whose tests it passes.

## Benchmarks

<!-- benchmarks -->
Smaller than all 3. Faster in all 9 timed comparisons.

| | gentleduck | Radix | Ark UI | input-otp |
|---|--:|--:|--:|--:|
| Size, gzipped bytes | 3,995 | 11,051 (0.36x) | 11,375 (0.35x) | 4,101 (0.97x) |
| Mount x100, ms | 6.18 | 28.7 (0.22x) | 15.7 (0.39x) | 17.1 (0.36x) |
| Update x100, ms | 4.38 | 13.7 (0.32x) | 13.1 (0.34x) | 18.9 (0.23x) |
| Unmount x100, ms | 0.802 | 2.22 (0.36x) | 1.41 (0.57x) | 0.921 (0.87x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 0.2.1, Ark UI 5.40.0 and input-otp 1.5.0.
<!-- /benchmarks -->

## Tests

The stories cover a six-digit code with a separator, controlled and cleared by its owner; a code in a form,
submitted under its name once complete and on `Enter` with or without a submit button, and reset to its default;
disabled, read-only and password slots; one stop for `Tab`; and a code right to left. The end-to-end suite runs each in Chromium,
Firefox and WebKit, with a tap on a touch screen.

Each test written for this module was proven by changing the code and watching a test fail. The suites taken from
Ark UI run that library's own cases against this code. Each file's header names its source and every case left out,
and not every case in them was proven that way.

<!-- tests -->
| Suite | Tests | Files |
|---|--:|---|
| Unit | 99 | `input-otp.ark.test.tsx` 8, `input-otp.test.tsx` 79, `one-time-password-field.radix.test.tsx` 12 |
| End to end | 21 | `input-otp.e2e.ts` 21 |
| registry-ui | 3 | `input-otp.test.tsx` 3 |
<!-- /tests -->

<!-- behaviour -->
<details>
<summary>120 behaviours, one per test</summary>

**Unit, `input-otp.ark.test.tsx`**

- Ark UI pin input
  - has no axe violations
  - labels each slot for assistive technology
  - focuses its first slot with autoFocus
  - moves focus to the next slot as a character is typed
  - clears the slot before on Backspace in an empty one, moving there
  - tells onComplete once every slot is filled, and again once the last is typed over
  - asks the browser for a one-time code
  - marks its slots disabled and read-only

**Unit, `input-otp.test.tsx`**

- InputOTP
  - renders with data-slot="input-otp"
  - renders correct number of slots
  - renders a group with data-slot="input-otp-group" and the group role
  - slots render input elements
  - exports REGEXP_ONLY_DIGITS
  - forwards ref
  - REGEXP_ONLY_DIGITS rejects special chars
  - REGEXP_ONLY_DIGITS accepts all digits
  - renders correct slot data attributes
  - passes className to root
  - defaults to ltr direction
  - ArrowRight moves to the next slot in LTR
  - flips arrow navigation under a DirectionProvider without a dir prop
- InputOTP pattern
  - refuses a key the pattern does not accept
- InputOTPSeparator
  - is hidden from assistive technology
- InputOTP reporting the code
  - reports the whole code as each digit is typed
- InputOTP root
  - is a group with no label of its own
  - lets a role and a label passed to it win
- InputOTP value
  - shows a default value across the slots
  - follows a controlled value
  - keeps a controlled value the owner does not change
  - puts a key typed past the code into the first empty slot
  - replaces the character in a filled slot
  - selects the character of a slot that takes focus
- InputOTP deleting
  - Backspace in an empty slot removes the character before it and moves there
  - Backspace in a filled slot removes its character and stays
  - Backspace with nothing typed changes nothing
  - Delete removes the character in the slot and closes the gap
  - Delete in an empty slot changes nothing
  - leaves a key with a modifier to the browser
- InputOTP keys and fields it does not own
  - leaves Tab, Enter and the other named keys to the browser
  - leaves a field inside it that is not a slot to itself
  - renders through asChild to a component that drops its ref
- InputOTP pasting and autofill
  - pastes only the characters the pattern accepts, as far as the slots go, in place of the browser
  - pastes from the slot that has focus
  - spreads a code autofilled into one slot across all of them
  - keeps only the character an on-screen keyboard types beside the one a slot holds
  - takes a character an on-screen keyboard types without a key event
  - undoes a character typed that the pattern refuses
  - removes a character an on-screen keyboard deletes
- InputOTP onComplete
  - reports the code once the last slot is filled
  - stays quiet when a full code is typed over with the same character
- InputOTP disabled and read-only
  - disables every slot
  - keeps a read-only code as it is but lets focus move
- InputOTP slot disabled or read-only on its own
  - disables or makes read-only the slot given the prop, and leaves the others
  - keeps a slot read-only on its own from a key and a paste
- InputOTP slots
  - masks every slot when the type is password
  - opens the numeric keyboard for a digits-only code
  - gives Tab one stop, the slot typing goes to, which follows the code
  - keeps a tab stop a slot was given itself
  - numbers the slots without replacing a label of their own
  - lets a label given later replace the number
  - renumbers the slots it labelled when one is added before them
  - leaves slots past maxLength out of the code
- InputOTPHiddenInput
  - holds the code under the name the root gives it
  - takes a name of its own over the root
  - is disabled with its root, so a form leaves the code out
- InputOTP patterns
  - REGEXP_ONLY_DIGITS_AND_CHARS takes letters and digits and nothing else
  - REGEXP_ONLY_CHARS takes letters only
- InputOTP autoSubmit
  - submits its form with the whole code once the last slot is filled
  - waits for the code to be complete when its owner refuses the last character
  - leaves the form alone without autoSubmit
- InputOTP in a form
  - goes back to its default code when the form is reset
  - shows its default code again after a reset that left the code as it was
  - reports an empty code to its owner when the form is reset
  - keeps its code when the reset is cancelled
  - stops listening for the form reset once it unmounts
  - submits the form on Enter, as the only field of a form with no submit button does
  - leaves Enter to the browser in a form with a submit button of any kind, which the browser presses
  - submits the form on Enter when its only button resets it
  - does nothing on Enter outside a form
- InputOTP handlers of its own
  - calls its own key, input and paste handlers first, and changes nothing when they prevent the default
  - calls its own focus handler first, and selects nothing when it prevents the default
  - calls its own pointer handlers first, and keeps no press, or forgets none, when they prevent the default
- InputOTP pressed
  - puts the caret in the first empty slot when a slot past the end of the code is pressed
  - lets an arrow key reach a slot past the end of the code after a press there sent the caret back
  - lets a press on a filled slot or the first empty one take focus there
  - lets an arrow key reach a slot past the end of the code, after a press there that turned into a scroll
- InputOTP autofill
  - offers a code from a message to every slot, and a slot can turn it off

**Unit, `one-time-password-field.radix.test.tsx`**

- given a default OneTimePasswordField
  - should have no accessibility violations
  - should mask input value when type is password
  - should disable all inputs when Root is disabled
  - should type digits and advance focus
  - should navigate with arrow keys
  - pastes the code into the input
  - should truncate pasted characters to the number of inputs
- OneTimePasswordField.Root
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- OneTimePasswordField.Input
  - spreads props it does not consume onto the element it renders
  - forwards props to the child element when `asChild` is set
- OneTimePasswordField.HiddenInput
  - spreads props it does not consume onto the element it renders

**End to end, `input-otp.e2e.ts`**

- InputOTP code
  - fills a slot per digit, moves on as it goes, and reports the code once complete
  - is one stop for Tab, so Tab leaves the code and Shift+Tab comes back where typing goes
  - refuses a letter the digits pattern does not take
  - takes Backspace in an empty slot back over the digit before it
  - moves between slots on the arrow keys, and replaces the digit of a filled slot
  - keeps the code its length when typing goes on in the last slot, the last digit taking the new one
  - removes the digit in the slot on Delete, closing the gap
  - removes the digit in the slot on the key that deletes a word
  - fills every slot from a pasted code, keeping only its digits
  - fills every slot from text inserted at once, as an autofilled code arrives
  - replaces the digit of a filled slot with one an on-screen keyboard puts after it
  - puts the caret in the first empty slot when a slot past the end of the code is clicked
  - empties every slot when its owner clears the value
- InputOTP by touch
  - puts the caret in the first empty slot when a slot past the end of the code is tapped
- InputOTP in a form
  - submits the form under its name once the last slot is filled
  - hides each character as a password slot
  - takes no typing while read only, and no focus while disabled
  - goes back to its default code when the form is reset, and submits from there
  - submits the code on Enter in a form with no submit button
  - submits once on Enter in a form with a submit button, through that button
- InputOTP right to left
  - takes letters and digits, and moves to the slot on the side each arrow points to

</details>
<!-- /behaviour -->

## Beyond what it had

- `autoSubmit` submits the form the slots sit in once every slot is filled, as Ark's pin input does. It submits
  after `HiddenInput` holds the whole code.
- Every slot carries `autoComplete="one-time-code"`, so the browser can offer a code from a text message, as
  Ark's do with `otp`. A slot's own `autoComplete` wins.
- `autoFocus` on the root focuses the slot typing goes to once it mounts, as Radix's one-time password field and
  Ark's pin input take it.
- `onComplete` is called with the code once every slot is filled, as `onComplete` in `input-otp` and
  `onValueComplete` in Ark.
- `HiddenInput` submits the code under the root's `name`, and nothing while the root is disabled. The root
  takes `defaultValue`, `disabled`, `readOnly` and `type="password"`, and a slot takes `disabled` and
  `readOnly` of its own.

## Fixed

- Passes every Radix one-time-password-field test.
- The docs submitted the form by calling `requestSubmit` from `onComplete`, which sent the code without its
  last character, because the hidden input had not caught up. `autoSubmit` replaces it.
- `name` landed on the wrapper `div`, which no form reads.
- `Backspace` removes a character from the code, where it cleared the slot without calling `onValueChange`,
  and `Delete` works, where it did nothing.
- A code an on-screen keyboard types, or the browser autofills into one slot, spreads across the slots. A
  slot has no `maxLength`, which cut such a code to its first character in a browser, so a character typed
  beside the one a slot holds replaces it.
- Resetting the form puts the code back to `defaultValue`. The form emptied the slots and the code stayed, so
  the next character went in after the old code and `HiddenInput` still submitted it.
- `Enter` submits the form, as Radix does. The browser submits a form holding more than one field only through
  its submit button, so a code in a form without one was never sent. A form with a submit button is left to the
  browser, which presses it, where Radix submits that form itself, without the button.
- Pressing a slot past the end of the code puts the caret in the first empty slot, as Radix does. The caret sat
  in the slot pressed while typing filled another. The arrow keys still reach every slot.
- The code is one stop for `Tab`, the slot typing goes to, as in Radix and Zag. Every slot was a stop, so
  leaving the code took a `Tab` per slot. A `tabIndex` a slot is given itself is kept.
- A slot selects its character when it takes focus, opens the numeric keyboard when the pattern is
  `REGEXP_ONLY_DIGITS`, and keeps an `aria-label` of its own.

## Smaller and faster

- The separator drops `customIndicator`, which did what its children do.
- The context carries the code and the root's `name`, `disabled`, `readOnly` and `type` in place of its refs,
  direction and `maxLength`.

## Breaking changes

- `REGEXP_ONLY_DIGITS_AND_CHARS`, the default pattern, takes a digit or a letter from `a` to `z`, where it
  took any character. Pass `pattern={/^.$/}` for the old behaviour.
- The root is a `role="group"` where it was a `region`, and no longer labels itself, so give it an
  `aria-label`.
- A slot rendered outside `InputOTP` throws.
- `Tab` stops once in the code, so a test that tabbed from slot to slot should press `ArrowRight`.
- `IInputOTP.IContext` changed shape, as above.
- `InputOTP.Separator` drops `customIndicator`; pass the content as children.

## registry-ui

- `InputOTPHiddenInput` submits the code in a form, and `REGEXP_ONLY_CHARS` is exported beside the other two
  patterns.
- `InputOTPSeparator` draws its children in place of the dot, and drops `customIndicator` (breaking).
- The examples label their code. The form example submits once the code is complete, and is named by the
  label it shows, which pointed `htmlFor` at the root `div`, an element a label cannot name.
- The parts stop setting the `data-slot` the primitive already sets.
- A new example sends a code from a plain form on `Enter`, and clears it with the form's reset button.

## Later

- Ark's `blurOnComplete`, `placeholder` and `onValueInvalid`, and an active-slot attribute to style the
  caret by, as `input-otp` has.
- The slots' `Digit n` labels are set after mount, so the server markup has none.
- The root still writes `dir`.
