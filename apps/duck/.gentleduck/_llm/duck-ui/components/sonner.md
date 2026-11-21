```tsx title="components/sonner-1.tsx"
// import from your project: import Demo from '@/components/sonner-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { toast } from 'sonner'

export default function Demo() {
  return (
    <Button
      onClick={() =>
        toast('Event has been created', {
          action: {
            label: 'Undo',
            onClick: () => console.log('Undo'),
          },
          description: 'Sunday, December 03, 2023 at 9:00 AM',
        })
      }
      variant="outline">
      Show Toast
    </Button>
  )
}
```

## Philosophy

Toasts are the UI equivalent of a tap on the shoulder  -  noticeable but not blocking. We wrap Sonner because it handles the hard parts (stacking, dismissal timing, swipe gestures, accessibility announcements) better than a from-scratch implementation. Our layer adds visual consistency with the design system and upload progress integration.

## About

Sonner is built and maintained by [emilkowalski\_](https://twitter.com/emilkowalski_).

## How It's Built

## Installation

CLI
Manual

Run the following command:

```bash
npx @gentleduck/cli add sonner
```

Add the Toaster component

```tsx title="app/layout.tsx" {1,9}
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
```

Install the following dependencies:

```bash
npm install sonner next-themes @gentleduck/libs lucide-react
```

Add the `Button` and `Progress` component to your project.

The `Sonner` component uses the [`Button`](/duck-ui/components/button) and [`Progress`](/duck-ui/components/progress) components. Make sure you have them installed in your project.

Copy and paste the following code into your project.

Add the Toaster component

```tsx title="app/layout.tsx" {1,9}
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
```

## Usage

```tsx
import { toast } from 'sonner'
```

```tsx
toast('Event has been created.')
```

## Examples

### Custom icon

`icon` replaces the toast's icon, and `action` adds a button that runs its `onClick` and closes the toast.

```tsx title="components/sonner-2.tsx"
// import from your project: import Demo from '@/components/sonner-2'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function Demo() {
  return (
    <Button
      onClick={() =>
        toast('Your session expires in 5 minutes', {
          action: {
            label: 'Stay signed in',
            onClick: () => toast.success('Session extended'),
          },
          className: 'gap-3',
          description: 'Save your work to keep it.',
          icon: <ShieldAlert />,
        })
      }
      variant="outline">
      Show Toast
    </Button>
  )
}
```

### Upload

```tsx title="components/sonner-3.tsx"
// import from your project: import Demo from '@/components/sonner-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { SonnerUpload } from '@gentleduck/registry-ui/sonner'
import React from 'react'
import { toast } from 'sonner'

const TOAST_ID = 'sonner-upload'

export default function Demo() {
  const controllerRef = React.useRef(new AbortController())
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = React.useRef(0)

  const stop = React.useCallback(() => {
    controllerRef.current.abort()
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  // The toaster outlives the demo, so the toast it owns goes with it.
  React.useEffect(
    () => () => {
      stop()
      toast.dismiss(TOAST_ID)
    },
    [stop],
  )

  const show = (progress: number) => {
    toast(
      <SonnerUpload
        attachments={2}
        onCancel={(_, dismiss) => {
          stop()
          dismiss(TOAST_ID)
        }}
        onComplete={(_, dismiss) => dismiss(TOAST_ID)}
        progress={progress}
        remainingTime={Math.max(0, 3000 - progress * 30)}
      />,
      { dismissible: false, duration: 30000, id: TOAST_ID },
    )
  }

  const start = () => {
    stop()
    controllerRef.current = new AbortController()
    progressRef.current = 0
    show(0)
    intervalRef.current = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + Math.floor(Math.random() * 11) + 5, 100)
      show(progressRef.current)
      if (progressRef.current >= 100) stop()
    }, 400)
  }

  return (
    <Button border="default" onClick={start} size="sm" variant="outline">
      Show Upload Toast
    </Button>
  )
}
```

### Toast Types

```tsx title="components/sonner-4.tsx"
// import from your project: import Demo from '@/components/sonner-4'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { toast } from 'sonner'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => toast.success('File uploaded successfully')} variant="outline">
        Success
      </Button>
      <Button onClick={() => toast.error('Upload failed. Please try again.')} variant="outline">
        Error
      </Button>
      <Button onClick={() => toast.warning('Storage is almost full (90%)')} variant="outline">
        Warning
      </Button>
      <Button onClick={() => toast.info('Your file is queued for processing')} variant="outline">
        Info
      </Button>
      <Button
        onClick={() => {
          toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: 'Uploading file...',
            success: 'File uploaded successfully!',
            error: 'Upload failed',
          })
        }}
        variant="outline">
        Promise
      </Button>
    </div>
  )
}
```

### Multi-File Upload

```tsx title="components/sonner-5.tsx"
// import from your project: import Demo from '@/components/sonner-5'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { SonnerUpload } from '@gentleduck/registry-ui/sonner'
import React from 'react'
import { toast } from 'sonner'

export default function Demo() {
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = React.useRef(0)
  const toastId = 'multi-upload'

  const updateToast = (progress: number) => {
    toast(
      <SonnerUpload
        attachments={5}
        onCancel={handleCancel}
        onComplete={handleComplete}
        progress={progress}
        remainingTime={Math.max(0, Math.round((100 - progress) * 0.6))}
      />,
      { dismissible: false, duration: 60000, id: toastId },
    )
  }

  const startProgress = () => {
    progressRef.current = 0
    updateToast(0)

    intervalRef.current = setInterval(() => {
      const step = Math.floor(Math.random() * 6) + 2
      progressRef.current = Math.min(progressRef.current + step, 100)
      updateToast(progressRef.current)

      if (progressRef.current >= 100) stop()
    }, 600)
  }

  const stop = React.useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  React.useEffect(() => stop, [stop])

  const handleCancel = () => {
    toast.dismiss(toastId)
    stop()
  }

  const handleComplete = () => {
    toast.dismiss(toastId)
    toast.success('All 5 files uploaded successfully')
  }

  const handleClick = () => {
    handleCancel()
    startProgress()
  }

  return (
    <Button border="default" onClick={handleClick} size="sm" variant="outline">
      Upload 5 Files
    </Button>
  )
}
```

### Position

A toast's `position` overrides the `Toaster`'s for that toast alone.

```tsx title="components/sonner-7.tsx"
// import from your project: import Demo from '@/components/sonner-7'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { toast } from 'sonner'

const POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const

export default function Demo() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {POSITIONS.map((position) => (
        <Button
          key={position}
          onClick={() => toast(`Shown ${position.replace('-', ' ')}`, { position })}
          size="sm"
          variant="outline">
          {position}
        </Button>
      ))}
    </div>
  )
}
```

### Rich colours and close button

`richColors` tints success, error, warning and info toasts, `closeButton` gives each toast a close button, and `expand` shows the stack open. These are `Toaster` props, so this example mounts its own `Toaster` with an `id` and sends its toasts there with `toasterId`, leaving the page's `Toaster` as it is.

```tsx title="components/sonner-8.tsx"
// import from your project: import Demo from '@/components/sonner-8'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Toaster } from '@gentleduck/registry-ui/sonner'
import { toast } from 'sonner'

const TOASTER_ID = 'sonner-rich'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toaster closeButton expand id={TOASTER_ID} richColors />
      <Button onClick={() => toast.success('Payment received', { toasterId: TOASTER_ID })} variant="outline">
        Success
      </Button>
      <Button onClick={() => toast.error('Card declined', { toasterId: TOASTER_ID })} variant="outline">
        Error
      </Button>
      <Button onClick={() => toast.warning('Card expires next month', { toasterId: TOASTER_ID })} variant="outline">
        Warning
      </Button>
      <Button onClick={() => toast.info('Receipt sent by email', { toasterId: TOASTER_ID })} variant="outline">
        Info
      </Button>
    </div>
  )
}
```

### Loading, then done

`toast.loading` returns the toast's id. Pass it as `id` to `toast.success` or `toast.error` and the same toast changes in place, rather than a second one appearing.

```tsx title="components/sonner-9.tsx"
// import from your project: import Demo from '@/components/sonner-9'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { toast } from 'sonner'

export default function Demo() {
  return (
    <Button
      onClick={() => {
        const id = toast.loading('Saving the draft...')
        setTimeout(() => toast.success('Draft saved', { description: 'Saved to your workspace.', id }), 1500)
      }}
      variant="outline">
      Save Draft
    </Button>
  )
}
```

### Action and cancel

`action` and `cancel` each add a button. Both close the toast; `cancel` is drawn quieter, for the choice that changes nothing.

```tsx title="components/sonner-10.tsx"
// import from your project: import Demo from '@/components/sonner-10'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { toast } from 'sonner'

export default function Demo() {
  return (
    <Button
      onClick={() =>
        toast('Message archived', {
          action: { label: 'Undo', onClick: () => toast.success('Message restored') },
          cancel: { label: 'Dismiss', onClick: () => {} },
        })
      }
      variant="outline">
      Archive Message
    </Button>
  )
}
```

### Position and theme

```tsx title="components/sonner-11.tsx"
// import from your project: import Demo from '@/components/sonner-11'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Toaster } from '@gentleduck/registry-ui/sonner'
import * as React from 'react'
import { toast } from 'sonner'

const TOASTER_ID = 'sonner-placement'
const POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const
const THEMES = ['light', 'dark', 'system'] as const

export default function Demo() {
  const [position, setPosition] = React.useState<(typeof POSITIONS)[number]>('top-center')
  const [theme, setTheme] = React.useState<(typeof THEMES)[number]>('dark')

  return (
    <div className="flex flex-col items-center gap-3">
      <Toaster id={TOASTER_ID} position={position} theme={theme} />
      <div className="flex flex-wrap justify-center gap-2">
        {POSITIONS.map((value) => (
          <Button
            key={value}
            onClick={() => setPosition(value)}
            size="sm"
            variant={value === position ? 'default' : 'outline'}>
            {value}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        {THEMES.map((value) => (
          <Button
            key={value}
            onClick={() => setTheme(value)}
            size="sm"
            variant={value === theme ? 'default' : 'outline'}>
            {value}
          </Button>
        ))}
      </div>
      <Button onClick={() => toast('Saved', { description: `${position}, ${theme} theme`, toasterId: TOASTER_ID })}>
        Show a toast
      </Button>
    </div>
  )
}
```

## RTL Support

Set the direction once with `<html dir="rtl">` (or a `DirectionProvider` around the `Toaster`) and toasts follow: text, icons and the action button mirror, and left/right positions mirror, so the default `bottom-right` becomes `bottom-left`.

```tsx title="components/sonner-6.tsx"
// import from your project: import Demo from '@/components/sonner-6'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Toaster } from '@gentleduck/registry-ui/sonner'
import { toast } from 'sonner'

const TOASTER_ID = 'sonner-rtl'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      {/* This docs page is LTR, so the demo mounts its own Toaster inside the provider.
          In an app with <html dir="rtl">, the root Toaster is already RTL. */}
      <Toaster id={TOASTER_ID} />
      <Button
        onClick={() =>
          toast('تم إنشاء الحدث', {
            action: {
              label: 'تراجع',
              onClick: () => console.log('Undo'),
            },
            description: 'الأحد، 3 ديسمبر 2023 الساعة 9:00 صباحًا',
            toasterId: TOASTER_ID,
          })
        }
        variant="outline">
        عرض الإشعار
      </Button>
    </DirectionProvider>
  )
}
```

## API Reference

### Toaster

The `Toaster` component wraps the `Sonner` `Toaster` from the `sonner` library, applying theme synchronization via `next-themes` and default styling.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Optional override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `position` | `ToasterProps['position']` | `'bottom-right'` | Corner the toasts stack in. Left and right mirror in RTL |
| `theme` | `'light' \| 'dark' \| 'system'` | `'system'` | Toast theme. Auto-detected from `next-themes` `useTheme()` |
| `style` | `React.CSSProperties` | - | Merged over the popover colours the toasts take, `--normal-bg`, `--normal-border` and `--normal-text`, so one of those can be overridden and the rest kept |
| `...props` | `ToasterProps` | - | Additional props inherited from the `sonner` toaster. |

### SonnerUpload

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `progress` | `number` | (required) | Current upload progress percentage (0--100) |
| `attachments` | `number` | (required) | Number of files being uploaded |
| `remainingTime` | `number` | - | Estimated remaining upload time in seconds |
| `onCancel` | `(e: React.MouseEvent<HTMLButtonElement>, dismiss: (id: string) => void) => void` | - | Callback triggered when the Cancel button is clicked. Receives the click event and a function to dismiss the toast by ID |
| `onComplete` | `(e: React.MouseEvent<HTMLButtonElement>, dismiss: (id: string) => void) => void` | - | Callback triggered when the Complete button is clicked. Receives the click event and a function to dismiss the toast by ID |

While `progress` is under 100, `SonnerUpload` shows a spinning `Loader`, the time left when `remainingTime` is above zero, and a Cancel button. From 100 up it shows a `CircleCheck`, a full bar at 100%, reads "Upload complete", says it is safe to close the browser, and offers Complete. The bar is named "Upload progress". It adds no live region of its own, since the `Toaster` already announces what changes in a toast.

### Utility Function

#### `formatTime(seconds: number): string`

Formats a duration in seconds into a human-readable string:

* Returns days if >= 1 day (`'Xd'`),
* else hours if >= 1 hour (`'Xh'`),
* else minutes if >= 1 minute (`'Xm'`),
* else seconds (`'Xs'`).

Each is rounded down, so `formatTime(119)` is `'1m'`.

### Types

```ts
export type UploadSonnerProps = {
  progress: number
  attachments: number
  remainingTime?: number
  onCancel?: (
    e: React.MouseEvent<HTMLButtonElement>,
    dismiss: (id: string) => void
  ) => void
  onComplete?: (
    e: React.MouseEvent<HTMLButtonElement>,
    dismiss: (id: string) => void
  ) => void
}

export type ToasterProps = React.ComponentProps<typeof Sonner>
```