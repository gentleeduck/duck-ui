The `Item` component is a straightforward flex container that can house nearly any type of content. Use it to display a title, description, and actions. Group it with the `ItemGroup` component to create a list of items.

You can pretty much achieve the same result with the `div` element and some classes, but **I've built this so many times** that I decided to create a component for it. Now I use it all the time.

```tsx title="components/item-1.tsx"
// import from your project: import Demo from '@/components/item-1'
import { Button } from '@gentleduck/registry-ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@gentleduck/registry-ui/item'
import { ChevronRightIcon, ClipboardListIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Weekly Standup Notes</ItemTitle>
          <ItemDescription>Review action items from the last meeting before Friday.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            View
          </Button>
        </ItemActions>
      </Item>
      <Item asChild size="sm" variant="outline">
        {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
        <a href="#">
          <ItemMedia>
            <ClipboardListIcon className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>3 tasks assigned to you this sprint.</ItemTitle>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  )
}
```

## Philosophy

The Item component is a universal list entry primitive. Rather than building separate list-item variants for every context (settings, menus, selections), Item provides a flexible container with consistent spacing, alignment, and interactive states. It's the atoms-level building block that higher-level components compose upon.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add item
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives @gentleduck/variants
```

The `item` component depends on the [`label`](/duck-ui/components/label) and [`separator`](/duck-ui/components/separator) components.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
```

```tsx showLineNumbers
<Item>
  <ItemHeader>Item Header</ItemHeader>
  <ItemMedia />
  <ItemContent>
    <ItemTitle>Item</ItemTitle>
    <ItemDescription>Item</ItemDescription>
  </ItemContent>
  <ItemActions />
  <ItemFooter>Item Footer</ItemFooter>
</Item>
```

## Examples

### Variants

```tsx title="components/item-2.tsx"
// import from your project: import Demo from '@/components/item-2'
import { Button } from '@gentleduck/registry-ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@gentleduck/registry-ui/item'

export default function Demo() {
  return (
    <div className="flex flex-col gap-6">
      <Item>
        <ItemContent>
          <ItemTitle>File Upload Complete</ItemTitle>
          <ItemDescription>report-q4.pdf was uploaded successfully to shared drive.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Open
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Payment Received</ItemTitle>
          <ItemDescription>Invoice #1042 has been paid. Amount: $2,400.00.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Details
          </Button>
        </ItemActions>
      </Item>
      <Item variant="muted">
        <ItemContent>
          <ItemTitle>Archived Project</ItemTitle>
          <ItemDescription>Landing page redesign was archived on Jan 15, 2026.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Restore
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
}
```

### Size

The `Item` component has different sizes for different use cases. For example, you can use the `sm` size for a compact item or the `default` size for a standard item.

```tsx title="components/item-3.tsx"
// import from your project: import Demo from '@/components/item-3'
import { Button } from '@gentleduck/registry-ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@gentleduck/registry-ui/item'
import { GitCommitVerticalIcon, PackageIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <PackageIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Release v2.4.0 Published</ItemTitle>
          <ItemDescription>Includes 12 bug fixes and 3 new components.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Changelog
          </Button>
        </ItemActions>
      </Item>
      <Item size="sm" variant="outline">
        <ItemMedia>
          <GitCommitVerticalIcon className="size-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>feat: add slider primitive</ItemTitle>
          <ItemDescription>Committed 2 hours ago</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  )
}
```

### Icon

```tsx title="components/item-4.tsx"
// import from your project: import Demo from '@/components/item-4'
import { Button } from '@gentleduck/registry-ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@gentleduck/registry-ui/item'
import { HardDriveIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <HardDriveIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Storage Almost Full</ItemTitle>
          <ItemDescription>You have used 48.2 GB of 50 GB. Free up space or upgrade your plan.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Manage
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
}
```

### Avatar

