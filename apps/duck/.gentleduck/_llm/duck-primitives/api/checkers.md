```tsx
import * as Checkers from '@gentleduck/primitives/checkers'
```

## Anatomy

```tsx
const {
  SvgIndicator,
  inputStyle,
  indicatorReady,
  checkedIndicatorReady,
  indeterminateIndicatorReady,
} = Checkers.useSvgIndicator({
  indicator: <svg />,
  checkedIndicator: <svg />,
  indeterminateIndicator: <svg />,
})
```

***

## Exports

* `Checkers.useSvgIndicator`
* `Checkers.useCheckedSync`

***

## Usage

```tsx
import { useSvgIndicator } from '@gentleduck/primitives/checkers'

function CustomIndicatorInput() {
  const { SvgIndicator, inputStyle } = useSvgIndicator({
    indicator: <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /></svg>,
    checkedIndicator: <svg viewBox="0 0 16 16"><path d="M3 8l3 3 7-7" /></svg>,
    indeterminateIndicator: <svg viewBox="0 0 16 16"><path d="M3 8h10" /></svg>,
  })

  return (
    <>
      <SvgIndicator />
      <input className="checkbox" style={inputStyle} type="checkbox" />
    </>
  )
}
```

***

## Examples

### Checked and indeterminate icons

```tsx title="components/checkers-svg-indicator.tsx"
// import from your project: import Demo from '@/components/checkers-svg-indicator'
'use client'

import { useSvgIndicator } from '@gentleduck/primitives/checkers'
import * as React from 'react'
import styles from '../primitives.module.css'

const ICON = { fill: 'none', stroke: 'black', strokeLinecap: 'round', strokeWidth: 2.5, viewBox: '0 0 16 16' } as const

export default function CheckersSvgIndicatorExample() {
  const all = React.useRef<HTMLInputElement>(null)
  const [picked, setPicked] = React.useState([true, false, true])
  const { SvgIndicator, inputStyle } = useSvgIndicator({
    checkedIndicator: (
      <svg {...ICON}>
        <path d="M3 8.5l3 3 7-7" />
      </svg>
    ),
    indeterminateIndicator: (
      <svg {...ICON}>
        <path d="M3.5 8h9" />
      </svg>
    ),
  })
  const count = picked.filter(Boolean).length

  React.useEffect(() => {
    if (all.current) all.current.indeterminate = count > 0 && count < picked.length
  }, [count, picked.length])

  return (
    <div className={styles.choices}>
      <SvgIndicator />
      <label className={styles.choice}>
        <input
          checked={count === picked.length}
          className={styles.nativeCheck}
          onChange={(event) => setPicked(picked.map(() => event.target.checked))}
          ref={all}
          style={inputStyle}
          type="checkbox"
        />
        Every channel
      </label>
      {['Email', 'Push', 'SMS'].map((channel, index) => (
        <label className={styles.choice} key={channel} style={{ paddingInlineStart: '1.5rem' }}>
          <input
            checked={picked[index]}
            className={styles.nativeCheck}
            onChange={(event) => setPicked(picked.map((value, at) => (at === index ? event.target.checked : value)))}
            style={inputStyle}
            type="checkbox"
          />
          {channel}
        </label>
      ))}
    </div>
  )
}
```

### A switch drawn from two icons

```tsx title="components/checkers-switch-indicator.tsx"
// import from your project: import Demo from '@/components/checkers-switch-indicator'
'use client'

import { useSvgIndicator } from '@gentleduck/primitives/checkers'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function CheckersSwitchIndicatorExample() {
  const [on, setOn] = React.useState(true)
  const { SvgIndicator, inputStyle } = useSvgIndicator({
    checkedIndicator: (
      <svg viewBox="0 0 32 16">
        <circle cx="24" cy="8" r="6" />
      </svg>
    ),
    indicator: (
      <svg viewBox="0 0 32 16">
        <circle cx="8" cy="8" r="6" />
      </svg>
    ),
  })

  return (
    <label className={styles.choice}>
      <SvgIndicator />
      <input
        aria-checked={on}
        checked={on}
        className={styles.nativeSwitch}
        onChange={(event) => setOn(event.target.checked)}
        role="switch"
        style={inputStyle}
        type="checkbox"
      />
      Wi-Fi
    </label>
  )
}
```

### A form that hears a controlled value

