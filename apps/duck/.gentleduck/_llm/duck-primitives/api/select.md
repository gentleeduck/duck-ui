```tsx
import * as Select from '@gentleduck/primitives/select'
```

## Anatomy

```tsx
<Select.Root>
  <Select.Trigger>
    <Select.Value />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.ScrollUpButton />
      <Select.Viewport>
        <Select.Group>
          <Select.Label />
          <Select.Item>
            <Select.ItemText />
            <Select.ItemIndicator />
          </Select.Item>
        </Select.Group>
        <Select.Separator />
      </Select.Viewport>
      <Select.ScrollDownButton />
    </Select.Content>
  </Select.Portal>
</Select.Root>
```

***

## Usage

```tsx
import * as Select from '@gentleduck/primitives/select'

function ThemeSelect() {
  return (
    <Select.Root defaultValue="system">
      <Select.Trigger className="px-3 py-2 border rounded">
        <Select.Value placeholder="Pick a theme" />
        <Select.Icon />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content position="popper" sideOffset={4} className="bg-white border rounded shadow-lg">
          <Select.Viewport className="p-1">
            <Select.Item value="light" className="px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100">
              <Select.ItemText>Light</Select.ItemText>
              <Select.ItemIndicator>*</Select.ItemIndicator>
            </Select.Item>
            <Select.Item value="dark" className="px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100">
              <Select.ItemText>Dark</Select.ItemText>
              <Select.ItemIndicator>*</Select.ItemIndicator>
            </Select.Item>
            <Select.Item value="system" className="px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100">
              <Select.ItemText>System</Select.ItemText>
              <Select.ItemIndicator>*</Select.ItemIndicator>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

## Multiple

With `multiple`, the select holds a list of values. `value`, `defaultValue` and `onValueChange` take and give `string[]` in the order the values were picked, and TypeScript reads which from the prop.

```tsx
import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'

