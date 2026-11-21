```tsx title="components/resizable-1.tsx"
// import from your project: import Demo from '@/components/resizable-1'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'

export default function Demo() {
  return (
    <ResizablePanelGroup className="max-w-md rounded-lg border md:min-w-[450px]" orientation="horizontal">
      <ResizablePanel defaultSize="50%">
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="50%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="25%">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="75%">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

## Philosophy

Resizable panels let users allocate screen real estate to match their workflow. We wrap react-resizable-panels because the math of proportional resizing, minimum sizes, and persistent layouts is deceptively complex. The PanelGroup/Panel/Handle model keeps the API simple while supporting arbitrarily complex layouts.

## About

The `Resizable` component is built on top of
[`react-resizable-panels`](https://github.com/bvaughn/react-resizable-panels) by [`bvaughn`](https://github.com/bvaughn).

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add resizable
```

Install the following dependencies:

```bash
npm install react-resizable-panels @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
```

```tsx showLineNumbers
<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel>One</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Two</ResizablePanel>
</ResizablePanelGroup>
```

## Examples

### Vertical

Use the `orientation` prop to set the direction of the resizable panels.

```tsx title="components/resizable-2.tsx"
// import from your project: import Demo from '@/components/resizable-2'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'

export default function Demo() {
  return (
    <ResizablePanelGroup className="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]" orientation="vertical">
      <ResizablePanel defaultSize="25%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Header</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="75%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

```tsx showLineNumbers {9}
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Example() {
  return (
    <ResizablePanelGroup orientation="vertical">
      <ResizablePanel>One</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>Two</ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

### Handle

The grip handle shows by default. Pass `withHandle={false}` to render only the thin line without the visible grip.

```tsx title="components/resizable-3.tsx"
// import from your project: import Demo from '@/components/resizable-3'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'

export default function Demo() {
  return (
    <ResizablePanelGroup className="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]" orientation="horizontal">
      <ResizablePanel defaultSize="25%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle={false} />
      <ResizablePanel defaultSize="75%">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

```tsx showLineNumbers {11}
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Example() {
  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel>One</ResizablePanel>
      <ResizableHandle withHandle={false} />
      <ResizablePanel>Two</ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

### Sizes, limits and collapsing

A size given as a string is a percentage of the group, `"30%"` or just `"30"`, and a size given as a number is pixels. `minSize` and `maxSize` bound a drag. A `collapsible` panel dragged below its `minSize` snaps to `collapsedSize`, and `onResize` reports each new size, so this sidebar swaps its label for an initial once it is a rail.

```tsx title="components/resizable-6.tsx"
// import from your project: import Demo from '@/components/resizable-6'
'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'
import * as React from 'react'

export default function Demo() {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <ResizablePanelGroup className="min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]">
      <ResizablePanel
        collapsedSize="8%"
        collapsible
        defaultSize="30%"
        maxSize="45%"
        minSize="20%"
        onResize={({ asPercentage }) => setCollapsed(asPercentage < 20)}>
        <div className="flex h-full items-center justify-center p-2">
          <span className="font-semibold">{collapsed ? 'N' : 'Navigation'}</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="70%">
        <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground text-sm">
          Drag the sidebar below 20% and it snaps shut to a rail
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

### Reading the layout

`onLayoutChange` reports every panel's size, keyed by its `id`, on each move of a drag. `onLayoutChanged` reports once the drag ends, so it is the one to save, and `defaultLayout` takes the same shape back to restore it.

```tsx title="components/resizable-7.tsx"
// import from your project: import Demo from '@/components/resizable-7'
'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'
import * as React from 'react'

const DEFAULT_LAYOUT = { editor: 70, files: 30 }

export default function Demo() {
  const [layout, setLayout] = React.useState<Record<string, number>>(DEFAULT_LAYOUT)

  return (
    <div className="flex max-w-md flex-col gap-2 md:min-w-[450px]">
      <ResizablePanelGroup
        className="min-h-[160px] rounded-lg border"
        defaultLayout={DEFAULT_LAYOUT}
        onLayoutChange={setLayout}>
        <ResizablePanel id="files" minSize="20%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Files</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel id="editor" minSize="30%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Editor</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <p className="text-muted-foreground text-sm">
        {Object.entries(layout)
          .map(([panel, size]) => `${panel} ${Math.round(size)}%`)
          .join(', ')}
      </p>
    </div>
  )
}
```

### Disabled

A `disabled` handle cannot be dragged or focused, and it dims. It can be locked and unlocked at any time.

```tsx title="components/resizable-8.tsx"
// import from your project: import Demo from '@/components/resizable-8'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'
import * as React from 'react'

export default function Demo() {
  const [locked, setLocked] = React.useState(true)

  return (
    <div className="flex max-w-md flex-col gap-3 md:min-w-[450px]">
      <ResizablePanelGroup className="min-h-[160px] rounded-lg border">
        <ResizablePanel defaultSize="40%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Preview</span>
          </div>
        </ResizablePanel>
        <ResizableHandle disabled={locked} />
        <ResizablePanel defaultSize="60%">
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Code</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Button className="self-start" onClick={() => setLocked(!locked)} size="sm" variant="outline">
        {locked ? 'Unlock the layout' : 'Lock the layout'}
      </Button>
    </div>
  )
}
```

### Saving the layout

```tsx title="components/resizable-9.tsx"
// import from your project: import Demo from '@/components/resizable-9'
'use client'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'
import * as React from 'react'

export default function Demo() {
  const [saved, setSaved] = React.useState('50, 50')

  return (
    <div className="flex flex-col items-center gap-3">
      <ResizablePanelGroup
        className="max-w-md rounded-lg border md:min-w-[450px]"
        onLayoutChanged={(layout) =>
          setSaved(
            Object.values(layout)
              .map((size) => Math.round(size))
              .join(', '),
          )
        }
        orientation="horizontal">
        <ResizablePanel defaultSize="50%">
          <div className="flex h-[120px] items-center justify-center">Editor</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%">
          <div className="flex h-[120px] items-center justify-center">Preview</div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <p className="text-muted-foreground text-sm">Saved once the drag settles: {saved}</p>
    </div>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the panel group follows it: panels mirror, and dragging and arrow keys follow the visual layout. No `dir` prop or `rtl:` classes needed.

```tsx title="components/resizable-4.tsx"
// import from your project: import Demo from '@/components/resizable-4'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@gentleduck/registry-ui/resizable'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <ResizablePanelGroup className="max-w-md rounded-lg border md:min-w-[450px]" orientation="horizontal">
        <ResizablePanel defaultSize="50%">
          <div className="flex h-[200px] items-center justify-center p-6">
            <span className="font-semibold">القائمة</span>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize="50%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="25%">
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">العنوان</span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize="75%">
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-semibold">المحتوى</span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionResizablePanelGroup` for a smooth entrance animation powered by [motion](https://motion.dev). The panel group uses a `scaleIn` entrance (fade, scale, and blur) with a `springBouncy` transition on mount.

```tsx title="components/resizable-5.tsx"
// import from your project: import Demo from '@/components/resizable-5'
import {
  MotionResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@gentleduck/registry-ui/resizable'

export default function Demo() {
  return (
    <MotionResizablePanelGroup className="max-w-md rounded-lg border md:min-w-[450px]" orientation="horizontal">
      <ResizablePanel defaultSize="50%">
        <div className="flex h-[200px] items-center justify-center p-6">
          <span className="font-semibold">One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize="50%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="25%">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize="75%">
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </MotionResizablePanelGroup>
  )
}
```

}>
  Requires the `motion` package. Use `MotionResizablePanelGroup` instead of `ResizablePanelGroup`. The rest of the components (`ResizablePanel`, `ResizableHandle`) stay the same. The regular `ResizablePanelGroup` is perfectly fine - this is an optional enhancement.

## API Reference

### ResizablePanelGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout orientation of the panels |
| `defaultLayout` | `Record<string, number>` | `--` | Starting percentage of each panel, keyed by panel `id`: the shape `onLayoutChanged` reports |
| `onLayoutChange` | `(layout: Layout) => void` | `--` | Called on every change, each pointer move of a drag included |
| `onLayoutChanged` | `(layout: Layout) => void` | `--` | Called once a change settles, after the pointer is released |
| `disabled` | `boolean` | `false` | Turns resizing off for the whole group |
| `className` | `string` | `--` | Additional CSS classes for the panel group |
| `dir` | `"ltr" \| "rtl"` | `--` | Text direction override for RTL support |
| `children` | `React.ReactNode` | `--` | `ResizablePanel` and `ResizableHandle` elements |
| `...props` | `React.ComponentPropsWithoutRef<typeof Group>` | - | Additional props inherited from `Group`. |

### ResizablePanel

Re-exports `Panel` from `react-resizable-panels` directly.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `--` | Names the panel in a layout, which `defaultLayout` needs |
| `defaultSize` | `number \| string` | `--` | Starting size. A string is a percentage of the group (`"25%"`), a number is pixels |
| `minSize` | `number \| string` | `--` | Smallest size a drag reaches, in the same units |
| `maxSize` | `number \| string` | `--` | Largest size a drag reaches, in the same units |
| `collapsible` | `boolean` | `false` | Snaps the panel to `collapsedSize` when it is dragged below `minSize` |
| `collapsedSize` | `number \| string` | `"0%"` | Size of the panel while collapsed |
| `onResize` | `(size: PanelSize) => void` | `--` | Called with each new size, as `asPercentage` and `inPixels` |
| `disabled` | `boolean` | `false` | Keeps the panel at its size, whichever handle is dragged |
| `className` | `string` | `--` | Additional CSS classes for the panel |
| `children` | `React.ReactNode` | `--` | Panel content |
| `...props` | `React.ComponentPropsWithoutRef<typeof Panel>` | - | Additional props inherited from `Panel`. |

### ResizableHandle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `withHandle` | `boolean` | `true` | Whether to render the visible grip icon handle. Set to `false` to show only the thin line. |
| `aria-label` | `string` | `"Resize panels"` | Name read out for the handle |
| `disabled` | `boolean` | `false` | Stops the handle resizing its panels and takes it out of the tab order; it dims while disabled |
| `className` | `string` | `--` | Additional CSS classes for the resize handle |
| `...props` | `React.ComponentPropsWithoutRef<typeof Separator>` | - | Additional props inherited from `Separator`. |

### MotionResizablePanelGroup

`scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition on mount. Wraps `ResizablePanelGroup`. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ResizablePanelGroupProps` | - | All props from `ResizablePanelGroup` are supported |