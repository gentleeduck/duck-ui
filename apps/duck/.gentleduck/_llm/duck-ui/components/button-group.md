```tsx title="components/button-group-1.tsx"
// import from your project: import Demo from '@/components/button-group-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarPlusIcon,
  ClockIcon,
  ListFilterPlusIcon,
  MailCheckIcon,
  MoreHorizontalIcon,
  TagIcon,
  Trash2Icon,
} from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [label, setLabel] = React.useState('personal')

  return (
    <ButtonGroup>
      <ButtonGroup className="hidden sm:flex">
        <Button aria-label="Go Back" size="icon" variant="outline">
          <ArrowLeftIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Snooze</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="More Options" size="icon" variant="outline">
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <MailCheckIcon />
                Mark as Read
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArchiveIcon />
                Archive
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <ClockIcon />
                Snooze
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CalendarPlusIcon />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ListFilterPlusIcon />
                Add to List
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <TagIcon />
                  Label As...
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup onValueChange={setLabel} value={label}>
                    <DropdownMenuRadioItem value="personal">Personal</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="work">Work</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                Trash
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </ButtonGroup>
  )
}
```

## Philosophy

Individual buttons sometimes belong together. ButtonGroup handles the visual joining  -  shared borders, connected radii, consistent spacing  -  so you don't manually manage CSS for grouped actions. It's a layout primitive, not a logic primitive: each button inside still owns its own behavior.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add button-group
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/variants
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group"
```

```tsx
<ButtonGroup>
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>
```

## Examples

### Orientation

Set the `orientation` prop to change the button group layout.

```tsx title="components/button-group-2.tsx"
// import from your project: import Demo from '@/components/button-group-2'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { MinusIcon, PlusIcon } from 'lucide-react'

export default function Demo() {
  return (
    <ButtonGroup aria-label="Media controls" className="h-fit" orientation="vertical">
      <Button aria-label="Increase" size="icon" variant="outline">
        <PlusIcon aria-hidden="true" />
      </Button>
      <Button aria-label="Decrease" size="icon" variant="outline">
        <MinusIcon aria-hidden="true" />
      </Button>
    </ButtonGroup>
  )
}
```

### Size

Control the size of buttons using the `size` prop on individual buttons.

```tsx title="components/button-group-3.tsx"
// import from your project: import Demo from '@/components/button-group-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { PlusIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-8">
      <ButtonGroup>
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button size="sm" variant="outline">
          Button
        </Button>
        <Button size="sm" variant="outline">
          Group
        </Button>
        <Button aria-label="Add" size="icon-sm" variant="outline">
          <PlusIcon aria-hidden="true" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Default</Button>
        <Button variant="outline">Button</Button>
        <Button variant="outline">Group</Button>
        <Button aria-label="Add" size="icon" variant="outline">
          <PlusIcon aria-hidden="true" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button size="lg" variant="outline">
          Large
        </Button>
        <Button size="lg" variant="outline">
          Button
        </Button>
        <Button size="lg" variant="outline">
          Group
        </Button>
        <Button aria-label="Add" size="icon-lg" variant="outline">
          <PlusIcon aria-hidden="true" />
        </Button>
      </ButtonGroup>
    </div>
  )
}
```

### Nested

Nest `<ButtonGroup>` components to create button groups with spacing.

```tsx title="components/button-group-4.tsx"
// import from your project: import Demo from '@/components/button-group-4'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'

export default function Demo() {
  return (
    <ButtonGroup>
      <ButtonGroup>
        <Button size="sm" variant="outline">
          1
        </Button>
        <Button size="sm" variant="outline">
          2
        </Button>
        <Button size="sm" variant="outline">
          3
        </Button>
        <Button size="sm" variant="outline">
          4
        </Button>
        <Button size="sm" variant="outline">
          5
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button aria-label="Previous" size="icon-sm" variant="outline">
          <ArrowLeftIcon />
        </Button>
        <Button aria-label="Next" size="icon-sm" variant="outline">
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  )
}
```

### Separator

The `ButtonGroupSeparator` component visually divides buttons within a group.

Buttons with variant `outline` do not need a separator since they have a border. For other variants, a separator is recommended to improve the visual hierarchy.

```tsx title="components/button-group-5.tsx"
// import from your project: import Demo from '@/components/button-group-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@gentleduck/registry-ui/button-group'

