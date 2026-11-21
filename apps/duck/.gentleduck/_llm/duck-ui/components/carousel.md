```tsx title="components/carousel-1.tsx"
// import from your project: import Demo from '@/components/carousel-1'
'use client'
import { Card, CardContent } from '@gentleduck/registry-ui/card'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'

export default function Demo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list generated from Array.from
          <CarouselItem key={`item-${index + 1}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-4xl">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

## About

The carousel component is built using the [Embla Carousel](https://www.embla-carousel.com/) library.

## Philosophy

Carousels are controversial  -  done wrong, they hide content behind interaction. We wrap Embla Carousel because it handles the hard parts (touch gestures, snap points, accessibility, RTL support) without opinions about visual design. Our layer adds the gentleduck/ui styling and exposes Previous/Next controls as composable elements.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add carousel
```

Install the following dependencies:

```bash
npm install embla-carousel-react @gentleduck/libs
```

Add the `Button` component to your project.

The `Carousel` component uses the [`Button`](/duck-ui/components/button) component. Make sure you have it installed in your project.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
```

```tsx showLineNumbers
<Carousel>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
```

## Examples

### Sizes

To set the size of the items, you can use the `basis` utility class on the `<CarouselItem />`.

```tsx title="components/carousel-2.tsx"
// import from your project: import Demo from '@/components/carousel-2'
'use client'
import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'

export default function Demo() {
  return (
    <Carousel
      className="w-full max-w-sm"
      opts={{
        align: 'start',
      }}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list generated from Array.from
          <CarouselItem className="md:basis-1/2 lg:basis-1/3" key={`item-${index + 1}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-3xl">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

```tsx showLineNumbers /-ml-4/ /pl-4/
<Carousel>
  <CarouselContent className="-ms-4">
    <CarouselItem className="ps-4">...</CarouselItem>
    <CarouselItem className="ps-4">...</CarouselItem>
    <CarouselItem className="ps-4">...</CarouselItem>
  </CarouselContent>
</Carousel>
```

```tsx showLineNumbers /-ml-2/ /pl-2/ /md:-ml-4/ /md:pl-4/
<Carousel>
  <CarouselContent className="-ms-2 md:-ms-4">
    <CarouselItem className="ps-2 md:ps-4">...</CarouselItem>
    <CarouselItem className="ps-2 md:ps-4">...</CarouselItem>
    <CarouselItem className="ps-2 md:ps-4">...</CarouselItem>
  </CarouselContent>
</Carousel>
```

### Spacing

To set the spacing between the items, we use a `ps-[VALUE]` utility on the `<CarouselItem />` and a negative `-ms-[VALUE]` on the `<CarouselContent />`.

Use the logical `ps-` and `-ms-`. The carousel spaces its items with them, so they replace its spacing, where `pl-` and `-ml-` would sit beside it and, in a right-to-left carousel, pull the other way.

} className="mt-6">
  **Why:** I have been using the `gap` property or a `grid` layout on the `   <CarouselContent />` but it required a lot of math and mental effort to get the
  spacing right. I found `ps-[VALUE]` and `-ms-[VALUE]` utilities much easier to
  use.

  You can always adjust this in your own project if you need to.

```tsx title="components/carousel-3.tsx"
// import from your project: import Demo from '@/components/carousel-3'
'use client'
import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'

export default function Demo() {
  return (
    <Carousel className="w-full max-w-sm">
      <CarouselContent className="-ms-1">
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list generated from Array.from
          <CarouselItem className="ps-1 md:basis-1/2 lg:basis-1/3" key={`item-${index + 1}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-2xl">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

```tsx showLineNumbers /-ml-4/ /pl-4/
<Carousel>
  <CarouselContent className="-ms-4">
    <CarouselItem className="ps-4">...</CarouselItem>
    <CarouselItem className="ps-4">...</CarouselItem>
    <CarouselItem className="ps-4">...</CarouselItem>
  </CarouselContent>
</Carousel>
```

```tsx showLineNumbers /-ml-2/ /pl-2/ /md:-ml-4/ /md:pl-4/
<Carousel>
  <CarouselContent className="-ms-2 md:-ms-4">
    <CarouselItem className="ps-2 md:ps-4">...</CarouselItem>
    <CarouselItem className="ps-2 md:ps-4">...</CarouselItem>
    <CarouselItem className="ps-2 md:ps-4">...</CarouselItem>
  </CarouselContent>
</Carousel>
```

