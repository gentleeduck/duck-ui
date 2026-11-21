```tsx
import * as RovingFocusGroup from '@gentleduck/primitives/roving-focus'
```

## Usage

```tsx
<RovingFocusGroup.Root orientation="horizontal" loop>
  <RovingFocusGroup.Item asChild>
    <button>Item 1</button>
  </RovingFocusGroup.Item>
  <RovingFocusGroup.Item asChild>
    <button>Item 2</button>
  </RovingFocusGroup.Item>
  <RovingFocusGroup.Item asChild>
    <button>Item 3</button>
  </RovingFocusGroup.Item>
</RovingFocusGroup.Root>
```

## Examples

### A toolbar

```tsx title="components/roving-focus-toolbar.tsx"
// import from your project: import Demo from '@/components/roving-focus-toolbar'
'use client'

import * as RovingFocus from '@gentleduck/primitives/roving-focus'
import styles from '../primitives.module.css'

export default function RovingFocusToolbarExample() {
  return (
    <div className={styles.stack}>
      <RovingFocus.Root aria-label="Formatting" className={styles.group} loop orientation="horizontal" role="toolbar">
        {['Bold', 'Italic', 'Underline', 'Strike'].map((name) => (
          <RovingFocus.Item asChild key={name}>
            <button className={styles.button} type="button">
              {name}
            </button>
          </RovingFocus.Item>
        ))}
      </RovingFocus.Root>
      <p className={styles.note}>One Tab stop for the whole toolbar; the arrow keys, Home and End move inside it.</p>
    </div>
  )
}
```

### Controlled tab stop

```tsx title="components/roving-focus-controlled.tsx"
// import from your project: import Demo from '@/components/roving-focus-controlled'
'use client'

import * as RovingFocus from '@gentleduck/primitives/roving-focus'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function RovingFocusControlledExample() {
  const [stop, setStop] = React.useState<string | null>('cut')

  return (
    <div className={styles.stack}>
      <RovingFocus.Root
        className={styles.group}
        currentTabStopId={stop}
        onCurrentTabStopIdChange={setStop}
        orientation="vertical">
        {['cut', 'copy', 'paste'].map((id) => (
          <RovingFocus.Item asChild key={id} tabStopId={id}>
            <button className={styles.button} type="button">
              {id}
            </button>
          </RovingFocus.Item>
        ))}
      </RovingFocus.Root>
      <p className={styles.note}>The tab stop is {stop ?? 'none'}. Tab back in and focus lands on it.</p>
    </div>
  )
}
```

### Active and unfocusable items

```tsx title="components/roving-focus-active.tsx"
// import from your project: import Demo from '@/components/roving-focus-active'
'use client'

import * as RovingFocus from '@gentleduck/primitives/roving-focus'
import styles from '../primitives.module.css'

export default function RovingFocusActiveExample() {
  return (
    <div className={styles.stack}>
      <RovingFocus.Root className={styles.group} orientation="horizontal">
        {['Day', 'Week', 'Month'].map((view) => (
          <RovingFocus.Item active={view === 'Week'} asChild key={view}>
            <button aria-pressed={view === 'Week'} className={styles.button} type="button">
              {view}
            </button>
          </RovingFocus.Item>
        ))}
        <RovingFocus.Item asChild focusable={false}>
          <button className={styles.button} disabled type="button">
            Year (soon)
          </button>
        </RovingFocus.Item>
      </RovingFocus.Root>
      <p className={styles.note}>
        Tabbing in lands on the active Week, and the arrows pass over the item that is not focusable.
      </p>
    </div>
  )
}
```

### Reading the tab stop

```tsx title="components/roving-focus-item-state.tsx"
// import from your project: import Demo from '@/components/roving-focus-item-state'
'use client'

import * as RovingFocus from '@gentleduck/primitives/roving-focus'
import styles from '../primitives.module.css'

export default function RovingFocusItemStateExample() {
  return (
    <RovingFocus.Root className={styles.group} orientation="horizontal">
      {['One', 'Two', 'Three'].map((name) => (
        <RovingFocus.Item className={styles.button} key={name}>
          {({ isCurrentTabStop }) => `${name}${isCurrentTabStop ? ' (tab stop)' : ''}`}
        </RovingFocus.Item>
      ))}
    </RovingFocus.Root>
  )
}
```

***

## Props (Root)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | - | Arrow key direction |
| `dir` | `'ltr' \| 'rtl'` | - | Which way `ArrowLeft` and `ArrowRight` move, written to the group as `dir` so its items run the same way. Without it the group takes a `DirectionProvider`'s, then `<html dir>`. |
| `loop` | `boolean` | `false` | Wrap at boundaries |
| `currentTabStopId` | `string \| null` | - | Controlled active tab stop ID |
| `defaultCurrentTabStopId` | `string` | - | Initial active tab stop ID (uncontrolled) |
| `onCurrentTabStopIdChange` | `(tabStopId: string \| null) => void` | - | Called when the active tab stop changes |
| `onEntryFocus` | `(event: Event) => void` | - | Called when focus enters the group. Call `event.preventDefault()` to prevent auto-focus. |
| `preventScrollOnEntryFocus` | `boolean` | `false` | Prevent scroll when focus enters the group |

