```tsx title="components/avatar-1.tsx"
// import from your project: import Demo from '@/components/avatar-1'
import { Avatar, AvatarFallback, AvatarImage } from '@gentleduck/registry-ui/avatar'

export default function Demo() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-12">
      <Avatar>
        <AvatarImage
          alt="gentleduck"
          src="https://github.com/gentleeduck/gentleduck/blob/master/apps/duck-ui-docs/public/static/LOGO.png?raw=true"
        />
        <AvatarFallback>GD</AvatarFallback>
      </Avatar>
      <Avatar className="rounded-lg">
        <AvatarImage alt="wildduck" src="https://avatars.githubusercontent.com/u/108896341?v=4" />
        <AvatarFallback className="rounded-lg">WD</AvatarFallback>
      </Avatar>
      <div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
        <Avatar>
          <AvatarImage
            alt="gentleduck"
            src="https://github.com/gentleeduck/gentleduck/blob/master/apps/duck-ui-docs/public/static/LOGO.png?raw=true"
          />
          <AvatarFallback>GD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage alt="wildduck" src="https://avatars.githubusercontent.com/u/108896341?v=4" />
          <AvatarFallback>WD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage
            alt="Guest"
            src="https://raw.githubusercontent.com/wildduck2/duck-starter-kit/15fbc61fb02cd21a873108b380ca12fe31f50099/apps/document-client/public/placeholder2.webp"
          />
          <AvatarFallback>GD</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
```

## Philosophy

Identity in UI starts with a face. Avatars humanize interfaces by giving users a visual anchor. We support both single avatars and groups because social context  -  seeing who else is involved  -  is a fundamental interaction pattern. The fallback-to-initials behavior ensures graceful degradation when images fail.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add avatar
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
```

```tsx showLineNumbers
<Avatar>
  <AvatarImage src="https://github.com/wildduck2.png" alt="wildduck" />
  <AvatarFallback>WD</AvatarFallback>
</Avatar>
```

## Examples

### Fallback and a group

A photo that fails to load leaves the fallback in its place. `delayMs` holds the fallback back for that long, so a photo that loads quickly never flashes the initials first. `AvatarGroup` draws the first `maxVisible` of `imgs` and a count of the rest.

```tsx title="components/avatar-4.tsx"
// import from your project: import Demo from '@/components/avatar-4'
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@gentleduck/registry-ui/avatar'

const team = [
  { alt: 'wildduck', fallback: 'WD', id: 'wildduck', src: 'https://avatars.githubusercontent.com/u/108896341?v=4' },
  { alt: 'Ada Lovelace', fallback: 'AL', id: 'ada' },
  { alt: 'Grace Hopper', fallback: 'GH', id: 'grace' },
  { alt: 'Alan Turing', fallback: 'AT', id: 'alan' },
  { alt: 'Katherine Johnson', fallback: 'KJ', id: 'katherine' },
]

export default function Demo() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-12">
      <Avatar>
        <AvatarImage alt="A photo that is gone" src="/avatars/missing.png" />
        <AvatarFallback delayMs={600}>NF</AvatarFallback>
      </Avatar>
      <AvatarGroup imgs={team} maxVisible={3} />
    </div>
  )
}
```

### srcSet and an overflow label

```tsx title="components/avatar-5.tsx"
// import from your project: import Demo from '@/components/avatar-5'
'use client'

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@gentleduck/registry-ui/avatar'
import * as React from 'react'

const team = [
  { alt: 'Ana', id: 'ana', src: 'https://avatars.githubusercontent.com/u/108896341?v=4' },
  { alt: 'Bruno', id: 'bruno' },
  { alt: 'Carla', id: 'carla' },
  { alt: 'Diego', id: 'diego' },
  { alt: 'Elena', id: 'elena' },
]

