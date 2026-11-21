```tsx
import * as Accordion from '@gentleduck/primitives/accordion'
```

## Anatomy

```tsx
<Accordion.Root>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>
        <Accordion.Indicator />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content />
  </Accordion.Item>
</Accordion.Root>
```

***

## Usage

```tsx
import * as Accordion from '@gentleduck/primitives/accordion'

function BasicAccordion() {
  return (
    <Accordion.Root type="single" collapsible>
      <Accordion.Item value="item-1">
        <Accordion.Header>
          <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It adheres to the WAI-ARIA design pattern.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item-2">
        <Accordion.Header>
          <Accordion.Trigger>Is it unstyled?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          Yes. It is unstyled by default, giving you full control over styling.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  )
}
```

***

## Examples

### Single, collapsible

```tsx title="components/accordion-single.tsx"
// import from your project: import Demo from '@/components/accordion-single'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

const FAQ = [
  {
    value: 'shipping',
    question: 'How long does shipping take?',
    answer: 'Three to five working days in most regions.',
  },
  { value: 'returns', question: 'Can I return an order?', answer: 'Yes, within 30 days, in its original packaging.' },
  { value: 'warranty', question: 'Is there a warranty?', answer: 'Every product carries a two-year warranty.' },
]

export default function AccordionSingleExample() {
  return (
    <Accordion.Root className={styles.disclosure} collapsible defaultValue="shipping" type="single">
      {FAQ.map((item) => (
        <Accordion.Item className={styles.disclosureItem} key={item.value} value={item.value}>
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>
              {item.question}
              <Accordion.Indicator className={styles.chevron}>v</Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={`${styles.disclosureContent} ${styles.animated}`}>
            <div>{item.answer}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
```

### Multiple

```tsx title="components/accordion-multiple.tsx"
// import from your project: import Demo from '@/components/accordion-multiple'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

const SECTIONS = ['Account', 'Billing', 'Notifications']

export default function AccordionMultipleExample() {
  return (
    <Accordion.Root className={styles.disclosure} defaultValue={['Account', 'Notifications']} type="multiple">
      {SECTIONS.map((section) => (
        <Accordion.Item className={styles.disclosureItem} key={section} value={section}>
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>
              {section}
              <Accordion.Indicator className={styles.chevron}>v</Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={`${styles.disclosureContent} ${styles.animated}`}>
            <div>Settings for {section.toLowerCase()}, open beside the others.</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
```

### Controlled

```tsx title="components/accordion-controlled.tsx"
// import from your project: import Demo from '@/components/accordion-controlled'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import * as React from 'react'
import styles from '../primitives.module.css'

const STEPS = ['Details', 'Address', 'Payment']

export default function AccordionControlledExample() {
  const [value, setValue] = React.useState('Details')
  const [focused, setFocused] = React.useState<string | null>(null)
  const at = STEPS.indexOf(value)

  return (
    <div className={styles.stack}>
      <Accordion.Root
        className={styles.disclosure}
        onFocusChange={setFocused}
        onValueChange={setValue}
        type="single"
        value={value}>
        {STEPS.map((step) => (
          <Accordion.Item className={styles.disclosureItem} key={step} value={step}>
            <Accordion.Header className={styles.disclosureHeader}>
              <Accordion.Trigger className={styles.disclosureTrigger}>{step}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.disclosureContent}>
              <div>Fill in your {step.toLowerCase()}.</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <div className={styles.row}>
        <button
          className={styles.button}
          disabled={at <= 0}
          onClick={() => setValue(STEPS[at - 1] ?? '')}
          type="button">
          Back
        </button>
        <button
          className={`${styles.button} ${styles.primary}`}
          disabled={at >= STEPS.length - 1}
          onClick={() => setValue(STEPS[at + 1] ?? '')}
          type="button">
          Next
        </button>
      </div>
      <p className={styles.note}>
        Open: {value || 'none'}. Focused trigger: {focused ?? 'none'}.
      </p>
    </div>
  )
}
```

### Disabled

