```tsx title="components/hover-card-1.tsx"
// import from your project: import Demo from '@/components/hover-card-1'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import { CalendarIcon } from 'lucide-react'

export default function Demo() {
  return (
    <HoverCard>
      <HoverCardTrigger variant={'link'}>@nextjs</HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage alt="VC" src="https://github.com/gentleeduck.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">@nextjs</h4>
            <p className="text-sm">The React Framework -- created and maintained by @vercel.</p>
            <div className="flex items-center pt-2">
              <CalendarIcon className="me-2 h-4 w-4 opacity-70" />{' '}
              <span className="text-muted-foreground text-xs">Joined December 2021</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
```

## Philosophy

Hover cards provide progressive disclosure without commitment. They let users preview content before clicking, reducing unnecessary navigation. We build on Popover primitives because hover cards are fundamentally popovers with mouse-enter triggers  -  shared internals mean consistent behavior and smaller bundle size.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add hover-card
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs
```

Add the `Button` component to your project.

The `HoverCard` component uses the [`Button`](/duck-ui/components/button) component. Make sure you have it installed in your project.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
```

```tsx
<HoverCard>
  <HoverCardTrigger>Hover</HoverCardTrigger>
  <HoverCardContent>
    The React Framework - created and maintained by @vercel.
  </HoverCardContent>
</HoverCard>
```

## Examples

### Active Trigger on Open

Style the trigger to appear active while the hover card is open using `data-[state=open]`:

```tsx title="components/hover-card-3.tsx"
// import from your project: import Demo from '@/components/hover-card-3'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'

export default function Demo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a
          href="https://github.com/gentleeduck"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-sm underline-offset-4 hover:underline data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:no-underline">
          @gentleduck
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://github.com/gentleeduck.png" />
            <AvatarFallback>GD</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">gentleduck</h4>
            <p className="text-muted-foreground text-sm">The trigger link is highlighted while hovering this card.</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
```

### Arrow

Add a caret pointing at the trigger. The arrow moves along the content edge when collision avoidance shifts the card near a viewport boundary.

```tsx title="components/hover-card-5.tsx"
// import from your project: import Demo from '@/components/hover-card-5'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { HoverCard, HoverCardArrow, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import { CalendarIcon } from 'lucide-react'

export default function Demo() {
  return (
    <HoverCard>
      <HoverCardTrigger variant="link">@nextjs</HoverCardTrigger>
      <HoverCardContent side="bottom" arrowPadding={8} className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage alt="VC" src="https://github.com/gentleeduck.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">@nextjs</h4>
            <p className="text-sm">The React Framework — created and maintained by @vercel.</p>
            <div className="flex items-center pt-2">
              <CalendarIcon className="me-2 h-4 w-4 opacity-70" />
              <span className="text-muted-foreground text-xs">Joined December 2021</span>
            </div>
          </div>
        </div>
        <HoverCardArrow />
      </HoverCardContent>
    </HoverCard>
  )
}
```

The arrow fills with `--popover` and outlines its curve in `--hover-card-border-color`, the content's border colour. Change both with a class such as `[--hover-card-border-color:#5865f2]` on `HoverCardContent`, or in its `style`. `MotionHoverCardContent` takes it too:

```tsx
<HoverCardContent className="[--hover-card-border-color:#5865f2]">
  ...
  <HoverCardArrow />
</HoverCardContent>
```

### Delays

`openDelay` is how long the pointer or focus rests on the trigger before the card opens, and `closeDelay` how long it stays once they leave. `onOpenChange` reports each change.

```tsx title="components/hover-card-7.tsx"
// import from your project: import Demo from '@/components/hover-card-7'
'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import * as React from 'react'

const USERS = [
  { handle: '@quick', note: 'Opens at once and closes as soon as you leave.', openDelay: 0, closeDelay: 0 },
  { handle: '@patient', note: 'Waits a second to open and lingers a second after.', openDelay: 1000, closeDelay: 1000 },
] as const

export default function Demo() {
  const [open, setOpen] = React.useState<string | null>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-6">
        {USERS.map((user) => (
          <HoverCard
            closeDelay={user.closeDelay}
            key={user.handle}
            onOpenChange={(next) =>
              setOpen((current) => (next ? user.handle : current === user.handle ? null : current))
            }
            openDelay={user.openDelay}>
            <HoverCardTrigger href="#" variant="link">
              {user.handle}
            </HoverCardTrigger>
            <HoverCardContent className="w-64 text-sm">{user.note}</HoverCardContent>
          </HoverCard>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">Open: {open ?? 'none'}</p>
    </div>
  )
}
```

