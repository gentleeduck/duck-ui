```tsx title="components/navigation-menu-1.tsx"
// import from your project: import Demo from '@/components/navigation-menu-1'
'use client'

import { cn } from '@gentleduck/libs/cn'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@gentleduck/registry-ui/navigation-menu'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

const components: { title: string; href: string; description: string }[] = [
  {
    description: 'A modal dialog that interrupts the user with important content and expects a response.',
    href: '/docs/components/alert-dialog',
    title: 'Alert Dialog',
  },
  {
    description: 'For sighted users to preview content available behind a link.',
    href: '/docs/components/hover-card',
    title: 'Hover Card',
  },
  {
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
    href: '/docs/components/progress',
    title: 'Progress',
  },
  {
    description: 'Visually or semantically separates content.',
    href: '/docs/components/scroll-area',
    title: 'Scroll-area',
  },
  {
    description: 'A set of layered sections of content -- known as tab panels -- that are displayed one at a time.',
    href: '/docs/components/tabs',
    title: 'Tabs',
  },
  {
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    href: '/docs/components/tooltip',
    title: 'Tooltip',
  },
]

export default function Demo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex gap-3 p-6">
              <NavigationMenuLink asChild className="w-[350px] rounded-md bg-muted">
                <a
                  className="flex h-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  href="/">
                  <Image
                    alt="Logo"
                    className="object-contain"
                    height={100}
                    src="https://zpgqhogoevbgpxustvmo.supabase.co/storage/v1/object/public/produc_imgs/duckui%20(1).png"
                    width={100}
                  />
                  <div className="mt-4 mb-2 font-medium text-lg">duck/ui</div>
                  <p className="text-muted-foreground text-sm leading-tight">
                    Beautifully designed components that you can copy and paste into your apps. Accessible.
                    Customizable. Open Source.
                  </p>
                </a>
              </NavigationMenuLink>
              <div className="flex flex-col gap-2">
                <ListItem href="/docs" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="/docs/components/typography" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </div>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[500px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[500px]">
              {components.map((component) => (
                <ListItem href={component.href} key={component.title} title={component.title}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Documentation</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const ListItem = React.forwardRef<React.ComponentRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            ref={ref}
            {...props}>
            <div className="font-medium text-sm leading-none">{title}</div>
            <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = 'ListItem'
```

## Philosophy

Navigation menus serve a different purpose than dropdown menus  -  they're for wayfinding, not actions. The distinction matters for accessibility: navigation menus use `<nav>` and link semantics, while dropdown menus use `role="menu"` and button semantics. We expose viewport and indicator sub-components for advanced hover/focus animations.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add navigation-menu
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs @gentleduck/variants lucide-react
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"
```

```tsx showLineNumbers
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink>Link</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Examples

### Without a viewport

`viewport={false}` drops each item's content right under its own trigger instead of in one shared panel that resizes between items. `NavigationMenuIndicator` in the list draws an arrow under the open trigger, and `active` on a link marks the current page.

```tsx title="components/navigation-menu-4.tsx"
// import from your project: import Demo from '@/components/navigation-menu-4'
'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@gentleduck/registry-ui/navigation-menu'

export default function Demo() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-48 gap-1">
              <li>
                <NavigationMenuLink href="#analytics">Analytics</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#automation">Automation</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Company</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-48 gap-1">
              <li>
                <NavigationMenuLink href="#about">About</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#careers">Careers</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink active className={navigationMenuTriggerStyle()} href="#pricing">
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

### Vertical

`orientation="vertical"` stacks the list and opens each item to its side, with the indicator and the chevron pointing at it. `ArrowUp` and `ArrowDown` move between the triggers, the arrow pointing away from the list enters the content, and a new item's content slides in from above or below.

```tsx title="components/navigation-menu-5.tsx"
// import from your project: import Demo from '@/components/navigation-menu-5'
'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@gentleduck/registry-ui/navigation-menu'

const sections = [
  { links: ['Overview', 'Members', 'Billing'], title: 'Workspace' },
  { links: ['Profile', 'Notifications', 'Security'], title: 'Account' },
  { links: ['Guides', 'Changelog'], title: 'Help' },
]

