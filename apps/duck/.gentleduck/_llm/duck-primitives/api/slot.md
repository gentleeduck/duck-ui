```tsx
import { Slot, Slottable, createSlot, createSlottable } from '@gentleduck/primitives/slot'
```

## Examples

### asChild with Slot

```tsx title="components/slot-as-child.tsx"
// import from your project: import Demo from '@/components/slot-as-child'
'use client'

import { Slot } from '@gentleduck/primitives/slot'
import type * as React from 'react'
import styles from '../primitives.module.css'

function Button({ asChild, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Component = asChild ? Slot : 'button'
  return <Component className={styles.button} {...props} />
}

export default function SlotAsChildExample() {
  return (
    <div className={styles.row}>
      <Button type="button">A button</Button>
      <Button asChild>
        <a href="#docs">A link styled as one</a>
      </Button>
    </div>
  )
}
```

### How props merge

```tsx title="components/slot-merge-props.tsx"
// import from your project: import Demo from '@/components/slot-merge-props'
'use client'

import { Slot } from '@gentleduck/primitives/slot'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function SlotMergePropsExample() {
  const [log, setLog] = React.useState<string[]>([])
  const add = (entry: string) => () => setLog((entries) => [...entries, entry].slice(-4))

  return (
    <div className={styles.stack}>
      <Slot className={styles.button} onClick={add('slot handler')} style={{ padding: '0.6rem 1rem' }}>
        <button className={styles.primary} onClick={add('child handler')} style={{ padding: '0.3rem' }} type="button">
          Click me
        </button>
      </Slot>
      <p className={styles.note}>
        Both classes apply, the child's padding wins, and both handlers run, the child's first. {log.join(', ')}
      </p>
    </div>
  )
}
```

### Slottable

```tsx title="components/slot-slottable.tsx"
// import from your project: import Demo from '@/components/slot-slottable'
'use client'

import { Slot, Slottable } from '@gentleduck/primitives/slot'
import type * as React from 'react'
import styles from '../primitives.module.css'

function IconButton({ asChild, children, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Component = asChild ? Slot : 'button'
  return (
    <Component className={styles.button} {...props}>
      <span aria-hidden>+</span>
      <Slottable>{children}</Slottable>
    </Component>
  )
}

export default function SlotSlottableExample() {
  return (
    <div className={styles.row}>
      <IconButton type="button">New file</IconButton>
      <IconButton asChild>
        <a href="#new">New file as a link</a>
      </IconButton>
    </div>
  )
}
```

***

## What it does

}>
  `Slot` renders its child element instead of creating its own DOM node, merging all props from the Slot onto the child. This is the mechanism behind `asChild`.

When `<Primitive.button asChild>` is used, the `button` element is replaced by a `Slot`, and the child element receives all the button's props (ARIA attributes, event handlers, refs, etc.). The Slot is a single component, so an `asChild` adds one entry to the React tree. `Root` is the same component under the name the other primitives use.

## How props merge

| Prop type | Behavior |
| --- | --- |
| Event handlers (`onClick`, etc.) | Both fire (child first, then slot) |
| `style` | Merged (child overrides slot) |
| `className` | Concatenated, the slot's first |
| `aria-describedby` | Joined, the child's ids first, with blanks, repeats and a `false` or other value that is not a string dropped |
| `ref` | Both refs receive the element through one composed ref that keeps its identity across renders, so a child ref that sets state does not loop. A slot with no ref of its own hands the child its own ref unchanged |
| `dangerouslySetInnerHTML` | Dropped, so `asChild` cannot inject raw HTML into the child |
| Everything else | Child props override slot props |

## What it can slot onto

The Slot needs one React element: its only child, or the element inside its `Slottable`. `null`, `undefined`, `false` and an empty string render nothing. Anything else, such as text, a number, `0` or several elements, throws an error naming the owner:

```text
Primitive.button failed to slot onto its children. Expected a single React element child or `Slottable`.
```

A lazy reference a server component passes as the child is unwrapped with `React.use` until it reaches the element.

## Creating named slots

Use `createSlot` and `createSlottable` to create named instances for better debugging in React DevTools and clearer errors:

```tsx
const MySlot = createSlot('MyComponent')
const MySlottable = createSlottable('MyComponent')
```

## `Slottable`

}>
  Marks the child the Slot lands on when the Slot has other children too. It is identified by `Symbol.for('gentleduck.slottable')`, a key in the global symbol registry, so a `Slottable` from another copy of the package still counts.

The Slot's other children go inside the element, where the `Slottable` stood. A child that comes and goes, such as `{icon && <Icon />}`, leaves the element's own children where they were, so they keep their state:

```tsx
<Slot>
  <Icon />
  <Slottable>
    <a href="/">Home</a>
  </Slottable>
</Slot>

// renders
<a href="/"><Icon />Home</a>
```

To wrap the element's own children as well, pass the element as `child` and a function as `children`. The function receives the element's children and returns what goes inside it:

```tsx
<Slot>
  <Slottable child={<a href="/">Home</a>}>{(label) => <span className="label">{label}</span>}</Slottable>
  <Icon />
</Slot>

// renders
<a href="/"><span class="label">Home</span><Icon /></a>
```