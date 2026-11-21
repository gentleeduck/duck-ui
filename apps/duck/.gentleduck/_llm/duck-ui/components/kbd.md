```tsx title="components/kbd-1.tsx"
// import from your project: import Demo from '@/components/kbd-1'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>Alt</Kbd>
        <Kbd>Fn</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>S</Kbd>
      </KbdGroup>
    </div>
  )
}
```

}>
  **Note:** `CommandShortcut` and the menus' shortcuts sit inside their item and can bind the keys they show with `onKeysPressed`. `Kbd` only draws keys, so it fits anywhere a key is named: in text, a button, a tooltip or an input.

## Philosophy

Keyboard shortcuts deserve visual prominence. The Kbd component renders key combinations with consistent styling, making shortcut discovery a natural part of the UI rather than something hidden in documentation. We pair it with `@gentleduck/vim` for actual key binding  -  Kbd handles the display, vim handles the logic.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add kbd
```

Install the following dependencies:

```bash
npm install @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Kbd } from "@/components/ui/kbd"
```

```tsx
<Kbd>Ctrl</Kbd>
```

## Examples

### Group

Use the `KbdGroup` component to group keyboard keys together.

```tsx title="components/kbd-2.tsx"
// import from your project: import Demo from '@/components/kbd-2'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-muted-foreground text-sm">
        Press{' '}
        <KbdGroup>
          <Kbd>Ctrl + K</Kbd>
          <Kbd>Ctrl + P</Kbd>
        </KbdGroup>{' '}
        to jump between files quickly
      </p>
    </div>
  )
}
```

### Button

Use the `Kbd` component inside a `Button` component to display a keyboard key inside a button.

```tsx title="components/kbd-3.tsx"
// import from your project: import Demo from '@/components/kbd-3'
import { Button } from '@gentleduck/registry-ui/button'
import { Kbd } from '@gentleduck/registry-ui/kbd'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button className="pe-2" size="sm" variant="outline">
        Confirm <Kbd>Enter</Kbd>
      </Button>
      <Button className="pe-2" size="sm" variant="outline">
        Dismiss <Kbd>Esc</Kbd>
      </Button>
    </div>
  )
}
```

### Tooltip

You can use the `Kbd` component inside a `Tooltip` component to display a tooltip with a keyboard key.

```tsx title="components/kbd-4.tsx"
// import from your project: import Demo from '@/components/kbd-4'
import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup } from '@gentleduck/registry-ui/button-group'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-4">
        <ButtonGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">
                Undo
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                Undo{' '}
                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>Z</Kbd>
                </KbdGroup>
              </div>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">
                Redo
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                Redo{' '}
                <KbdGroup>
                  <Kbd>Ctrl</Kbd>
                  <Kbd>Y</Kbd>
                </KbdGroup>
              </div>
            </TooltipContent>
          </Tooltip>
        </ButtonGroup>
      </div>
    </TooltipProvider>
  )
}
```

### Input Group

You can use the `Kbd` component inside a `InputGroupAddon` component to display a keyboard key inside an input group.

```tsx title="components/kbd-5.tsx"
// import from your project: import Demo from '@/components/kbd-5'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Kbd } from '@gentleduck/registry-ui/kbd'
import { SearchIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      <InputGroup>
        <InputGroupInput placeholder="Quick find..." />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>Ctrl</Kbd>
          <Kbd>/</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
```

### Platform keys

Pass `keys` instead of a label and `Kbd` writes the binding out for the platform the page runs on: `mod+k` reads `Cmd+K` on a Mac and `Ctrl+K` elsewhere. A server cannot tell the platform, so it draws the Windows and Linux keys and the browser swaps in its own once the page hydrates, without a hydration error.

```tsx title="components/kbd-8.tsx"
// import from your project: import Demo from '@/components/kbd-8'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'

export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-3 text-muted-foreground text-sm">
      <p className="flex items-center gap-2">
        Search <Kbd keys="mod+k" />
      </p>
      <p className="flex items-center gap-2">
        Command palette <Kbd keys="mod+shift+p" />
      </p>
      <p className="flex items-center gap-2">
        New line{' '}
        <KbdGroup>
          <Kbd keys="shift+enter" />
          <span>or</span>
          <Kbd keys="alt+enter" />
        </KbdGroup>
      </p>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the surrounding layout follows it. `Kbd` and `KbdGroup` take their direction from their own label, so shortcuts such as `Ctrl + S` or `⌘K` keep their order inside right-to-left text.

```tsx title="components/kbd-6.tsx"
// import from your project: import Demo from '@/components/kbd-6'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="flex flex-col items-center gap-4 text-muted-foreground text-sm">
        <p>
          اضغط{' '}
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <span>+</span>
            <Kbd>S</Kbd>
          </KbdGroup>{' '}
          لحفظ التغييرات.
        </p>
        <p>
          استخدم <Kbd>⌘K</Kbd> لفتح لوحة الأوامر، و<Kbd>Esc</Kbd> لإغلاقها.
        </p>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionKbd` for a staggered `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition on keyboard shortcuts, powered by [motion](https://motion.dev).

```tsx title="components/kbd-7.tsx"
// import from your project: import Demo from '@/components/kbd-7'
'use client'

import { KbdGroup, MotionKbd } from '@gentleduck/registry-ui/kbd'

export default function Demo() {
  return (
    <div className="flex items-center gap-4 p-4">
      <KbdGroup>
        <MotionKbd index={0}>⌘</MotionKbd>
        <MotionKbd index={1}>K</MotionKbd>
      </KbdGroup>
      <KbdGroup>
        <MotionKbd index={2}>⌘</MotionKbd>
        <MotionKbd index={3}>⇧</MotionKbd>
        <MotionKbd index={4}>P</MotionKbd>
      </KbdGroup>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionKbd` instead of `Kbd`. Pass `index` for stagger order.

## API Reference

### Kbd

Displays an individual keyboard key with consistent styling.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl' \| 'auto'` | `'auto'` | Text direction. Defaults to `auto`, so it follows the key label rather than the page. |
| `className` | `string` | - | Additional class names for the kbd element |
| `keys` | `string` | - | A binding such as `mod+k`, written out for the platform with `@gentleduck/vim`'s `formatForDisplay`. A server draws the Windows and Linux keys, and the browser swaps in its own once hydrated. Shown when there are no `children`. |
| `children` | `React.ReactNode` | - | Key label text or icon. Takes precedence over `keys` when both are provided. |
| `...props` | `React.HTMLProps<HTMLElement>` | - | Additional props to spread to the kbd element |

### KbdGroup

Groups multiple `Kbd` components together in an inline layout.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional class names for the group |
| `children` | `React.ReactNode` | - | `Kbd` elements to group together |
| `...props` | `React.ComponentPropsWithoutRef<'kbd'>` | - | Additional props to spread to the group's `kbd` element, which its `ref` reaches |

### MotionKbd

Same props as `Kbd`, `keys` included, plus an optional `index` prop for stagger delay (30ms per index). Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.