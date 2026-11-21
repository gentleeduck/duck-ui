```tsx title="components/alert-1.tsx"
// import from your project: import Demo from '@/components/alert-1'
import { Alert, AlertDescription, AlertTitle } from '@gentleduck/registry-ui/alert'
import { Terminal } from 'lucide-react'

export default function Demo() {
  return (
    <Alert>
      <Terminal aria-hidden="true" className="h-4 w-4" />
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the cli.</AlertDescription>
    </Alert>
  )
}
```

## Philosophy

Alerts exist to break the user's flow  -  intentionally. When something demands attention, a subtle inline message beats a disruptive modal every time. We keep the API to just `variant` because an alert's job is simple: show a message with visual weight. Anything more complex belongs in a dialog.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add alert
```

Install the following dependencies:

```bash
npm install @gentleduck/variants @gentleduck/libs
```

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import { Terminal } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
```

```tsx
<Alert>
  <Terminal className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components and dependencies to your app using the cli.
  </AlertDescription>
</Alert>
```

## Examples

### Variants

```tsx title="components/alert-2.tsx"
// import from your project: import Demo from '@/components/alert-2'
import { Alert, AlertDescription, AlertTitle } from '@gentleduck/registry-ui/alert'
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert>
        <CheckCircle2Icon aria-hidden="true" />
        <AlertTitle>Success! Your changes have been saved</AlertTitle>
        <AlertDescription>This is an alert with icon, title and description.</AlertDescription>
      </Alert>
      <Alert>
        <PopcornIcon aria-hidden="true" />
        <AlertTitle>This Alert has a title and an icon. No description.</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon aria-hidden="true" />
        <AlertTitle>Unable to process your payment.</AlertTitle>
        <AlertDescription>
          <p>Please verify your billing information and try again.</p>
          <ul className="list-inside list-disc text-sm">
            <li>Check your card details</li>
            <li>Ensure sufficient funds</li>
            <li>Verify billing address</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
```

### Icon, title and description

An icon placed first takes its own column, and the title and description line up beside it. Either one can be left out, and a description can hold paragraphs and lists.

```tsx title="components/alert-3.tsx"
// import from your project: import Demo from '@/components/alert-3'
import { Alert, AlertDescription, AlertTitle } from '@gentleduck/registry-ui/alert'
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-xl items-start gap-4">
      <Alert>
        <CheckCircle2Icon aria-hidden="true" />
        <AlertTitle>Success! Your changes have been saved</AlertTitle>
        <AlertDescription>This is an alert with icon, title and description.</AlertDescription>
      </Alert>
      <Alert>
        <PopcornIcon aria-hidden="true" />
        <AlertTitle>This Alert has a title and an icon. No description.</AlertTitle>
      </Alert>
      <Alert variant="destructive">
        <AlertCircleIcon aria-hidden="true" />
        <AlertTitle>Unable to process your payment.</AlertTitle>
        <AlertDescription>
          <p>Please verify your billing information and try again.</p>
          <ul className="list-inside list-disc text-sm">
            <li>Check your card details</li>
            <li>Ensure sufficient funds</li>
            <li>Verify billing address</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
```

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the alert follows it: the icon moves to the start side. No `dir` prop or `rtl:` classes needed.

```tsx title="components/alert-4.tsx"
// import from your project: import Demo from '@/components/alert-4'
import { Alert, AlertDescription, AlertTitle } from '@gentleduck/registry-ui/alert'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="grid w-full max-w-xl items-start gap-4">
        <Alert>
          <CheckCircle2Icon aria-hidden="true" />
          <AlertTitle>تم حفظ التغييرات بنجاح</AlertTitle>
          <AlertDescription>تنبيه يضم أيقونة وعنوانًا ووصفًا.</AlertDescription>
        </Alert>
        <Alert>
          <PopcornIcon aria-hidden="true" />
          <AlertTitle>تنبيه بعنوان وأيقونة فقط، دون وصف.</AlertTitle>
        </Alert>
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden="true" />
          <AlertTitle>تعذّر إتمام عملية الدفع.</AlertTitle>
          <AlertDescription>
            <p>يرجى مراجعة بيانات الفوترة ثم المحاولة مرة أخرى.</p>
            <ul className="list-inside list-disc text-sm">
              <li>تحقق من بيانات البطاقة</li>
              <li>تأكد من توفر رصيد كافٍ</li>
              <li>تحقق من عنوان الفوترة</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionAlert` for a staggered entrance animation powered by [motion](https://motion.dev). The alert, title, and description each use a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition, staggered by delay.

```tsx title="components/alert-5.tsx"
// import from your project: import Demo from '@/components/alert-5'
'use client'

import { MotionAlert, MotionAlertDescription, MotionAlertTitle } from '@gentleduck/registry-ui/alert'
import { AlertCircle, Terminal } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <MotionAlert>
        <Terminal aria-hidden="true" className="h-4 w-4" />
        <MotionAlertTitle>Heads up!</MotionAlertTitle>
        <MotionAlertDescription>You can add components to your app using the cli.</MotionAlertDescription>
      </MotionAlert>
      <MotionAlert variant="destructive">
        <AlertCircle aria-hidden="true" className="h-4 w-4" />
        <MotionAlertTitle>Error</MotionAlertTitle>
        <MotionAlertDescription>Your session has expired. Please log in again.</MotionAlertDescription>
      </MotionAlert>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionAlert` instead of `Alert`, `MotionAlertTitle` instead of `AlertTitle`, and `MotionAlertDescription` instead of `AlertDescription`. The icon stays as a plain SVG.

## API Reference

### Alert

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'destructive'` | `'default'` | Visual style variant for the alert |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | - | Additional CSS classes applied to the alert container |
| `children` | `React.ReactNode` | - | Alert content, typically an icon, AlertTitle, and AlertDescription |
| `...props` | `React.ComponentProps<'div'>` | - | Additional standard component props. |

### AlertTitle

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the title element |
| `children` | `React.ReactNode` | - | Title text content |
| `...props` | `React.ComponentProps<'div'>` | - | Additional standard component props. |

### AlertDescription

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the description element |
| `children` | `React.ReactNode` | - | Description text content |
| `...props` | `React.ComponentProps<'div'>` | - | Additional standard component props. |

### MotionAlert

`scaleIn` entrance (fade, scale, and blur) with a `springBouncy` transition on mount. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `AlertProps` | - | All props from `Alert` are supported |

### MotionAlertTitle

`scaleIn` entrance (fade, scale, and blur) with a `springBouncy` transition, delayed 100ms after the container. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `AlertTitleProps` | - | All props from `AlertTitle` are supported |

### MotionAlertDescription

`scaleIn` entrance (fade, scale, and blur) with a `springBouncy` transition, delayed 180ms after the title. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `...props` | `AlertDescriptionProps` | - | All props from `AlertDescription` are supported |