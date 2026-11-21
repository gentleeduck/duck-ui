```tsx title="components/separator-1.tsx"
// import from your project: import Demo from '@/components/separator-1'
import { Separator } from '@gentleduck/registry-ui/separator'

export default function Demo() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="font-medium text-sm leading-none">Duck UI</h4>
        <p className="text-muted-foreground text-sm">An open-source UI component library.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  )
}
```

## Philosophy

Visual hierarchy needs breathing room. The Separator creates semantic and visual boundaries between content sections. We expose `orientation` as the only meaningful prop because a divider's job is to divide  -  its value comes from where you place it, not how you configure it.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add separator
```

Install the following dependencies:

```bash
npm install @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Separator } from "@/components/ui/separator"
```

```tsx
<Separator />
```

## Examples

### Labelled divider

Two separators that share a row with `flex-1` leave the label between them.

```tsx title="components/separator-4.tsx"
// import from your project: import Demo from '@/components/separator-4'
import { Button } from '@gentleduck/registry-ui/button'
import { Separator } from '@gentleduck/registry-ui/separator'

export default function Demo() {
  return (
    <div className="grid w-72 gap-4">
      <Button>Sign in with a passkey</Button>
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs uppercase">or</span>
        <Separator className="flex-1" />
      </div>
      <Button variant="outline">Email me a link</Button>
    </div>
  )
}
```

### Between rows

```tsx title="components/separator-5.tsx"
// import from your project: import Demo from '@/components/separator-5'
import { Separator } from '@gentleduck/registry-ui/separator'
import * as React from 'react'

const RELEASES = [
  { name: 'v2.4.0', note: 'Calendar date fields' },
  { name: 'v2.3.1', note: 'Select highlight fix' },
  { name: 'v2.3.0', note: 'Resizable collapsing' },
]

export default function Demo() {
  return (
    <div className="w-72 rounded-md border">
      {RELEASES.map((release, index) => (
        <React.Fragment key={release.name}>
          {index > 0 ? <Separator /> : null}
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-medium">{release.name}</span>
            <span className="text-muted-foreground">{release.note}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}
```

### Colour and thickness

The line is the separator's background, so a `bg-*` class colours it and a height class thickens a horizontal one. A dashed line is a top border with the background cleared.

```tsx title="components/separator-6.tsx"
// import from your project: import Demo from '@/components/separator-6'
import { Separator } from '@gentleduck/registry-ui/separator'

export default function Demo() {
  return (
    <div className="grid w-72 gap-6 text-muted-foreground text-sm">
      <div className="grid gap-2">
        Primary
        <Separator className="bg-primary" />
      </div>
      <div className="grid gap-2">
        Thicker
        <Separator className="h-1 rounded-full" />
      </div>
      <div className="grid gap-2">
        Dashed
        <Separator className="border-t border-dashed bg-transparent" />
      </div>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the separator follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/separator-2.tsx"
// import from your project: import Demo from '@/components/separator-2'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Separator } from '@gentleduck/registry-ui/separator'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div>
        <div className="space-y-1">
          <h4 className="font-medium text-sm leading-none">مكونات Duck UI</h4>
          <p className="text-muted-foreground text-sm">مكتبة مكونات واجهات مفتوحة المصدر.</p>
        </div>
        <Separator className="my-4" />
        <div className="flex h-5 items-center gap-4 text-sm">
          <div>المدونة</div>
          <Separator orientation="vertical" />
          <div>التوثيق</div>
          <Separator orientation="vertical" />
          <div>المصدر</div>
        </div>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionSeparator` for a smooth expand-from-center animation powered by [motion](https://motion.dev). Horizontal separators scale along the X axis, vertical ones along Y.

```tsx title="components/separator-3.tsx"
// import from your project: import Demo from '@/components/separator-3'
import { MotionSeparator } from '@gentleduck/registry-ui/separator'

export default function Demo() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="font-medium text-sm leading-none">Duck UI</h4>
        <p className="text-muted-foreground text-sm">An open-source UI component library.</p>
      </div>
      <MotionSeparator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <MotionSeparator orientation="vertical" />
        <div>Docs</div>
        <MotionSeparator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionSeparator` instead of `Separator`. Same props. The regular `Separator` is perfectly fine - this is an optional enhancement.

## API Reference

### Separator

Writes the orientation as both `aria-orientation` and `data-orientation`, so a class such as `data-[orientation=vertical]:h-auto` can key on it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Controls the orientation of the separator line |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS class names |
| `...props` | `React.HTMLAttributes<HTMLHRElement>` | - | Additional props to spread to the hr element |

### MotionSeparator

Expands from center with `springBouncy` transition: scales along X for horizontal, Y for vertical. Renders a `div` with `role="separator"` instead of `hr`. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Controls the orientation and animation axis |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override |
| `className` | `string` | - | Additional CSS class names |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the div element |