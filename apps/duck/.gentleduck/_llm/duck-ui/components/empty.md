```tsx title="components/empty-1.tsx"
// import from your project: import Demo from '@/components/empty-1'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@gentleduck/registry-ui/empty'
import { IconInbox } from '@tabler/icons-react'
import { ArrowUpRightIcon } from 'lucide-react'

export default function Demo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconInbox />
        </EmptyMedia>
        <EmptyTitle>Your Inbox is Empty</EmptyTitle>
        <EmptyDescription>
          No messages waiting for you. New conversations will show up here when someone reaches out.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button>Compose Message</Button>
          <Button variant="outline">View Archived</Button>
        </div>
      </EmptyContent>
      <Button asChild className="text-muted-foreground" size="sm" variant="link">
        {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
        <a href="#">
          Manage Preferences <ArrowUpRightIcon />
        </a>
      </Button>
    </Empty>
  )
}
```

## Philosophy

Empty states are opportunities, not dead ends. When there's no data to show, the Empty component turns a blank screen into a call to action. We structure it as header + content because every empty state needs two things: an explanation of why it's empty, and a path forward. The media slot (icon, avatar, illustration) adds emotional tone.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add empty
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
```

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <Icon />
    </EmptyMedia>
    <EmptyTitle>No data</EmptyTitle>
    <EmptyDescription>No data found</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>Add data</Button>
  </EmptyContent>
</Empty>
```

## Examples

### Outline

Use the `border` utility class to create an outline empty state.

```tsx title="components/empty-2.tsx"
// import from your project: import Demo from '@/components/empty-2'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@gentleduck/registry-ui/empty'
import { IconBookmark } from '@tabler/icons-react'

export default function Demo() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBookmark />
        </EmptyMedia>
        <EmptyTitle>No Saved Items</EmptyTitle>
        <EmptyDescription>Bookmark articles, pages, or resources to find them quickly later.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          Browse Content
        </Button>
      </EmptyContent>
    </Empty>
  )
}
```

### Background

Use the `bg-*` and `bg-gradient-*` utilities to add a background to the empty state.

```tsx title="components/empty-3.tsx"
// import from your project: import Demo from '@/components/empty-3'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@gentleduck/registry-ui/empty'
import { IconChartBar } from '@tabler/icons-react'
import { RefreshCcwIcon } from 'lucide-react'

export default function Demo() {
  return (
    <Empty className="h-full bg-gradient-to-b from-30% from-muted/50 to-background">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconChartBar />
        </EmptyMedia>
        <EmptyTitle>No Analytics Data</EmptyTitle>
        <EmptyDescription>Once your site receives traffic, usage metrics and trends will appear here.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" variant="outline">
          <RefreshCcwIcon />
          Refresh
        </Button>
      </EmptyContent>
    </Empty>
  )
}
```

### Avatar

Use the `EmptyMedia` component to display an avatar in the empty state.

```tsx title="components/empty-4.tsx"
// import from your project: import Demo from '@/components/empty-4'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@gentleduck/registry-ui/empty'

export default function Demo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <Avatar className="size-12">
            <AvatarImage alt="a profile picture for wildduck2" src="https://github.com/wildduck2.png" />
            <AvatarFallback>WD</AvatarFallback>
          </Avatar>
        </EmptyMedia>
        <EmptyTitle>No Activity Yet</EmptyTitle>
        <EmptyDescription>
          This account has no recent activity. Start a conversation or share an update to get things going.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Share Update</Button>
      </EmptyContent>
    </Empty>
  )
}
```

### Avatar Group

Use the `EmptyMedia` component to display an avatar group in the empty state.

```tsx title="components/empty-5.tsx"
// import from your project: import Demo from '@/components/empty-5'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@gentleduck/registry-ui/empty'
import { PlusIcon } from 'lucide-react'

export default function Demo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <div className="flex -space-x-2 *:data-[slot=avatar]:size-12 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
            <Avatar>
              <AvatarImage alt="collaborator 1" src="https://github.com/wildduck2.png" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage alt="collaborator 2" src="https://github.com/wildduck2.png" />
              <AvatarFallback>JR</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage alt="collaborator 3" src="https://github.com/wildduck2.png" />
              <AvatarFallback>SK</AvatarFallback>
            </Avatar>
          </div>
        </EmptyMedia>
        <EmptyTitle>No Collaborators</EmptyTitle>
        <EmptyDescription>Add collaborators to work together on shared documents and tasks.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">
          <PlusIcon />
          Add Collaborator
        </Button>
      </EmptyContent>
    </Empty>
  )
}
```

### InputGroup

You can add an `InputGroup` component to the `EmptyContent` component.

```tsx title="components/empty-6.tsx"
// import from your project: import Demo from '@/components/empty-6'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@gentleduck/registry-ui/empty'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Kbd } from '@gentleduck/registry-ui/kbd'
import { SearchIcon } from 'lucide-react'

export default function Demo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No Results Found</EmptyTitle>
        <EmptyDescription>
          We could not find anything matching your query. Try a different search term below.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <InputGroup className="sm:w-3/4">
          <InputGroupInput placeholder="Search for something else..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>/</Kbd>
          </InputGroupAddon>
        </InputGroup>
        <EmptyDescription>
          {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
          Still stuck? <a href="#">Browse all categories</a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}
```

