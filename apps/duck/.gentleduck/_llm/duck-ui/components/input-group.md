```tsx title="components/input-group-1.tsx"
// import from your project: import Demo from '@/components/input-group-1'
'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@gentleduck/registry-ui/input-group'
import { Separator } from '@gentleduck/registry-ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { IconCheck, IconInfoCircle, IconPaperclip } from '@tabler/icons-react'
import { ArrowUpIcon, FilterIcon } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-6">
        <InputGroup>
          <InputGroupInput placeholder="Filter logs..." />
          <InputGroupAddon>
            <FilterIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">24 entries</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput className="!ps-1" placeholder="github.com/acme/repo" />
          <InputGroupAddon>
            <InputGroupText>git clone </InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton aria-label="Info" className="rounded-full" size="icon-xs">
                  <IconInfoCircle aria-hidden="true" />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Repository will be cloned to ~/projects.</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Describe your issue..." />
          <InputGroupAddon align="block-end">
            <InputGroupButton aria-label="Attach file" className="rounded-full" size="icon-xs" variant="outline">
              <IconPaperclip aria-hidden="true" />
            </InputGroupButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton variant="ghost">Low</InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="[--radius:0.95rem]" side="top">
                <DropdownMenuItem>Low</DropdownMenuItem>
                <DropdownMenuItem>Medium</DropdownMenuItem>
                <DropdownMenuItem>High</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupText className="ms-auto">3 attachments</InputGroupText>
            <Separator className="!h-4" orientation="vertical" />
            <InputGroupButton className="rounded-full" disabled size="icon-xs" variant="default">
              <ArrowUpIcon aria-hidden="true" />
              <span className="sr-only">Submit</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="team-alpha" />
          <InputGroupAddon align="inline-end">
            <div className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <IconCheck className="size-3" />
            </div>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
```

## Philosophy

Complex input patterns  -  search bars, URL fields, currency inputs  -  need structure beyond a bare `<input>`. InputGroup composes Input with addons, icons, and buttons in a unified container. Rather than building a mega-input with dozens of props, we give you building blocks that snap together. Composition over configuration.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add input-group
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/variants 
```

The `input-group` component depends on the [`button`](/duck-ui/components/button), [`input`](/duck-ui/components/input), and [`textarea`](/duck-ui/components/textarea) components.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
```

```tsx showLineNumbers
<InputGroup>
  <InputGroupInput placeholder="Search..." />
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupAddon align="inline-end">
    <InputGroupButton>Search</InputGroupButton>
  </InputGroupAddon>
</InputGroup>
```

## Examples

### Icon

```tsx title="components/input-group-2.tsx"
// import from your project: import Demo from '@/components/input-group-2'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { AtSignIcon, CheckCircleIcon, GlobeIcon, LinkIcon, PackageIcon, PhoneIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="+1 (555) 000-0000" type="tel" />
        <InputGroupAddon>
          <PhoneIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Enter tracking number" />
        <InputGroupAddon>
          <PackageIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Look up domain" />
        <InputGroupAddon>
          <GlobeIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <CheckCircleIcon />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="username" />
        <InputGroupAddon>
          <AtSignIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <LinkIcon />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

### Text

Display additional text information alongside inputs.

```tsx title="components/input-group-3.tsx"
// import from your project: import Demo from '@/components/input-group-3'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@gentleduck/registry-ui/input-group'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="0.0" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>kg</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>EUR</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput className="!ps-0.5" placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.00</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput className="!ps-0.5" placeholder="handle" />
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Write release notes..." />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-muted-foreground text-xs">500 characters remaining</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

### Button

Add buttons to perform actions within the input group.