### Disabled

`disabled` keeps the card closed, here behind a setting. Turning it on while the card is open closes it.

```tsx title="components/hover-card-6.tsx"
// import from your project: import Demo from '@/components/hover-card-6'
'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import * as React from 'react'

export default function Demo() {
  const [previews, setPreviews] = React.useState(true)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <Switch checked={previews} id="hover-card-previews" onCheckedChange={setPreviews} />
        <Label htmlFor="hover-card-previews">Link previews</Label>
      </div>
      <HoverCard disabled={!previews}>
        <HoverCardTrigger variant="link">@gentleduck</HoverCardTrigger>
        <HoverCardContent side="bottom">
          <h4 className="font-semibold text-sm">@gentleduck</h4>
          <p className="text-sm">Accessible primitives and the components built on them.</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
```

### Loading content

A card can load what it shows once it opens, as a profile fetched on hover does. What arrives later stays out of the tab order with the rest of the card.

```tsx title="components/hover-card-8.tsx"
// import from your project: import Demo from '@/components/hover-card-8'
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import { Skeleton } from '@gentleduck/registry-ui/skeleton'
import * as React from 'react'

function Profile() {
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 600)
    return () => clearTimeout(timer)
  }, [])

  if (!loaded) {
    return (
      <div className="flex gap-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage alt="gentleduck" src="https://github.com/gentleeduck.png" />
        <AvatarFallback>GD</AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start gap-2">
        <h4 className="font-semibold text-sm">@gentleduck</h4>
        <p className="text-sm">Builds accessible React components.</p>
        <Button size="sm">Follow</Button>
      </div>
    </div>
  )
}

export default function Demo() {
  return (
    <HoverCard>
      <HoverCardTrigger href="#" variant="link">
        @gentleduck
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <Profile />
      </HoverCardContent>
    </HoverCard>
  )
}
```

### Open from the start, aligned

```tsx title="components/hover-card-9.tsx"
// import from your project: import Demo from '@/components/hover-card-9'
'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'

export default function Demo() {
  return (
    <HoverCard defaultOpen>
      <HoverCardTrigger border="primary" variant="ghost">
        Open from the start
      </HoverCardTrigger>
      <HoverCardContent align="start" alignOffset={8} className="w-64" sideOffset={10}>
        defaultOpen shows the card on load. It is aligned to the trigger's start and pushed 10px away.
      </HoverCardContent>
    </HoverCard>
  )
}
```

### Motion placement

```tsx title="components/hover-card-10.tsx"
// import from your project: import Demo from '@/components/hover-card-10'
'use client'

import { HoverCardTrigger, MotionHoverCard, MotionHoverCardContent } from '@gentleduck/registry-ui/hover-card'

const SIDES = ['top', 'right', 'bottom', 'left'] as const

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {SIDES.map((side) => (
        <MotionHoverCard key={side} openDelay={150} placement={side}>
          <HoverCardTrigger variant="outline">{side}</HoverCardTrigger>
          <MotionHoverCardContent className="w-48">Opens on the {side} and animates from it.</MotionHoverCardContent>
        </MotionHoverCard>
      ))}
    </div>
  )
}
```

### Kept mounted

```tsx title="components/hover-card-11.tsx"
// import from your project: import Demo from '@/components/hover-card-11'
'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import * as React from 'react'

function Counter() {
  const [count, setCount] = React.useState(0)
  return (
    <button className="underline" onClick={() => setCount((value) => value + 1)} type="button">
      Liked {count} times
    </button>
  )
}

export default function Demo() {
  return (
    <HoverCard openDelay={150}>
      <HoverCardTrigger variant="outline">Hover me</HoverCardTrigger>
      <HoverCardContent className="w-56 text-sm data-[state=closed]:hidden" forceMount>
        <Counter />
        <p className="text-muted-foreground text-xs">The count survives closing, since forceMount keeps it mounted.</p>
      </HoverCardContent>
    </HoverCard>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the hover card follows. The portaled content gets the resolved `dir`, the trigger keeps the page's, and `side="left"`/`side="right"` and `align="start"`/`align="end"` mirror with it.

```tsx
<DirectionProvider dir="rtl">
  <HoverCard>
    <HoverCardTrigger>مرّر المؤشر</HoverCardTrigger>
    <HoverCardContent>محتوى البطاقة هنا.</HoverCardContent>
  </HoverCard>
