```tsx
import { FocusScope } from '@gentleduck/primitives/focus-scope'
```

## Usage

```tsx
<FocusScope trapped loop onMountAutoFocus={(e) => e.preventDefault()}>
  <div>
    <input placeholder="First" />
    <input placeholder="Second" />
    <button>Submit</button>
  </div>
</FocusScope>
```

## Examples

### Trapped and looping

```tsx title="components/focus-scope-trapped.tsx"
// import from your project: import Demo from '@/components/focus-scope-trapped'
'use client'

import { FocusScope } from '@gentleduck/primitives/focus-scope'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function FocusScopeTrappedExample() {
  const [trapped, setTrapped] = React.useState(false)
  const [loop, setLoop] = React.useState(true)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setTrapped((value) => !value)} type="button">
          {trapped ? 'Release focus' : 'Trap focus'}
        </button>
        <button className={styles.button} onClick={() => setLoop((value) => !value)} type="button">
          loop {loop ? 'on' : 'off'}
        </button>
      </div>
      <FocusScope className={`${styles.box} ${styles.stack}`} loop={loop} trapped={trapped}>
        <input className={styles.input} placeholder="First" />
        <input className={styles.input} placeholder="Second" />
        <button className={styles.button} onClick={() => setTrapped(false)} type="button">
          Done
        </button>
      </FocusScope>
      <p className={styles.note}>Trapped, Tab cannot leave the box. loop takes it from Done back to First.</p>
    </div>
  )
}
```

### Mount and unmount focus

```tsx title="components/focus-scope-auto-focus.tsx"
// import from your project: import Demo from '@/components/focus-scope-auto-focus'
'use client'

import { FocusScope } from '@gentleduck/primitives/focus-scope'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function FocusScopeAutoFocusExample() {
  const [shown, setShown] = React.useState(false)
  const [skipMount, setSkipMount] = React.useState(false)
  const toggle = React.useRef<HTMLButtonElement>(null)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setShown((value) => !value)} ref={toggle} type="button">
          {shown ? 'Hide the form' : 'Show the form'}
        </button>
        <label className={styles.choice}>
          <input checked={skipMount} onChange={(event) => setSkipMount(event.target.checked)} type="checkbox" />
          Keep focus where it was
        </label>
      </div>
      {shown ? (
        <FocusScope
          className={`${styles.box} ${styles.stack}`}
          onMountAutoFocus={(event) => skipMount && event.preventDefault()}
          onUnmountAutoFocus={(event) => {
            event.preventDefault()
            toggle.current?.focus()
          }}
          trapped>
          <input className={styles.input} placeholder="Focused on mount" />
          <input className={styles.input} placeholder="Second field" />
        </FocusScope>
      ) : null}
    </div>
  )
}
```

### Branches

```tsx title="components/focus-scope-branches.tsx"
// import from your project: import Demo from '@/components/focus-scope-branches'
'use client'

import { FocusScope } from '@gentleduck/primitives/focus-scope'
import { Portal } from '@gentleduck/primitives/portal'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function FocusScopeBranchesExample() {
  const [branch, setBranch] = React.useState<HTMLDivElement | null>(null)

  return (
    <div className={styles.stack}>
      <FocusScope branches={branch ? [branch] : []} className={`${styles.box} ${styles.stack}`} loop trapped>
        <input className={styles.input} placeholder="Inside the scope" />
        <Portal>
          <div
            className={`${styles.content} ${styles.panel}`}
            ref={setBranch}
            style={{ position: 'fixed', bottom: '1rem', insetInlineEnd: '1rem' }}>
            <button className={styles.button} type="button">
              Portalled, still reachable
            </button>
          </div>
        </Portal>
      </FocusScope>
      <p className={styles.note}>The trapped scope lets focus into the portalled panel, its branch, and back.</p>
    </div>
  )
}
```

***

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `trapped` | `boolean` | `false` | Trap focus inside the scope |
| `loop` | `boolean` | `false` | <Kbd>Tab</Kbd> wraps from last to first element |
| `asChild` | `boolean` | `false` | Render as child element |
| `onMountAutoFocus` | `(event) => void` | - | Called when focus moves in on mount. Prevent default to skip auto-focus. |
| `onUnmountAutoFocus` | `(event) => void` | - | Called when focus restores on unmount |
| `branches` | `readonly HTMLElement[]` | - | Nodes outside the scope's DOM, such as a nested layer's portalled content, that focus may move into |

Focus that lands in an input selects its text, on mount and when focus comes back to it. A <Kbd>Tab</Kbd> pressed while an input method is composing text is left to the input method. An `onKeyDown` passed to the scope runs before its own handler, and a <Kbd>Tab</Kbd> it prevents does not loop.

A looping scope counts a group of native radios as one stop, as the browser does: <Kbd>Tab</Kbd> leaves the group from any radio in it, and looping into the group lands on its checked radio. A focusable `svg` is a stop, and mount focus passes over a link inside an `svg` as it does an html one. Nothing inside a `hidden` or `inert` element or a disabled `<fieldset>` is a stop. The walk for stops enters each open shadow root inside the scope and follows its slots, so a field inside a custom element at the scope's edge is its first or last stop, and radios in a shadow root are a group apart from those of the same name outside it.

A <Kbd>Tab</Kbd> the browser would take to a positive `tabIndex` outside a trapped scope lands on the next stop inside it, read in the scope's own order, and a <Kbd>Shift+Tab</Kbd> on the one before. A trapped scope whose last focused element has gone, such as a button in a branch that closed, takes focus to its own element when focus leaves.

## Iframes, shadow roots and a changing element

The scope works in its container's own document, so inside an iframe it traps, loops and gives focus back there. It reads the element focused inside each open shadow root, so it works inside a shadow root too, and a trapped scope holding a custom element gives focus back to the field inside it rather than to the element itself.

A scope whose element changes, as with `asChild` when its child changes type, stays the same scope. It gives focus back once, when it unmounts, to what had focus when it first mounted, and a scope opened over another keeps the one under it paused throughout.

## Branches

A trapped scope keeps focus inside its own DOM, so a nested layer portalled out of it, such as a popover's content, needs to register as a branch. Host the branches with `useFocusScopeBranchRegistry` and `FocusScopeBranchProvider`, and register each node with `useFocusScopeBranch`:

```tsx
import {
  FocusScope,
  FocusScopeBranchProvider,
  useFocusScopeBranch,
  useFocusScopeBranchRegistry,
} from '@gentleduck/primitives/focus-scope'

function Panel({ children }: { children: React.ReactNode }) {
  const { nodes, registry } = useFocusScopeBranchRegistry()
  return (
    <FocusScopeBranchProvider registry={registry}>
      <FocusScope trapped loop branches={nodes}>
        <div>{children}</div>
      </FocusScope>
    </FocusScopeBranchProvider>
  )
}

function Portalled() {
  const [node, setNode] = React.useState<HTMLDivElement | null>(null)
  useFocusScopeBranch(node)
  return createPortal(<div ref={setNode}>...</div>, document.body)
}
```

A modal `Dialog` and a modal `Popover` host branches, and `Popover.Content` registers itself, so a popover inside a dialog needs nothing extra.

}>
  Used internally by the content of Dialog, Popover, Select and every menu, and a Tooltip's content registers as a branch. You typically don't need to use it directly unless building your own overlay components.