```tsx title="components/scroll-area-1.tsx"
// import from your project: import Demo from '@/components/scroll-area-1'
import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'
import { Separator } from '@gentleduck/registry-ui/separator'
import * as React from 'react'

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`)

export default function Demo() {
  return (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 font-medium text-sm leading-none">Tags</h4>
        {tags.map((tag) => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}
```

## Philosophy

ScrollArea keeps the browser's own scrolling and scrollbar, so scroll physics, keyboard scrolling, and screen readers work as they do everywhere else. You style the scrollbar once in your global CSS and every ScrollArea picks it up. The API stays small (`viewportClassName` and `viewportRef`) because scrolling should be invisible infrastructure, not a feature you configure.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add scroll-area
```

```css title="global.css"
/* Add this block of css to your project. */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  /* Replace this with your own custom scrollbar thumb color */
  background: var(--border);
  border-radius: 5px;
}
```

Install the following dependencies:

```bash
npm install @gentleduck/libs
```

Copy and paste the following code into your project.

 Add this block of css to your project.

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  /* Replace this with your own custom scrollbar thumb color */
  background: var(--border);
  border-radius: 5px;
}
```

Update the import paths to match your project setup.

## Usage

```tsx
import { ScrollArea } from "@/components/ui/scroll-area"
```

```tsx
<ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
  Jokester began sneaking into the castle in the middle of the night and leaving
  jokes all over the place: under the king's pillow, in his soup, even in the
  royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
  then, one day, the people of the kingdom discovered that the jokes left by
  Jokester were so funny that they couldn't help but laugh. And once they
  started laughing, they couldn't stop.
</ScrollArea>
```

## Examples

### Horizontal Scrolling

```tsx title="components/scroll-area-2.tsx"
// import from your project: import Demo from '@/components/scroll-area-2'
import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'
import Image from 'next/image'

export interface IArtwork {
  artist: string
  art: string
}

export const works: IArtwork[] = [
  {
    art: 'https://images.pexels.com/photos/27309761/pexels-photo-27309761.jpeg',
    artist: 'Lina Escobar',
  },
  {
    art: 'https://images.pexels.com/photos/14757972/pexels-photo-14757972.jpeg',
    artist: 'Marco Duvall',
  },
  {
    art: 'https://images.pexels.com/photos/5046721/pexels-photo-5046721.jpeg',
    artist: 'Sahana Ramesh',
  },
]

export default function Demo() {
  return (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {works.map((artwork) => (
          <figure className="shrink-0" key={artwork.artist}>
            <div className="overflow-hidden">
              <Image
                alt={`Photo by ${artwork.artist}`}
                className="max-h-[300px] select-none rounded-md object-cover"
                draggable={false}
                height={300}
                src={artwork.art}
                width={230}
              />
            </div>
            <figcaption className="pt-2 text-muted-foreground text-xs">
              Photo by <span className="font-semibold text-foreground">{artwork.artist}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </ScrollArea>
  )
}
```

### Both directions

Content wider and taller than the frame scrolls both ways in the one viewport. Sticky cells stick to the viewport, so a table header stays in view.

```tsx title="components/scroll-area-6.tsx"
// import from your project: import Demo from '@/components/scroll-area-6'
import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const regions = ['North', 'South', 'East', 'West', 'Central', 'Coastal', 'Highlands', 'Islands', 'Metro', 'Rural']

export default function Demo() {
  return (
    <ScrollArea className="h-64 w-80 rounded-md border">
      <table className="w-max border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky top-0 bg-background px-3 py-2 text-start font-medium">Region</th>
            {months.map((month) => (
              <th className="sticky top-0 bg-background px-3 py-2 text-end font-medium" key={month}>
                {month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region, row) => (
            <tr className="border-t" key={region}>
              <td className="px-3 py-2">{region}</td>
              {months.map((month, column) => (
                <td className="px-3 py-2 text-end tabular-nums" key={month}>
                  {((row + 3) * (column + 7) * 37) % 900}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}
```

### Scrolling from code

`viewportRef` reaches the element that scrolls, so `scrollTo` and `scrollTop` work on it. Here two buttons move a build log to its start and its end. Pass `role="region"` and an `aria-label` when the area is a landmark of its own.

```tsx title="components/scroll-area-5.tsx"
// import from your project: import Demo from '@/components/scroll-area-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'
import * as React from 'react'

const lines = Array.from({ length: 40 }, (_, i) => `[12:${String(i).padStart(2, '0')}] build step ${i + 1} finished`)

export default function Demo() {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const scrollTo = (top: number) => viewportRef.current?.scrollTo({ behavior: 'smooth', top })

  return (
    <div className="flex w-80 flex-col gap-2">
      <ScrollArea aria-label="Build log" className="h-56 rounded-md border" role="region" viewportRef={viewportRef}>
        <pre className="p-4 font-mono text-xs leading-6">{lines.join('\n')}</pre>
      </ScrollArea>
      <div className="flex gap-2">
        <Button onClick={() => scrollTo(0)} size="sm" variant="outline">
          Back to top
        </Button>
        <Button onClick={() => scrollTo(viewportRef.current?.scrollHeight ?? 0)} size="sm" variant="outline">
          Jump to latest
        </Button>
      </div>
    </div>
  )
}
```

## Scrollbar

The viewport shows the native scrollbar, styled by the `::-webkit-scrollbar` rules from the installation step. Chromium and Safari use those rules; Firefox ignores them and draws its own thin scrollbar.

To keep scrolling but hide the bar, pass `scrollbar-none` to the viewport. Use it sparingly: without a bar, nothing tells people the content scrolls. A row cut off at the edge, as here, is one way to show it.

```tsx title="components/scroll-area-7.tsx"
// import from your project: import Demo from '@/components/scroll-area-7'
import { Badge } from '@gentleduck/registry-ui/badge'
import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'

const topics = ['Design', 'Engineering', 'Product', 'Research', 'Marketing', 'Sales', 'Support', 'Finance', 'Legal']

export default function Demo() {
  return (
    <ScrollArea className="w-72" viewportClassName="scrollbar-none snap-x">
      <div className="flex w-max gap-2 py-1">
        {topics.map((topic) => (
          <Badge className="snap-start" key={topic} variant="secondary">
            {topic}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the scroll area follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/scroll-area-3.tsx"
// import from your project: import Demo from '@/components/scroll-area-3'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { ScrollArea } from '@gentleduck/registry-ui/scroll-area'
import { Separator } from '@gentleduck/registry-ui/separator'
import * as React from 'react'

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`)

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <ScrollArea className="h-72 w-48 rounded-md border">
        <div className="p-4">
          <h4 className="mb-4 font-medium text-sm leading-none">الإصدارات</h4>
          {tags.map((tag) => (
            <React.Fragment key={tag}>
              <div className="text-sm">{tag}</div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionScrollArea` for a smooth entrance animation powered by [motion](https://motion.dev). The container uses the shared `scaleIn` preset (fade, scale, and blur) with a `springBouncy` transition on mount.

```tsx title="components/scroll-area-4.tsx"
// import from your project: import Demo from '@/components/scroll-area-4'
'use client'

import { MotionScrollArea } from '@gentleduck/registry-ui/scroll-area'
import { Separator } from '@gentleduck/registry-ui/separator'

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`)

export default function Demo() {
  return (
    <MotionScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 font-medium text-sm leading-none">Tags</h4>
        {tags.map((tag) => (
          <div key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </div>
        ))}
      </div>
    </MotionScrollArea>
  )
}
```

}>
  Requires the `motion` package. Use `MotionScrollArea` instead of `ScrollArea`. Same props. The regular `ScrollArea` is perfectly fine - this is an optional enhancement.

## API Reference

### ScrollArea

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `viewportRef` | `React.Ref<HTMLDivElement>` | - | Ref forwarded to the inner scrollable viewport element |
| `viewportClassName` | `string` | `--` | Additional CSS classes for the inner scrollable viewport. Pass `scrollbar-none` to hide the scrollbar |
| `className` | `string` | `--` | Additional CSS classes for the outer container |
| `style` | `React.CSSProperties` | `--` | Inline styles for the outer container |
| `children` | `React.ReactNode` | `--` | Scrollable content |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props for the outer container, which `ref` also reaches |

### MotionScrollArea

`scaleIn` entrance (fade, scale, and blur) with `springBouncy` transition on mount. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ScrollAreaProps` | - | All props from `ScrollArea` are supported (drag handlers are omitted for motion type safety) |