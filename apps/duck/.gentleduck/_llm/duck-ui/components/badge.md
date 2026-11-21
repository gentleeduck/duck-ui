```tsx title="components/badge-1.tsx"
// import from your project: import Demo from '@/components/badge-1'
import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <Badge aria-label="Badge" size={'default'} variant={'default'}>
      Badge
    </Badge>
  )
}
```

## Features

* Supports multiple **styles**, **sizes**, and **borders** with Tailwind theming
* Built-in **hover**, **focus**, and **ring** states for accessibility
* **Icon-ready** with circular `icon` mode and smart sizing
* Lightweight, **ref-forwarding**, and easily composable
* Powered by `@gentleduck/variants` for scalable, consistent design

## Philosophy

A badge is metadata made visible. It labels, categorizes, and quantifies without demanding interaction. We deliberately keep badges non-interactive by default  -  if you need a clickable label, compose it with a button. This constraint keeps the component's purpose clear and its accessibility story simple.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add badge
```

Install the following dependencies:

```bash
npm install @gentleduck/variants @gentleduck/primitives @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Badge } from '@/components/ui/badge'
```

```tsx
<Badge variant="secondary">Badge</Badge>
```

## Examples

### Badge with Tooltip

`Badge` is a flexible and customizable React component used to display small status indicators with
`Tooltip`, ..etc.

```tsx
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const MyBadge = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge aria-label="Badge" className="rounded-full" size="icon" variant="outline">
          <Info />
        </Badge>
      </TooltipTrigger>
      <TooltipContent>Info Badge</TooltipContent>
    </Tooltip>
  )
}
```

### Default

```tsx title="components/badge-2.tsx"
// import from your project: import Demo from '@/components/badge-2'
import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <Badge aria-label="Badge" variant={'default'}>
      Badge
    </Badge>
  )
}
```

### Secondary

```tsx title="components/badge-3.tsx"
// import from your project: import Demo from '@/components/badge-3'
import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <Badge aria-label="Badge" variant={'secondary'}>
      Badge
    </Badge>
  )
}
```

### Destructive

```tsx title="components/badge-4.tsx"
// import from your project: import Demo from '@/components/badge-4'
import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <Badge aria-label="Badge" variant={'destructive'}>
      Badge
    </Badge>
  )
}
```

### Warning

```tsx title="components/badge-5.tsx"
// import from your project: import Demo from '@/components/badge-5'
import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <Badge aria-label="Badge" variant={'warning'}>
      Badge
    </Badge>
  )
}
```

### Dashed

```tsx title="components/badge-6.tsx"
// import from your project: import Demo from '@/components/badge-6'
import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <Badge aria-label="Badge" variant={'dashed'}>
      Badge
    </Badge>
  )
}
```

### Outline

```tsx title="components/badge-7.tsx"
// import from your project: import Demo from '@/components/badge-7'
import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <Badge aria-label="Badge" variant={'outline'}>
      Badge
    </Badge>
  )
}
```

### Icon

```tsx title="components/badge-8.tsx"
// import from your project: import Demo from '@/components/badge-8'
import { Badge } from '@gentleduck/registry-ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Info } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge aria-label="Badge" className="rounded-full" size="icon" variant="outline">
            <Info aria-hidden="true" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Info Badge</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

### Borders and sizes

```tsx title="components/badge-11.tsx"
// import from your project: import Demo from '@/components/badge-11'
import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge border="primary" variant="outline">
          Primary border
        </Badge>
        <Badge border="secondary">Secondary border</Badge>
        <Badge border="destructive">Destructive border</Badge>
        <Badge border="warning">Warning border</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm">Small</Badge>
        <Badge>Default</Badge>
        <Badge size="lg">Large</Badge>
        <Badge className="underline" variant="nothing">
          Unstyled
        </Badge>
      </div>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the badge follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/badge-9.tsx"
// import from your project: import Demo from '@/components/badge-9'
import { Badge } from '@gentleduck/registry-ui/badge'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { BadgeCheckIcon, ClockIcon } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>جديد</Badge>
        <Badge variant="secondary">
          <BadgeCheckIcon aria-hidden="true" className="size-3.5" />
          موثّق
        </Badge>
        <Badge variant="outline">
          <ClockIcon aria-hidden="true" className="size-3.5" />
          قيد المراجعة
        </Badge>
        <Badge variant="destructive">مرفوض</Badge>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionBadge` for a smooth pop-in entrance animation powered by [motion](https://motion.dev). The badge scales and fades in with a bouncy spring on mount.

```tsx title="components/badge-10.tsx"
// import from your project: import Demo from '@/components/badge-10'
'use client'

import { MotionBadge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <MotionBadge>Default</MotionBadge>
      <MotionBadge variant="secondary">Secondary</MotionBadge>
      <MotionBadge variant="destructive">Destructive</MotionBadge>
      <MotionBadge variant="outline">Outline</MotionBadge>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionBadge` instead of `Badge`. Same props except `asChild` is not supported.

## API Reference

### Badge

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'secondary' \| 'destructive' \| 'warning' \| 'dashed' \| 'outline' \| 'nothing'` | `'default'` | Visual style of the badge |
| `size` | `'default' \| 'sm' \| 'lg' \| 'icon'` | `'default'` | Size of the badge |
| `border` | `'default' \| 'primary' \| 'secondary' \| 'destructive' \| 'warning'` | `'default'` | Border style variant |
| `asChild` | `boolean` | `false` | If `true`, renders using a `Slot` instead of a `span` element |
| `className` | `string` | `--` | Additional class names to apply |
| `...props` | `Omit<React.HTMLProps<HTMLSpanElement>, 'size'>` | - | Additional props to spread to the span element |

### MotionBadge

Pops in with a scale-and-fade animation on mount using the `popIn` preset and a `springBouncy` transition. `asChild` is not supported. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `Omit<BadgeProps, 'asChild'>` | - | All props from `Badge` except `asChild` |