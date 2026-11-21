```tsx title="components/card-1.tsx"
// import from your project: import Demo from '@/components/card-1'
import { Button } from '@gentleduck/registry-ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Framework</Label>
              <Select>
                <SelectTrigger id="framework" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  )
}
```

## Philosophy

Cards are the universal container for grouped content. We decompose them into Header, Content, Footer, Title, and Description not because every card needs all five, but because real-world cards vary enormously. A pricing card needs a footer; a notification card doesn't. The sub-component pattern lets you compose exactly what you need.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add card
```

Install the following dependencies:

```bash
npm install @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
```

```tsx showLineNumbers
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>Card Action</CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>
```

## Examples

```tsx title="components/card-2.tsx"
// import from your project: import Demo from '@/components/card-2'
import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { Switch } from '@gentleduck/registry-ui/switch'
import { BellRing, Check } from 'lucide-react'

const notifications = [
  {
    description: '1 hour ago',
    title: 'Your call has been confirmed.',
  },
  {
    description: '1 hour ago',
    title: 'You have a new message!',
  },
  {
    description: '2 hours ago',
    title: 'Your subscription is expiring soon!',
  },
]

type CardProps = React.ComponentProps<typeof Card>

export default function Demo({ className, ...props }: CardProps) {
  return (
    <Card className={cn('w-[380px]', className)} {...props}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4 rounded-md border p-4">
          <BellRing />
          <div className="flex-1 space-y-1">
            <p className="font-medium text-sm leading-none">Push Notifications</p>
            <p className="text-muted-foreground text-sm">Send notifications to device.</p>
          </div>
          <Switch />
        </div>
        <div>
          {notifications.map((notification) => (
            <div
              className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              key={notification.title}>
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
              <div className="space-y-1">
                <p className="font-medium text-sm leading-none">{notification.title}</p>
                <p className="text-muted-foreground text-sm">{notification.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Check aria-hidden="true" /> Mark all as read
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Action, and borders

`CardAction` puts a control at the end of the header, beside the title and the description. A `border-b` on the header or a `border-t` on the footer draws a rule and adds the padding beside it.

```tsx title="components/card-5.tsx"
// import from your project: import Demo from '@/components/card-5'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@gentleduck/registry-ui/card'

export default function Demo() {
  return (
    <Card className="w-[350px]">
      <CardHeader className="border-b">
        <CardTitle>Mill pond</CardTitle>
        <CardDescription>Twelve ducks, open all year.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Follow
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">The ducks are fed at nine and at four. Bring oats, never bread.</p>
      </CardContent>
      <CardFooter className="border-t">
        <Button variant="ghost">Share</Button>
        <Button>Visit</Button>
      </CardFooter>
    </Card>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the card follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/card-3.tsx"
// import from your project: import Demo from '@/components/card-3'
import { Button } from '@gentleduck/registry-ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>إنشاء مشروع</CardTitle>
          <CardDescription>انشر مشروعك الجديد بنقرة واحدة.</CardDescription>
        </CardHeader>

        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="card-rtl-name">الاسم</Label>
                <Input id="card-rtl-name" placeholder="اسم مشروعك" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="card-rtl-type">نوع المشروع</Label>

                <Select>
                  <SelectTrigger id="card-rtl-type" className="w-full">
                    <SelectValue placeholder="اختر نوع المشروع" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="landing">صفحة هبوط</SelectItem>
                    <SelectItem value="dashboard">لوحة تحكم</SelectItem>
                    <SelectItem value="ecommerce">متجر إلكتروني</SelectItem>
                    <SelectItem value="portfolio">معرض أعمال</SelectItem>
                    <SelectItem value="blog">مدونة</SelectItem>
                    <SelectItem value="mobile-app">تطبيق جوال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <Button variant="outline">إلغاء</Button>
          <Button>نشر</Button>
        </CardFooter>
      </Card>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionCard`, `MotionCardHeader`, `MotionCardContent`, and `MotionCardFooter` for staggered scale-and-blur entrance animations powered by [motion](https://motion.dev).

```tsx title="components/card-4.tsx"
// import from your project: import Demo from '@/components/card-4'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import {
  CardDescription,
  CardTitle,
  MotionCard,
  MotionCardContent,
  MotionCardFooter,
  MotionCardHeader,
} from '@gentleduck/registry-ui/card'
import { MotionInput } from '@gentleduck/registry-ui/input'
import { MotionLabel } from '@gentleduck/registry-ui/label'
import {
  MotionSelect,
  MotionSelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <MotionCard className="w-[350px]">
      <MotionCardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </MotionCardHeader>
      <MotionCardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <MotionLabel htmlFor="name" index={0}>
                Name
              </MotionLabel>
              <MotionInput id="name" placeholder="Name of your project" index={1} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <MotionLabel htmlFor="framework" index={2}>
                Framework
              </MotionLabel>
              <MotionSelect>
                <SelectTrigger id="framework" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <MotionSelectContent>
                  <SelectItem value="next">Next.js</SelectItem>
                  <SelectItem value="sveltekit">SvelteKit</SelectItem>
                  <SelectItem value="astro">Astro</SelectItem>
                  <SelectItem value="nuxt">Nuxt.js</SelectItem>
                </MotionSelectContent>
              </MotionSelect>
            </div>
          </div>
        </form>
      </MotionCardContent>
      <MotionCardFooter className="flex">
        <MotionButton variant="outline">Cancel</MotionButton>
        <MotionButton>Deploy</MotionButton>
      </MotionCardFooter>
    </MotionCard>
  )
}
```

}>
  Requires the `motion` package. Replace `Card` with `MotionCard`, `CardHeader` with `MotionCardHeader`, `CardContent` with `MotionCardContent`, and `CardFooter` with `MotionCardFooter`. `CardTitle`, `CardDescription`, and `CardAction` stay the same.

## API Reference

### Card

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS classes applied to the card container |
| `children` | `React.ReactNode` | - | Card content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### CardHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the header |
| `children` | `React.ReactNode` | - | Header content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### CardTitle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the title |
| `children` | `React.ReactNode` | - | Title content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### CardDescription

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the description |
| `children` | `React.ReactNode` | - | Description content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### CardAction

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the action container |
| `children` | `React.ReactNode` | - | Action content (e.g. buttons, icons) |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### CardContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the content area |
| `children` | `React.ReactNode` | - | Main card content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### CardFooter

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the footer |
| `children` | `React.ReactNode` | - | Footer content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### MotionCard

Same props as `Card`. Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.

### MotionCardHeader

Same props as `CardHeader`. Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition and a 50ms delay. Requires the `motion` package.

### MotionCardContent

Same props as `CardContent`. Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition and a 100ms delay. Requires the `motion` package.

### MotionCardFooter

Same props as `CardFooter`. Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition and a 150ms delay. Requires the `motion` package.