```tsx title="components/input-group-4.tsx"
// import from your project: import Demo from '@/components/input-group-4'
'use client'

import { useCopyToClipboard } from '@gentleduck/hooks/use-copy-to-clipboard'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { IconBookmark, IconCheck, IconCopy, IconInfoCircle } from '@tabler/icons-react'
import * as React from 'react'

export default function Demo() {
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="https://deploy.acme.dev/p/abc123" readOnly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            onClick={() => {
              copyToClipboard('https://deploy.acme.dev/p/abc123')
            }}
            size="icon-xs"
            title="Copy">
            {isCopied ? <IconCheck aria-hidden="true" /> : <IconCopy aria-hidden="true" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup className="[--radius:9999px]">
        <Popover>
          <PopoverTrigger asChild>
            <InputGroupAddon>
              <InputGroupButton aria-label="SSL info" size="icon-xs" variant="secondary">
                <IconInfoCircle aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="flex flex-col gap-1 rounded-xl text-sm">
            <p className="font-medium">SSL certificate is valid.</p>
            <p>Connection to this site is encrypted and verified.</p>
          </PopoverContent>
        </Popover>
        <InputGroupAddon className="ps-1.5 text-muted-foreground">https://</InputGroupAddon>
        <InputGroupInput id="input-secure-19" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Bookmark"
            aria-pressed={isBookmarked}
            onClick={() => setIsBookmarked(!isBookmarked)}
            size="icon-xs">
            <IconBookmark
              className="data-[saved=true]:fill-blue-600 data-[saved=true]:stroke-blue-600"
              data-saved={isBookmarked}
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Filter by tag..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Apply</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

### Tooltip

Add tooltips to provide additional context or help.

```tsx title="components/input-group-5.tsx"
// import from your project: import Demo from '@/components/input-group-5'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { HelpCircle, InfoIcon } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-4">
        <InputGroup>
          <InputGroupInput placeholder="Paste your SSH public key" />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton aria-label="Info" size="icon-xs" variant="ghost">
                  <InfoIcon />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent align="end" side="top">
                <p>Starts with ssh-rsa, ssh-ed25519, or ecdsa-sha2</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="https://hooks.example.com/events" />
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton aria-label="Help" size="icon-xs" variant="ghost">
                  <HelpCircle />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent align="end" side="top">
                <p>Webhook events are sent as POST requests</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="DATABASE_URL" />
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupAddon>
                <InputGroupButton aria-label="Help" size="icon-xs" variant="ghost">
                  <HelpCircle />
                </InputGroupButton>
              </InputGroupAddon>
            </TooltipTrigger>
            <TooltipContent align="end" side="top">
              <p>Environment variables are encrypted at rest</p>
            </TooltipContent>
          </Tooltip>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
```

### Textarea

Input groups also work with textarea components. Use `block-start` or `block-end` for alignment.

```tsx title="components/input-group-6.tsx"
// import from your project: import Demo from '@/components/input-group-6'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@gentleduck/registry-ui/input-group'
import { IconCopy, IconCornerDownLeft, IconDatabase, IconRefresh } from '@tabler/icons-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <InputGroup>
        <InputGroupTextarea
          className="min-h-[200px]"
          id="textarea-code-32"
          placeholder="SELECT * FROM users WHERE active = true;"
        />
        <InputGroupAddon align="block-end" className="border-t">
          <InputGroupText>Row 1, Col 1</InputGroupText>
          <InputGroupButton className="ms-auto" size="sm" variant="default">
            Execute <IconCornerDownLeft />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText className="font-medium font-mono">
            <IconDatabase />
            production.sql
          </InputGroupText>
          <InputGroupButton aria-label="Refresh" className="ms-auto" size="icon-xs">
            <IconRefresh aria-hidden="true" />
          </InputGroupButton>
          <InputGroupButton aria-label="Copy" size="icon-xs" variant="ghost">
            <IconCopy aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

### Spinner

Show loading indicators while processing input.

Use `Button loading` inside `InputGroupButton` for the built-in animated `<Loader />` spinner behavior.

