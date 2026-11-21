```tsx title="components/preview-panel-1.tsx"
// import from your project: import Demo from '@/components/preview-panel-1'
import { PreviewPanel } from '@gentleduck/registry-ui/preview-panel'

export default function Demo() {
  return (
    <PreviewPanel maxHeight="400px" className="rounded-lg border bg-card">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="size-24 rounded-full bg-primary/20" />
        <h3 className="font-semibold text-lg">Pan & Zoom</h3>
        <p className="text-muted-foreground text-sm">Unlock the view to drag and scroll, or use the controls.</p>
      </div>
    </PreviewPanel>
  )
}
```

## About

* **Pan & zoom** via drag, scroll wheel, and pinch-to-zoom gestures, behind a **lock** so the page scrolls past the panel until the user unlocks it
* An **`actions`** slot for your own buttons beside the zoom controls
* Built-in **zoom controls** with percentage badge
* **Zero re-renders** during continuous interactions (ref-based transforms)
* `unsafeHtml` prop for rendering raw HTML/SVG content directly (caller-sanitized; XSS sink)
* **Fullscreen dialog** variant with `PreviewPanelDialog`
* **Synced state** between inline and dialog panels via `syncPanels`
* RAF-batched state emission for maximum performance
* Built with gentleduck/ui components: `Button`, `Badge`, `ButtonGroup`, `Separator`, `Tooltip`, `Dialog`

## Philosophy

Preview panels bridge the gap between list views and detail views. Instead of navigating away to see content, users get an inline preview that respects their current context. `PreviewPanelDialog` pairs two panels through `onStateChange` and `syncState`, the same two props you can use to pair your own.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add preview-panel
```

Install the following dependencies:

```bash
npm install @gentleduck/libs lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { PreviewPanel } from '@/components/ui/preview-panel'
```

```tsx
<PreviewPanel maxHeight="400px">
  <YourContent />
</PreviewPanel>
```

### Locking

Drag, wheel and pinch start locked, so scrolling a page past the panel scrolls the page. The lock button in the controls turns them on, and the zoom buttons work either way. Start unlocked where the panel is the page's main content:

```tsx
<PreviewPanel defaultLocked={false} maxHeight="400px">
  <YourContent />
</PreviewPanel>
```

The lock button is named for what a press does: `unlockText` while locked and `lockText` while unlocked. With `showControls={false}` there is no lock button, so the gestures stay off unless you pass `defaultLocked={false}`.

### With actions

`actions` renders in the toolbar before the zoom controls, and still renders with `showControls={false}`.

```tsx
<PreviewPanel actions={<Button size="icon-sm" icon={<Copy />} aria-label="Copy" />}>
  <YourContent />
</PreviewPanel>
```

### With HTML content

```tsx
<PreviewPanel unsafeHtml="<svg>...</svg>" maxHeight="400px" />
```

### With dialog and sync

```tsx
import { PreviewPanelDialog } from '@/components/ui/preview-panel'
```

```tsx
<PreviewPanelDialog syncPanels maxHeight="400px">
  <YourContent />
</PreviewPanelDialog>
```

## Examples

### HTML / SVG content

Render raw HTML or SVG strings directly using the `unsafeHtml` prop. The value is rendered verbatim via `dangerouslySetInnerHTML` and is not sanitized, so only pass HTML you fully trust. In development, either panel warns once in the console when the markup carries a `<script>` tag or an inline event handler.

```tsx title="components/preview-panel-2.tsx"
// import from your project: import Demo from '@/components/preview-panel-2'
import { PreviewPanel } from '@gentleduck/registry-ui/preview-panel'

const SVG_HTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="10" y="10" width="80" height="80" rx="8" fill="#3b82f6" opacity="0.8"/>
  <rect x="110" y="10" width="80" height="80" rx="8" fill="#10b981" opacity="0.8"/>
  <rect x="10" y="110" width="80" height="80" rx="8" fill="#f59e0b" opacity="0.8"/>
  <rect x="110" y="110" width="80" height="80" rx="8" fill="#ef4444" opacity="0.8"/>
  <text x="100" y="105" text-anchor="middle" font-size="12" fill="currentColor">SVG Content</text>