```tsx title="components/item-5.tsx"
// import from your project: import Demo from '@/components/item-5'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@gentleduck/registry-ui/item'
import { UserPlusIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia>
          <Avatar className="size-10">
            <AvatarImage alt="profile picture for alexchen" src="https://avatar.vercel.sh/alexchen" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Alex Chen</ItemTitle>
          <ItemDescription>Frontend Engineer -- joined 3 weeks ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button aria-label="Follow" className="rounded-full" size="icon-sm" variant="outline">
            <UserPlusIcon />
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia>
          <div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
            <Avatar className="hidden sm:flex">
              <AvatarImage alt="sara" src="https://avatar.vercel.sh/sara" />
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <Avatar className="hidden sm:flex">
              <AvatarImage alt="omar" src="https://avatar.vercel.sh/omar" />
              <AvatarFallback>OK</AvatarFallback>
            </Avatar>
            <Avatar className="hidden sm:flex">
              <AvatarImage alt="liwei" src="https://avatar.vercel.sh/liwei" />
              <AvatarFallback>LW</AvatarFallback>
            </Avatar>
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Design Review Group</ItemTitle>
          <ItemDescription>3 reviewers awaiting your feedback on the mockups.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Review
          </Button>
        </ItemActions>
      </Item>
    </div>
  )
}
```

### Image

```tsx title="components/item-6.tsx"
// import from your project: import Demo from '@/components/item-6'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@gentleduck/registry-ui/item'
import Image from 'next/image'

const articles = [
  {
    author: 'Dana Whitfield',
    category: 'Engineering',
    readTime: '6 min',
    title: 'Building Accessible Components from Scratch',
  },
  {
    author: 'Marcus Lee',
    category: 'Design',
    readTime: '4 min',
    title: 'Color Systems That Scale Across Themes',
  },
  {
    author: 'Priya Sharma',
    category: 'DevOps',
    readTime: '8 min',
    title: 'Zero-Downtime Deployments with Blue-Green Strategy',
  },
]

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup className="gap-4">
        {articles.map((article) => (
          <Item asChild key={article.title} variant="outline">
            {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
            <a href="#">
              <ItemMedia variant="image">
                <Image
                  alt={article.title}
                  className="object-cover grayscale"
                  height={32}
                  src={`https://avatar.vercel.sh/${article.title}`}
                  width={32}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  {article.title} - <span className="text-muted-foreground">{article.category}</span>
                </ItemTitle>
                <ItemDescription>{article.author}</ItemDescription>
              </ItemContent>
              <ItemContent className="flex-none text-center">
                <ItemDescription>{article.readTime}</ItemDescription>
              </ItemContent>
            </a>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
```

### Group

```tsx title="components/item-7.tsx"
// import from your project: import Demo from '@/components/item-7'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@gentleduck/registry-ui/item'
import { MessageSquareIcon } from 'lucide-react'
import * as React from 'react'

const contacts = [
  {
    avatar: 'https://avatar.vercel.sh/jordan',
    lastMessage: 'Sounds good, let me check the PR.',
    name: 'Jordan Rivera',
  },
  {
    avatar: 'https://avatar.vercel.sh/taylor',
    lastMessage: 'The staging deploy is live now.',
    name: 'Taylor Kim',
  },
  {
    avatar: 'https://avatar.vercel.sh/casey',
    lastMessage: 'Can we reschedule the sync to Thursday?',
    name: 'Casey Nakamura',
  },
]

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup>
        {contacts.map((contact, index) => (
          <React.Fragment key={contact.name}>
            <Item>
              <ItemMedia>
                <Avatar>
                  <AvatarImage alt={contact.name} src={contact.avatar} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent className="gap-1">
                <ItemTitle>{contact.name}</ItemTitle>
                <ItemDescription>{contact.lastMessage}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button aria-label="Message" className="rounded-full" size="icon" variant="ghost">
                  <MessageSquareIcon aria-hidden="true" />
                </Button>
              </ItemActions>
            </Item>
            {index !== contacts.length - 1 && <ItemSeparator />}
          </React.Fragment>
        ))}
      </ItemGroup>
    </div>
  )
}
```

### Header

```tsx title="components/item-8.tsx"
// import from your project: import Demo from '@/components/item-8'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from '@gentleduck/registry-ui/item'
import Image from 'next/image'

const templates = [
  {
    description: 'Blog, portfolio, and marketing pages.',
    image: 'https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop',
    name: 'Static Site',
  },
  {
    description: 'Auth, dashboard, and REST API scaffold.',
    image: 'https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop',
    name: 'Full-Stack App',
  },
  {
    description: 'Storybook, tests, and publish pipeline.',
    image: 'https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop',
    name: 'Component Library',
  },
]

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ItemGroup className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <Item key={template.name} variant="outline">
            <ItemHeader>
              <Image
                alt={template.name}
                className="aspect-square w-full rounded-sm object-cover"
                height={128}
                src={template.image}
                width={128}
              />
            </ItemHeader>
            <ItemContent>
              <ItemTitle>{template.name}</ItemTitle>
              <ItemDescription>{template.description}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