export default function Demo() {
  return (
    <NavigationMenu className="items-start" orientation="vertical">
      <NavigationMenuList className="w-44">
        {sections.map((section) => (
          <NavigationMenuItem key={section.title} value={section.title}>
            <NavigationMenuTrigger>{section.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-48 gap-1">
                {section.links.map((link) => (
                  <li key={link}>
                    <NavigationMenuLink href={`#${link.toLowerCase()}`}>{link}</NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  )
}
```

### Controlled and manual

`value` and `onValueChange` hold the open item. `activationMode="manual"` opens an item on a click only and keeps it open once the pointer leaves, `closeOnSelect={false}` on a link keeps the menu open after it, and a `disabled` trigger opens nothing and is passed over by the arrow keys.

```tsx title="components/navigation-menu-6.tsx"
// import from your project: import Demo from '@/components/navigation-menu-6'
'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@gentleduck/registry-ui/navigation-menu'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState('')
  const [compared, setCompared] = React.useState<string[]>([])
  const compare = (plan: string) => setCompared((plans) => (plans.includes(plan) ? plans : [...plans, plan]))

  return (
    <div className="flex flex-col items-center gap-3">
      <NavigationMenu activationMode="manual" onValueChange={setOpen} value={open}>
        <NavigationMenuList>
          <NavigationMenuItem value="plans">
            <NavigationMenuTrigger>Plans</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-56 gap-1">
                {['Starter', 'Team', 'Enterprise'].map((plan) => (
                  <li key={plan}>
                    <NavigationMenuLink
                      closeOnSelect={false}
                      href={`#${plan.toLowerCase()}`}
                      onSelect={() => compare(plan)}>
                      Compare {plan}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="roadmap">
            <NavigationMenuTrigger disabled>Roadmap</NavigationMenuTrigger>
            <NavigationMenuContent />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <p className="text-muted-foreground text-sm">
        Open: {open || 'none'}, comparing: {compared.join(', ') || 'nothing yet'}
      </p>
    </div>
  )
}
```

### Delays and a kept indicator

```tsx title="components/navigation-menu-7.tsx"
// import from your project: import Demo from '@/components/navigation-menu-7'
'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@gentleduck/registry-ui/navigation-menu'

export default function Demo() {
  return (
    <NavigationMenu closeDelay={400} defaultValue="" delayDuration={500} skipDelayDuration={1000}>
      <NavigationMenuList>
        {['Products', 'Solutions', 'Pricing'].map((name) => (
          <NavigationMenuItem key={name} value={name}>
            <NavigationMenuTrigger>{name}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-60 gap-1 p-2">
                <NavigationMenuLink href="#">All {name.toLowerCase()}</NavigationMenuLink>
                <NavigationMenuLink href="#">What is new</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuIndicator forceMount />
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}
```

## Component Composition

## Link

You can use the `asChild` prop to make another component look like a navigation menu trigger. Here's an example of a link that looks like a navigation menu trigger.

```tsx showLineNumbers title="components/example-navigation-menu.tsx"
import Link from "next/link"

export function NavigationMenuDemo() {
  return (
    <NavigationMenuItem>
      <NavigationMenuLink asChild>
        <Link href="/www">Documentation</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the navigation menu follows. Content aligns to the right, slides in from the side of the trigger you moved to, and arrow keys move through the list in visual order.

```tsx title="components/navigation-menu-2.tsx"
// import from your project: import Demo from '@/components/navigation-menu-2'
'use client'

import { cn } from '@gentleduck/libs/cn'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@gentleduck/registry-ui/navigation-menu'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

const components: { title: string; href: string; description: string }[] = [
  {
    description: 'نافذة حوار تقاطع المستخدم بمحتوى مهم وتنتظر منه استجابة.',
    href: '/docs/components/alert-dialog',
    title: 'مربع حوار التنبيه',
  },
  {
    description: 'تتيح للمستخدمين المبصرين معاينة المحتوى الموجود خلف الرابط.',
    href: '/docs/components/hover-card',
    title: 'بطاقة التمرير',
  },
  {
    description: 'يعرض مؤشرًا يوضّح مدى اكتمال مهمة، ويظهر عادةً كشريط تقدّم.',
    href: '/docs/components/progress',
    title: 'شريط التقدّم',
  },
  {
    description: 'يضيف تمريرًا مخصّصًا للمحتوى بمظهر موحّد في جميع المتصفحات.',
    href: '/docs/components/scroll-area',
    title: 'منطقة التمرير',
  },
  {
    description: 'مجموعة من أقسام المحتوى المتراكبة، تُعرف بلوحات التبويب، تُعرض واحدة تلو الأخرى.',
    href: '/docs/components/tabs',
    title: 'التبويبات',
  },
  {
    description: 'نافذة منبثقة تعرض معلومات عن عنصر عندما يتلقى تركيز لوحة المفاتيح أو يمر مؤشر الفأرة فوقه.',
    href: '/docs/components/tooltip',
    title: 'تلميح الأدوات',
  },
]

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>البدء</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="flex gap-3 p-6">
                <NavigationMenuLink asChild className="w-[350px] rounded-md bg-muted">
                  <a
                    className="flex h-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/">
                    <Image
                      alt="Logo"
                      className="object-contain"
                      height={100}
                      src="https://zpgqhogoevbgpxustvmo.supabase.co/storage/v1/object/public/produc_imgs/duckui%20(1).png"
                      width={100}
                    />
                    <div className="mt-4 mb-2 font-medium text-lg">duck/ui</div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      مكونات مصممة بإتقان يمكنك نسخها ولصقها في تطبيقاتك. سهلة الوصول. قابلة للتخصيص. مفتوحة المصدر.
                    </p>
                  </a>
                </NavigationMenuLink>
                <div className="flex flex-col gap-2">
                  <ListItem href="/docs" title="مقدمة">
                    مكونات قابلة لإعادة الاستخدام مبنية باستخدام Radix UI و Tailwind CSS.
                  </ListItem>
                  <ListItem href="/docs/installation" title="التثبيت">
                    كيفية تثبيت الاعتماديات وتنظيم بنية تطبيقك.
                  </ListItem>
                  <ListItem href="/docs/components/typography" title="الطباعة">
                    أنماط العناوين والفقرات والقوائم وغيرها.
                  </ListItem>
                </div>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>المكونات</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[500px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[500px]">
                {components.map((component) => (
                  <ListItem href={component.href} key={component.title} title={component.title}>
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/docs" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>التوثيق</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </DirectionProvider>
  )
}

const ListItem = React.forwardRef<React.ComponentRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            ref={ref}
            {...props}>
            <div className="font-medium text-sm leading-none">{title}</div>
            <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = 'ListItem'
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionNavigationMenu` to open the viewport with a `scaleIn` animation (fade, scale, and blur) on a bouncy spring, powered by [motion](https://motion.dev). The bar itself stays still, and the viewport plays its exit before it leaves.

```tsx title="components/navigation-menu-3.tsx"
// import from your project: import Demo from '@/components/navigation-menu-3'
'use client'

import { cn } from '@gentleduck/libs/cn'
import {
  MotionNavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@gentleduck/registry-ui/navigation-menu'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

const components: { title: string; href: string; description: string }[] = [
  {
    description: 'A modal dialog that interrupts the user with important content and expects a response.',
    href: '/docs/components/alert-dialog',
    title: 'Alert Dialog',
  },
  {
    description: 'For sighted users to preview content available behind a link.',
    href: '/docs/components/hover-card',
    title: 'Hover Card',
  },
  {
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
    href: '/docs/components/progress',
    title: 'Progress',
  },
  {
    description: 'Visually or semantically separates content.',
    href: '/docs/components/scroll-area',
    title: 'Scroll-area',
  },
  {
    description: 'A set of layered sections of content -- known as tab panels -- that are displayed one at a time.',
    href: '/docs/components/tabs',
    title: 'Tabs',
  },
  {
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    href: '/docs/components/tooltip',
    title: 'Tooltip',
  },
]

export default function Demo() {
  return (
    <MotionNavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="flex gap-3 p-6">
              <NavigationMenuLink asChild className="w-[350px] rounded-md bg-muted">
                <a
                  className="flex h-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  href="/">
                  <Image
                    alt="Logo"
                    className="object-contain"
                    height={100}
                    src="https://zpgqhogoevbgpxustvmo.supabase.co/storage/v1/object/public/produc_imgs/duckui%20(1).png"
                    width={100}
                  />
                  <div className="mt-4 mb-2 font-medium text-lg">duck/ui</div>
                  <p className="text-muted-foreground text-sm leading-tight">
                    Beautifully designed components that you can copy and paste into your apps. Accessible.
                    Customizable. Open Source.
                  </p>
                </a>
              </NavigationMenuLink>
              <div className="flex flex-col gap-2">
                <ListItem href="/docs" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="/docs/components/typography" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </div>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[500px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[500px]">
              {components.map((component) => (
                <ListItem href={component.href} key={component.title} title={component.title}>
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>Documentation</NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </MotionNavigationMenu>
  )
}

const ListItem = React.forwardRef<React.ComponentRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            ref={ref}
            {...props}>
            <div className="font-medium text-sm leading-none">{title}</div>
            <p className="line-clamp-2 text-muted-foreground text-sm leading-snug">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = 'ListItem'
```

}>
  Requires the `motion` package. Use `MotionNavigationMenu` instead of `NavigationMenu`. All other sub-components stay the same.

## API Reference

### NavigationMenu

Root container that wraps the navigation menu and optionally renders the viewport.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Controlled value of the active menu item |
| `defaultValue` | `string` | - | Default active value for uncontrolled usage |
| `onValueChange` | `(value: string) => void` | - | Callback when the active value changes |
| `viewport` | `boolean` | `true` | Whether to render the `NavigationMenuViewport` automatically |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`) and inherited by descendants. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | The orientation of the menu |
| `delayDuration` | `number` | `200` | Duration in ms from when the pointer enters a trigger until the content opens. A click on the trigger before then cancels the open |
| `skipDelayDuration` | `number` | `300` | Duration in ms a user has to enter another trigger without incurring a delay again |
| `closeDelay` | `number` | `150` | Duration in ms an item stays open after the pointer leaves it |
| `activationMode` | `'automatic' \| 'manual'` | `'automatic'` | `manual` opens and closes an item only on a click of its trigger, and ignores the pointer resting on it |
| `className` | `string` | - | Additional CSS classes for the root element |
| `children` | `React.ReactNode` | - | Navigation menu list and other elements |
| `...props` | `React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>` | - | Additional props inherited from `NavigationMenu.Root`. |

### NavigationMenuList

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the list element |
| `...props` | `React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>` | - | Additional props inherited from `NavigationMenu.List`. |

### NavigationMenuItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the menu item |
| `...props` | `React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>` | - | Additional props inherited from `NavigationMenu.Item`. |

### NavigationMenuTrigger

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the trigger |
| `children` | `React.ReactNode` | `--` | Trigger label content. A chevron icon is appended automatically |
| `...props` | `React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>` | - | Additional props inherited from `NavigationMenu.Trigger`. |

### NavigationMenuContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the content panel |
| `...props` | `React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>` | - | Additional props inherited from `NavigationMenu.Content`. |

### NavigationMenuLink

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the link |
| `active` | `boolean` | `false` | Marks the link as the current page and draws it highlighted |
| `closeOnSelect` | `boolean` | `true` | `false` keeps the menu open once the link is selected. A click with Cmd, Ctrl, Shift or Alt held leaves it open either way, since the link opens elsewhere and the page stays |
| `onSelect` | `(event: Event) => void` | - | Called when the link is chosen. `event.preventDefault()` keeps the menu open |
| `...props` | `React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>` | - | Additional props inherited from `NavigationMenu.Link`. |

### NavigationMenuViewport

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the viewport |
| `...props` | `React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>` | - | Additional props inherited from `NavigationMenu.Viewport`. |

### NavigationMenuIndicator

Place it in `NavigationMenuList`. It draws an arrow under the open trigger, or beside it in a vertical menu.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes for the indicator |
| `forceMount` | `true` | - | Keeps the indicator drawn, as `data-state="hidden"`, while no item is open |
| `...props` | `React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>` | - | Additional props inherited from `NavigationMenu.Indicator`. |

### navigationMenuTriggerStyle

A `cva` variant function that returns the default trigger styling classes. Use it to style non-trigger elements (e.g. plain links) to match the trigger appearance.

```tsx
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"

<NavigationMenuLink className={navigationMenuTriggerStyle()}>
  Documentation
</NavigationMenuLink>
```

### MotionNavigationMenu

Same props as `NavigationMenu`. Its viewport opens with a `scaleIn` animation (fade, scale, and blur) on a bouncy spring and stays mounted through its exit, in place of the CSS animation `NavigationMenuViewport` plays. With `viewport={false}` the contents keep their CSS animation. Requires the `motion` package.