```tsx title="components/skeleton-1.tsx"
// import from your project: import Demo from '@/components/skeleton-1'
import { Skeleton } from '@gentleduck/registry-ui/skeleton'

export default function Demo() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
```

## Philosophy

Loading states deserve the same design attention as loaded states. Skeleton placeholders reduce perceived wait time by hinting at the shape of incoming content. We keep this component prop-less intentionally  -  you control the shape through `className` and layout, mirroring the actual content it replaces.

For icon-only UIs, keep a compact icon-sized skeleton instead of removing the skeleton entirely, so layout stability is preserved while loading.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add skeleton
```

Install the following dependencies:

```bash
npm install @gentleduck/libs 
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

```tsx
<Skeleton className="w-[100px] h-[20px] rounded-full" />
```

## Examples

### Card

```tsx title="components/skeleton-2.tsx"
// import from your project: import Demo from '@/components/skeleton-2'
import { Skeleton } from '@gentleduck/registry-ui/skeleton'

export default function Demo() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  )
}
```

### Loading, then content

Each block is hidden from screen readers and stops pulsing under reduced motion, so the region does the telling: mark it `aria-busy` while it loads and put a visually hidden `role="status"` line in it. Size the blocks to the content they stand in for, so nothing moves when it arrives.

```tsx title="components/skeleton-5.tsx"
// import from your project: import Demo from '@/components/skeleton-5'
'use client'

import { Avatar, AvatarFallback } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import { Skeleton } from '@gentleduck/registry-ui/skeleton'
import * as React from 'react'

export default function Demo() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [loading])

  return (
    <div className="grid w-72 gap-4">
      <section aria-busy={loading} aria-label="Profile" className="flex items-center gap-4 rounded-lg border p-4">
        {loading ? (
          <>
            <span className="sr-only" role="status">
              Loading the profile
            </span>
            <Skeleton className="size-12 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="size-12">
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="font-medium text-sm leading-4">Ada Lovelace</p>
              <p className="text-muted-foreground text-xs leading-3">Analyst, London</p>
            </div>
          </>
        )}
      </section>
      <Button disabled={loading} onClick={() => setLoading(true)} size="sm" variant="outline">
        Reload
      </Button>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the skeleton follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/skeleton-3.tsx"
// import from your project: import Demo from '@/components/skeleton-3'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Skeleton } from '@gentleduck/registry-ui/skeleton'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionSkeleton` for staggered entrance animations powered by [motion](https://motion.dev). Each skeleton block uses a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition, staggered by 50ms via the `index` prop.

```tsx title="components/skeleton-4.tsx"
// import from your project: import Demo from '@/components/skeleton-4'
'use client'

import { MotionSkeleton } from '@gentleduck/registry-ui/skeleton'

export default function Demo() {
  return (
    <div className="flex items-center space-x-4">
      <MotionSkeleton className="h-12 w-12 rounded-full" index={0} />
      <div className="space-y-2">
        <MotionSkeleton className="h-4 w-[250px]" index={1} />
        <MotionSkeleton className="h-4 w-[200px]" index={2} />
      </div>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionSkeleton` instead of `Skeleton`. Same props plus `index` for stagger delay. The regular `Skeleton` is perfectly fine - this is an optional enhancement.

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS class names to control shape and size. The block is `aria-hidden`, and its pulse stops under `prefers-reduced-motion`. |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### MotionSkeleton

Staggered `scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Stagger delay index (50ms per index) for entrance animation |
| `...props` | `SkeletonProps` | - | All props from `Skeleton` are supported |