function ToppingsSelect() {
  const [toppings, setToppings] = React.useState<string[]>([])

  return (
    <Select.Root multiple name="toppings" onValueChange={setToppings} value={toppings}>
      <Select.Trigger aria-label="Toppings" className="px-3 py-2 border rounded">
        <Select.Value placeholder="Pick toppings" />
        <Select.Icon />
      </Select.Trigger>

      <Select.Portal>
        <Select.Content position="popper" sideOffset={4} className="bg-white border rounded shadow-lg">
          <Select.Viewport className="p-1">
            {['Basil', 'Mushroom', 'Olive'].map((topping) => (
              <Select.Item key={topping} value={topping.toLowerCase()} className="px-3 py-1.5 rounded">
                <Select.ItemText>{topping}</Select.ItemText>
                <Select.ItemIndicator>*</Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

* A click, Enter or Space toggles the item and leaves the list open. Escape or a press outside closes it.
* `Select.Value` shows the picked labels joined by ", ", or the placeholder while none is picked. A function given as its child is called with the picked values instead.
* The listbox carries `aria-multiselectable`, and every option says with `aria-selected` whether it is picked.
* The hidden native select is a `<select multiple>`, so a form gets `name` once per value, `required` asks for one pick, and a form reset restores the starting list.
* Typing a letter on the closed trigger picks nothing, since the pick would be made out of sight.
* With `position="item-aligned"`, the list opens with the first pick lined up over the trigger and focused, and holds still while picks are made.

***

## Examples

### Basic

```tsx title="components/select-basic.tsx"
// import from your project: import Demo from '@/components/select-basic'
'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

export default function SelectBasicExample() {
  return (
    <Select.Root defaultValue="banana">
      <Select.Trigger aria-label="Fruit" className={styles.trigger}>
        <Select.Value placeholder="Pick a fruit" />
        <Select.Icon>v</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.ScrollUpButton className={styles.note}>^</Select.ScrollUpButton>
          <Select.Viewport>
            <Select.Group>
              <Select.Label className={styles.groupLabel}>Fruit</Select.Label>
              {['Apple', 'Banana', 'Cherry'].map((fruit) => (
                <Select.Item className={styles.item} key={fruit} value={fruit.toLowerCase()}>
                  <Select.ItemText>{fruit}</Select.ItemText>
                  <Select.ItemIndicator className={styles.shortcut}>x</Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
            <Select.Separator className={styles.separator} />
            <Select.Group>
              <Select.Label className={styles.groupLabel}>Vegetables</Select.Label>
              <Select.Item className={styles.item} value="carrot">
                <Select.ItemText>Carrot</Select.ItemText>
              </Select.Item>
              <Select.Item className={styles.item} disabled value="leek">
                <Select.ItemText>Leek (out of season)</Select.ItemText>
              </Select.Item>
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className={styles.note}>v</Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

### Controlled

```tsx title="components/select-controlled.tsx"
// import from your project: import Demo from '@/components/select-controlled'
'use client'

import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'
import styles from './styles.module.css'

export default function SelectControlledInternalExample() {
  const [value, setValue] = React.useState('apple')

  return (
    <Select.Select value={value} onValueChange={setValue}>
      <Select.SelectTrigger className={styles.trigger}>
        <Select.SelectValue placeholder="Choose fruit" />
      </Select.SelectTrigger>
      <Select.SelectPortal>
        <Select.SelectContent className={styles.content} sideOffset={8}>
          <Select.SelectViewport>
            <Select.SelectItem className={styles.item} value="apple">
              <Select.SelectItemText>Apple</Select.SelectItemText>
            </Select.SelectItem>
            <Select.SelectItem className={styles.item} value="banana">
              <Select.SelectItemText>Banana</Select.SelectItemText>
            </Select.SelectItem>
            <Select.SelectItem className={styles.item} value="orange">
              <Select.SelectItemText>Orange</Select.SelectItemText>
            </Select.SelectItem>
          </Select.SelectViewport>
        </Select.SelectContent>
      </Select.SelectPortal>
    </Select.Select>
  )
}
```

### Popper position

```tsx title="components/select-popper.tsx"
// import from your project: import Demo from '@/components/select-popper'
'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

export default function SelectPopperExample() {
  return (
    <Select.Root defaultValue="utc">
      <Select.Trigger aria-label="Time zone" className={styles.trigger}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={styles.content}
          position="popper"
          sideOffset={6}
          style={{ minWidth: 'var(--gentleduck-select-trigger-width)' }}>
          <Select.Viewport>
            {['utc', 'cet', 'est', 'pst'].map((zone) => (
              <Select.Item className={styles.item} key={zone} value={zone}>
                <Select.ItemText>{zone.toUpperCase()}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.Arrow className={styles.arrow} />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

### Multiple

```tsx title="components/select-multiple.tsx"
// import from your project: import Demo from '@/components/select-multiple'
'use client'

import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'
import styles from '../primitives.module.css'

const TAGS = ['design', 'frontend', 'backend', 'docs', 'testing']

export default function SelectMultipleExample() {
  const [tags, setTags] = React.useState<string[]>(['frontend'])

  return (
    <Select.Root multiple onValueChange={setTags} value={tags}>
      <Select.Trigger aria-label="Tags" className={styles.trigger}>
        <Select.Value placeholder="No tags">{(picked) => `${picked.length} tags: ${picked.join(', ')}`}</Select.Value>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content} position="popper" sideOffset={6}>
          <Select.Viewport>
            {TAGS.map((tag) => (
              <Select.Item className={styles.item} key={tag} value={tag}>
                <Select.ItemIndicator>x</Select.ItemIndicator>
                <Select.ItemText>{tag}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

### Items as data

```tsx title="components/select-items.tsx"
// import from your project: import Demo from '@/components/select-items'
'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

const COUNTRIES = [
  { value: 'de', label: 'Germany' },
  { value: 'eg', label: 'Egypt' },
  { value: 'jp', label: 'Japan' },
  { value: 'kp', label: 'North Korea', disabled: true },
]

export default function SelectItemsExample() {
  return (
    <Select.Root defaultValue="eg" items={COUNTRIES}>
      <Select.Trigger aria-label="Country" className={styles.trigger}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport>
            {COUNTRIES.map((country) => (
              <Select.Item
                className={styles.item}
                disabled={country.disabled}
                key={country.value}
                value={country.value}>
                <Select.ItemText>{country.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

### In a form

```tsx title="components/select-form.tsx"
// import from your project: import Demo from '@/components/select-form'
'use client'

import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SelectFormExample() {
  const [sent, setSent] = React.useState('')

  return (
    <form
      className={styles.stack}
      onSubmit={(event) => {
        event.preventDefault()
        setSent(String(new FormData(event.currentTarget).get('role')))
      }}>
      <Select.Root autoComplete="organization-title" name="role" required>
        <Select.Trigger aria-label="Role" className={styles.trigger}>
          <Select.Value placeholder="Pick a role" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={styles.content}>
            <Select.Viewport>
              {['viewer', 'editor', 'owner'].map((role) => (
                <Select.Item className={styles.item} key={role} value={role}>
                  <Select.ItemText>{role}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <div className={styles.row}>
        <button className={`${styles.button} ${styles.primary}`} type="submit">
          Invite
        </button>
        <button className={styles.button} type="reset">
          Reset
        </button>
      </div>
      <p className={styles.note}>
        {sent ? `Submitted role=${sent}` : 'name submits the pick, required refuses an empty one.'}
      </p>
    </form>
  )
}
```

### Controlled open state

```tsx title="components/select-controlled-open.tsx"
// import from your project: import Demo from '@/components/select-controlled-open'
'use client'

import * as Select from '@gentleduck/primitives/select'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SelectControlledOpenExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={styles.row}>
      <Select.Root onOpenChange={setOpen} open={open}>
        <Select.Trigger aria-label="Priority" className={styles.trigger}>
          <Select.Value placeholder="Priority" />
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={styles.content} position="popper" sideOffset={6}>
            <Select.Viewport>
              {['low', 'medium', 'high'].map((level) => (
                <Select.Item className={styles.item} key={level} value={level}>
                  <Select.ItemText>{level}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <button className={styles.button} onClick={() => setOpen(true)} type="button">
        Open from here
      </button>
    </div>
  )
}
```

### Disabled

```tsx title="components/select-disabled.tsx"
// import from your project: import Demo from '@/components/select-disabled'
'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

export default function SelectDisabledExample() {
  return (
    <Select.Root defaultValue="monthly" disabled>
      <Select.Trigger aria-label="Billing" className={styles.trigger}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport>
            <Select.Item className={styles.item} value="monthly">
              <Select.ItemText>Monthly</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

### Right to left

```tsx title="components/select-rtl.tsx"
// import from your project: import Demo from '@/components/select-rtl'
'use client'

import * as Select from '@gentleduck/primitives/select'
import styles from '../primitives.module.css'

export default function SelectRtlExample() {
  return (
    <Select.Root defaultValue="cairo" dir="rtl">
      <Select.Trigger aria-label="المدينة" className={styles.trigger}>
        <Select.Value />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.content}>
          <Select.Viewport>
            {[
              { value: 'cairo', label: 'القاهرة' },
              { value: 'riyadh', label: 'الرياض' },
              { value: 'amman', label: 'عمّان' },
            ].map((city) => (
              <Select.Item className={styles.item} key={city.value} value={city.value}>
                <Select.ItemText>{city.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
```

***

## API

### `Select.Root`

The root component that manages open/closed state, selected value, and provides context to all children. Inside a form, or with `form`, it also renders a hidden native `<select>`, so the value submits under `name`, autofill can set it, and a form reset restores the value the select started with.

A pick by the user dispatches a bubbling `change` event from that native select, so a form's `onChange` hears it, unless the item's handler stopped propagation. A change made through `value` updates the native select without bubbling.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `multiple` | `boolean` | `false` | Holds a list of values. See [Multiple](#multiple). |
| `value` | `string \| string[]` | - | Controlled selected value, a list in pick order with `multiple` |
| `defaultValue` | `string \| string[]` | - | Initial value (uncontrolled), a list with `multiple` |
| `onValueChange` | `(value: string) => void` | - | Called when the selected value changes. With `multiple` it is given `string[]`. |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state (uncontrolled) |
| `onOpenChange` | `(open: boolean) => void` | - | Called when the open state should change |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved with `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `name` | `string` | - | Name for native form submission |
| `autoComplete` | `string` | - | Hint for browser autofill |
| `disabled` | `boolean` | - | Disables the select |
| `required` | `boolean` | - | Marks as required for form validation. With `multiple`, one pick satisfies it. |
| `form` | `string` | - | Associates with a form element by ID |
| `items` | `{ value: string; label: string; disabled?: boolean }[]` | - | The items, as data. A closed select then renders none of its items: the trigger's label, the native `<select>` options and typing on the closed trigger come from this list, and the label is in the server's HTML. Children given to the value still win over the label. |

### `Select.Trigger`

Button that toggles the dropdown. Renders a `<button>` with `role="combobox"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as the child element instead of a `<button>` |
| `disabled` | `boolean` | `false` | Disables the trigger |

A trigger inside a disabled `<fieldset>` is disabled with it, and a press, a tap or a key leaves the select shut, as a native select does.

Sets `aria-expanded`, `aria-autocomplete="none"`, `data-state`, and `data-placeholder` automatically. It points `aria-controls` at the listbox only while the select is open, since the id names nothing while it is closed.

### `Select.Value`

Displays the selected item text or a placeholder. It takes `className` and `style`, and keeps `pointer-events: none` over any style given, so pressing the picked text never reaches the item it was copied from.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placeholder` | `React.ReactNode` | `''` | Content shown when no value is selected |
| `asChild` | `boolean` | - | Render as the child element, with the placeholder or the picked item's text inside it |
| `children` | `React.ReactNode \| ((value: string[]) => React.ReactNode)` | - | Shown in place of the picked text. A function is given the picked values in pick order, a single select's one value as a list, and is not called while nothing is picked. |

### `Select.Icon`

Decorative icon next to the value. Renders a `<span>` with `aria-hidden`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as child element |

### `Select.Portal`

Renders the dropdown content into a portal.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `Element \| DocumentFragment \| RefObject \| null` | `document.body` | Portal target |

### `Select.Content`

The dropdown content. Handles focus trapping, dismiss-on-click-outside, escape-to-close, and keyboard navigation.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `'item-aligned' \| 'popper'` | `'item-aligned'` | Positioning strategy |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` | Preferred side (popper only) |
| `sideOffset` | `number` | - | Main-axis offset (popper only) |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Cross-axis alignment (popper only) |
| `alignOffset` | `number` | - | Cross-axis offset (popper only) |
| `avoidCollisions` | `boolean` | `true` | Flip to avoid viewport overflow (popper only) |
| `collisionBoundary` | `Element \| Element[]` | - | Custom collision boundary (popper only) |
| `collisionPadding` | `number` | `10` | Padding from viewport edges |
| `arrowPadding` | `number` | `0` | Minimum padding between arrow and content edges (popper only) |
| `sticky` | `'partial' \| 'always'` | `'partial'` | Keep content in view when trigger is partially hidden (popper only) |
| `hideWhenDetached` | `boolean` | `false` | Hide content once the trigger is scrolled out of view (popper only) |
| `onCloseAutoFocus` | `(event: Event) => void` | - | Called when focus returns to trigger on close |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - | Called when Escape is pressed |
| `onPointerDownOutside` | `(event) => void` | - | Called when clicking outside |
| `onFocusOutside` | `(event) => void` | - | Called when focus moves outside. Default prevents dismiss on focus out. |
| `trapFocus` | `boolean` | `context.open` | Override whether focus is trapped inside the content |
| `disableOutsidePointerEvents` | `boolean` | `context.open` | Override whether pointer events outside are blocked |
| `lockScroll` | `boolean` | `context.open` | Override whether body scroll is locked while open |

The `trapFocus`, `disableOutsidePointerEvents`, and `lockScroll` props default to the select's open state. Override them when integrating with animation libraries like [motion](https://motion.dev) that need custom lifecycle control during exit animations.

Exposes `data-state="open"` / `data-state="closed"` and `data-side` for CSS animation.

When using `position="popper"`, the following CSS custom properties are available:

* `--gentleduck-select-content-transform-origin`
* `--gentleduck-select-content-available-width`
* `--gentleduck-select-content-available-height`
* `--gentleduck-select-trigger-width`
* `--gentleduck-select-trigger-height`

### `Select.Viewport`

Scrollable container for items inside the content.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `nonce` | `string` | - | Nonce for the injected scrollbar-hiding style element |

### `Select.Group`

Groups related items. Renders a `<div>` with `role="group"`.

### `Select.Label`

Label for a group. Linked via `aria-labelledby`.

### `Select.Item`

A selectable item. Renders a `<div>` with `role="option"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | (required) | The value for this item. An empty string clears the selection and shows the `Value` placeholder. |
| `disabled` | `boolean` | `false` | Disables the item |
| `textValue` | `string` | - | Text override for typeahead search (defaults to text content) |

Exposes `data-state="checked"` / `data-state="unchecked"`, `data-highlighted`, and `data-disabled`.

### `Select.ItemText`

The text portion of an item. When selected, the text content is portalled into the `Value` component. Its `className` and `style` land on the span in the list, and the copy in the `Value` carries only the text.

### `Select.ItemIndicator`

Renders only when the parent item is selected. Use for check marks or other visual indicators.

### `Select.ScrollUpButton` / `Select.ScrollDownButton`

Scroll buttons that appear when content overflows. Auto-scroll on hover.

### `Select.Separator`

Visual separator between items. Renders a `<div>` with `aria-hidden`.

### `Select.Provider` / `Select.BubbleInput`

`Select.Root` is `Select.Provider` with `Select.BubbleInput` inside it. Compose the two yourself to place the hidden native select, or to give it props of its own.

```tsx
<Select.Provider name="size" defaultValue="m">
  <Select.Trigger />
  <Select.Portal>{/* ... */}</Select.Portal>
  <Select.BubbleInput data-testid="size-native" />
</Select.Provider>
```

`Select.Provider` takes the same props as `Select.Root`. `Select.BubbleInput` takes the props of a `<select>` except `value`, which comes from the provider.

### `Select.Arrow`

Arrow pointing to the trigger. Only renders when `position="popper"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `10` | Arrow width in pixels |
| `height` | `number` | `5` | Arrow height in pixels |

***

## Keyboard interactions

| Key | Action |
| --- | --- |
| <Kbd>Space</Kbd> / <Kbd>Enter</Kbd> | Opens the select (on trigger) or selects focused item. With `multiple`, toggles the focused item and leaves the list open. |
| <Kbd>ArrowDown</Kbd> | Opens the select or moves focus to next item |
| <Kbd>ArrowUp</Kbd> | Opens the select or moves focus to previous item |
| <Kbd>Home</Kbd> | Moves focus to first item |
| <Kbd>End</Kbd> | Moves focus to last item |
| <Kbd>PageUp</Kbd> | Moves focus to first item |
| <Kbd>PageDown</Kbd> | Moves focus to last item |
| <Kbd>Escape</Kbd> | Closes the select |
| <Kbd>Tab</Kbd> | Prevented while open (standard select behavior) |
| A letter | Focus the next item after the focused one whose text starts with it. On the closed trigger, pick the next one after the selected item, except with `multiple`, where it picks nothing |

## In an iframe or a shadow root

Give `Select.Portal` a `container` inside the iframe or the shadow root. Focus, the arrow keys and typeahead then read the element focused there, the press that opened the list is followed in the iframe's document, and the list closes when the iframe's window loses focus or is resized. Item-aligned content keeps inside the iframe's window and grows no taller than it.