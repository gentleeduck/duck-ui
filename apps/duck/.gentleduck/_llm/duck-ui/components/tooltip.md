```tsx title="components/tooltip-1.tsx"
// import from your project: import Demo from '@/components/tooltip-1'
import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>

        <TooltipContent>
          <p>Add to library</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

## Philosophy

Tooltips are the lightest touch of contextual help  -  they appear on hover, require no interaction, and disappear when attention moves on. We build on Floating UI because positioning against viewport edges, scroll containers, and dynamic layouts is harder than it looks. The `data-state` and `data-side` attributes give you animation hooks without JavaScript state management.

* **Floating UI powered positioning** - Smart placement with `flip`, `shift`, and `offset` middleware.
* **State-aware styling hooks** - `data-state` and `data-side` attributes for state and placement styling.
* **Transform-origin variable** - Uses `--gentleduck-tooltip-content-transform-origin` for direction-aware animations.
* **Customizable delays** - Configure open and close delays globally with `TooltipProvider` or per tooltip with `delayDuration` and `closeDelay`.
* **Flexible triggers** - Wrap any element using `asChild`.
* **Accessible by default** - Implements proper ARIA attributes and keyboard navigation.
* **Portal rendering** - Renders tooltips in a portal to avoid layout clipping.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add tooltip
```

Install dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs
```

Copy the `Tooltip` component code into your project.

Ensure import paths match your project structure.

## Usage

```tsx
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

// app/layout.tsx (once)
<TooltipProvider>{children}</TooltipProvider>

<Tooltip delayDuration={500}>
  <TooltipTrigger>Hover</TooltipTrigger>
  <TooltipContent>Tooltip text</TooltipContent>
</Tooltip>
```

## Examples

### Basic

```tsx title="components/tooltip-2.tsx"
// import from your project: import Demo from '@/components/tooltip-2'
import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>
        <TooltipContent>Tooltip Content</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

### Custom Trigger with `asChild`

The trigger has to take focus, or a keyboard never opens the tooltip, so give `asChild` a link or a button rather than a `span`.

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <a className="underline" href="/docs/duck-ui/changelog">
      Changelog
    </a>
  </TooltipTrigger>
  <TooltipContent>Every release, newest first</TooltipContent>
</Tooltip>
```

### Placement

`side` picks the edge the content opens on, and `align` where it sits along that edge. Near the edge of the viewport the content flips to the other side.

```tsx title="components/tooltip-9.tsx"
// import from your project: import Demo from '@/components/tooltip-9'
import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