</svg>`

export default function Demo() {
  return <PreviewPanel unsafeHtml={SVG_HTML} maxHeight="350px" className="rounded-lg border bg-card" />
}
```

### Dialog with synced zoom

Open the content in a fullscreen dialog. Zoom and position sync between both panels, and the fullscreen panel starts unlocked.

```tsx title="components/preview-panel-3.tsx"
// import from your project: import Demo from '@/components/preview-panel-3'
import { PreviewPanelDialog } from '@gentleduck/registry-ui/preview-panel'

export default function Demo() {
  return (
    <PreviewPanelDialog maxHeight="350px" syncPanels>
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static list generated from Array.from
              key={i}
              className="flex size-16 items-center justify-center rounded-md bg-primary/10 font-medium text-sm">
              {i + 1}
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          Click expand to open fullscreen. Zoom state syncs between both views.
        </p>
      </div>
    </PreviewPanelDialog>
  )
}
```

### Image viewer

Use as a zoomable image viewer.

```tsx title="components/preview-panel-4.tsx"
// import from your project: import Demo from '@/components/preview-panel-4'
import { PreviewPanel } from '@gentleduck/registry-ui/preview-panel'

export default function Demo() {
  return (
    <PreviewPanel maxHeight="400px" initialZoom={0.8} className="rounded-lg border bg-card">
      {/* biome-ignore lint/performance/noImgElement: example component demonstrating PreviewPanel with a plain img */}
      <img
        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80"
        alt="Landscape"
        className="max-w-[600px] rounded-md"
        draggable={false}
      />
    </PreviewPanel>
  )
}
```

### Unlocked, with actions

`defaultLocked={false}` turns drag, wheel and pinch on from the start, and `minZoom` and `maxZoom` bound every way of zooming. The grid toggle sits in `actions`, before the zoom controls. Unlocked, the wheel over the panel zooms it instead of scrolling the page.

```tsx title="components/preview-panel-7.tsx"
// import from your project: import Demo from '@/components/preview-panel-7'
'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import { PreviewPanel } from '@gentleduck/registry-ui/preview-panel'
import { Grid3x3 } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [grid, setGrid] = React.useState(true)

  return (
    <PreviewPanel
      actions={
        <Button
          aria-label="Show the grid"
          aria-pressed={grid}
          className="rounded-md border bg-background/80 backdrop-blur-sm"
          icon={<Grid3x3 aria-hidden="true" />}
          onClick={() => setGrid((shown) => !shown)}
          size="icon-sm"
          variant={grid ? 'secondary' : 'ghost'}
        />
      }
      className="rounded-lg border bg-card"
      defaultLocked={false}
      maxHeight="400px"
      maxZoom={2}
      minZoom={0.5}>
      <div
        className={cn(
          'flex size-72 flex-col items-center justify-center gap-2 rounded-md border border-dashed',
          grid &&
            '[background-image:radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]',
        )}>
        <span className="font-semibold text-lg">Canvas</span>
        <span className="text-muted-foreground text-sm">Drag, scroll or pinch, from 50% to 200%</span>
      </div>
    </PreviewPanel>
  )
}
```

### Synced panels

Feed each panel's `onStateChange` into one state and hand that state back as `syncState`, and the panels pan and zoom together. A panel leaves alone a state it already shows, so its own update coming back does nothing.

