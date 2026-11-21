```tsx
import * as Arrow from '@gentleduck/primitives/arrow'
```

## Anatomy

```tsx
<Arrow.Arrow />
```

***

## Usage

```tsx
import { Arrow } from '@gentleduck/primitives/arrow'

function PopoverArrow() {
  return <Arrow width={12} height={6} className="fill-popover" />
}
```

### Custom shape with `asChild`

```tsx
<Arrow.Arrow asChild viewBox="0 0 14 8" width={14} height={8}>
  <path d="M0 0h14L7 8z" />
</Arrow.Arrow>
```

***

## Examples

### Sizes

```tsx title="components/arrow-sizes.tsx"
// import from your project: import Demo from '@/components/arrow-sizes'
'use client'

import * as Arrow from '@gentleduck/primitives/arrow'
import styles from '../primitives.module.css'

const SIZES = [
  { width: 10, height: 5 },
  { width: 16, height: 8 },
  { width: 24, height: 6 },
]

export default function ArrowSizesExample() {
  return (
    <div className={styles.row}>
      {SIZES.map(({ width, height }) => (
        <div className={styles.stack} key={width} style={{ justifyItems: 'center' }}>
          <div className={`${styles.content} ${styles.panel}`} style={{ minWidth: 0 }}>
            {width} x {height}
          </div>
          <Arrow.Root
            aria-hidden
            className={styles.arrow}
            height={height}
            style={{ marginTop: '-0.8rem' }}
            width={width}
          />
        </div>
      ))}
    </div>
  )
}
```

### A shape of your own

```tsx title="components/arrow-custom-shape.tsx"
// import from your project: import Demo from '@/components/arrow-custom-shape'
'use client'

import * as Arrow from '@gentleduck/primitives/arrow'
import styles from '../primitives.module.css'

export default function ArrowCustomShapeExample() {
  return (
    <div className={styles.row}>
      <div className={styles.stack} style={{ justifyItems: 'center' }}>
        <div className={`${styles.content} ${styles.panel}`} style={{ minWidth: 0 }}>
          Sharp
        </div>
        <Arrow.Root aria-hidden asChild className={styles.arrow} height={8} style={{ marginTop: '-0.8rem' }} width={16}>
          <polygon points="0,0 30,0 15,10" />
        </Arrow.Root>
      </div>
      <div className={styles.stack} style={{ justifyItems: 'center' }}>
        <div className={`${styles.content} ${styles.panel}`} style={{ minWidth: 0 }}>
          Notched
        </div>
        <Arrow.Root aria-hidden asChild className={styles.arrow} height={8} style={{ marginTop: '-0.8rem' }} width={16}>
          <path d="M0 0h30L20 10h-10z" />
        </Arrow.Root>
      </div>
    </div>
  )
}
```

***

## API

### `Arrow.Arrow`

Also exported as `Arrow.Root`, the name Radix gives it. Renders an `<svg>` holding a downward arrow with a rounded tip, drawn in a `0 0 30 10` viewBox and stretched to `width` and `height`. A `viewBox` or `preserveAspectRatio` passed in replaces its own. Carries `data-slot="arrow"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `10` | SVG width |
| `height` | `number` | `5` | SVG height |
| `asChild` | `boolean` | - | Draw `children` inside the svg in place of the rounded arrow. The svg stays, unlike `asChild` elsewhere |
| `children` | `React.ReactNode` | - | The shape drawn with `asChild`, in the svg's viewBox |
| `...props` | `React.ComponentPropsWithoutRef<typeof Primitive.svg>` | - | Native SVG props |

***

## Notes

* `Arrow` is commonly used by `popover`, `tooltip`, and menu-like floating content.
* If the arrow is decorative only, set `aria-hidden="true"` on the rendered element.
* Because it renders an SVG element, it can be styled via `fill`, `stroke`, and CSS variables.