const SIDES = [
  { label: 'Top', side: 'top' },
  { label: 'Right', side: 'right' },
  { label: 'Bottom', side: 'bottom' },
  { label: 'Left', side: 'left' },
] as const

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {SIDES.map(({ label, side }) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button variant="outline">{label}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>Opens on the {side}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
```

### Animated Tooltip

```tsx
<Tooltip>
  <TooltipTrigger>Hover</TooltipTrigger>
  <TooltipContent className="TooltipContent">Animated tooltip</TooltipContent>
</Tooltip>
```

The content stays in the page until a CSS animation on it ends, so animate with keyframes. A `transition` never runs: the content mounts already open and is removed as soon as it closes.

```css
.TooltipContent {
  transform-origin: var(--gentleduck-tooltip-content-transform-origin);
  animation: tooltip-in 150ms ease;
}

.TooltipContent[data-state='closed'] {
  animation: tooltip-out 100ms ease forwards;
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes tooltip-out {
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

### Tooltip with Toggle

When wrapping a `Toggle`, or any element that keeps its own pressed state, use `disableCloseOnClick`. A press then leaves the tooltip open, and the toggle keeps its own `data-state` and `data-slot`, with the tooltip's state on `data-tooltip-state`:

```tsx
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Bold } from 'lucide-react'

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild disableCloseOnClick>
      <Toggle aria-label="Toggle bold">
        <Bold className="h-4 w-4" />
      </Toggle>
    </TooltipTrigger>
    <TooltipContent>Toggle bold</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Without `disableCloseOnClick`, the toggle still toggles, but a press closes the tooltip, and the trigger's `data-state` (`closed`, `delayed-open` or `instant-open`) replaces the toggle's `on` or `off`, so its pressed style never shows.

```tsx title="components/tooltip-4.tsx"
// import from your project: import Demo from '@/components/tooltip-4'
import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Bold } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild disableCloseOnClick>
          <Toggle aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>

        <TooltipContent>
          <p>Toggle bold</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

### Controlled

`open` and `onOpenChange` let the tooltip say something after a press. A tap on a touch screen opens no tooltip, so the copy opens it to show that it worked, and `disableCloseOnClick` keeps the press from closing it. The live region tells a screen reader, which does not read a description again when it changes.

```tsx title="components/tooltip-10.tsx"
// import from your project: import Demo from '@/components/tooltip-10'
'use client'

import { useCopyToClipboard } from '@gentleduck/hooks/use-copy-to-clipboard'
import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Check, Copy } from 'lucide-react'
import * as React from 'react'

const COMMAND = 'npx @gentleduck/cli add tooltip'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  // A tap opens no tooltip, so the copy opens it to show that it worked.
  const { copyToClipboard, isCopied } = useCopyToClipboard({ onCopy: () => setOpen(true) })

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 rounded-md border py-1 ps-3 pe-1">
        <code className="text-sm">{COMMAND}</code>
        <Tooltip onOpenChange={setOpen} open={open}>
          <TooltipTrigger asChild disableCloseOnClick>
            <Button aria-label="Copy the command" onClick={() => copyToClipboard(COMMAND)} size="icon" variant="ghost">
              {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isCopied ? 'Copied' : 'Copy'}</TooltipContent>
        </Tooltip>
        <span aria-live="polite" className="sr-only">
          {isCopied ? 'Copied the command.' : ''}
        </span>
      </div>
    </TooltipProvider>
  )
}
```

### Explaining an Unavailable Action

A `disabled` button takes no focus and no pointer events, so a tooltip on it never opens. Mark the button `aria-disabled` instead, which keeps it focusable and announced as unavailable, and ignore the press yourself. `disabled` on the `Tooltip` turns the explanation off once the action is available.

```tsx title="components/tooltip-11.tsx"
// import from your project: import Demo from '@/components/tooltip-11'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import * as React from 'react'

export default function Demo() {
  const [title, setTitle] = React.useState('')
  const [published, setPublished] = React.useState('')
  const ready = title.trim() !== ''

  return (
    <TooltipProvider>
      <form
        className="flex w-full max-w-sm flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (ready) setPublished(title.trim())
        }}>
        <Label htmlFor="post-title">Title</Label>
        <div className="flex gap-2">
          <Input id="post-title" onChange={(event) => setTitle(event.target.value)} value={title} />
          <Tooltip disabled={ready}>
            <TooltipTrigger asChild>
              {/* aria-disabled, not disabled: a disabled button takes no focus or hover, so it could never explain itself. */}
              <Button aria-disabled={!ready || undefined} className="aria-disabled:opacity-50" type="submit">
                Publish
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add a title before you publish.</TooltipContent>
          </Tooltip>
        </div>
        <p aria-live="polite" className="text-muted-foreground text-sm">
          {published ? `Published "${published}".` : ''}
        </p>
      </form>
    </TooltipProvider>
  )
}
```

### Announcing Something Else

`aria-label` on the content is what a screen reader announces in its place. Use it where the visible content does not read well aloud, such as a key symbol.

```tsx title="components/tooltip-12.tsx"
// import from your project: import Demo from '@/components/tooltip-12'
import { Button } from '@gentleduck/registry-ui/button'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Save } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button aria-label="Save" size="icon" variant="outline">
            <Save aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent aria-label="Command S" className="flex items-center gap-2">
          Save
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

### Close Delay

`closeDelay` keeps a tooltip open for a moment after the pointer leaves, so a pointer that overshoots can come back to it. Moving onto another tooltip still closes it at once.

```tsx title="components/tooltip-8.tsx"
// import from your project: import Demo from '@/components/tooltip-8'
import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Bold, Italic, Underline } from 'lucide-react'

const TOOLS = [
  { icon: Bold, label: 'Bold' },
  { icon: Italic, label: 'Italic' },
  { icon: Underline, label: 'Underline' },
]

export default function Demo() {
  return (
    <TooltipProvider closeDelay={300} delayDuration={200}>
      <div className="flex gap-1">
        {TOOLS.map(({ icon: Icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button aria-label={label} size="icon" variant="ghost">
                <Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
```

### Arrow

Add a directional caret that always tracks the trigger. The arrow moves along the content edge when collision avoidance shifts the tooltip near a viewport boundary.

Use `arrowPadding` to match the content's `border-radius` so the arrow never slides past the rounded corners.

```tsx title="components/tooltip-6.tsx"
// import from your project: import Demo from '@/components/tooltip-6'
import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>

        <TooltipContent side="bottom" arrowPadding={12} className="rounded-xl px-4 py-2 font-semibold">
          <p>Inbox</p>
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

Customize the border color via `--tooltip-border-color` on `TooltipContent`, in its `style` or as a class such as `[--tooltip-border-color:#5865f2]`. `MotionTooltipContent` takes it too:

```tsx
<TooltipContent className="[--tooltip-border-color:#5865f2]">
  ...
  <TooltipArrow />
</TooltipContent>
```

### Provider timing and hoverable content

```tsx title="components/tooltip-13.tsx"
// import from your project: import Demo from '@/components/tooltip-13'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider delayDuration={300} disableHoverableContent skipDelayDuration={800}>
      <div className="flex items-center gap-2">
        {['Bold', 'Italic', 'Underline'].map((mark) => (
          <Tooltip key={mark}>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">
                {mark[0]}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mark}</TooltipContent>
          </Tooltip>
        ))}
        <Tooltip defaultOpen disableHoverableContent={false}>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">
              ?
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open from the start, and hoverable unlike the others</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
```

### Kept open, placed and with a wide arrow

```tsx title="components/tooltip-14.tsx"
// import from your project: import Demo from '@/components/tooltip-14'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Pinned tip</Button>
        </TooltipTrigger>
        <TooltipContent
          align="start"
          alignOffset={4}
          avoidCollisions
          collisionPadding={12}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          sideOffset={10}>
          Escape and a press outside leave this open.
          <TooltipArrow height={8} width={16} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

### Kept mounted for a transition

```tsx title="components/tooltip-15.tsx"
// import from your project: import Demo from '@/components/tooltip-15'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Kept in the page</Button>
        </TooltipTrigger>
        <TooltipContent
          className="transition-opacity data-[state=closed]:pointer-events-none data-[state=closed]:opacity-0"
          forceMount>
          forceMount keeps the tooltip mounted, so its own transition fades it.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

## Keyboard

| Key | Action |
| --- | --- |
| `Tab` | Moving focus onto the trigger opens the tooltip at once, without the delay, and moving it away closes it |
| `Escape` | Closes the tooltip, and focus stays on the trigger |

## Styling Hooks

* **`data-state`** - Set on trigger and content (`closed`, `delayed-open`, `instant-open`) for state-based styling.
* **`data-tooltip-state`** - Set on a trigger with `disableCloseOnClick` in place of `data-state`, which stays the child's own.
* **`data-side`** - Set on content (`top`, `right`, `bottom`, `left`) for placement-aware styles.
* **`--gentleduck-tooltip-content-transform-origin`** - CSS variable for animation transform origin.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the tooltip follows. The portaled content gets the resolved `dir`, and `side="left"`/`side="right"` and `align="start"`/`align="end"` mirror with it.

```tsx
<DirectionProvider dir="rtl">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>مرّر المؤشر</TooltipTrigger>
      <TooltipContent>نص التلميح</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</DirectionProvider>
```

```tsx title="components/tooltip-3.tsx"
// import from your project: import Demo from '@/components/tooltip-3'
import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">مرّر المؤشر</Button>
          </TooltipTrigger>

          <TooltipContent>
            <p>أضف إلى المكتبة</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionTooltip` and `MotionTooltipContent` for smooth enter/exit animations powered by [motion](https://motion.dev). The tooltip fades in with a subtle scale, blur, and directional shift toward the trigger.

```tsx title="components/tooltip-5.tsx"
// import from your project: import Demo from '@/components/tooltip-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { MotionTooltip, MotionTooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider>
      <MotionTooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover</Button>
        </TooltipTrigger>

        <MotionTooltipContent>
          <p>Add to library</p>
        </MotionTooltipContent>
      </MotionTooltip>
    </TooltipProvider>
  )
}
```

The animation moves in from whichever `side` the content opens on, and a `TooltipArrow` points from the content the same way it does on `TooltipContent`.

```tsx title="components/tooltip-7.tsx"
// import from your project: import Demo from '@/components/tooltip-7'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  MotionTooltip,
  MotionTooltipContent,
  TooltipArrow,
  TooltipProvider,
  TooltipTrigger,
} from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider>
      <MotionTooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Share</Button>
        </TooltipTrigger>
        <MotionTooltipContent side="right">
          <p>Copies a link anyone can open</p>
          <TooltipArrow />
        </MotionTooltipContent>
      </MotionTooltip>
    </TooltipProvider>
  )
}
```

}>
  Requires the `motion` package. Use `MotionTooltip` instead of `Tooltip` and `MotionTooltipContent` instead of `TooltipContent`. `TooltipProvider` and `TooltipTrigger` stay the same.

## API Reference

### TooltipProvider

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Tooltip tree to provide behavior for |
| `delayDuration` | `number` | `700` | Delay before opening tooltips |
| `closeDelay` | `number` | `0` | Delay before closing once the pointer leaves |
| `skipDelayDuration` | `number` | `300` | Window where moving between triggers skips delay. `0` keeps the delay on every tooltip |
| `disableHoverableContent` | `boolean` | `false` | Close tooltip as soon as pointer leaves trigger |

### Tooltip

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Tooltip sub-components (`TooltipTrigger`, `TooltipContent`) |
| `open` | `boolean` | - | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when open state changes |
| `delayDuration` | `number` | `700` | Per-tooltip delay override |
| `closeDelay` | `number` | `0` | Per-tooltip close delay override |
| `disableHoverableContent` | `boolean` | `false` | Per-tooltip hover-content behavior override |
| `disabled` | `boolean` | `false` | Keeps the tooltip closed, and closes it if it is open |
| `dir` | `'ltr' \| 'rtl'` | - | Direction of the content, resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). The trigger keeps the page's |
| `...props` | `React.ComponentPropsWithRef<typeof TooltipPrimitive.Root>` | - | Additional root props |

### TooltipTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | Renders the child element as the trigger instead of a `button` |
| `disableCloseOnClick` | `boolean` | `false` | Keeps the tooltip open when the trigger is pressed, and leaves an `asChild` child's own `data-state` and `data-slot` alone. The tooltip's state goes on `data-tooltip-state`. Use when wrapping an element like `Toggle` |
| `children` | `React.ReactNode` | - | Content rendered inside the trigger |
| `className` | `string` | - | Additional CSS class names to apply |
| `...props` | `Omit<React.ComponentPropsWithRef<typeof TooltipPrimitive.Trigger>, 'size'>` | - | Additional props to spread to the button element |

### TooltipContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS class names to apply |
| `children` | `React.ReactNode` | - | Content rendered inside the tooltip, once |
| `aria-label` | `string` | - | Announced in place of the visible content |
| `ref` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the content container |
| `forceMount` | `true` | - | Keeps the content in the page while closed, as `data-state="closed"`, for an exit animation to run on |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Preferred side relative to the trigger |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment on the chosen side |
| `sideOffset` | `number` | `4` | Main-axis offset from trigger |
| `alignOffset` | `number` | `0` | Cross-axis offset from trigger |
| `arrowPadding` | `number` | `0` | How close the arrow may come to the content's corners. Match the `border-radius` |
| `avoidCollisions` | `boolean` | `true` | Flips and shifts the content to keep it in the viewport |
| `collisionPadding` | `number \| Partial<Record<Side, number>>` | `0` | Distance kept from the viewport edges when avoiding collisions |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | - | Called on Escape. `event.preventDefault()` keeps the tooltip open |
| `onPointerDownOutside` | `(event: CustomEvent) => void` | - | Called on a press outside the content and the trigger. `event.preventDefault()` keeps the tooltip open |
| `...props` | `React.ComponentPropsWithRef<typeof TooltipPrimitive.Content>` | - | Additional props to spread to the content div |

### TooltipArrow

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | `14` | Arrow width in px |
| `height` | `number` | `7` | Arrow height in px |
| `className` | `string` | - | Additional CSS classes. The arrow fills with `--popover` and draws a 1px outline in `--tooltip-border-color` |
| `style` | `CSSProperties` | - | Override `--tooltip-border-color` here to change stroke color |

### MotionTooltip

Wraps with `useMotionRoot` for exit animation support. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `TooltipProps` | - | All props from `Tooltip` are supported |

### MotionTooltipContent

Adds directional scale, blur, and opacity enter/exit animation with a `springBouncy` transition, on the same surface as `TooltipContent`. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `TooltipContentProps` | - | All props from `TooltipContent` are supported |