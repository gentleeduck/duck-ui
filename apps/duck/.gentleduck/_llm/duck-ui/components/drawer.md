```tsx title="components/drawer-1.tsx"
// import from your project: import Demo from '@/components/drawer-1'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Minus, Plus } from 'lucide-react'
import * as React from 'react'
import { Bar, BarChart } from 'recharts'

function generateRandomGoals(count: number, minGoal: number = 100, maxGoal: number = 500): { goal: number }[] {
  const goals: { goal: number }[] = []
  for (let i = 0; i < count; i++) {
    goals.push({
      goal: Math.floor(Math.random() * (maxGoal - minGoal + 1)) + minGoal,
    })
  }
  return goals
}

const data = generateRandomGoals(20)

export default function Demo() {
  const [goal, setGoal] = React.useState(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button className="h-8 w-8" disabled={goal <= 200} onClick={() => onClick(-10)} variant="outline">
                <Minus aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="font-bold text-7xl tracking-tighter">{goal}</div>
                <div className="text-[0.70rem] text-muted-foreground uppercase">Calories/day</div>
              </div>
              <Button className="h-8 w-8" disabled={goal >= 400} onClick={() => onClick(10)} variant="outline">
                <Plus aria-hidden="true" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
            <div className="mt-3 h-[120px]">
              <BarChart data={data} height={120} width={320}>
                <Bar
                  dataKey="goal"
                  style={
                    {
                      fill: 'var(--foreground)',
                      opacity: 0.9,
                    } as React.CSSProperties
                  }
                />
              </BarChart>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
```

## Philosophy

Drawers are the mobile-native sibling of sheets  -  they respond to drag gestures and snap to natural positions. We wrap Vaul because gesture physics and spring animations are notoriously hard to get right. The result feels native on touch devices while degrading gracefully to a standard overlay on desktop.

## About