```tsx title="components/input-group-7.tsx"
// import from your project: import Demo from '@/components/input-group-7'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@gentleduck/registry-ui/input-group'
import { Loader } from 'lucide-react'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return <Loader aria-label="Loading" className={'size-4 animate-spin'} role="status" {...props} />
}

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup data-disabled>
        <InputGroupInput disabled placeholder="Uploading assets..." />
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput disabled placeholder="Connecting to server..." />
        <InputGroupAddon>
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput disabled placeholder="Syncing changes..." />
        <InputGroupAddon align="inline-end">
          <InputGroupText>Syncing...</InputGroupText>
          <Spinner />
        </InputGroupAddon>
      </InputGroup>
      <InputGroup data-disabled>
        <InputGroupInput disabled placeholder="Validating configuration..." />
        <InputGroupAddon>
          <Loader className="animate-spin" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupText className="text-muted-foreground">Almost done...</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

### Label

Add labels within input groups to improve accessibility.

```tsx title="components/input-group-8.tsx"
// import from your project: import Demo from '@/components/input-group-8'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Label } from '@gentleduck/registry-ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { InfoIcon } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-4">
        <InputGroup>
          <InputGroupInput id="project" placeholder="my-project" />
          <InputGroupAddon>
            <Label htmlFor="project">/</Label>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput id="workspace" placeholder="acme-workspace" />
          <InputGroupAddon align="block-start">
            <Label className="text-foreground" htmlFor="workspace">
              Workspace
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton aria-label="Help" className="ms-auto rounded-full" size="icon-xs" variant="ghost">
                  <InfoIcon />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Workspace names must be unique across your organization</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
```

### Dropdown

Pair input groups with dropdown menus for complex interactions.

```tsx title="components/input-group-9.tsx"
// import from your project: import Demo from '@/components/input-group-9'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { ChevronDownIcon, MoreHorizontal } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Enter commit message" />
        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton aria-label="More" size="icon-xs" variant="ghost">
                <MoreHorizontal aria-hidden="true" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem>Amend last commit</DropdownMenuItem>
              <DropdownMenuItem>Sign commit</DropdownMenuItem>
              <DropdownMenuItem>View history</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup className="[--radius:1rem]">
        <InputGroupInput placeholder="Find components..." />
        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton className="!pe-1.5 text-xs" variant="ghost">
                Scope... <ChevronDownIcon className="size-3" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="[--radius:0.95rem]">
              <DropdownMenuItem>All Packages</DropdownMenuItem>
              <DropdownMenuItem>UI Components</DropdownMenuItem>
              <DropdownMenuItem>Primitives</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

### Button Group

Wrap input groups with button groups to create prefixes and suffixes.

```tsx title="components/input-group-10.tsx"
// import from your project: import Demo from '@/components/input-group-10'
import { ButtonGroup, ButtonGroupText } from '@gentleduck/registry-ui/button-group'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Label } from '@gentleduck/registry-ui/label'
import { SendIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <ButtonGroup>
        <ButtonGroupText asChild>
          <Label htmlFor="endpoint">api/v1/</Label>
        </ButtonGroupText>
        <InputGroup>
          <InputGroupInput id="endpoint" />
          <InputGroupAddon align="inline-end">
            <SendIcon />
          </InputGroupAddon>
        </InputGroup>
      </ButtonGroup>
    </div>
  )
}
```

### Kbd

A `Kbd` in an addon sits closer to the edge, as a button does.

```tsx title="components/input-group-14.tsx"
// import from your project: import Demo from '@/components/input-group-14'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Kbd } from '@gentleduck/registry-ui/kbd'
import { Search } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput aria-label="Search" placeholder="Search..." />
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

### Invalid

Set `aria-invalid` on the control, and the whole group draws its border in the destructive colour.

```tsx title="components/input-group-15.tsx"
// import from your project: import Demo from '@/components/input-group-15'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { AtSign } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <InputGroup>
        <InputGroupInput
          aria-describedby="handle-error-q2w"
          aria-invalid="true"
          aria-label="Handle"
          defaultValue="mill pond"
        />
        <InputGroupAddon>
          <AtSign aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
      <p className="text-destructive text-sm" id="handle-error-q2w">
        A handle has no spaces.
      </p>
    </div>
  )
}
```

### Custom Input

Add the `data-slot="input-group-control"` attribute to your custom input for automatic behavior and focus state handling: the group draws its focus ring, and a click on an addon focuses the input.

No style is applied to the custom input. Apply your own styles using the `className` prop.

```tsx title="components/input-group-11.tsx"
// import from your project: import Demo from '@/components/input-group-11'
'use client'

