```tsx title="components/accordion-1.tsx"
// import from your project: import Demo from '@/components/accordion-1'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'

export default function Demo() {
  return (
    <Accordion className="w-[350px]" collapsible type="single">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It&apos;s animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

## Philosophy

Accordions solve the progressive disclosure problem  -  show the outline, hide the details until requested. We use a compound component pattern (Accordion -> AccordionItem -> AccordionTrigger + AccordionContent) because each piece needs independent control while sharing open/close state. The `type="single"` vs `type="multiple"` distinction maps directly to whether sections are mutually exclusive.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add accordion
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
```

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Examples

### Default

```tsx title="components/accordion-2.tsx"
// import from your project: import Demo from '@/components/accordion-2'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'

export default function Demo() {
  return (
    <Accordion className="w-[350px]" collapsible defaultValue="item-1" type="single">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It&apos;s animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

### ChevronDown Icon

```tsx title="components/accordion-3.tsx"
// import from your project: import Demo from '@/components/accordion-3'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import { ChevronDown } from 'lucide-react'

export default function Demo() {
  return (
    <Accordion className="w-[350px]" collapsible type="single">
      <AccordionItem value="item-1">
        <AccordionTrigger icon={<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}>
          Is it accessible?
        </AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger icon={<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}>
          Is it styled?
        </AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components&apos; aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger icon={<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />}>
          Is it animated?
        </AccordionTrigger>
        <AccordionContent>Yes. It&apos;s animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

### multiple

```tsx title="components/accordion-4.tsx"
// import from your project: import Demo from '@/components/accordion-4'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import { Plus } from 'lucide-react'

export default function Demo() {
  return (
    <Accordion className="w-full" type="multiple">
      <AccordionItem value="item-1">
        <AccordionTrigger className="hover:no-underline" icon={<Plus aria-hidden="true" />}>
          Is it accessible?
        </AccordionTrigger>
        <AccordionContent>
          Yes. This accordion is built following the WAI-ARIA design patterns to ensure accessibility for users with
          disabilities. Each trigger is keyboard-navigable, and the content is properly associated with its trigger for
          screen readers. This makes it usable across a wide range of devices and assistive technologies.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="hover:no-underline" icon={<Plus aria-hidden="true" />}>
          Is it styled?
        </AccordionTrigger>
        <AccordionContent>
          Yes. The accordion comes with a modern and clean default styling that seamlessly integrates with other UI
          components in the registry. You can also customize the styles with utility classes or by overriding the
          default class names, ensuring it matches the aesthetic of your application.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="hover:no-underline" icon={<Plus aria-hidden="true" />}>
          Is it animated?
        </AccordionTrigger>
        <AccordionContent>
          Yes. By default, the accordion includes smooth and responsive animations for expanding and collapsing content.
          These animations provide a visually appealing user experience, while also making the state transitions more
          intuitive. If you prefer, the animations can be disabled or replaced with your own custom effects.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger className="hover:no-underline" icon={<Plus aria-hidden="true" />}>
          How customizable is it?
        </AccordionTrigger>
        <AccordionContent>
          The accordion is highly customizable. You can modify its behavior, appearance, and animations through props,
          custom styles, and utility classes. Whether you need to adjust the spacing, colors, or even change the way it
          functions, the accordion is designed to be flexible and adaptable to your project's needs.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger className="hover:no-underline" icon={<Plus aria-hidden="true" />}>
          What are some use cases for this component?
        </AccordionTrigger>
        <AccordionContent>
          Accordions are versatile and can be used in a variety of scenarios, such as:
          <ul className="ms-5 mt-2 list-disc">
            <li>FAQ sections to organize questions and answers.</li>
            <li>Collapsible menus or sub-menus in navigation systems.</li>
            <li>Displaying content-heavy sections in a compact way, such as product details or documentation.</li>
            <li>Interactive forms where users can expand and fill sections as needed.</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

### Active Trigger on Open

Style the trigger to appear highlighted when its section is expanded using `data-[state=open]`:

```tsx title="components/accordion-6.tsx"
// import from your project: import Demo from '@/components/accordion-6'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'

export default function Demo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="data-[state=open]:font-semibold data-[state=open]:text-primary">
          Is it accessible?
        </AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger className="data-[state=open]:font-semibold data-[state=open]:text-primary">
          Is it styled?
        </AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that match the other components' aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger className="data-[state=open]:font-semibold data-[state=open]:text-primary">
          Is it animated?
        </AccordionTrigger>
        <AccordionContent>Yes. It's animated by default, but you can disable it if you prefer.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

### Controlled, with a disabled item

`value` and `onValueChange` hold which item is open in your own state. A `disabled` item stays shut, and the arrow keys pass over it.

```tsx title="components/accordion-8.tsx"
// import from your project: import Demo from '@/components/accordion-8'
'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState('shipping')
  return (
    <div className="flex w-87.5 flex-col gap-3">
      <p className="text-muted-foreground text-sm">Open: {open || 'none'}</p>
      <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent>Three to five working days, tracked from the day it leaves us.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="returns">
          <AccordionTrigger>Returns</AccordionTrigger>
          <AccordionContent>Free within thirty days, in the box it came in.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="gift" disabled>
          <AccordionTrigger>Gift wrapping (sold out)</AccordionTrigger>
          <AccordionContent>Wrapped in recycled paper with a handwritten card.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
```

### Horizontal, without looping

```tsx title="components/accordion-9.tsx"
// import from your project: import Demo from '@/components/accordion-9'
'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import * as React from 'react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday']

export default function Demo() {
  const [focused, setFocused] = React.useState<string | null>(null)
  const [log, setLog] = React.useState<string[]>([])

  return (
    <div className="flex flex-col gap-3">
      <Accordion
        className="flex w-[420px]"
        collapsible
        loop={false}
        onFocusChange={setFocused}
        orientation="horizontal"
        type="single">
        {DAYS.map((day) => (
          <AccordionItem
            className="flex-1 border-e last:border-e-0"
            key={day}
            onOpenChange={(open) =>
              setLog((entries) => [`${day} ${open ? 'opened' : 'closed'}`, ...entries].slice(0, 3))
            }
            value={day}>
            <AccordionTrigger className="px-3">{day}</AccordionTrigger>
            <AccordionContent className="px-3">Shifts on {day}.</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-muted-foreground text-sm">
        Focused: {focused ?? 'none'}. {log.join(', ') || 'ArrowLeft and ArrowRight move, and stop at either end.'}
      </p>
    </div>
  )
}
```

### Built on first open

```tsx title="components/accordion-10.tsx"
// import from your project: import Demo from '@/components/accordion-10'
'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import * as React from 'react'

function Report({ name }: { name: string }) {
  const [loadedAt] = React.useState(() => new Date().toLocaleTimeString())
  return (
    <p>
      The {name} report, built at {loadedAt}. It is not built until first opened, and kept after.
    </p>
  )
}

export default function Demo() {
  return (
    <Accordion className="w-[350px]" collapsible renderOnce type="single">
      {['Sales', 'Traffic'].map((name) => (
        <AccordionItem key={name} value={name}>
          <AccordionTrigger>{name}</AccordionTrigger>
          <AccordionContent>
            <Report name={name.toLowerCase()} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the accordion follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/accordion-5.tsx"
// import from your project: import Demo from '@/components/accordion-5'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@gentleduck/registry-ui/accordion'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Accordion className="w-87.5" collapsible type="single">
        <AccordionItem value="item-1">
          <AccordionTrigger>هل يدعم إمكانية الوصول؟</AccordionTrigger>
          <AccordionContent>نعم، فهو يتبع نمط التصميم المعتمد في WAI-ARIA.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>هل يأتي بتنسيق جاهز؟</AccordionTrigger>
          <AccordionContent>نعم، يأتي بأنماط افتراضية متناسقة مع بقية المكونات.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>هل يدعم الحركة؟</AccordionTrigger>
          <AccordionContent>نعم، الحركة مفعّلة افتراضيًا ويمكنك تعطيلها متى شئت.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionAccordionItem`, `MotionAccordionTrigger`, and `MotionAccordionContent` for smooth height animations powered by [motion](https://motion.dev). The content animates from height 0 to auto with a fade, using a 250ms expo-out curve.

```tsx title="components/accordion-7.tsx"
// import from your project: import Demo from '@/components/accordion-7'
'use client'

import {
  MotionAccordion,
  MotionAccordionContent,
  MotionAccordionItem,
  MotionAccordionTrigger,
} from '@gentleduck/registry-ui/accordion'

export default function Demo() {
  return (
    <MotionAccordion className="w-[350px]" collapsible type="single">
      <MotionAccordionItem value="item-1">
        <MotionAccordionTrigger>Is it accessible?</MotionAccordionTrigger>
        <MotionAccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</MotionAccordionContent>
      </MotionAccordionItem>
      <MotionAccordionItem value="item-2">
        <MotionAccordionTrigger>Is it styled?</MotionAccordionTrigger>
        <MotionAccordionContent>
          Yes. It comes with default styles that matches the other components&apos; aesthetic.
        </MotionAccordionContent>
      </MotionAccordionItem>
      <MotionAccordionItem value="item-3">
        <MotionAccordionTrigger>Is it animated?</MotionAccordionTrigger>
        <MotionAccordionContent>
          Yes. It&apos;s animated by default, but you can disable it if you prefer.
        </MotionAccordionContent>
      </MotionAccordionItem>
    </MotionAccordion>
  )
}
```

}>
  Requires the `motion` package. Replace `AccordionItem` with `MotionAccordionItem`, `AccordionTrigger` with `MotionAccordionTrigger`, and `AccordionContent` with `MotionAccordionContent`. The `Accordion` root stays the same.

## API Reference

### Accordion

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'single' \| 'multiple'` | `'single'` | Defines accordion behavior. `'single'` allows only one open item; `'multiple'` allows multiple open items |
| `defaultValue` | `string \| string[]` | - | Sets initial open state(s); string for single type, array for multiple |
| `value` | `string \| string[]` | - | Controlled open state(s); requires `onValueChange` for updates |
| `onValueChange` | `(value: string \| string[]) => void` | - | Callback fired when open state changes |
| `collapsible` | `boolean` | `false` | Allows collapsing the currently open item by clicking again (single type only) |
| `renderOnce` | `boolean` | `false` | Mounts content only on first expand and preserves it afterward |
| `disabled` | `boolean` | `false` | Disables every item |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Which arrow keys move focus between triggers |
| `loop` | `boolean` | `true` | Arrow keys wrap from the last trigger to the first and back |
| `onFocusChange` | `(value: string \| null) => void` | - | Called with the focused item's value, and with `null` once focus leaves the triggers |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS classes applied to the root div |
| `children` | `React.ReactNode` | - | AccordionItem elements to render inside the accordion |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### AccordionItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | a generated id | Identifies the item in the root's `value` |
| `children` | `React.ReactNode` | - | The item's `AccordionTrigger` and `AccordionContent` |
| `disabled` | `boolean` | `false` | Prevents the item from being opened or closed |
| `onOpenChange` | `(open: boolean) => void` | - | Called when the item's trigger, or the browser's find-in-page, opens or closes it |
| `className` | `string` | - | Additional CSS classes applied to the item div |
| `...props` | `React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>` | - | Additional props inherited from `Accordion.Item` |

### AccordionTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `React.ReactNode` | - | Custom icon component; defaults to a rotating ChevronDown |
| `className` | `string` | - | Additional CSS classes applied to the trigger button |
| `children` | `React.ReactNode` | - | Content rendered as the trigger label |
| `...props` | `React.HTMLProps<HTMLButtonElement>` | - | Additional props to spread to the trigger button |

The trigger sits in an `h3`, so assistive technology lists each section, and its icon is hidden from it.

### AccordionContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the content div |
| `children` | `React.ReactNode` | - | Content to reveal when the accordion item is expanded |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

Closed content stays in the page as `hidden="until-found"`, so the browser's find-in-page opens the item holding the match. Its height animates with `tw-animate-css`'s `animate-accordion-down` and `animate-accordion-up`, which every browser runs.

### MotionAccordion

Wraps `Accordion` and auto-injects a stagger `index` into each `MotionAccordionItem` child, creating a cascading entrance. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `AccordionProps` | - | All props from `Accordion` are supported |

### MotionAccordionItem

Replaces `AccordionItem`. Renders with a staggered `scaleIn` entrance (fade, scale, and blur; 50ms per index). Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Stagger delay index (50ms per index) for entrance animation. Auto-injected when used inside `MotionAccordion`. |
| `...props` | `AccordionItemProps` | - | All props from `AccordionItem` are supported |

### MotionAccordionTrigger

Replaces `AccordionTrigger`. The trigger label uses a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition, and chevron rotation is driven by motion instead of CSS `group-open`. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `AccordionTriggerProps` | - | All props from `AccordionTrigger` are supported |

### MotionAccordionContent

Replaces `AccordionContent`. Animates height from 0 to auto with staggered blur and opacity fade using the `heightAuto` preset. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `AccordionContentProps` | - | All props from `AccordionContent` are supported |