Drawer is built on [Vaul](https://github.com/emilkowalski/vaul) by [emilkowalski\_](https://twitter.com/emilkowalski_).

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add drawer
```

Install the required dependency:

```bash
npm install vaul @gentleduck/libs
```

Copy and paste the following code into your project.

Update import paths as needed.

## Usage

```tsx showLineNumbers
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui'
```

```tsx showLineNumbers
<Drawer>
  <DrawerTrigger>Open</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Are you absolutely sure?</DrawerTitle>
      <DrawerDescription>This action cannot be undone.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

## Examples

### Drawer

using the normal one.

```tsx title="components/drawer-2.tsx"
// import from your project: import Demo from '@/components/drawer-2'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Minus, Plus } from 'lucide-react'
import * as React from 'react'
import { Bar, BarChart } from 'recharts'

function generateRandomGoals(count: number, minGoal: number = 100, maxGoal: number = 500): { goal: number }[] {
  const goals: { goal: number }[] = []
  for (let i = 0; i < count; i++) {
    goals.push({
      goal: Math.floor(Math.random() * (maxGoal - minGoal + 1)) + minGoal,
    })
  }
  return goals
}

const data = generateRandomGoals(20)

export default function Demo() {
  const [goal, setGoal] = React.useState(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <Drawer shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button className="h-8 w-8" disabled={goal <= 200} onClick={() => onClick(-10)} variant="outline">
                <Minus aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="font-bold text-7xl tracking-tighter">{goal}</div>
                <div className="text-[0.70rem] text-muted-foreground uppercase">Calories/day</div>
              </div>
              <Button className="h-8 w-8" disabled={goal >= 400} onClick={() => onClick(10)} variant="outline">
                <Plus aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
            <div className="mt-3 h-[120px]">
              <BarChart data={data} height={120} width={320}>
                <Bar
                  dataKey="goal"
                  style={
                    {
                      fill: 'var(--foreground)',
                      opacity: 0.9,
                    } as React.CSSProperties
                  }
                />
              </BarChart>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
```

### Responsive Dialog

Use `Dialog` and `Drawer` together to create a responsive dialog. It renders `Dialog` on desktop and `Drawer` on mobile.

```tsx title="components/drawer-3.tsx"
// import from your project: import Demo from '@/components/drawer-3'
import { useMediaQuery } from '@gentleduck/hooks/use-media-query'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@gentleduck/registry-ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer onOpenChange={setOpen} open={open} shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-start">
          <DrawerTitle>Edit profile</DrawerTitle>
          <DrawerDescription>Make changes to your profile here. Click save when you're done.</DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ProfileForm({ className }: React.ComponentProps<'form'>) {
  return (
    <form className={cn('grid items-start gap-4', className)}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input defaultValue="wildduck@example.com" id="email" type="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input defaultValue="@wildduck" id="username" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  )
}
```

### Non-dismissible

A non-dismissible drawer For cases when your drawer has to be always visible, Nothing will close it unless you make it controlled and close it programmatically.

```tsx title="components/drawer-4.tsx"
// import from your project: import Demo from '@/components/drawer-4'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Minus, Plus } from 'lucide-react'
import * as React from 'react'
import { Bar, BarChart } from 'recharts'

function generateRandomGoals(count: number, minGoal: number = 100, maxGoal: number = 500): { goal: number }[] {
  const goals: { goal: number }[] = []
  for (let i = 0; i < count; i++) {
    goals.push({
      goal: Math.floor(Math.random() * (maxGoal - minGoal + 1)) + minGoal,
    })
  }
  return goals
}

const goals = generateRandomGoals(20)

export default function Demo() {
  const [goal, setGoal] = React.useState<number>(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <Drawer shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open New Drawer</Button>
      </DrawerTrigger>
      <DrawerContent className="h-[480px]">
        <div className="mx-auto max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Goal</DrawerTitle>
            <DrawerDescription>Set your daily calorie goal</DrawerDescription>
          </DrawerHeader>

          <ContentComponent goal={goal} onClick={onClick} />

          <DrawerFooter className="flex-row gap-2">
            <DrawerClose asChild>
              <Button className="w-full" variant="default">
                Close Drawer
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export const ContentComponent = ({ goal, onClick }: { goal: number; onClick: (adjustment: number) => void }) => {
  return (
    <div className="flex w-full items-start justify-center pt-4 pb-2">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-center space-x-2">
          <Button
            className="h-8 w-8 shrink-0 rounded-full"
            disabled={goal <= 200}
            onClick={() => onClick(-10)}
            size="icon"
            variant="outline">
            <Minus aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Decrease</span>
          </Button>

          <div className="flex-1 text-center">
            <div className="font-bold text-7xl tracking-tighter">{goal}</div>
            <div className="text-[0.70rem] text-muted-foreground uppercase">Calories/day</div>
          </div>

          <Button
            className="h-8 w-8 shrink-0 rounded-full"
            disabled={goal >= 400}
            onClick={() => onClick(10)}
            size="icon"
            variant="outline">
            <Plus aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>

        <div className="mt-3 h-[120px] w-full">
          <BarChart data={goals} height={120} width={368}>
            <Bar
              dataKey="goal"
              style={
                {
                  fill: 'var(--foreground)',
                  opacity: 0.9,
                  width: '50px',
                } as React.CSSProperties
              }
            />
          </BarChart>
        </div>
      </div>
    </div>
  )
}
```

### Non-modal

```tsx title="components/drawer-5.tsx"
// import from your project: import Demo from '@/components/drawer-5'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Minus, Plus } from 'lucide-react'
import * as React from 'react'
import { Bar, BarChart } from 'recharts'

function generateRandomGoals(count: number, minGoal: number = 100, maxGoal: number = 500): { goal: number }[] {
  const goals: { goal: number }[] = []
  for (let i = 0; i < count; i++) {
    goals.push({
      goal: Math.floor(Math.random() * (maxGoal - minGoal + 1)) + minGoal,
    })
  }
  return goals
}

const goals = generateRandomGoals(20)

export default function Demo() {
  const [goal, setGoal] = React.useState<number>(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <Drawer modal={false} shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open New Drawer</Button>
      </DrawerTrigger>

      <DrawerContent className="h-[480px]">
        <div className="mx-auto max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Goal</DrawerTitle>
            <DrawerDescription>Set your daily calorie goal</DrawerDescription>
          </DrawerHeader>

          <ContentComponent goal={goal} onClick={onClick} />

          <DrawerFooter className="flex-row gap-2">
            <DrawerClose asChild>
              <Button className="w-full" variant="default">
                Close Drawer
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export const ContentComponent = ({ goal, onClick }: { goal: number; onClick: (adjustment: number) => void }) => {
  return (
    <div className="flex w-full items-start justify-center pt-4 pb-2">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-center space-x-2">
          <Button
            className="h-8 w-8 shrink-0 rounded-full"
            disabled={goal <= 200}
            onClick={() => onClick(-10)}
            size="icon"
            variant="outline">
            <Minus aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Decrease</span>
          </Button>

          <div className="flex-1 text-center">
            <div className="font-bold text-7xl tracking-tighter">{goal}</div>
            <div className="text-[0.70rem] text-muted-foreground uppercase">Calories/day</div>
          </div>

          <Button
            className="h-8 w-8 shrink-0 rounded-full"
            disabled={goal >= 400}
            onClick={() => onClick(10)}
            size="icon"
            variant="outline">
            <Plus aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>

        <div className="mt-3 h-[120px] w-full">
          <BarChart data={goals} height={120} width={368}>
            <Bar
              dataKey="goal"
              style={
                {
                  fill: 'var(--foreground)',
                  opacity: 0.9,
                  width: '50px',
                } as React.CSSProperties
              }
            />
          </BarChart>
        </div>
      </div>
    </div>
  )
}
```

### Custom Drawer

```tsx title="components/drawer-6.tsx"
// import from your project: import Demo from '@/components/drawer-6'
'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Separator } from '@gentleduck/registry-ui/separator'
import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import * as React from 'react'

const TASKS = [
  { id: 'plan', title: 'Plan the project', description: 'Outline key milestones and deliverables.' },
  { id: 'gather', title: 'Gather resources', description: 'Collect tools, assets, and information.' },
  { id: 'develop', title: 'Start development', description: 'Implement core features and iterate.' },
  { id: 'test', title: 'Testing phase', description: 'Debug, QA, and performance optimization.' },
  { id: 'launch', title: 'Launch & review', description: 'Deploy and gather feedback.' },
]

export default function Demo() {
  const [checked, setChecked] = React.useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const progress = Math.round((checked.size / TASKS.length) * 100)
  const allDone = checked.size === TASKS.length

  return (
    <Drawer shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open checklist</Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader className="text-start">
          <div className="flex items-center justify-between">
            <DrawerTitle>Launch checklist</DrawerTitle>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold text-xs transition-colors',
                allDone
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground',
              )}>
              {progress}%
            </span>
          </div>
          <DrawerDescription>Complete all steps before going live.</DrawerDescription>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all duration-500', allDone ? 'bg-green-500' : 'bg-primary')}
              style={{ width: `${progress}%` }}
            />
          </div>
        </DrawerHeader>

        <Separator />

        <div className="flex flex-col gap-1 px-4 py-3">
          {TASKS.map((task) => {
            const done = checked.has(task.id)
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggle(task.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-accent/50',
                  done && 'opacity-60',
                )}>
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <span className={cn('font-medium text-sm', done && 'line-through')}>{task.title}</span>
                  <p className="text-muted-foreground text-xs">{task.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <DrawerFooter>
          {allDone ? (
            <DrawerClose asChild>
              <Button className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Sparkles className="me-2 h-4 w-4" />
                Ship it
              </Button>
            </DrawerClose>
          ) : (
            <Button variant="secondary" disabled>
              {TASKS.length - checked.size} step{TASKS.length - checked.size !== 1 ? 's' : ''} remaining
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
```

### Active Trigger on Open

Style the trigger to appear active while the drawer is open using `data-[state=open]`:

```tsx title="components/drawer-8.tsx"
// import from your project: import Demo from '@/components/drawer-8'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Menu } from 'lucide-react'

export default function Demo() {
  return (
    <Drawer shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:ring-2 data-[state=open]:ring-ring">
          <Menu className="me-2 h-4 w-4" />
          Open drawer
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer</DrawerTitle>
          <DrawerDescription>The trigger stays active while the drawer is open.</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}
```

### Sides

Open the drawer from the `top`, `right`, `bottom`, or `left` by setting the `direction` prop.

```tsx title="components/drawer-9.tsx"
// import from your project: import Demo from '@/components/drawer-9'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'

const PARAGRAPHS = Array.from({ length: 10 }, (_, index) => index + 1)

const DRAWER_SIDES = ['top', 'right', 'bottom', 'left'] as const

export default function Demo() {
  return (
    <div className="flex flex-wrap gap-2">
      {DRAWER_SIDES.map((side) => (
        <Drawer key={side} direction={side === 'bottom' ? undefined : (side as 'top' | 'right' | 'left')}>
          <DrawerTrigger asChild>
            <Button className="capitalize" variant="outline">
              {side}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
            <DrawerHeader>
              <DrawerTitle>Move Goal</DrawerTitle>
              <DrawerDescription>Set your daily activity goal.</DrawerDescription>
            </DrawerHeader>
            <div className="no-scrollbar overflow-y-auto px-4">
              {PARAGRAPHS.map((section) => (
                <p className="mb-4 leading-normal" key={section}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                  officia deserunt mollit anim id est laborum.
                </p>
              ))}
            </div>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  )
}
```

### Scrollable Content

Right-side drawer with a long, scrollable body. The scroll container fills remaining height while header and footer stay pinned.

```tsx title="components/drawer-10.tsx"
// import from your project: import Demo from '@/components/drawer-10'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'

const SECTIONS = Array.from({ length: 20 }, (_, index) => index + 1)

export default function Demo() {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">Open Right Drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Terms of Service</DrawerTitle>
          <DrawerDescription>Scroll through the content below.</DrawerDescription>
        </DrawerHeader>
        <div className="no-scrollbar flex-1 overflow-y-auto px-4">
          {SECTIONS.map((section) => (
            <p className="mb-4 text-sm leading-normal" key={section}>
              <strong>Section {section}.</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))}
        </div>
        <DrawerFooter>
          <Button>Accept</Button>
          <DrawerClose asChild>
            <Button variant="outline">Decline</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
```

### Styling the backdrop

```tsx title="components/drawer-11.tsx"
// import from your project: import Demo from '@/components/drawer-11'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'

export default function Demo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Open over a tinted backdrop</Button>
      </DrawerTrigger>
      <DrawerContent overlayProps={{ className: 'bg-primary/30 backdrop-blur-sm' }}>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>overlayProps styles the backdrop behind the drawer.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
```

## Component Composition

## Behavior

* **Background Scaling**: Scales the background when the drawer is open using `[vaul-drawer-wrapper]`.
* **Custom Close Threshold**: Controls when the drawer should close based on swipe distance (0 to 1).
* **Scroll Lock Timeout**: Sets a delay for drawer drag after scrolling (default: 500ms).
* **Snap Points**: Defines percentage or pixel values for drawer screen coverage.
* **Fade Effect**: Applies a fade effect from a specific snap point.
* **Modal Control**: Allows interaction with elements outside the drawer (default: true).
* **Handle-Only Dragging**: Restricts drawer dragging to `<Drawer.Handle />` (default: false).
* **Directional Control**: Opens drawer from top, bottom, left, or right (default: bottom).
* **Scroll Restoration Prevention**: Avoids restoring scroll after navigation within the drawer (default: true).
* **Disable Scroll Prevention**: Disables scroll prevention to fix autofocus issues (default: true).
* **No Body Styles**: Prevents Vaul from applying styles to the body (default: false).
* **Background Color on Scale**: Controls background color change when the drawer opens (default: true).
* **No Drag Attribute**: Prevents drawer dragging when interacting with elements marked `[data-vaul-no-drag]`.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the drawer follows. The portaled content gets the resolved `dir`, and horizontal drawers (`left`/`right`) are mirrored in RTL.

```tsx title="components/drawer-7.tsx"
// import from your project: import Demo from '@/components/drawer-7'
import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Minus, Plus } from 'lucide-react'
import * as React from 'react'
import { Bar, BarChart } from 'recharts'

function generateRandomGoals(count: number, minGoal: number = 100, maxGoal: number = 500): { goal: number }[] {
  const goals: { goal: number }[] = []
  for (let i = 0; i < count; i++) {
    goals.push({
      goal: Math.floor(Math.random() * (maxGoal - minGoal + 1)) + minGoal,
    })
  }
  return goals
}

const data = generateRandomGoals(20)

export default function Demo() {
  const [goal, setGoal] = React.useState(350)

  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }

  return (
    <DirectionProvider dir="rtl">
      <Drawer shouldScaleBackground={false}>
        <DrawerTrigger asChild>
          <Button variant="outline">فتح الدرج</Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>هدفك اليومي</DrawerTitle>
              <DrawerDescription>حدّد هدف نشاطك اليومي.</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="flex items-center justify-center gap-2">
                <Button className="h-8 w-8" disabled={goal <= 200} onClick={() => onClick(-10)} variant="outline">
                  <Minus aria-hidden="true" className="size-4" />
                  <span className="sr-only">تقليل</span>
                </Button>
                <div className="flex-1 text-center">
                  <div className="font-bold text-7xl tracking-tighter">{goal}</div>
                  <div className="text-[0.70rem] text-muted-foreground">سعرة حرارية في اليوم</div>
                </div>
                <Button className="h-8 w-8" disabled={goal >= 400} onClick={() => onClick(10)} variant="outline">
                  <Plus aria-hidden="true" />
                  <span className="sr-only">زيادة</span>
                </Button>
              </div>
              <div className="mt-3 h-[120px]">
                <BarChart data={data} height={120} width={320}>
                  <Bar
                    dataKey="goal"
                    style={
                      {
                        fill: 'var(--foreground)',
                        opacity: 0.9,
                      } as React.CSSProperties
                    }
                  />
                </BarChart>
              </div>
            </div>
            <DrawerFooter>
              <Button>إرسال</Button>
              <DrawerClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </DirectionProvider>
  )
}
```

## API Reference

### Drawer

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `shouldScaleBackground` | `boolean` | `true` | Whether to scale the background when drawer is open |
| `dir` | `'ltr' \| 'rtl'` | - | Optional override, used to mirror horizontal drawers in RTL. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `...props` | `React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>` | - | Additional props inherited from `Drawer.Root`. |

### DrawerTrigger

Wrapper around `DrawerPrimitive.Trigger`. Used to toggle the drawer open or closed.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the trigger |
| `children` | `React.ReactNode` | - | Trigger content |
| `...props` | `React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Trigger>` | - | Additional props inherited from `Drawer.Trigger`. |

### DrawerPortal

Wrapper around `DrawerPrimitive.Portal`. Renders drawer content in a React Portal.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Portal>` | - | Additional props inherited from `Drawer.Portal`. |

### DrawerClose

Wrapper around `DrawerPrimitive.Close`. Closes the drawer when clicked.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the close element |
| `children` | `React.ReactNode` | - | Close button content |
| `...props` | `React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Close>` | - | Additional props inherited from `Drawer.Close`. |

### DrawerOverlay

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the overlay |
| `...props` | `React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>` | - | Additional props inherited from `Drawer.Overlay`. |

### DrawerContent

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the content panel |
| `children` | `React.ReactNode` | - | Drawer inner content |
| `dir` | `'ltr' \| 'rtl'` | - | Optional override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `overlayProps` | `React.ComponentPropsWithoutRef<typeof DrawerOverlay>` | - | Props forwarded to the `DrawerOverlay` |
| `...props` | `React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>` | - | Additional props inherited from `Drawer.Content`. |

### DrawerHeader

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the header |
| `children` | `React.ReactNode` | - | Header content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### DrawerFooter

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Optional override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS classes applied to the footer |
| `children` | `React.ReactNode` | - | Footer content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### DrawerTitle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Optional override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS classes applied to the title |
| `children` | `React.ReactNode` | - | Title text |
| `...props` | `React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>` | - | Additional props inherited from `Drawer.Title`. |

### DrawerDescription

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Optional override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS classes applied to the description |
| `children` | `React.ReactNode` | - | Description text |
| `...props` | `React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>` | - | Additional props inherited from `Drawer.Description`. |

## See also

* [Dialog](/duck-ui/components/dialog)  -  Centered modal overlay
* [Sheet](/duck-ui/components/sheet)  -  Side panel overlay