## Props (Item)

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tabStopId` | `string` | generated | The id the group names in `currentTabStopId` when this item is its tab stop |
| `focusable` | `boolean` | `true` | `false` keeps the item out of arrow key and Tab navigation, and a mouse down on it moves no focus |
| `active` | `boolean` | `false` | Focus entering the group goes to this item first, as to the checked radio or the pressed toggle |
| `textValue` | `string` | - | What a typeahead over the group matches, in place of the item's text |
| `children` | `ReactNode \| ((state) => ReactNode)` | - | Nodes, or a function called with `isCurrentTabStop` and `hasTabStop` |
| `asChild` | `boolean` | `false` | Renders the child element instead of a `span` |

```tsx
<RovingFocusGroup.Item tabStopId="bold" asChild>
  {({ isCurrentTabStop, hasTabStop }) => (
    <button data-tab-stop={isCurrentTabStop ? '' : undefined}>Bold</button>
  )}
</RovingFocusGroup.Item>
```

`isCurrentTabStop` is true for the one item Tab reaches. `hasTabStop` is true once the group has a tab stop at all, which it gets from `currentTabStopId` or when an item is first focused.

## Keyboard

| Key | Horizontal | Vertical |
| --- | --- | --- |
| `ArrowRight` | Next item, previous right to left | - |
| `ArrowLeft` | Previous item, next right to left | - |
| `ArrowDown` | - | Next item |
| `ArrowUp` | - | Previous item |
| `Home`, `PageUp` | First item | First item |
| `End`, `PageDown` | Last item | Last item |
| `Tab` | Into the group on its tab stop, then out past the other items | Same |
| `Shift+Tab` | Out of the group from any item, or from after it back onto its tab stop | Same |

A group with no `orientation` moves on all four arrows. An arrow held with Shift, Ctrl, Alt or Meta goes to the page. Items that cannot take focus are skipped, and `loop` wraps at either end. <Kbd>Tab</Kbd> enters on an item even after a mouse down that moved no focus, and <Kbd>Shift+Tab</Kbd> leaves the group from any item.

The group writes its `tabindex` after React commits, so server markup carries none. A `tabIndex` given to the group, or carried by the element `asChild` slots it onto, is left alone, and the group takes the tab stop back once that `tabIndex` is dropped.

## Data attributes

| Part | Attribute | Values |
| --- | --- | --- |
| Root | `data-slot` | `roving-focus-group` |
| Root | `data-orientation` | `horizontal`, `vertical` |
| Root | `dir` | `ltr`, `rtl` |
| Item | `data-slot` | `roving-focus-item` |
| Item | `data-orientation` | `horizontal`, `vertical` |

## Hooks

`useRovingFocusGroup(options, ref)` and `useRovingFocusItem(props, ref, enabled?)` are the group and an item without an element of their own, for a part that renders its own element, as the radio group and the menus do.

```tsx
const group = useRovingFocusGroup({ orientation: 'horizontal', dir: 'ltr', loop: true }, forwardedRef)
return (
  <RovingFocusProvider scope={undefined} {...group.context}>
    <div {...props} {...group.props} />
  </RovingFocusProvider>
)

const item = useRovingFocusItem({ tabStopId: 'bold', onKeyDown }, forwardedRef)
return <button {...item.attributes} {...item.handlers} data-current={item.state.isCurrentTabStop || undefined} />
```

The group hook takes the root's props, with `dir` required, and returns the `context` for `RovingFocusProvider` and the `props`, ref included, for the group's element. The item hook takes an item's props and its `onMouseDown`, `onFocus` and `onKeyDown` to compose with, and returns its `state`, its `attributes` (the tab index and `data-orientation`, or `undefined` while `enabled` is `false`, for the caller to set a tab index of its own) and its `handlers`, ref included. `focusFirst`, `getFocusableItems`, `getFocusIntent` and `wrapArray` are exported too, for a part that moves focus itself.

## How it works

}>
  Only one item in the group is tabbable at a time (`tabIndex={0}`). All others have `tabIndex={-1}`. Arrow keys move focus between items. This follows the **WAI-ARIA roving tabindex** pattern. Focus moves a task after the key, and a key pressed before it lands counts from the item it is moving to, so each press moves one item even on a busy page. Any other key goes to the item that has focus when it is pressed, so on a busy page an Enter pressed straight after an arrow can still reach the item focus is leaving. Radix behaves the same: moving focus inside the keydown would batch every item's blur and focus handlers into it, the React bug ([facebook/react#20332](https://github.com/facebook/react/issues/20332)) the wait avoids.

}>
  Used by `ToggleGroup`, `RadioGroup`, `Menubar` and every menu. It works inside an iframe and inside a shadow root.