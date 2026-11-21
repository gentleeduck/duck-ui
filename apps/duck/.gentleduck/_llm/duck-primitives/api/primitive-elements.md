```tsx
import { Primitive } from '@gentleduck/primitives/primitive-elements'
```

## Usage

```tsx
// Renders a native <button>
<Primitive.button onClick={handleClick}>Click me</Primitive.button>

// Renders YOUR element with the button's forwarded props
<Primitive.button asChild>
  <a href="/next">Navigate</a>
</Primitive.button>
```

## Examples

### asChild

```tsx title="components/primitive-as-child.tsx"
// import from your project: import Demo from '@/components/primitive-as-child'
'use client'

import { Primitive } from '@gentleduck/primitives/primitive-elements'
import styles from '../primitives.module.css'

export default function PrimitiveAsChildExample() {
  return (
    <div className={styles.row}>
      <Primitive.button className={styles.button} onClick={() => undefined} type="button">
        A native button
      </Primitive.button>
      <Primitive.button asChild className={styles.button}>
        <a href="#next">A link that takes the button's props</a>
      </Primitive.button>
    </div>
  )
}
```

### A primitive of your own

```tsx title="components/primitive-custom.tsx"
// import from your project: import Demo from '@/components/primitive-custom'
'use client'

import { Primitive } from '@gentleduck/primitives/primitive-elements'
import * as React from 'react'
import styles from '../primitives.module.css'

const Badge = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<typeof Primitive.span>>(
  ({ className, ...props }, ref) => (
    <Primitive.span className={`${styles.note} ${className ?? ''}`} data-slot="badge" ref={ref} {...props} />
  ),
)

export default function PrimitiveCustomExample() {
  return (
    <div className={styles.row}>
      <Badge>A badge</Badge>
      <Badge asChild>
        <a href="#releases">A badge that is a link</a>
      </Badge>
    </div>
  )
}
```

***

## Available elements

}>
  `Primitive.a`, `Primitive.button`, `Primitive.div`, `Primitive.form`, `Primitive.h2`, `Primitive.h3`, `Primitive.img`, `Primitive.input`, `Primitive.label`, `Primitive.li`, `Primitive.nav`, `Primitive.ol`, `Primitive.p`, `Primitive.select`, `Primitive.span`, `Primitive.svg`, `Primitive.ul`

  Each accepts all native HTML props for that element type, plus `asChild`. `asChild` stays with the primitive, so one primitive can slot onto another. `Primitive` is also exported as `Root`, the name Radix gives it.

## Building custom primitives

}>
  When building your own primitives, use `Primitive.*` elements as the base to get `asChild` support for free.

```tsx
const MyButton = React.forwardRef((props, ref) => {
  return <Primitive.button {...props} ref={ref} />
})
```