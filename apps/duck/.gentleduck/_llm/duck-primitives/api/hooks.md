```tsx
import { useControllableState } from '@gentleduck/primitives/hooks/use-controllable-state'
import { useSize } from '@gentleduck/primitives/hooks/use-size'
```

Each hook is imported from `@gentleduck/primitives/hooks/<file>`, the file named in its heading.

## Examples

### useControllableState

```tsx title="components/hooks-controllable-state.tsx"
// import from your project: import Demo from '@/components/hooks-controllable-state'
'use client'

import { useControllableState } from '@gentleduck/primitives/hooks/use-controllable-state'
import * as React from 'react'
import styles from '../primitives.module.css'

function Stepper({
  value,
  defaultValue = 0,
  onValueChange,
}: {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
}) {
  const [count, setCount] = useControllableState({
    caller: 'Stepper',
    defaultProp: defaultValue,
    onChange: onValueChange,
    prop: value,
  })
  return (
    <div className={styles.row}>
      <button className={styles.button} onClick={() => setCount(count - 1)} type="button">
        -
      </button>
      <span className={styles.note}>{count}</span>
      <button className={styles.button} onClick={() => setCount(count + 1)} type="button">
        +
      </button>
    </div>
  )
}

export default function HooksControllableStateExample() {
  const [value, setValue] = React.useState(10)

  return (
    <div className={styles.stack}>
      <span className={styles.label}>Uncontrolled, starting at 3</span>
      <Stepper defaultValue={3} />
      <span className={styles.label}>Controlled by the page ({value})</span>
      <Stepper onValueChange={setValue} value={value} />
    </div>
  )
}
```

### useSize

```tsx title="components/hooks-size.tsx"
// import from your project: import Demo from '@/components/hooks-size'
'use client'

import { useSize } from '@gentleduck/primitives/hooks/use-size'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function HooksSizeExample() {
  const [element, setElement] = React.useState<HTMLTextAreaElement | null>(null)
  const size = useSize(element)

  return (
    <div className={styles.stack}>
      <textarea
        className={styles.input}
        defaultValue="Drag my corner."
        ref={setElement}
        rows={3}
        style={{ resize: 'both' }}
      />
      <p className={styles.note}>{size ? `${Math.round(size.width)} x ${Math.round(size.height)}` : 'Measuring...'}</p>
    </div>
  )
}
```

### usePrevious

```tsx title="components/hooks-previous.tsx"
// import from your project: import Demo from '@/components/hooks-previous'
'use client'

import { usePrevious } from '@gentleduck/primitives/hooks/use-previous'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function HooksPreviousExample() {
  const [price, setPrice] = React.useState(42)
  const [, rerender] = React.useState(0)
  const previous = usePrevious(price)
  const trend = price > previous ? 'up' : price < previous ? 'down' : 'flat'

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setPrice((value) => value + 1)} type="button">
          Raise
        </button>
        <button className={styles.button} onClick={() => setPrice((value) => value - 1)} type="button">
          Lower
        </button>
        <button className={styles.button} onClick={() => rerender((count) => count + 1)} type="button">
          Render again
        </button>
      </div>
      <p className={styles.note}>
        {price}, was {previous}, {trend}. A render that changes nothing keeps the previous value.
      </p>
    </div>
  )
}
```

### useStateMachine

```tsx title="components/hooks-state-machine.tsx"
// import from your project: import Demo from '@/components/hooks-state-machine'
'use client'

import { useStateMachine } from '@gentleduck/primitives/hooks/use-state-machine'
import styles from '../primitives.module.css'

export default function HooksStateMachineExample() {
  const [state, send] = useStateMachine('stopped', {
    paused: { play: 'playing', stop: 'stopped' },
    playing: { pause: 'paused', stop: 'stopped' },
    stopped: { play: 'playing' },
  })

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => send('play')} type="button">
          Play
        </button>
        <button className={styles.button} onClick={() => send('pause')} type="button">
          Pause
        </button>
        <button className={styles.button} onClick={() => send('stop')} type="button">
          Stop
        </button>
      </div>
      <p className={styles.note}>State: {state}. An event the state has no move for is dropped.</p>
    </div>
  )
}
```

### useEscapeKeydown