```tsx title="components/accordion-disabled.tsx"
// import from your project: import Demo from '@/components/accordion-disabled'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AccordionDisabledExample() {
  const [locked, setLocked] = React.useState(false)

  return (
    <div className={styles.stack}>
      <Accordion.Root className={styles.disclosure} collapsible disabled={locked} type="single">
        <Accordion.Item className={styles.disclosureItem} value="plan">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Plan</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent}>
            <div>Free plan, renewed monthly.</div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item className={styles.disclosureItem} disabled value="sso">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Single sign-on (Enterprise only)</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent}>
            <div>Connect your identity provider.</div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item className={styles.disclosureItem} value="usage">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Usage</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent}>
            <div>1,204 of 5,000 requests this month.</div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
      <button className={styles.button} onClick={() => setLocked((value) => !value)} type="button">
        {locked ? 'Unlock every item' : 'Disable every item'}
      </button>
      <p className={styles.note}>The arrow keys pass over a disabled trigger.</p>
    </div>
  )
}
```

### Horizontal

```tsx title="components/accordion-horizontal.tsx"
// import from your project: import Demo from '@/components/accordion-horizontal'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

const PANELS = ['Mon', 'Tue', 'Wed', 'Thu']

export default function AccordionHorizontalExample() {
  return (
    <div className={styles.stack}>
      <Accordion.Root
        className={styles.disclosure}
        defaultValue="Tue"
        loop={false}
        orientation="horizontal"
        type="single">
        {PANELS.map((day) => (
          <Accordion.Item className={styles.disclosureItem} key={day} value={day}>
            <Accordion.Header className={styles.disclosureHeader}>
              <Accordion.Trigger className={styles.disclosureTrigger}>{day}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.disclosureContent}>
              <div>Shifts on {day}</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <p className={styles.note}>ArrowLeft and ArrowRight move between days, and stop at either end with loop off.</p>
    </div>
  )
}
```

### Right to left

```tsx title="components/accordion-rtl.tsx"
// import from your project: import Demo from '@/components/accordion-rtl'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

const ITEMS = [
  { value: 'a', question: 'هل يدعم إمكانية الوصول؟', answer: 'نعم، يتبع نمط WAI-ARIA.' },
  { value: 'b', question: 'هل يأتي بتنسيق جاهز؟', answer: 'لا، التنسيق متروك لك.' },
]

export default function AccordionRtlExample() {
  return (
    <div className={styles.stack}>
      <Accordion.Root className={styles.disclosure} collapsible dir="rtl" orientation="horizontal" type="single">
        {ITEMS.map((item) => (
          <Accordion.Item className={styles.disclosureItem} key={item.value} value={item.value}>
            <Accordion.Header className={styles.disclosureHeader}>
              <Accordion.Trigger className={styles.disclosureTrigger}>{item.question}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.disclosureContent}>
              <div>{item.answer}</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <p className={styles.note}>ArrowLeft moves to the next item, since the items run right to left.</p>
    </div>
  )
}
```

### Found by the browser's search

```tsx title="components/accordion-hidden-until-found.tsx"
// import from your project: import Demo from '@/components/accordion-hidden-until-found'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

export default function AccordionHiddenUntilFoundExample() {
  return (
    <div className={styles.stack}>
      <Accordion.Root className={styles.disclosure} collapsible type="single">
        <Accordion.Item className={styles.disclosureItem} value="rivers">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Rivers</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent} hiddenUntilFound>
            <div>An otter can hold its breath for eight minutes.</div>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item className={styles.disclosureItem} value="forests">
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>Forests</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={styles.disclosureContent} hiddenUntilFound>
            <div>A red squirrel buries thousands of seeds each autumn.</div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
      <p className={styles.note}>Search the page for "otter" and the browser opens the item that holds it.</p>
    </div>
  )
}
```

### Force mounted