import { InputGroup, InputGroupAddon, InputGroupButton } from '@gentleduck/registry-ui/input-group'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <Textarea
          className="field-sizing-content flex min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base outline-none transition-[color,box-shadow] md:text-sm"
          data-slot="input-group-control"
          placeholder="Share your feedback..."
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton className="ms-auto" size="sm" variant="default">
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

```tsx showLineNumbers
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group"
import TextareaAutosize from "react-textarea-autosize"

export function InputGroupCustom() {
  return (
    <InputGroup>
      <TextareaAutosize
        data-slot="input-group-control"
        className="dark:bg-input/30 flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none"
        placeholder="Autoresize textarea..."
      />
      <InputGroupAddon align="block-end">how</InputGroupAddon>
    </InputGroup>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `InputGroup` follows it: `inline-start` addons sit on the right and `inline-end` addons on the left. No `dir` prop or `rtl:` classes needed.

```tsx title="components/input-group-12.tsx"
// import from your project: import Demo from '@/components/input-group-12'
'use client'

import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@gentleduck/registry-ui/input-group'
import { Separator } from '@gentleduck/registry-ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { IconCheck, IconInfoCircle, IconPaperclip } from '@tabler/icons-react'
import { ArrowUpIcon, FilterIcon } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <TooltipProvider>
        <div className="grid w-full max-w-sm gap-6">
          <InputGroup>
            <InputGroupInput placeholder="تصفية السجلات..." />
            <InputGroupAddon>
              <FilterIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">24 سجلًا</InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput inputMode="decimal" placeholder="0.00" />
            <InputGroupAddon>
              <InputGroupText>المبلغ</InputGroupText>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupText>ر.س</InputGroupText>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InputGroupButton aria-label="معلومات" className="rounded-full" size="icon-xs">
                    <IconInfoCircle aria-hidden="true" />
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>المبلغ شامل ضريبة القيمة المضافة.</TooltipContent>
              </Tooltip>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupTextarea placeholder="اشرح مشكلتك..." />
            <InputGroupAddon align="block-end">
              <InputGroupButton aria-label="إرفاق ملف" className="rounded-full" size="icon-xs" variant="outline">
                <IconPaperclip aria-hidden="true" />
              </InputGroupButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <InputGroupButton variant="ghost">منخفضة</InputGroupButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="[--radius:0.95rem]" side="top">
                  <DropdownMenuItem>منخفضة</DropdownMenuItem>
                  <DropdownMenuItem>متوسطة</DropdownMenuItem>
                  <DropdownMenuItem>عالية</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <InputGroupText className="ms-auto">3 مرفقات</InputGroupText>
              <Separator className="!h-4" orientation="vertical" />
              <InputGroupButton className="rounded-full" disabled size="icon-xs" variant="default">
                <ArrowUpIcon aria-hidden="true" />
                <span className="sr-only">إرسال</span>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput placeholder="فريق ألفا" />
            <InputGroupAddon align="inline-end">
              <div className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <IconCheck className="size-3" />
              </div>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </TooltipProvider>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionInputGroup` for a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition, powered by [motion](https://motion.dev). Pass `index` for stagger delay when using multiple groups.

```tsx title="components/input-group-13.tsx"
// import from your project: import Demo from '@/components/input-group-13'
'use client'