</DirectionProvider>
```

```tsx title="components/hover-card-2.tsx"
// import from your project: import Demo from '@/components/hover-card-2'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@gentleduck/registry-ui/hover-card'
import { CalendarIcon } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <HoverCard>
        <HoverCardTrigger variant={'link'}>Next.js</HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between gap-4">
            <Avatar>
              <AvatarImage alt="Next.js" src="https://github.com/gentleeduck.png" />
              <AvatarFallback>NJ</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Next.js</h4>
              <p className="text-sm">إطار عمل React من تطوير Vercel وصيانتها.</p>
              <div className="flex items-center gap-2 pt-2">
                <CalendarIcon aria-hidden="true" className="size-4 opacity-70" />
                <span className="text-muted-foreground text-xs">انضمّ في ديسمبر 2021</span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionHoverCard` and `MotionHoverCardContent` for smooth enter/exit animations powered by [motion](https://motion.dev). The card scales and fades with a directional shift matching the placement side.

```tsx title="components/hover-card-4.tsx"
// import from your project: import Demo from '@/components/hover-card-4'
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { HoverCardTrigger, MotionHoverCard, MotionHoverCardContent } from '@gentleduck/registry-ui/hover-card'
import { CalendarIcon } from 'lucide-react'

export default function Demo() {
  return (
    <MotionHoverCard>
      <HoverCardTrigger variant={'link'}>@nextjs</HoverCardTrigger>
      <MotionHoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage alt="VC" src="https://github.com/gentleeduck.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">@nextjs</h4>
            <p className="text-sm">The React Framework -- created and maintained by @vercel.</p>
            <div className="flex items-center pt-2">
              <CalendarIcon className="me-2 h-4 w-4 opacity-70" />{' '}
              <span className="text-muted-foreground text-xs">Joined December 2021</span>
            </div>
          </div>
        </div>
      </MotionHoverCardContent>
    </MotionHoverCard>
  )
}
```

}>
  Requires the `motion` package. Use `MotionHoverCard` instead of `HoverCard` and `MotionHoverCardContent` instead of `HoverCardContent`. `HoverCardTrigger` stays the same.

## API Reference

### HoverCard

Root that holds the hover card's state. It is `HoverCardPrimitive.Root` itself and renders no element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `-` | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | `-` | Callback when open state changes |
| `defaultOpen` | `boolean` | `-` | Initial open state for uncontrolled usage |
| `openDelay` | `number` | `700` | Delay before opening on hover or keyboard focus. A touch does not open it. |
| `closeDelay` | `number` | `300` | Delay before closing on pointer leave/blur |
| `disabled` | `boolean` | `false` | Keeps the card closed, and closes it if it is open |
| `dir` | `'ltr' \| 'rtl'` | - | Direction of the content, resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). The trigger keeps the page's |
| `children` | `React.ReactNode` | `--` | HoverCard sub-components |

### HoverCardTrigger

The element that triggers the hover card on hover. Applies `buttonVariants` styling.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `ButtonVariant` | `'outline'` | Button variant style |
| `size` | `ButtonSize` | `'default'` | Button size |
| `border` | `ButtonBorder` | `'default'` | Button border style |
| `children` | `React.ReactNode` | `--` | Content rendered inside the trigger button |
| `...props` | `React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger> & Variants.VariantProps<typeof buttonVariants>` | - | Additional props inherited from `HoverCard.Trigger`. Always renders a native `a` element; there is no `asChild`/`Slot` support. |

### HoverCardContent

The content displayed when the hover card is open. Wraps `HoverCardPrimitive.Content` with animation and styling.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `-` | Additional CSS classes. The arrow fills with `--popover` and draws a 1px outline in `--hover-card-border-color` |
| `children` | `React.ReactNode` | `-` | Content rendered inside the hover card |
| `forceMount` | `true` | - | Keeps the content in the page while closed, as `data-state="closed"`, for an exit animation to run on |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Preferred side relative to the trigger |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment on the chosen side |
| `sideOffset` | `number` | `4` | Main-axis offset from trigger |
| `alignOffset` | `number` | `0` | Cross-axis offset from trigger |
| `...props` | `React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> & React.HTMLProps<HTMLDivElement>` | - | Additional props inherited from `HoverCard.Content` and standard content div props. |

### MotionHoverCard

Wraps with `useMotionRoot` for exit animation support. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | The side `MotionHoverCardContent` opens on and animates from when its own `side` is unset |
| `...props` | `React.ComponentProps<typeof HoverCard>` | - | Every `HoverCard` prop |

### MotionHoverCardContent

Adds directional scale, blur, and opacity enter/exit animation, on the same surface as `HoverCardContent`. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `HoverCardContentProps` | - | All props from `HoverCardContent` are supported |