export default function Demo() {
  return (
    <ButtonGroup>
      <Button size="sm" variant="secondary">
        Copy
      </Button>
      <ButtonGroupSeparator />

      <Button size="sm" variant="secondary">
        Paste
      </Button>
    </ButtonGroup>
  )
}
```

### Split

Create a split button group by adding two buttons separated by a `ButtonGroupSeparator`.

```tsx title="components/button-group-6.tsx"
// import from your project: import Demo from '@/components/button-group-6'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@gentleduck/registry-ui/button-group'
import { Plus } from 'lucide-react'

export default function Demo() {
  return (
    <ButtonGroup>
      <Button variant="secondary">Button</Button>
      <ButtonGroupSeparator />
      <Button aria-label="Add" size="icon" variant="secondary">
        <Plus aria-hidden="true" />
      </Button>
    </ButtonGroup>
  )
}
```

### Input

Wrap an `Input` component with buttons.

```tsx title="components/button-group-7.tsx"
// import from your project: import Demo from '@/components/button-group-7'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { Input } from '@gentleduck/registry-ui/input'

import { SearchIcon } from 'lucide-react'

export default function Demo() {
  return (
    <ButtonGroup>
      <Input placeholder="Search..." />
      <Button aria-label="Search" variant="outline" size="icon">
        <SearchIcon />
      </Button>
    </ButtonGroup>
  )
}
```

### Text

`ButtonGroupText` puts a prefix, a suffix or a label in line with the buttons and inputs. With `asChild` it draws on the element you give it, here a `Label` that names the input.

```tsx title="components/button-group-14.tsx"
// import from your project: import Demo from '@/components/button-group-14'
import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup, ButtonGroupText } from '@gentleduck/registry-ui/button-group'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Input aria-label="Site address" placeholder="duck.example" />
        <ButtonGroupText>.com</ButtonGroupText>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroupText asChild>
          <Label htmlFor="pond-name">Pond</Label>
        </ButtonGroupText>
        <Input id="pond-name" placeholder="Mill pond" />
        <Button variant="outline">Save</Button>
      </ButtonGroup>
    </div>
  )
}
```

### Input Group

Wrap an `InputGroup` component to create complex input layouts.

```tsx title="components/button-group-8.tsx"
// import from your project: import Demo from '@/components/button-group-8'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { AudioLinesIcon, PlusIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [voiceEnabled, setVoiceEnabled] = React.useState(false)

  return (
    <TooltipProvider>
      <ButtonGroup className="[--radius:9999rem]">
        <ButtonGroup>
          <Button aria-label="Add" size="icon" variant="outline">
            <PlusIcon aria-hidden="true" />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <InputGroup>
            <InputGroupInput
              disabled={voiceEnabled}
              placeholder={voiceEnabled ? 'Record and send audio...' : 'Send a message...'}
            />
            <InputGroupAddon align="inline-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <InputGroupButton
                    aria-label="Voice Mode"
                    aria-pressed={voiceEnabled}
                    className="data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100"
                    data-active={voiceEnabled}
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    size="icon-xs">
                    <AudioLinesIcon aria-hidden="true" />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>Voice Mode</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
        </ButtonGroup>
      </ButtonGroup>
    </TooltipProvider>
  )
}
```

### Dropdown Menu

Create a split button group with a `DropdownMenu` component.

```tsx title="components/button-group-9.tsx"
// import from your project: import Demo from '@/components/button-group-9'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  ShareIcon,
  TrashIcon,
  UserRoundXIcon,
  VolumeOffIcon,
} from 'lucide-react'