```tsx title="components/accordion-force-mount.tsx"
// import from your project: import Demo from '@/components/accordion-force-mount'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import styles from '../primitives.module.css'

export default function AccordionForceMountExample() {
  return (
    <Accordion.Root className={styles.disclosure} collapsible type="single">
      {['Summary', 'Details'].map((section) => (
        <Accordion.Item className={styles.disclosureItem} key={section} value={section}>
          <Accordion.Header className={styles.disclosureHeader}>
            <Accordion.Trigger className={styles.disclosureTrigger}>{section}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className={`${styles.disclosureContent} ${styles.collapse}`} forceMount>
            <div>Kept in the page while closed, so its own styles collapse it.</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
```

### Each item's onOpenChange

```tsx title="components/accordion-item-open-change.tsx"
// import from your project: import Demo from '@/components/accordion-item-open-change'
'use client'

import * as Accordion from '@gentleduck/primitives/accordion'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function AccordionItemOpenChangeExample() {
  const [log, setLog] = React.useState<string[]>([])
  const record = (section: string) => (open: boolean) =>
    setLog((entries) => [`${section} ${open ? 'opened' : 'closed'}`, ...entries].slice(0, 4))

  return (
    <div className={styles.stack}>
      <Accordion.Root className={styles.disclosure} collapsible type="single">
        {['Orders', 'Invoices'].map((section) => (
          <Accordion.Item
            className={styles.disclosureItem}
            key={section}
            onOpenChange={record(section)}
            value={section}>
            <Accordion.Header className={styles.disclosureHeader}>
              <Accordion.Trigger className={styles.disclosureTrigger}>{section}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className={styles.disclosureContent}>
              <div>Recent {section.toLowerCase()}.</div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
      <p className={styles.note}>{log.length ? log.join(', ') : 'Open an item to see its own onOpenChange.'}</p>
    </div>
  )
}
```

***

## API

### `Accordion.Root`

The root container. Accepts either `type="single"` (one item open at a time) or `type="multiple"` (multiple items open simultaneously). Renders a `<div>`.

#### Single mode

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'single'` | `'single'` | Allows only one item to be open at a time |
| `value` | `string` | - | Controlled open item value |
| `defaultValue` | `string` | - | Initial open item value (uncontrolled) |
| `onValueChange` | `(value: string) => void` | - | Called when the open item changes |
| `collapsible` | `boolean` | `false` | Allow the open item to be closed by clicking its trigger again |

#### Multiple mode

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'multiple'` | - | Allows multiple items to be open simultaneously |
| `value` | `string[]` | - | Controlled array of open item values |
| `defaultValue` | `string[]` | - | Initial array of open item values (uncontrolled) |
| `onValueChange` | `(value: string[]) => void` | - | Called when the open items change |

#### Both modes

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | Disables every item |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Which arrow keys move focus between triggers |
| `loop` | `boolean` | `true` | Arrow keys wrap from the last trigger to the first and back |
| `onFocusChange` | `(value: string \| null) => void` | - | Called with the focused item's value, and with `null` once focus leaves the triggers |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction; flips the horizontal arrow keys. Lands on the root as its `dir` attribute, and the parts carry none |

Exposes `data-orientation` and `data-disabled` on the root element.

***

### `Accordion.Item`

A single collapsible section. Must be a direct child of `Accordion.Root`. Renders a `<div>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Unique identifier for the item, used to control open state |
| `disabled` | `boolean` | `false` | Prevents the item from being opened or closed |
| `onOpenChange` | `(open: boolean) => void` | - | Called when the item's trigger, or the browser's find-in-page, opens or closes it. Not called when another item's opening closes it |

Exposes `data-state` (`open` | `closed`), `data-disabled`, `data-orientation` and `data-value` attributes.

***

### `Accordion.Header`

The heading that wraps a trigger, so assistive technology lists each section. Renders an `<h3>`; use `asChild` for another level.

Exposes `data-state`, `data-disabled` and `data-orientation` attributes.

***

### `Accordion.Trigger`

The button that toggles the associated content panel. Must be a descendant of `Accordion.Item`. Renders a `<button>`.

Inherits all standard `<button>` props.

Exposes `data-state` (`open` | `closed`), `data-disabled` and `data-orientation` attributes. Sets `aria-expanded`, `aria-controls` and, when disabled, `aria-disabled` automatically.

***

### `Accordion.Indicator`

A decorative element for the chevron, hidden from assistive technology. Renders a `<span>`.

Exposes `data-state`, `data-disabled` and `data-orientation` attributes, so the icon can rotate with `data-[state=open]:rotate-180`.

***

### `Accordion.Content`

The collapsible panel that contains the item's content. Must be a descendant of `Accordion.Item`. Renders a `<div>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `forceMount` | `boolean` | `false` | Keep the content mounted and visible when closed, for a JavaScript animation library to hide |
| `hiddenUntilFound` | `boolean` | `false` | Keep closed content in the page as `hidden="until-found"`, so the browser's find-in-page opens the item holding the match. A disabled item stays out of the search |