```tsx title="components/preview-panel-8.tsx"
// import from your project: import Demo from '@/components/preview-panel-8'
'use client'

import { PreviewPanel, type PreviewPanelState } from '@gentleduck/registry-ui/preview-panel'
import * as React from 'react'

const PHOTO = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'

export default function Demo() {
  const [view, setView] = React.useState<PreviewPanelState>({ x: 0, y: 0, zoom: 1 })

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {(['Before', 'After'] as const).map((side) => (
        <figure className="flex flex-col gap-2" key={side}>
          <PreviewPanel
            className="rounded-lg border bg-card"
            maxHeight="280px"
            onStateChange={setView}
            syncState={view}>
            {/* biome-ignore lint/performance/noImgElement: example component demonstrating PreviewPanel with a plain img */}
            <img
              alt={`Landscape, ${side.toLowerCase()} the edit`}
              className={side === 'Before' ? 'max-w-[320px] rounded-md grayscale' : 'max-w-[320px] rounded-md'}
              draggable={false}
              src={PHOTO}
            />
          </PreviewPanel>
          <figcaption className="text-muted-foreground text-sm">
            {side}, at {Math.round(view.zoom * 100)}%
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
```

### Controls of your own

`showControls={false}` hides the zoom controls, and `syncState` moves the view from outside the panel. With the controls hidden there is no lock button, so this view stays locked and only the buttons move it.

```tsx title="components/preview-panel-9.tsx"
// import from your project: import Demo from '@/components/preview-panel-9'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { PreviewPanel, type PreviewPanelState } from '@gentleduck/registry-ui/preview-panel'
import * as React from 'react'

const ZOOMS = [0.5, 1, 2]

export default function Demo() {
  const [view, setView] = React.useState<PreviewPanelState>({ x: 0, y: 0, zoom: 1 })

  return (
    <div className="flex w-full flex-col gap-3">
      <ButtonGroup aria-label="Zoom">
        {ZOOMS.map((zoom) => (
          <Button
            aria-pressed={view.zoom === zoom}
            key={zoom}
            onClick={() => setView({ x: 0, y: 0, zoom })}
            size="sm"
            variant={view.zoom === zoom ? 'secondary' : 'outline'}>
            {zoom * 100}%
          </Button>
        ))}
      </ButtonGroup>
      <PreviewPanel className="rounded-lg border bg-card" maxHeight="320px" showControls={false} syncState={view}>
        <div className="flex flex-col items-center gap-3 p-8">
          <div className="size-20 rounded-full bg-primary/20" />
          <p className="text-muted-foreground text-sm">Only the buttons above move this view.</p>
        </div>
      </PreviewPanel>
    </div>
  )
}
```

### Dialog without sync

`syncPanels={false}` gives the fullscreen panel a view of its own. `fullscreenText` names the expand button, and `panelClassName` styles both panels.

```tsx title="components/preview-panel-10.tsx"
// import from your project: import Demo from '@/components/preview-panel-10'
import { PreviewPanelDialog } from '@gentleduck/registry-ui/preview-panel'

const DIAGRAM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="320" height="120" fill="none" stroke="currentColor" stroke-width="1.5">
  <rect x="8" y="40" width="80" height="40" rx="6"/>
  <rect x="120" y="40" width="80" height="40" rx="6"/>
  <rect x="232" y="40" width="80" height="40" rx="6"/>
  <path d="M88 60h32M200 60h32"/>
  <g fill="currentColor" stroke="none" font-size="12" text-anchor="middle">
    <text x="48" y="64">Request</text>
    <text x="160" y="64">Queue</text>
    <text x="272" y="64">Worker</text>
  </g>
</svg>`

export default function Demo() {
  return (
    <PreviewPanelDialog
      fullscreenText="Open the diagram"
      maxHeight="300px"
      panelClassName="bg-muted/40"
      syncPanels={false}
      unsafeHtml={DIAGRAM}
    />
  )
}
```

### Zoom controls on their own

```tsx title="components/preview-panel-11.tsx"
// import from your project: import Demo from '@/components/preview-panel-11'
'use client'

import { ZoomControls } from '@gentleduck/registry-ui/preview-panel'
import * as React from 'react'