```tsx title="components/hooks-escape-keydown.tsx"
// import from your project: import Demo from '@/components/hooks-escape-keydown'
'use client'

import { useEscapeKeydown } from '@gentleduck/primitives/hooks/use-escape-keydown'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function HooksEscapeKeydownExample() {
  const [count, setCount] = React.useState(0)
  useEscapeKeydown(() => setCount((value) => value + 1))

  return (
    <div className={styles.stack}>
      <input className={styles.input} placeholder="Type in Japanese, then Escape" />
      <p className={styles.note}>
        Escape pressed {count} times. One that ends an input method's composition is not counted.
      </p>
    </div>
  )
}
```

### useId

```tsx title="components/hooks-id.tsx"
// import from your project: import Demo from '@/components/hooks-id'
'use client'

import { useId } from '@gentleduck/primitives/hooks/use-id'
import styles from '../primitives.module.css'

function Field({ label, id }: { label: string; id?: string }) {
  const inputId = useId(id)
  return (
    <div className={styles.stack}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input className={styles.input} id={inputId} />
      <span className={styles.note}>id: {inputId}</span>
    </div>
  )
}

export default function HooksIdExample() {
  return (
    <div className={styles.row}>
      <Field label="Generated" />
      <Field id="billing-email" label="Given" />
    </div>
  )
}
```

***

## `useControllableState` (`use-controllable-state`)

```tsx
function Switch({ checked, defaultChecked = false, onCheckedChange }: SwitchProps) {
  const [on, setOn] = useControllableState({
    prop: checked,
    defaultProp: defaultChecked,
    onChange: onCheckedChange,
    caller: 'Switch',
  })
  return <button aria-pressed={on} onClick={() => setOn((value) => !value)} type="button" />
}
```

| Option | Type | Description |
| --- | --- | --- |
| `prop` | `T \| undefined` | The controlled value. While it is set, `setValue` only calls `onChange`, and only with a value that differs from it |
| `defaultProp` | `T` | The starting value when uncontrolled |
| `onChange` | `(value: T) => void` | Called once per change in either mode |
| `caller` | `string` | Named in the development warning a switch between controlled and uncontrolled logs |

`setValue` takes a value or an updater, as `useState`'s does.

## `useCallbackRef` (`use-callback-ref`)

`useCallbackRef(callback)` returns a function whose identity never changes and which always calls the latest `callback`, so it can sit in an effect's dependencies. It calls nothing while `callback` is `undefined`.

## `useEscapeKeydown` (`use-escape-keydown`)

`useEscapeKeydown(onEscapeKeyDown, ownerDocument = document)` listens for Escape on `ownerDocument` in the capture phase. An Escape pressed during an IME composition is left to the input method, which cancels the composition with it.

## `useFocusGuards` and `FocusGuards` (`use-focus-guard`)

`useFocusGuards()` keeps a focusable, invisible `span` with `data-slot="focus-guard"` at each edge of the body while any user of it is mounted, so focus leaving a portalled focus scope has somewhere to land. Every user shares one pair, which moves only when something has been put outside it and goes with the last user. `FocusGuards` is the same as a component around its children.

## `useId` (`use-id`)

`useId(deterministicId?)` returns `deterministicId` when it is given, and otherwise React's `useId` prefixed `gentleduck-`.

## `useLayoutEffect` (`use-layout-effect`)

React's `useLayoutEffect` in a browser, and a function that does nothing on the server, where React warns about a layout effect.

## `usePrevious` (`use-previous`)

`usePrevious(value)` returns the value before the last change, through renders that change nothing. A value is recorded when its render reaches the page, so a render React throws away, as when a transition suspends, does not count.

## `useSize` (`use-size`)

`useSize(element)` returns the element's border-box `{ width, height }`, measured as it mounts and then from a `ResizeObserver`, or `undefined` without an element. A report is applied on the next animation frame, only the last of several in one frame, and one that repeats the size it has renders nothing.

## `useStateMachine` (`use-state-machine`)

```tsx
const [state, send] = useStateMachine('stopped', {
  stopped: { play: 'playing' },
  playing: { pause: 'paused', stop: 'stopped' },
  paused: { play: 'playing', stop: 'stopped' },
})
```

`send(event)` moves to the state the table gives for the current state and that event. An event with no transition from the current state is dropped without a render. Two sends in one handler are read in order, the second from the state the first leads to. `send` never changes identity.