export default function Demo() {
  return (
    <ButtonGroup>
      <Button variant="outline">Follow</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="More options" className="!ps-2" variant="outline">
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" className="[--radius:1rem]">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <VolumeOffIcon />
              Mute Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CheckIcon />
              Mark as Read
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlertTriangleIcon />
              Report Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserRoundXIcon />
              Block User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ShareIcon />
              Share Conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CopyIcon />
              Copy Conversation
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive">
              <TrashIcon />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
```

### Select

Pair with a `Select` component.

```tsx title="components/button-group-10.tsx"
// import from your project: import Demo from '@/components/button-group-10'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@gentleduck/registry-ui/select'
import { ArrowRightIcon } from 'lucide-react'
import * as React from 'react'

const CURRENCIES = [
  { label: 'US Dollar', value: '$' },
  { label: 'Euro', value: '€' },
  { label: 'British Pound', value: '£' },
]

export default function Demo() {
  const [from, setFrom] = React.useState('$')
  const [to, setTo] = React.useState('€')
  const [amount, setAmount] = React.useState('£')

  return (
    <ButtonGroup>
      <ButtonGroup>
        <Select onValueChange={setFrom} value={from}>
          <SelectTrigger className="w-[70px] font-mono">{from}</SelectTrigger>
          <SelectContent className="min-w-24">
            {CURRENCIES.map((c) => (
              <SelectItem key={`from-${c.value}`} value={c.value}>
                {c.value} <span className="text-muted-foreground">{c.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setTo} value={to}>
          <SelectTrigger className="w-[70px] font-mono">{to}</SelectTrigger>
          <SelectContent className="min-w-24">
            {CURRENCIES.map((c) => (
              <SelectItem key={`to-${c.value}`} value={c.value}>
                {c.value} <span className="text-muted-foreground">{c.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setAmount} value={amount}>
          <SelectTrigger className="w-[70px] font-mono">{amount}</SelectTrigger>
          <SelectContent className="min-w-24">
            {CURRENCIES.map((c) => (
              <SelectItem key={`amount-${c.value}`} value={c.value}>
                {c.value} <span className="text-muted-foreground">{c.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ButtonGroup>
      <ButtonGroup>
        <Button aria-label="Send" size="icon" variant="outline">
          <ArrowRightIcon />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  )
}
```

### Popover

Use with a `Popover` component.

```tsx title="components/button-group-11.tsx"
// import from your project: import Demo from '@/components/button-group-11'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Separator } from '@gentleduck/registry-ui/separator'
import { Textarea } from '@gentleduck/registry-ui/textarea'
import { BotIcon, ChevronDownIcon } from 'lucide-react'

export default function Demo() {
  return (
    <ButtonGroup>
      <Button variant="outline">
        <BotIcon aria-hidden="true" /> Copilot
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button aria-label="Open Popover" size="icon" variant="outline">
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" className="rounded-xl p-0 text-sm">
          <div className="px-4 py-3">
            <div className="font-medium text-sm">Agent Tasks</div>
          </div>
          <Separator />
          <div className="p-4 text-sm *:[p:not(:last-child)]:mb-2">
            <Textarea className="mb-4 resize-none" placeholder="Describe your task in natural language." />
            <p className="font-medium">Start a new task with Copilot</p>
            <p className="text-muted-foreground">
              Describe your task in natural language. Copilot will work in the background and open a pull request for
              your review.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  )
}
```

## Accessibility

* The `ButtonGroup` component has the `role` attribute set to `group`.
* Use <Kbd>Tab</Kbd> to navigate between the buttons in the group.
* Use `aria-label` or `aria-labelledby` to label the button group.

```tsx showLineNumbers
<ButtonGroup aria-label="Button group">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</ButtonGroup>
```

## ButtonGroup vs ToggleGroup

* Use the `ButtonGroup` component when you want to group buttons that perform an action.
* Use the `ToggleGroup` component when you want to group buttons that toggle a state.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `ButtonGroup` follows it, including the joined corners and borders. No `dir` prop or `rtl:` classes needed.

```tsx title="components/button-group-12.tsx"
// import from your project: import Demo from '@/components/button-group-12'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  ArchiveIcon,
  ArrowRightIcon,
  CalendarPlusIcon,
  ClockIcon,
  ListFilterPlusIcon,
  MailCheckIcon,
  MoreHorizontalIcon,
  TagIcon,
  Trash2Icon,
} from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [label, setLabel] = React.useState('personal')

  return (
    <DirectionProvider dir="rtl">
      <ButtonGroup>
        <ButtonGroup className="hidden sm:flex">
          <Button aria-label="رجوع" size="icon" variant="outline">
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">أرشفة</Button>
          <Button variant="outline">إبلاغ</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline">تأجيل</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="خيارات إضافية" size="icon" variant="outline">
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <MailCheckIcon />
                  تحديد كمقروء
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArchiveIcon />
                  أرشفة
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <ClockIcon />
                  تأجيل
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarPlusIcon />
                  إضافة إلى التقويم
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ListFilterPlusIcon />
                  إضافة إلى القائمة
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <TagIcon />
                    تصنيف
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup onValueChange={setLabel} value={label}>
                      <DropdownMenuRadioItem value="personal">شخصي</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="work">عمل</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="other">أخرى</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </ButtonGroup>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionButtonGroup` for a smooth scale-and-blur entrance animation powered by [motion](https://motion.dev).

```tsx title="components/button-group-13.tsx"
// import from your project: import Demo from '@/components/button-group-13'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import { ButtonGroup, MotionButtonGroup } from '@gentleduck/registry-ui/button-group'
import { MotionSelect, MotionSelectContent, SelectItem, SelectTrigger } from '@gentleduck/registry-ui/select'
import { ArrowRightIcon } from 'lucide-react'
import * as React from 'react'

const CURRENCIES = [
  { label: 'US Dollar', value: '$' },
  { label: 'Euro', value: '€' },
  { label: 'British Pound', value: '£' },
]

export default function Demo() {
  const [from, setFrom] = React.useState('$')
  const [to, setTo] = React.useState('€')
  const [amount, setAmount] = React.useState('£')

  return (
    <MotionButtonGroup>
      <ButtonGroup>
        <MotionSelect onValueChange={setFrom} value={from}>
          <SelectTrigger className="w-[70px] font-mono">{from}</SelectTrigger>
          <MotionSelectContent className="min-w-24">
            {CURRENCIES.map((c) => (
              <SelectItem key={`from-${c.value}`} value={c.value}>
                {c.value} <span className="text-muted-foreground">{c.label}</span>
              </SelectItem>
            ))}
          </MotionSelectContent>
        </MotionSelect>

        <MotionSelect onValueChange={setTo} value={to}>
          <SelectTrigger className="w-[70px] font-mono">{to}</SelectTrigger>
          <MotionSelectContent className="min-w-24">
            {CURRENCIES.map((c) => (
              <SelectItem key={`to-${c.value}`} value={c.value}>
                {c.value} <span className="text-muted-foreground">{c.label}</span>
              </SelectItem>
            ))}
          </MotionSelectContent>
        </MotionSelect>

        <MotionSelect onValueChange={setAmount} value={amount}>
          <SelectTrigger className="w-[70px] font-mono">{amount}</SelectTrigger>
          <MotionSelectContent className="min-w-24">
            {CURRENCIES.map((c) => (
              <SelectItem key={`amount-${c.value}`} value={c.value}>
                {c.value} <span className="text-muted-foreground">{c.label}</span>
              </SelectItem>
            ))}
          </MotionSelectContent>
        </MotionSelect>
      </ButtonGroup>

      <ButtonGroup>
        <MotionButton aria-label="Send" size="icon" variant="outline">
          <ArrowRightIcon />
        </MotionButton>
      </ButtonGroup>
    </MotionButtonGroup>
  )
}
```

}>
  Requires the `motion` package. Use `MotionButtonGroup` instead of `ButtonGroup`. All other sub-components stay the same.

## API Reference

### ButtonGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction of the button group |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | `--` | Additional class names to apply |
| `children` | `React.ReactNode` | `--` | Grouped content (buttons, separators, text, or nested groups) |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### ButtonGroupSeparator

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'vertical'` | Orientation of the separator line |
| `className` | `string` | `--` | Additional class names to apply |
| `...props` | `React.ComponentPropsWithoutRef<typeof Separator>` | - | Additional props inherited from `Separator`. |

### ButtonGroupText

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | If `true`, uses the `Slot` component instead of rendering a `div` |
| `className` | `string` | `--` | Additional class names to apply |
| `children` | `React.ReactNode` | `--` | Text content to display |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### MotionButtonGroup

Scales up from 0.95 with blur on mount using the `scaleIn` preset and a bouncy spring transition. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `ButtonGroupProps` | - | All props from `ButtonGroup` are supported |