export default function Demo() {
  const [zoom, setZoom] = React.useState(1)
  const [locked, setLocked] = React.useState(false)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-40 w-72 items-center justify-center overflow-hidden rounded-md border">
        <div className="size-16 rounded-md bg-primary transition-transform" style={{ transform: `scale(${zoom})` }} />
      </div>
      <ZoomControls
        locked={locked}
        onReset={() => setZoom(1)}
        onToggleLock={() => setLocked((value) => !value)}
        onZoomIn={() => locked || setZoom((value) => Math.min(3, value + 0.25))}
        onZoomOut={() => locked || setZoom((value) => Math.max(0.25, value - 0.25))}
        zoom={zoom}
      />
    </div>
  )
}
```

### Motion zoom controls

```tsx title="components/preview-panel-12.tsx"
// import from your project: import Demo from '@/components/preview-panel-12'
'use client'

import { MotionZoomControls } from '@gentleduck/registry-ui/preview-panel'
import * as React from 'react'

export default function Demo() {
  const [zoom, setZoom] = React.useState(1)

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-muted-foreground text-sm">{Math.round(zoom * 100)}%</span>
      <MotionZoomControls
        onReset={() => setZoom(1)}
        onZoomIn={() => setZoom((value) => Math.min(3, value + 0.25))}
        onZoomOut={() => setZoom((value) => Math.max(0.25, value - 0.25))}
        resetText="Back to 100%"
        zoom={zoom}
        zoomInText="Bigger"
        zoomOutText="Smaller"
      />
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the panel follows: the zoom controls move to the top-left corner and lay out RTL. Use `zoomInText`, `zoomOutText`, `resetText`, `lockText`, and `unlockText` to translate the control labels.

```tsx title="components/preview-panel-5.tsx"
// import from your project: import Demo from '@/components/preview-panel-5'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { PreviewPanel } from '@gentleduck/registry-ui/preview-panel'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <PreviewPanel
        className="rounded-lg border bg-card"
        lockText="قفل العرض"
        maxHeight="400px"
        resetText="إعادة الضبط"
        unlockText="فتح قفل العرض"
        zoomInText="تكبير"
        zoomOutText="تصغير">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="size-24 rounded-full bg-primary/20" />
          <h3 className="font-semibold text-lg">تحريك وتكبير</h3>
          <p className="text-muted-foreground text-sm">افتح قفل العرض للسحب والتمرير، أو استخدم أدوات التحكم.</p>
        </div>
      </PreviewPanel>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionPreviewPanel` for a smooth entrance animation powered by [motion](https://motion.dev). The panel uses a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition on mount, and its internal controls (buttons, separators, badges, tooltips) use the full motion stack.

```tsx title="components/preview-panel-6.tsx"
// import from your project: import Demo from '@/components/preview-panel-6'
'use client'

import { MotionPreviewPanel } from '@gentleduck/registry-ui/preview-panel'

export default function Demo() {
  return (
    <MotionPreviewPanel maxHeight="400px" className="rounded-lg border bg-card">
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="size-24 rounded-full bg-primary/20" />
        <h3 className="font-semibold text-lg">Pan & Zoom</h3>
        <p className="text-muted-foreground text-sm">Unlock the view to drag and scroll, or use the controls.</p>
      </div>
    </MotionPreviewPanel>
  )
}
```

}>
  Requires the `motion` package. Use `MotionPreviewPanel` instead of `PreviewPanel`. Same props. The internal zoom controls automatically use `MotionButton`, `MotionBadge`, `MotionSeparator`, and `MotionTooltip`.

## API Reference

### PreviewPanel

The core pan-zoom container.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Direction override. Defaults to the nearest `DirectionProvider`, then `<html dir>`. |
| `maxHeight` | `string` | `--` | Maximum height of the panel container (e.g. `"400px"`) |
| `minZoom` | `number` | `0.25` | Minimum zoom level |
| `maxZoom` | `number` | `4` | Maximum zoom level |
| `initialZoom` | `number` | `1` | Starting zoom level |
| `showControls` | `boolean` | `true` | Whether to show the zoom controls overlay |
| `defaultLocked` | `boolean` | `true` | Whether drag, wheel and pinch start locked, so the wheel scrolls the page. The zoom buttons work either way |
| `actions` | `React.ReactNode` | `--` | Rendered in the toolbar before the zoom controls |
| `unsafeHtml` | `string` | `--` | Raw HTML string rendered verbatim via `dangerouslySetInnerHTML`. Takes priority over `children`. Not sanitized: pass only HTML you fully trust, never user-, CMS-, or URL-derived markup |
| `children` | `React.ReactNode` | `--` | Content to render inside the panel |
| `className` | `string` | `--` | Additional CSS classes for the outer container |
| `style` | `React.CSSProperties` | `--` | Inline styles for the outer container |
| `onStateChange` | `(state: PreviewPanelState) => void` | `--` | Called whenever zoom or position changes. Use to sync with another panel |
| `syncState` | `PreviewPanelState` | `--` | External state to apply. The panel syncs to this state when set |
| `zoomInText` | `string` | `'Zoom in'` | Label and tooltip for the zoom-in control |
| `zoomOutText` | `string` | `'Zoom out'` | Label and tooltip for the zoom-out control |
| `resetText` | `string` | `'Reset view'` | Label and tooltip for the reset control |
| `lockText` | `string` | `'Lock the view'` | Label and tooltip for the lock control while the view is unlocked |
| `unlockText` | `string` | `'Unlock the view'` | Label and tooltip for the lock control while the view is locked |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Spread onto the outer element, the one with `data-slot="preview-panel"` |

### MotionPreviewPanel

`scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition on mount. Zoom controls use `MotionButton`, `MotionBadge`, `MotionSeparator`, and `MotionTooltip` internally. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `PreviewPanelProps` | - | All props from `PreviewPanel` are supported |

### PreviewPanelDialog

Combines an inline `PreviewPanel` with a fullscreen `Dialog`. The expand button sits in the inline panel's toolbar, before the zoom controls. The inline panel starts locked and the fullscreen one unlocked.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Content rendered in both inline and dialog panels |
| `unsafeHtml` | `string` | - | Raw HTML string rendered verbatim via `dangerouslySetInnerHTML`. Takes priority over `children`. Not sanitized: pass only HTML you fully trust |
| `className` | `string` | - | Class name for the outer wrapper |
| `panelClassName` | `string` | - | Class name applied to both `PreviewPanel` instances |
| `maxHeight` | `string` | - | Maximum height of the inline panel |
| `minZoom` | `number` | `0.25` | Minimum zoom level |
| `maxZoom` | `number` | `4` | Maximum zoom level |
| `initialZoom` | `number` | `1` | Starting zoom level |
| `showControls` | `boolean` | `true` | Whether to show zoom controls |
| `defaultLocked` | `boolean` | `true` | Whether the inline panel starts locked. The fullscreen panel starts unlocked |
| `syncPanels` | `boolean` | `true` | Whether to sync zoom and position between inline and dialog panels |
| `fullscreenText` | `string` | `'Open fullscreen'` | Label and tooltip for the expand button |
| `zoomInText` | `string` | `'Zoom in'` | Label and tooltip for the zoom-in control |
| `zoomOutText` | `string` | `'Zoom out'` | Label and tooltip for the zoom-out control |
| `resetText` | `string` | `'Reset view'` | Label and tooltip for the reset control |
| `lockText` | `string` | `'Lock the view'` | Label and tooltip for the lock control while the view is unlocked |
| `unlockText` | `string` | `'Unlock the view'` | Label and tooltip for the lock control while the view is locked |

### PreviewPanelState

The state object used for syncing between panels.

```tsx
type PreviewPanelState = {
  zoom: number
  x: number
  y: number
}
```