```tsx title="components/checkers-checked-sync.tsx"
// import from your project: import Demo from '@/components/checkers-checked-sync'
'use client'

import { useCheckedSync } from '@gentleduck/primitives/checkers'
import * as React from 'react'
import styles from '../primitives.module.css'

function Checkbox({
  checked,
  id,
  onCheckedChange,
}: {
  checked: boolean
  id: string
  onCheckedChange: (checked: boolean) => void
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const sync = useCheckedSync(ref, { checked, onChange: (event) => onCheckedChange(event.target.checked) })
  return (
    <input checked={checked} className={styles.nativeCheck} id={id} name="terms" ref={ref} type="checkbox" {...sync} />
  )
}

export default function CheckersCheckedSyncExample() {
  const [checked, setChecked] = React.useState(false)
  const [heard, setHeard] = React.useState(0)

  return (
    <form
      className={styles.stack}
      onChange={() => setHeard((count) => count + 1)}
      onSubmit={(event) => event.preventDefault()}>
      <div className={styles.choice}>
        <Checkbox checked={checked} id="terms" onCheckedChange={setChecked} />
        <label htmlFor="terms">I accept the terms</label>
      </div>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setChecked((value) => !value)} type="button">
          Toggle from outside
        </button>
        <button className={styles.button} type="reset">
          Reset the form
        </button>
      </div>
      <p className={styles.note}>
        The form heard {heard} changes. A value set from outside reaches it too, and a reset puts the box back on its
        value.
      </p>
    </form>
  )
}
```

***

## API

### `useSvgIndicator(options)`

Renders each indicator into a hidden node, reads its markup back after every render, and hands it to the input as a data-URI CSS variable. An input cannot hold children, so this is how it draws an icon of your own.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `indicator` | `React.ReactNode` | - | SVG-like node for the unchecked state |
| `checkedIndicator` | `React.ReactNode` | - | SVG-like node for the checked state |
| `indeterminateIndicator` | `React.ReactNode` | - | SVG-like node for the indeterminate state |

Returns:

* `inputStyle`: `React.CSSProperties` with `--svg-off`, `--svg-on` and `--svg-indeterminate`, each set only when its indicator is given
* `SvgIndicator`: the hidden renderer. Render it once beside the input. It keeps one identity across renders, so its markup is never remounted
* `indicatorReady`, `checkedIndicatorReady`, `indeterminateIndicatorReady`: `boolean`, true once that indicator's variable is set

An indicator that changes is read again, and one that is taken away clears its variable. An `<svg>` written without `xmlns` gets the SVG namespace added, since an image drawn from markup without it shows nothing. Text in the markup is encoded, so it stays inside the quoted `url()`.

### `useCheckedSync(ref, options)`

Keeps the form of a native checkbox in step with the `checked` its owner sets. React fires no `change` event for a value set from outside. Radix sends a click from a hidden input for it, and this hook sends that click from the input itself.

```tsx
import * as React from 'react'
import { useCheckedSync } from '@gentleduck/primitives/checkers'

function Toggle({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  const ref = React.useRef<HTMLInputElement>(null)
  const sync = useCheckedSync(ref, { checked, onChange: (event) => onCheckedChange(event.target.checked) })

  return <input checked={checked} ref={ref} type="checkbox" {...sync} />
}
```

| Option | Type | Description |
| --- | --- | --- |
| `checked` | `boolean \| undefined` | The state the owner holds the input on, or `undefined` while the input keeps its own |
| `onChange` | `React.ChangeEventHandler<HTMLInputElement>` | The input's own change handler |
| `onClick` | `React.MouseEventHandler<HTMLInputElement>` | The input's own click handler |

Returns `onChange` and `onClick` to put on the input, in place of the ones passed in.

* When `checked` moves to a value the input has not reported, and the input is in a form, the hook dispatches a bubbling `click`. The form's `onChange` and native `change` listeners hear it as they would a click. The input's own `onChange` and `onClick` do not run, and the click stops before React hands it to an ancestor's `onClick`.
* A value the input reported through a click is not sent again when the owner sets it.
* After a form reset, a controlled input is put back on `checked` in the next animation frame, before the browser paints, since the reset lands after its event. An input whose `checked` is `undefined` is left to the reset.
* Outside a form it sends nothing.

Code that imports only `useSvgIndicator` leaves this hook out of its bundle.

***

## Styling contract

Each variable is a complete `url(...)`, so it goes straight into `mask-image` or `background-image`. A mask lets the icon take the input's text colour.

```css
.checkbox::after {
  content: '';
  width: 1em;
  height: 1em;
  background-color: currentColor;
  mask: var(--svg-off) center / contain no-repeat;
}

.checkbox:checked::after {
  mask-image: var(--svg-on);
}

.checkbox:indeterminate::after {
  mask-image: var(--svg-indeterminate);
}
```

A component whose control is not a native input, such as a radio item drawn as a `<button>`, keys the same rules off its own state attribute instead, for example `[data-state='checked']`.

}>
  This utility is intentionally low-level. It is best used inside design-system wrappers where input visuals are custom and behavior comes from primitives such as checkbox/radio components.