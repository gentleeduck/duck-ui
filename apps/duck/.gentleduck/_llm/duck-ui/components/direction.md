```tsx title="components/direction-1.tsx"
// import from your project: import Demo from '@/components/direction-1'
'use client'

import { Avatar, AvatarFallback } from '@gentleduck/registry-ui/avatar'
import { Badge } from '@gentleduck/registry-ui/badge'
import { Button } from '@gentleduck/registry-ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { DirectionProvider, useDirection } from '@gentleduck/registry-ui/direction'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const NOTIFICATIONS = [
  { defaultChecked: true, id: 'direction-email', label: 'إشعارات البريد الإلكتروني' },
  { defaultChecked: false, id: 'direction-mentions', label: 'تنبيهات الإشارات' },
]

function NextStepButton() {
  const dir = useDirection()
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight

  return (
    <Button className="px-0" variant="link">
      التالي: الأمان
      <Arrow aria-hidden="true" />
    </Button>
  )
}

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar>
            <AvatarFallback>سع</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <CardTitle>سارة العتيبي</CardTitle>
            <CardDescription>sara@example.com</CardDescription>
          </div>
          <Badge variant="secondary">مسؤولة</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {NOTIFICATIONS.map((item) => (
            <div className="flex items-center justify-between gap-4" key={item.id}>
              <Label htmlFor={item.id}>{item.label}</Label>
              <Switch defaultChecked={item.defaultChecked} id={item.id} />
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-between">
          <Button>حفظ التغييرات</Button>
          <NextStepButton />
        </CardFooter>
      </Card>
    </DirectionProvider>
  )
}
```

## Philosophy

Direction is cross-cutting state. Set it once and every component works out the rest: layout, spacing, icons, keyboard arrows, and where overlays open. You do not pass `dir` to components or add `rtl:` classes.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add direction
```

Install the following dependency:

```bash
npm install @gentleduck/primitives
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

Set the direction on the document:

```tsx
<html dir="rtl" lang="ar">
```

Or wrap your app, or any part of it, in `DirectionProvider`:

```tsx
import { DirectionProvider } from '@/components/ui/direction'

<DirectionProvider dir="rtl">{children}</DirectionProvider>
```

Components resolve direction from their own `dir` prop, then the nearest `DirectionProvider`, then `<html dir>`. Changes to `<html dir>` are picked up at runtime. On the server the document is not available, so in server-rendered apps use `DirectionProvider` (it can sit right inside `<html dir="rtl">`) to get the right direction on first paint.

`DirectionProvider` renders a `div` with `dir` and `display: contents`, so your own logical classes and `rtl:` variants follow it too, and it adds no box to the layout. A flex or grid row orders its items by its own direction, so put the provider around the row, not inside it.

### Custom components

Use `useDirection` when your own component needs the direction in JavaScript, such as picking an icon or flipping a key. For layout, prefer logical classes (`ms-*`, `pe-*`, `start-*`, `text-start`), which follow `dir` without any code.

```tsx
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useDirection } from '@/components/ui/direction'

function NextIcon() {
  const dir = useDirection()
  return dir === 'rtl' ? <ArrowLeft /> : <ArrowRight />
}
```

## Examples

### Switch at runtime

Change the provider's `dir` and everything under it follows: the slider fills from the other side and its arrow keys turn around, and the menu and its submenu open toward the start. `toDirection` narrows the string the toggle group reports, which is empty when its pressed item is pressed again.

```tsx title="components/direction-2.tsx"
// import from your project: import Demo from '@/components/direction-2'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider, type IDirection, toDirection } from '@gentleduck/registry-ui/direction'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { Slider } from '@gentleduck/registry-ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import * as React from 'react'

export default function Demo() {
  const [dir, setDir] = React.useState<IDirection.Kind>('rtl')

  return (
    <div className="grid w-full max-w-sm gap-4">
      <ToggleGroup
        aria-label="Direction"
        onValueChange={(value) => setDir((current) => toDirection(value) ?? current)}
        type="single"
        value={dir}
        variant="outline">
        <ToggleGroupItem value="ltr">Left to right</ToggleGroupItem>
        <ToggleGroupItem value="rtl">Right to left</ToggleGroupItem>
      </ToggleGroup>
      <DirectionProvider dir={dir}>
        <div className="grid gap-4 rounded-lg border p-4">
          <Slider aria-label="Volume" defaultValue={[60]} max={100} step={1} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="justify-self-start" variant="outline">
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Send to</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Message</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DirectionProvider>
    </div>
  )
}
```

### Nested directions

A provider inside another wins for its subtree. Here an Arabic card keeps its install commands, and the tabs that switch them, left to right.

```tsx title="components/direction-3.tsx"
// import from your project: import Demo from '@/components/direction-3'
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@gentleduck/registry-ui/card'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@gentleduck/registry-ui/tabs'

const COMMANDS = [
  ['npm', 'npm install @gentleduck/primitives'],
  ['bun', 'bun add @gentleduck/primitives'],
  ['pnpm', 'pnpm add @gentleduck/primitives'],
] as const

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>التثبيت</CardTitle>
          <CardDescription>
            ثبّت الحزمة باستخدام مدير الحزم الذي تفضّله. تبقى الأوامر وتبويباتها من اليسار إلى اليمين.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DirectionProvider dir="ltr">
            <Tabs defaultValue="npm">
              <TabsList>
                {COMMANDS.map(([name]) => (
                  <TabsTrigger key={name} value={name}>
                    {name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {COMMANDS.map(([name, command]) => (
                <TabsContent key={name} value={name}>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-sm">
                    <code>{command}</code>
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </DirectionProvider>
        </CardContent>
      </Card>
    </DirectionProvider>
  )
}
```

### Reading the direction

```tsx title="components/direction-4.tsx"
// import from your project: import Demo from '@/components/direction-4'
'use client'

import { DirectionProvider, Provider, toDirection, useDirection } from '@gentleduck/registry-ui/direction'

function Arrow({ dir }: { dir?: string }) {
  const direction = useDirection(toDirection(dir))
  return (
    <span className="rounded-md border px-3 py-1 text-sm">
      {direction === 'rtl' ? '<-' : '->'} {direction}
    </span>
  )
}

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <DirectionProvider dir="rtl">
        <div className="flex gap-2">
          <Arrow />
          <Arrow dir="ltr" />
          <Arrow dir="sideways" />
        </div>
      </DirectionProvider>
      <Provider dir="ltr">
        <Arrow />
      </Provider>
      <p className="text-muted-foreground text-sm">
        toDirection drops a value that is not ltr or rtl, so useDirection falls back to the provider.
      </p>
    </div>
  )
}
```

## API Reference

### Exports

| Export | Type | Description |
| --- | --- | --- |
| `DIRECTION_DICTIONARY` | `{ ltr: 'ltr'; rtl: 'rtl' }` | Canonical direction values |
| `DirectionProvider` | `React.FC<{ dir: 'ltr' \| 'rtl'; children?: ReactNode }>` | Provides direction to descendants |
| `Provider` | `React.FC<{ dir: 'ltr' \| 'rtl'; children?: ReactNode }>` | Alias for `DirectionProvider` |
| `useDirection` | `(localDir?: 'ltr' \| 'rtl') => 'ltr' \| 'rtl'` | Resolves `localDir` -> nearest `DirectionProvider` -> `<html dir>` |
| `DirectionContext` | `React.Context<'ltr' \| 'rtl' \| undefined>` | Underlying context object |
| `toDirection` | `(dir: unknown) => 'ltr' \| 'rtl' \| undefined` | Narrows an arbitrary `dir` value; anything else becomes `undefined` |