import { InputGroupAddon, InputGroupInput, InputGroupText, MotionInputGroup } from '@gentleduck/registry-ui/input-group'
import { MotionLabel } from '@gentleduck/registry-ui/label'
import { AtSignIcon, GlobeIcon, LockIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 p-4">
      <div className="flex flex-col gap-1.5">
        <MotionLabel htmlFor="motion-ig-email">Email</MotionLabel>
        <MotionInputGroup index={0}>
          <InputGroupAddon>
            <InputGroupText>
              <AtSignIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="motion-ig-email" placeholder="you@example.com" />
        </MotionInputGroup>
      </div>
      <div className="flex flex-col gap-1.5">
        <MotionLabel htmlFor="motion-ig-website">Website</MotionLabel>
        <MotionInputGroup index={1}>
          <InputGroupAddon>
            <InputGroupText>
              <GlobeIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="motion-ig-website" placeholder="https://example.com" />
        </MotionInputGroup>
      </div>
      <div className="flex flex-col gap-1.5">
        <MotionLabel htmlFor="motion-ig-password">Password</MotionLabel>
        <MotionInputGroup index={2}>
          <InputGroupAddon>
            <InputGroupText>
              <LockIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="motion-ig-password" type="password" placeholder="Enter password" />
        </MotionInputGroup>
      </div>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionInputGroup` instead of `InputGroup`. All other sub-components stay the same.

## API Reference

### InputGroup

The root container that wraps inputs and addons into a unified group with shared border and focus states.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | `--` | Additional CSS classes to apply |
| `children` | `React.ReactNode` | `--` | InputGroup sub-components to render inside the group |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### InputGroupAddon

Displays icons, text, buttons, or other content alongside inputs. A click on the addon, outside a button in it, focuses the group's control: the element marked `data-slot="input-group-control"`, or else its `input`.

} title="Focus Navigation">
  For proper focus navigation, the `InputGroupAddon` component should be placed
  after the input. Set the `align` prop to position the addon.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `align` | `'inline-start' \| 'inline-end' \| 'block-start' \| 'block-end'` | `'inline-start'` | Position of the addon relative to the input. Use `inline-start`/`inline-end` with `InputGroupInput` and `block-start`/`block-end` with `InputGroupTextarea`. |
| `onClick` | `React.MouseEventHandler<HTMLDivElement>` | - | Runs before the addon focuses the group's control. Call `event.preventDefault()` to keep the focus where it is. |
| `className` | `string` | `--` | Additional CSS classes to apply |
| `children` | `React.ReactNode` | `--` | Icons, text, buttons, or other content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### InputGroupButton

A button styled for use within input groups. Renders a `Button` with compact sizing defaults.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'xs' \| 'icon-xs' \| 'sm' \| 'icon-sm'` | `'xs'` | Size of the button |
| `variant` | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link' \| 'dashed' \| 'warning' \| 'nothing' \| 'expandIcon'` | `'ghost'` | Visual variant of the button |
| `type` | `string` | `'button'` | The HTML button type attribute |
| `className` | `string` | `--` | Additional CSS classes to apply |
| `...props` | `Omit<React.ComponentPropsWithoutRef<typeof Button>, 'size'>` | - | Additional props inherited from `Button` (excluding `size`). |

### InputGroupText

A styled span for displaying static text within input groups.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes to apply |
| `children` | `React.ReactNode` | `--` | Text or icon content to display |
| `...props` | `React.HTMLProps<HTMLSpanElement>` | - | Additional props to spread to the span element |

### InputGroupInput

Replacement for `<Input />` when building input groups. Has input group styles pre-applied and uses the unified `data-slot="input-group-control"` for focus state handling.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | `--` | Additional CSS classes to apply |
| `...props` | `React.HTMLProps<HTMLInputElement>` | - | Additional props to spread to the input element |

### InputGroupTextarea

Replacement for `<Textarea />` when building input groups. Has textarea group styles pre-applied and uses the unified `data-slot="input-group-control"` for focus state handling.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | `--` | Additional CSS classes to apply |
| `...props` | `React.HTMLProps<HTMLTextAreaElement>` | - | Additional props to spread to the textarea element |

### MotionInputGroup

Same props as `InputGroup` plus an optional `index` prop for stagger delay (50ms per index). Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.