```

### Footer

`ItemFooter` spans the full width of the item, below everything else in it.

```tsx title="components/item-13.tsx"
// import from your project: import Demo from '@/components/item-13'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from '@gentleduck/registry-ui/item'
import { GitBranch } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <GitBranch aria-hidden="true" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>feat/pond-search</ItemTitle>
          <ItemDescription>Deployed to preview 4 minutes ago.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Visit
          </Button>
        </ItemActions>
        <ItemFooter className="text-muted-foreground text-xs">
          <span>3 commits ahead of main</span>
          <span>Built in 1m 12s</span>
        </ItemFooter>
      </Item>
    </div>
  )
}
```

### Link

To render an item as a link, use the `asChild` prop. The hover and focus states will be applied to the anchor element, and it stays a link to a screen reader.

```tsx title="components/item-9.tsx"
// import from your project: import Demo from '@/components/item-9'
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@gentleduck/registry-ui/item'
import { ChevronRightIcon, ExternalLinkIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item asChild>
        {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
        <a href="#">
          <ItemContent>
            <ItemTitle>API Reference</ItemTitle>
            <ItemDescription>Explore endpoints, parameters, and response schemas.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ChevronRightIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
      <Item asChild variant="outline">
        {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
        <a href="#" rel="noopener noreferrer" target="_blank">
          <ItemContent>
            <ItemTitle>Changelog - February 2026</ItemTitle>
            <ItemDescription>See what shipped this month across all packages.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <ExternalLinkIcon className="size-4" />
          </ItemActions>
        </a>
      </Item>
    </div>
  )
}
```

```tsx showLineNumbers
<Item asChild>
  <a href="/dashboard">
    <ItemMedia />
    <ItemContent>
      <ItemTitle>Dashboard</ItemTitle>
      <ItemDescription>Overview of your account and activity.</ItemDescription>
    </ItemContent>
    <ItemActions />
  </a>
</Item>
```

### Dropdown

```tsx title="components/item-10.tsx"
// import from your project: import Demo from '@/components/item-10'
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@gentleduck/registry-ui/item'
import { ChevronDownIcon } from 'lucide-react'

const workspaces = [
  {
    avatar: 'https://avatar.vercel.sh/ducklabs',
    description: '12 members',
    name: 'Duck Labs',
  },
  {
    avatar: 'https://avatar.vercel.sh/starter',
    description: '5 members',
    name: 'Starter Kit',
  },
  {
    avatar: 'https://avatar.vercel.sh/oss',
    description: '28 members',
    name: 'Open Source Org',
  },
]

export default function Demo() {
  return (
    <div className="flex min-h-64 w-full max-w-md flex-col items-center gap-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-fit" size="sm" variant="outline">
            Switch Workspace <ChevronDownIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 [--radius:0.65rem]" side="bottom">
          {workspaces.map((workspace) => (
            <DropdownMenuItem className="p-0" key={workspace.name}>
              <Item className="w-full p-2" size="sm">
                <ItemMedia>
                  <Avatar className="size-8">
                    <AvatarImage alt={workspace.name} src={workspace.avatar} />
                    <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent className="gap-0.5">
                  <ItemTitle>{workspace.name}</ItemTitle>
                  <ItemDescription>{workspace.description}</ItemDescription>
                </ItemContent>
              </Item>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
```

## Notes

### Item vs Field

Use `Field` if you need to display a form input such as a checkbox, input, radio, or select.

If you only need to display content such as a title, description, and actions, use `Item`.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the item follows it. No `dir` prop or `rtl:` classes needed.

```tsx title="components/item-11.tsx"
// import from your project: import Demo from '@/components/item-11'
import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@gentleduck/registry-ui/item'
import { ChevronLeftIcon, ClipboardListIcon } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>ملاحظات الاجتماع الأسبوعي</ItemTitle>
            <ItemDescription>راجع المهام المتفق عليها في الاجتماع الأخير قبل يوم الخميس.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="outline">
              عرض
            </Button>
          </ItemActions>
        </Item>
        <Item asChild size="sm" variant="outline">
          {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
          <a href="#">
            <ItemMedia>
              <ClipboardListIcon className="size-5" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>لديك 3 مهام جديدة في هذه الدورة.</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronLeftIcon className="size-4" />
            </ItemActions>
          </a>
        </Item>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionItem` and `MotionItemGroup` for staggered `scaleIn` entrance animations (fade, scale, and blur) powered by [motion](https://motion.dev). Pass `index` to `MotionItem` for stagger delay.

```tsx title="components/item-12.tsx"
// import from your project: import Demo from '@/components/item-12'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import {
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  MotionItem,
  MotionItemGroup,
} from '@gentleduck/registry-ui/item'
import { FileTextIcon, InboxIcon, StarIcon } from 'lucide-react'

export default function Demo() {
  return (
    <MotionItemGroup className="w-full max-w-md gap-3 p-4">
      <MotionItem variant="outline" index={0}>
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Inbox</ItemTitle>
          <ItemDescription>3 unread messages waiting for review.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <MotionButton size="sm" variant="outline">
            Open
          </MotionButton>
        </ItemActions>
      </MotionItem>
      <MotionItem variant="outline" index={1}>
        <ItemMedia variant="icon">
          <StarIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Starred</ItemTitle>
          <ItemDescription>Items you have marked as important.</ItemDescription>
        </ItemContent>
      </MotionItem>
      <MotionItem variant="outline" index={2}>
        <ItemMedia variant="icon">
          <FileTextIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Drafts</ItemTitle>
          <ItemDescription>2 drafts saved for later.</ItemDescription>
        </ItemContent>
      </MotionItem>
    </MotionItemGroup>
  )
}
```

}>
  Requires the `motion` package. Use `MotionItem` instead of `Item` and `MotionItemGroup` instead of `ItemGroup`. All other sub-components stay the same.

## API Reference

### Item

The main component for displaying content with media, title, description, and actions.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the item container |
| `variant` | `"default" \| "muted" \| "outline"` | `"default"` | Visual variant of the item |
| `size` | `"default" \| "sm"` | `"default"` | Size of the item |
| `asChild` | `boolean` | `false` | Render as a child element using `Slot`. The child keeps its own role. |
| `children` | `React.ReactNode` | - | Item content (media, content, actions, etc.) |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

You can use the `asChild` prop to render a custom component as the item, for example a link. The hover and focus states will be applied to the custom component.

```tsx showLineNumbers
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

export function ItemLink() {
  return (
    <Item asChild>
      <a href="/dashboard">
        <ItemMedia variant="icon">
          <Home />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Dashboard</ItemTitle>
          <ItemDescription>
            Overview of your account and activity.
          </ItemDescription>
        </ItemContent>
      </a>
    </Item>
  )
}
```

### ItemGroup

A container that groups related items together with consistent styling. It is a list, and each `Item` in it a list item. An item given `asChild` is wrapped in a list item that takes no layout, so a link stays a link.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the group container |
| `children` | `React.ReactNode` | - | Item elements to group together |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### ItemSeparator

A horizontal separator between items in a group. Inside an `ItemGroup` it is drawn but not announced, since a list holds only list items.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the separator |
| `...props` | `React.ComponentPropsWithoutRef<typeof Separator>` | - | Additional props inherited from `Separator`. |

### ItemMedia

Displays media content such as icons, images, or avatars.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the media container |
| `variant` | `"default" \| "icon" \| "image"` | `"default"` | Visual variant of the media container |
| `children` | `React.ReactNode` | - | Media content (icon, image, avatar, etc.) |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### ItemContent

Wraps the title and description of the item.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the content wrapper |
| `children` | `React.ReactNode` | - | Title and description elements |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### ItemTitle

Displays the title of the item.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the title |
| `children` | `React.ReactNode` | - | Title text or elements |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### ItemDescription

Displays the description of the item.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the description |
| `children` | `React.ReactNode` | - | Description text or elements |
| `...props` | `React.HTMLProps<HTMLParagraphElement>` | - | Additional props to spread to the p element |

### ItemActions

Displays action buttons or other interactive elements.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the actions container |
| `children` | `React.ReactNode` | - | Action buttons or interactive elements |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### ItemHeader

Displays a header spanning the full width of the item.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the header |
| `children` | `React.ReactNode` | - | Header content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### ItemFooter

Displays a footer spanning the full width of the item.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the footer |
| `children` | `React.ReactNode` | - | Footer content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### MotionItem

Same props as `Item` plus an optional `index` prop for stagger delay (40ms per index). Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.

### MotionItemGroup

Same props as `ItemGroup`. Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.