### Orientation

Use the `orientation` prop to set the orientation of the carousel.

```tsx title="components/carousel-4.tsx"
// import from your project: import Demo from '@/components/carousel-4'
'use client'
import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'

export default function Demo() {
  return (
    <Carousel
      className="w-full max-w-xs"
      opts={{
        align: 'start',
      }}
      orientation="vertical">
      <CarouselContent className="-mt-1 h-[200px]">
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list generated from Array.from
          <CarouselItem className="pt-1 md:basis-1/2" key={`item-${index + 1}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <span className="font-semibold text-3xl">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

```tsx showLineNumbers /vertical | horizontal/
<Carousel orientation="vertical | horizontal">
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
</Carousel>
```

### Loop, icons and labels

With `opts={{ loop: true }}` the last slide leads back to the first, so neither arrow is ever disabled. `icon` swaps the arrow for one of your own, which follows the direction only if you give it `rtl:rotate-180`, and `text` names the button for a screen reader. The left and right arrow keys move the carousel while focus is inside it.

```tsx title="components/carousel-8.tsx"
// import from your project: import Demo from '@/components/carousel-8'
'use client'

import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ponds = ['Mill pond', 'Lake', 'Marsh', 'Canal']

export default function Demo() {
  return (
    <Carousel aria-label="Ponds" className="w-full max-w-xs" opts={{ loop: true }}>
      <CarouselContent>
        {ponds.map((pond) => (
          <CarouselItem key={pond}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6">
                  <span className="font-semibold text-2xl">{pond}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious icon={<ChevronLeft aria-hidden="true" className="rtl:rotate-180" />} text="Previous pond" />
      <CarouselNext icon={<ChevronRight aria-hidden="true" className="rtl:rotate-180" />} text="Next pond" />
    </Carousel>
  )
}
```

### Slide Counter (API)

```tsx title="components/carousel-5.tsx"
// import from your project: import Demo from '@/components/carousel-5'
'use client'

import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'
import * as React from 'react'

export default function Demo() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className="mx-auto max-w-xs">
      <Carousel className="w-full max-w-xs" setApi={setApi}>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list generated from Array.from
            <CarouselItem key={`item-${index + 1}`}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-4xl">{index + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="py-2 text-center text-muted-foreground text-sm">
        Slide {current} of {count}
      </div>
    </div>
  )
}
```

### Autoplay Plugin

```tsx title="components/carousel-6.tsx"
// import from your project: import Demo from '@/components/carousel-6'
'use client'

import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import * as React from 'react'

export default function Demo() {
  const plugin = React.useRef(Autoplay({ delay: 2000, stopOnInteraction: true }))

  return (
    <Carousel
      className="w-full max-w-xs"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      plugins={[plugin.current]}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list generated from Array.from
          <CarouselItem key={`item-${index + 1}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-4xl">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
```

### Styled controls

```tsx title="components/carousel-9.tsx"
// import from your project: import Demo from '@/components/carousel-9'
'use client'

import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'

export default function Demo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {[1, 2, 3, 4, 5].map((slide) => (
          <CarouselItem key={slide}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="font-semibold text-4xl">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious size="icon-sm" variant="secondary" />
      <CarouselNext size="icon-sm" variant="secondary" />
    </Carousel>
  )
}
```

## Component Composition

## Behavior

### Options

You can pass options to the carousel using the `opts` prop. See the [Embla Carousel docs](https://www.embla-carousel.com/api/options/) for more information.

```tsx showLineNumbers {2-5}
<Carousel
  opts={{
    align: "start",
    loop: true,
  }}
>
  <CarouselContent>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
    <CarouselItem>...</CarouselItem>
  </CarouselContent>
</Carousel>
```

### API

Use a state and the `setApi` props to get an instance of the carousel API.

```tsx showLineNumbers {1,4,22}
import { type CarouselApi } from "@/components/ui/carousel"

export function Example() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
      </CarouselContent>
    </Carousel>
  )
}
```

### Events

You can listen to events using the api instance from `setApi`.

```tsx showLineNumbers {1,4-14,16}
import { type CarouselApi } from "@/components/ui/carousel"