### Link

A link inside `EmptyDescription` is underlined, and takes the primary colour on hover.

```tsx title="components/empty-9.tsx"
// import from your project: import Demo from '@/components/empty-9'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@gentleduck/registry-ui/empty'
import { FolderOpen } from 'lucide-react'

export default function Demo() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Create a project to get started, or <a href="#import">import one</a> from another workspace.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Create project</Button>
      </EmptyContent>
    </Empty>
  )
}
```

## Component Composition

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the empty state follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/empty-7.tsx"
// import from your project: import Demo from '@/components/empty-7'
import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@gentleduck/registry-ui/empty'
import { IconInbox } from '@tabler/icons-react'
import { ArrowUpLeftIcon } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconInbox />
          </EmptyMedia>
          <EmptyTitle>صندوق الوارد فارغ</EmptyTitle>
          <EmptyDescription>لا توجد رسائل جديدة. ستظهر هنا المحادثات الجديدة فور تواصل أحد معك.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button>رسالة جديدة</Button>
            <Button variant="outline">عرض الأرشيف</Button>
          </div>
        </EmptyContent>
        <Button asChild className="text-muted-foreground" size="sm" variant="link">
          {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
          <a href="#">
            إدارة الإعدادات <ArrowUpLeftIcon />
          </a>
        </Button>
      </Empty>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionEmpty`, `MotionEmptyMedia`, `MotionEmptyTitle`, `MotionEmptyDescription`, and `MotionEmptyContent` for staggered entrance animations powered by [motion](https://motion.dev). Every element shares the same `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition, staggered by increasing delays.

```tsx title="components/empty-8.tsx"
// import from your project: import Demo from '@/components/empty-8'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import {
  EmptyHeader,
  MotionEmpty,
  MotionEmptyContent,
  MotionEmptyDescription,
  MotionEmptyMedia,
  MotionEmptyTitle,
} from '@gentleduck/registry-ui/empty'
import { IconInbox } from '@tabler/icons-react'

export default function Demo() {
  return (
    <MotionEmpty>
      <EmptyHeader>
        <MotionEmptyMedia variant="icon">
          <IconInbox />
        </MotionEmptyMedia>
        <MotionEmptyTitle>Your Inbox is Empty</MotionEmptyTitle>
        <MotionEmptyDescription>
          No messages waiting for you. New conversations will show up here when someone reaches out.
        </MotionEmptyDescription>
      </EmptyHeader>
      <MotionEmptyContent>
        <div className="flex gap-2">
          <MotionButton>Compose Message</MotionButton>
          <MotionButton variant="outline">View Archived</MotionButton>
        </div>
      </MotionEmptyContent>
    </MotionEmpty>
  )
}
```

}>
  Requires the `motion` package. Replace each sub-component with its Motion variant. `EmptyHeader` stays the same: it's a layout wrapper with no visual animation.

## API Reference

### Empty

The main component of the empty state. Wraps the `EmptyHeader` and `EmptyContent` components.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Empty state content |
| `...props` | `React.ComponentProps<'div'>` | - | Additional props to spread to the div |

### EmptyHeader

The `EmptyHeader` component wraps the empty media, title, and description.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Header content (media, title, description) |
| `...props` | `React.ComponentProps<'div'>` | - | Additional props to spread to the div |

### EmptyMedia

Use the `EmptyMedia` component to display the media of the empty state such as an icon or an image. You can also use it to display other components such as an avatar.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'icon'` | `'default'` | Visual variant of the media container |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Media content (icon, avatar, image) |
| `...props` | `React.ComponentProps<'div'>` | - | Additional props to spread to the div |

### EmptyTitle

Use the `EmptyTitle` component to display the title of the empty state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Title text |
| `...props` | `React.ComponentProps<'div'>` | - | Additional props to spread to the div |

### EmptyDescription

Use the `EmptyDescription` component to display the description of the empty state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Description text |
| `...props` | `React.ComponentProps<'p'>` | - | Additional props to spread to the description element (renders as a `div`) |

### EmptyContent

Use the `EmptyContent` component to display the content of the empty state such as a button, input or a link.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Action content (buttons, links, inputs) |
| `...props` | `React.ComponentProps<'div'>` | - | Additional props to spread to the div |

### MotionEmpty

Same props as `Empty`. Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.

### MotionEmptyMedia

Same props as `EmptyMedia`. Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition and a 50ms delay. Requires the `motion` package.

### MotionEmptyTitle

Same props as `EmptyTitle`. Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition and a 100ms delay. Requires the `motion` package.

### MotionEmptyDescription

Same props as `EmptyDescription`. Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition and a 150ms delay. Requires the `motion` package.

### MotionEmptyContent

Same props as `EmptyContent`. Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition and a 200ms delay. Requires the `motion` package.