export default function Demo() {
  const [status, setStatus] = React.useState('idle')

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <Avatar className="size-14">
          <AvatarImage
            alt="gentleduck"
            onLoadingStatusChange={setStatus}
            sizes="56px"
            srcSet="https://avatars.githubusercontent.com/u/108896341?v=4&s=56 1x, https://avatars.githubusercontent.com/u/108896341?v=4&s=112 2x"
          />
          <AvatarFallback>GD</AvatarFallback>
        </Avatar>
        <span className="text-muted-foreground text-sm">srcSet alone, status: {status}</span>
      </div>
      <AvatarGroup getOverflowLabel={(count) => `${count} personas más`} imgs={team} maxVisible={3} />
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the avatar follows it: groups stack from the start side. No `dir` prop or `rtl:` classes needed.

```tsx title="components/avatar-2.tsx"
// import from your project: import Demo from '@/components/avatar-2'
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@gentleduck/registry-ui/avatar'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'

const team = [
  {
    alt: 'فريق جنتل دك',
    fallback: 'جد',
    id: 'gentleduck',
    src: 'https://github.com/gentleeduck/gentleduck/blob/master/apps/duck-ui-docs/public/static/LOGO.png?raw=true',
  },
  { alt: 'أحمد علي', fallback: 'أع', id: 'ahmad', src: 'https://avatars.githubusercontent.com/u/108896341?v=4' },
  {
    alt: 'سارة خالد',
    fallback: 'سخ',
    id: 'sara',
    src: 'https://raw.githubusercontent.com/wildduck2/duck-starter-kit/15fbc61fb02cd21a873108b380ca12fe31f50099/apps/document-client/public/placeholder2.webp',
  },
  { alt: 'مريم حسن', fallback: 'مح', id: 'mariam' },
  { alt: 'يوسف عمر', fallback: 'يع', id: 'youssef' },
]

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="flex flex-row flex-wrap items-center gap-12">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage alt="أحمد علي" src="https://avatars.githubusercontent.com/u/108896341?v=4" />
            <AvatarFallback>أع</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">أحمد علي</span>
            <span className="text-muted-foreground text-xs">مطوّر واجهات أمامية</span>
          </div>
        </div>
        <AvatarGroup imgs={team} maxVisible={3} />
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionAvatar` and `MotionAvatarGroup` for animated entrance powered by [motion](https://motion.dev). Avatars scale and blur in on mount. The group staggers each avatar 80ms apart.

```tsx title="components/avatar-3.tsx"
// import from your project: import Demo from '@/components/avatar-3'
'use client'

import { AvatarFallback, AvatarImage, MotionAvatar, MotionAvatarGroup } from '@gentleduck/registry-ui/avatar'

export default function Demo() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-12">
      <MotionAvatar>
        <AvatarImage
          alt="gentleduck"
          src="https://github.com/gentleeduck/gentleduck/blob/master/apps/duck-ui-docs/public/static/LOGO.png?raw=true"
        />
        <AvatarFallback>GD</AvatarFallback>
      </MotionAvatar>
      <MotionAvatar className="rounded-lg">
        <AvatarImage alt="wildduck" src="https://avatars.githubusercontent.com/u/108896341?v=4" />
        <AvatarFallback className="rounded-lg">WD</AvatarFallback>
      </MotionAvatar>
      <MotionAvatarGroup
        imgs={[
          {
            id: '1',
            src: 'https://github.com/gentleeduck/gentleduck/blob/master/apps/duck-ui-docs/public/static/LOGO.png?raw=true',
            alt: 'gentleduck',
            fallback: 'GD',
          },
          { id: '2', src: 'https://avatars.githubusercontent.com/u/108896341?v=4', alt: 'wildduck', fallback: 'WD' },
          {
            id: '3',
            src: 'https://raw.githubusercontent.com/wildduck2/duck-starter-kit/15fbc61fb02cd21a873108b380ca12fe31f50099/apps/document-client/public/placeholder2.webp',
            alt: 'Guest',
            fallback: 'GD',
          },
          { id: '4', alt: 'Jane Doe', fallback: 'JD' },
          { id: '5', alt: 'Max Klein', fallback: 'MK' },
        ]}
        maxVisible={3}
      />
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionAvatar` instead of `Avatar` and `MotionAvatarGroup` instead of `AvatarGroup`. `AvatarImage` and `AvatarFallback` stay the same.

## API Reference

### Avatar

The root container rendered as a `span`. Provides context for `AvatarImage` and `AvatarFallback`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for styling the avatar container |
| `...props` | `React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>` | - | Additional props inherited from the avatar primitive root (span element) |

### AvatarImage

The `img` element inside the avatar. It is in the server's HTML, so the download starts before hydration, and it stays hidden until it loads and when it fails. `data-state` is `loading`, `loaded` or `error`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | - | Image source URL |
| `srcSet` | `string` | - | Candidate images for other pixel densities or widths. Enough on its own, without a `src` |
| `alt` | `string` | - | Alternate text for the image |
| `onLoadingStatusChange` | `(status: 'idle' \| 'loading' \| 'loaded' \| 'error') => void` | - | Callback when the image loading status changes |
| `className` | `string` | - | Additional class names for styling the image |
| `...props` | `React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>` | - | Additional props inherited from the avatar image primitive |

### AvatarFallback

Content displayed when the image has not loaded. Typically initials or an icon.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `delayMs` | `number` | - | Optional delay in milliseconds before showing the fallback (avoids flicker for fast-loading images) |
| `className` | `string` | - | Additional class names for styling the fallback |
| `children` | `React.ReactNode` | - | Fallback content (e.g. initials) |
| `...props` | `React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>` | - | Additional props inherited from the avatar fallback primitive |

### AvatarGroup

Shows the first `maxVisible` people and a `+N` counter for the rest. Each fallback is named by its `alt`, so a screen reader hears the same name before and after the photo loads.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `imgs` | `{ src?: string; alt?: string; fallback?: string; id?: string }[]` | (required) | Array of avatar data objects. Each fallback shows the first 2 letters of `fallback`, or of `alt` when there is none, never half of a flag, an emoji or an accented letter |
| `maxVisible` | `number` | `3` | Maximum number of avatars to display before showing a `+N` overflow counter |
| `getOverflowLabel` | `(count: number) => string` | `` count => `${count} more` `` | Names the `+N` counter for a screen reader, in the page's language |
| `className` | `string` | - | Additional class names for styling the avatar group container |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Additional props to spread to the container div |

### MotionAvatar

Content scales and blurs in on mount using the `scaleIn` preset. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `React.ComponentPropsWithoutRef<typeof Avatar>` | - | All props from `Avatar` are supported |

### MotionAvatarGroup

Each avatar staggers in 80ms apart with `scaleIn` animation. The overflow counter staggers last. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `IAvatarGroupProps` | - | All props from `AvatarGroup` are supported |