export function Example() {
  const [api, setApi] = React.useState<CarouselApi>()

  React.useEffect(() => {
    if (!api) {
      return
    }

    api.on("select", () => {
      // Do something on select.
    })
  }, [api])

  return (
    <Carousel setApi={setApi}>
      <CarouselContent>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
        <CarouselItem>...</CarouselItem>
      </CarouselContent>
    </Carousel>
  )
}
```

See the [Embla Carousel docs](https://www.embla-carousel.com/api/events/) for more information on using events.

### Plugins

You can use the `plugins` prop to add plugins to the carousel.

```ts showLineNumbers {1,6-10}
import Autoplay from "embla-carousel-autoplay"

export function Example() {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
    >
      // ...
    </Carousel>
  )
}
```

See the [Embla Carousel docs](https://www.embla-carousel.com/api/plugins/) for more information on using plugins.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the carousel follows: Embla scrolls right-to-left, the previous/next buttons and arrows swap sides, and the arrow keys match what you see. No `opts.direction` needed.

```tsx title="components/carousel-7.tsx"
// import from your project: import Demo from '@/components/carousel-7'
'use client'

import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'

const slides = [
  { number: '١', title: 'الشريحة الأولى' },
  { number: '٢', title: 'الشريحة الثانية' },
  { number: '٣', title: 'الشريحة الثالثة' },
  { number: '٤', title: 'الشريحة الرابعة' },
  { number: '٥', title: 'الشريحة الخامسة' },
]

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Carousel className="w-full max-w-xs">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.number}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square flex-col items-center justify-center gap-2 p-6">
                    <span className="font-semibold text-4xl">{slide.number}</span>
                    <span className="text-muted-foreground text-sm">{slide.title}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious text="الشريحة السابقة" />
        <CarouselNext text="الشريحة التالية" />
      </Carousel>
    </DirectionProvider>
  )
}
```

## API Reference

### Carousel

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `opts` | `CarouselOptions` | - | Configuration options passed to `embla-carousel` |
| `plugins` | `CarouselPlugin` | - | Array of Embla plugins |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Carousel axis direction |
| `dir` | `'ltr' \| 'rtl'` | - | Direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `setApi` | `(api: CarouselApi) => void` | - | Callback to expose the Embla API |
| `...props` | `React.HTMLAttributes<HTMLElement>` | - | Additional props to spread to the `section` |

### CarouselContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the content container |
| `children` | `React.ReactNode` | - | `CarouselItem` elements |
| `...props` | `React.HTMLAttributes<HTMLUListElement>` | - | Additional props to spread to the underlying `ul` element (wrapped in an unstyled `overflow-hidden` div that holds the Embla ref) |

### CarouselItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the item (use `basis-*` utilities to control size) |
| `children` | `React.ReactNode` | - | Slide content |
| `...props` | `React.HTMLProps<HTMLLIElement>` | - | Additional props to spread to the li element |

### CarouselPrevious

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `'outline'` | Variant prop for the `Button` component |
| `size` | `string` | `'icon'` | Size prop for the `Button` component |
| `text` | `string` | `'Previous slide'` | Name of the button, as text only a screen reader reads |
| `icon` | `React.ReactNode` | arrow | Replaces the arrow, which points the other way in a right-to-left carousel |
| `...props` | `React.ComponentPropsWithoutRef<typeof Button>` | - | Additional props inherited from `Button`. |

### CarouselNext

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `string` | `'outline'` | Variant prop for the `Button` component |
| `size` | `string` | `'icon'` | Size prop for the `Button` component |
| `text` | `string` | `'Next slide'` | Name of the button, as text only a screen reader reads |
| `icon` | `React.ReactNode` | arrow | Replaces the arrow, which points the other way in a right-to-left carousel |
| `...props` | `React.ComponentPropsWithoutRef<typeof Button>` | - | Additional props inherited from `Button`. |

### Types

```ts
type CarouselApi = UseEmblaCarouselType[1]
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0]
type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: 'horizontal' | 'vertical'
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: CarouselApi
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps
```