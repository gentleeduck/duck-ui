```tsx
import * as VisuallyHidden from '@gentleduck/primitives/visibility-hidden'
```

## Anatomy

```tsx
<VisuallyHidden.Root>Accessible-only label</VisuallyHidden.Root>
```

***

## Usage

```tsx
import { VisuallyHidden } from '@gentleduck/primitives/visibility-hidden'

function IconButtonLabel() {
  return (
    <button>
      <svg aria-hidden viewBox="0 0 16 16" />
      <VisuallyHidden>Open notifications</VisuallyHidden>
    </button>
  )
}
```

### Icon-only button label

```tsx
<button>
  <BellIcon aria-hidden />
  <VisuallyHidden.Root>Open notifications</VisuallyHidden.Root>
</button>
```

***

## Examples

### An icon button's label

```tsx title="components/visually-hidden-icon-label.tsx"
// import from your project: import Demo from '@/components/visually-hidden-icon-label'
'use client'

import { VisuallyHidden } from '@gentleduck/primitives/visibility-hidden'
import styles from '../primitives.module.css'

export default function VisuallyHiddenIconLabelExample() {
  return (
    <button className={styles.button} type="button">
      <span aria-hidden>x</span>
      <VisuallyHidden>Close notifications</VisuallyHidden>
    </button>
  )
}
```

### Hiding a dialog title

```tsx title="components/visually-hidden-dialog-title.tsx"
// import from your project: import Demo from '@/components/visually-hidden-dialog-title'
'use client'

import * as Dialog from '@gentleduck/primitives/dialog'
import { VisuallyHidden } from '@gentleduck/primitives/visibility-hidden'
import styles from '../primitives.module.css'

export default function VisuallyHiddenDialogTitleExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.button}>Open a photo</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content aria-describedby={undefined} className={styles.dialog}>
          <VisuallyHidden asChild>
            <Dialog.Title>Sunset over the harbour</Dialog.Title>
          </VisuallyHidden>
          <div className={styles.box} style={{ height: '10rem' }} />
          <Dialog.Close className={styles.button}>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

***

## API

### `VisuallyHidden` / `Root`

Renders a visually hidden `<span>` using an accessibility-safe clipping pattern. The `span` carries `data-slot="visually-hidden"`; with `asChild` the child keeps its own `data-slot`, so a hidden `Dialog.Title` still reads `dialog-title`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Hide the child itself in place of a `<span>`, such as a `Dialog.Title` |
| `style` | `React.CSSProperties` | - | Inline styles merged after the hidden ones, so one given replaces its hidden counterpart |
| `...props` | `React.ComponentPropsWithoutRef<typeof Primitive.span>` | - | Native span props |

***

## Accessibility guidance

* Use this primitive when text must be available to assistive tech but not visible.
* Prefer it for icon-only controls, additional context labels, and hidden headings.
* Do not use it to hide interactive controls from visual users; use proper conditional rendering for that case.