Exposes `data-state` (`open` | `closed`), `data-disabled` and `data-orientation` attributes. Sets `role="region"` and `aria-labelledby` automatically, and `aria-hidden` while closed content stays in the page.

Closing content stays mounted until its CSS exit animation ends. The content's open size is set as `--gentleduck-accordion-content-height` and `--gentleduck-accordion-content-width`, unless its `style` sets one, and an item open on the first render does not play its open animation:

```css
.content[data-state="open"] {
  animation: accordion-down 200ms ease-out;
}

.content[data-state="closed"] {
  animation: accordion-up 150ms ease-in;
}

@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--gentleduck-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--gentleduck-accordion-content-height); }
  to { height: 0; }
}
```

***

## Keyboard Interaction

| Key | Description |
| --- | --- |
| `Enter` | Toggles the focused item open or closed |
| `Space` | Toggles the focused item open or closed |
| `ArrowDown` | Moves focus to the next trigger when `orientation` is `vertical` |
| `ArrowUp` | Moves focus to the previous trigger when `orientation` is `vertical` |
| `ArrowRight` | Moves focus to the next trigger when `orientation` is `horizontal`, the previous in `rtl` |
| `ArrowLeft` | Moves focus to the previous trigger when `orientation` is `horizontal`, the next in `rtl` |
| `Home` | Moves focus to the first trigger |
| `End` | Moves focus to the last trigger |

Disabled triggers are skipped, and so are a nested accordion's and those React has hidden in a suspended `Suspense` boundary or a hidden `Activity`. Focus wraps at either end unless `loop` is `false`. The root and its triggers are found by `data-slot`, so one given another `data-slot` drops out of keyboard navigation.

***

## Benchmarks

Measured against every library that ships an accordion, as on the [benchmarks page](/duck-primitives/benchmarks).

{/* benchmarks */}

Smaller than all 4. Faster in all 12 timed comparisons.

| | gentleduck | Radix | Base UI | React Aria | Ark UI |
|---|--:|--:|--:|--:|--:|
| Size, gzipped bytes | 4,847 | 8,770 (0.55x) | 9,260 (0.52x) | 14,752 (0.33x) | 11,953 (0.41x) |
| Mount x100, ms | 10.4 | 22.3 (0.47x) | 25.0 (0.42x) | 34.8 (0.30x) | 18.1 (0.57x) |
| Update x100, ms | 9.76 | 17.2 (0.57x) | 15.5 (0.63x) | 34.1 (0.29x) | 40.2 (0.24x) |
| Unmount x100, ms | 1.89 | 2.76 (0.68x) | 2.79 (0.68x) | 4.73 (0.40x) | 2.53 (0.74x) |

Behind nowhere: smaller and faster than every library here, in every case.

Each cell after gentleduck's is that library's figure, with gentleduck's as a multiple of it in brackets: under 1x is smaller or faster, and bold marks where gentleduck is behind. x100 is a hundred copies at once. A time is the median of the main thread's work in production React on headless Chromium, until the frame that shows the result has painted, including what a library leaves to an effect, a later task or the next frame. Versions: Radix 1.2.20, Base UI 1.0.0-rc.0, React Aria 1.22.1 and Ark UI 5.40.0.

{/* /benchmarks */}