```tsx
import * as Avatar from '@gentleduck/primitives/avatar'
```

## Anatomy

```tsx
<Avatar.Root>
  <Avatar.Image />
  <Avatar.Fallback />
</Avatar.Root>
```

***

## Usage

```tsx
import * as Avatar from '@gentleduck/primitives/avatar'

function UserAvatar() {
  return (
    <Avatar.Root className="relative flex size-10 shrink-0 overflow-hidden rounded-full">
      <Avatar.Image
        src="https://github.com/wildduck.png"
        alt="@wildduck"
        className="aspect-square size-full"
      />
      <Avatar.Fallback className="flex size-full items-center justify-center rounded-full bg-muted" delayMs={600}>
        WD
      </Avatar.Fallback>
    </Avatar.Root>
  )
}
```

***

## Examples

### Image and fallback

```tsx title="components/avatar-fallback.tsx"
// import from your project: import Demo from '@/components/avatar-fallback'
'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import styles from '../primitives.module.css'

export default function AvatarFallbackExample() {
  return (
    <div className={styles.row}>
      <Avatar.Root className={styles.avatar}>
        <Avatar.Image
          alt="gentleduck"
          className={styles.avatarImage}
          src="https://avatars.githubusercontent.com/u/108896341?v=4"
        />
        <Avatar.Fallback>GD</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root className={styles.avatar}>
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar.Root>
    </div>
  )
}
```

### Loading status

```tsx title="components/avatar-loading-status.tsx"
// import from your project: import Demo from '@/components/avatar-loading-status'
'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AvatarLoadingStatusExample() {
  const [good, setGood] = React.useState('idle')
  const [broken, setBroken] = React.useState('idle')

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Avatar.Root className={styles.avatar}>
          <Avatar.Image
            alt="gentleduck"
            className={styles.avatarImage}
            onLoadingStatusChange={setGood}
            src="https://avatars.githubusercontent.com/u/108896341?v=4"
          />
          <Avatar.Fallback>GD</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root className={styles.avatar}>
          <Avatar.Image
            alt="Missing"
            className={styles.avatarImage}
            onLoadingStatusChange={setBroken}
            src="https://example.invalid/missing.png"
          />
          <Avatar.Fallback>?</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <p className={styles.note}>
        First image: {good}. Broken image: {broken}, so its fallback stays.
      </p>
    </div>
  )
}
```

### Delayed fallback

```tsx title="components/avatar-delay.tsx"
// import from your project: import Demo from '@/components/avatar-delay'
'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AvatarDelayExample() {
  const [key, setKey] = React.useState(0)

  return (
    <div className={styles.stack}>
      <div className={styles.row} key={key}>
        <Avatar.Root className={styles.avatar}>
          <Avatar.Image alt="Slow" className={styles.avatarImage} src="https://example.invalid/slow.png" />
          <Avatar.Fallback delayMs={600}>600</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root className={styles.avatar}>
          <Avatar.Image alt="Slow" className={styles.avatarImage} src="https://example.invalid/slow.png" />
          <Avatar.Fallback delayMs={0}>0</Avatar.Fallback>
        </Avatar.Root>
      </div>
      <button className={styles.button} onClick={() => setKey((value) => value + 1)} type="button">
        Mount again
      </button>
      <p className={styles.note}>
        delayMs keeps a fallback back so a fast image never flashes it. At 0 it shows on the first render.
      </p>
    </div>
  )
}
```

### srcSet only

```tsx title="components/avatar-src-set.tsx"
// import from your project: import Demo from '@/components/avatar-src-set'
'use client'

import * as Avatar from '@gentleduck/primitives/avatar'
import styles from '../primitives.module.css'

export default function AvatarSrcSetExample() {
  return (
    <div className={styles.stack}>
      <Avatar.Root className={styles.avatar} style={{ width: '3.5rem', height: '3.5rem' }}>
        <Avatar.Image
          alt="gentleduck"
          className={styles.avatarImage}
          sizes="56px"
          srcSet="https://avatars.githubusercontent.com/u/108896341?v=4&s=56 1x, https://avatars.githubusercontent.com/u/108896341?v=4&s=112 2x"
        />
        <Avatar.Fallback>GD</Avatar.Fallback>
      </Avatar.Root>
      <p className={styles.note}>A srcSet alone is enough: the browser picks the candidate for the screen.</p>
    </div>
  )
}
```

***

## API

### `Avatar.Root`

The root container that manages image loading state. Renders a `<span>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `string` | - | Sets the `dir` attribute, `auto` included. Leave it out and the avatar follows the page |
| `asChild` | `boolean` | - | Render as child element |

### `Avatar.Image`

The `<img>` element. It is in the page from the first render, the server's HTML included, so the download starts before the page hydrates. Until it loads it is hidden but still laid out, so `loading="lazy"` still waits for the viewport. An image that loads as 0 by 0 counts as an error. Render one per `Avatar.Root`: a second logs a warning in development.

It shows once it is complete with a natural size, which covers an image that loaded before hydration. A new `src` or `srcSet` hides it again until that one loads, unless the browser already has it. Every other `<img>` attribute, such as `sizes`, `loading`, `crossOrigin` and `referrerPolicy`, goes on the image as given, and `onLoad` and `onError` still fire.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | - | Image source URL |
| `srcSet` | `string` | - | Candidate images for other pixel densities or widths. Enough on its own, without a `src` |
| `onLoadingStatusChange` | `(status: ImageLoadingStatus) => void` | - | Called when loading status changes |
| `asChild` | `boolean` | - | Render as child element |

**`ImageLoadingStatus`**: `'idle' | 'loading' | 'loaded' | 'error'`, exported as `IAvatar.ImageLoadingStatus`

| Data attribute | Values |
| --- | --- |
| `data-state` | `'loading' \| 'loaded' \| 'error'` |

Style the loaded image with `[data-state="loaded"]`, for example to fade it in. While it is not loaded, its inline `style` also carries `position: absolute`, a 1px size and `visibility: hidden`.

### `Avatar.Fallback`

Renders until the image loads, and again if the image unmounts. Renders a `<span>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `delayMs` | `number` | - | Delay in milliseconds before showing the fallback. A new value starts the wait over |
| `asChild` | `boolean` | - | Render as child element |