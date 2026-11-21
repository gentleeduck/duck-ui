```tsx title="components/field-1.tsx"
// import from your project: import Demo from '@/components/field-1'
import { Button } from '@gentleduck/registry-ui/button'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>All transactions are secure and encrypted</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-name-43j">Name on Card</FieldLabel>
                <Input id="checkout-7j9-card-name-43j" placeholder="Evil Rabbit" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">Card Number</FieldLabel>
                <Input id="checkout-7j9-card-number-uw1" placeholder="1234 5678 9012 3456" required />
                <FieldDescription>Enter your 16-digit card number</FieldDescription>
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="checkout-exp-month-ts6">Month</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-exp-month-ts6">
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">01</SelectItem>
                      <SelectItem value="02">02</SelectItem>
                      <SelectItem value="03">03</SelectItem>
                      <SelectItem value="04">04</SelectItem>
                      <SelectItem value="05">05</SelectItem>
                      <SelectItem value="06">06</SelectItem>
                      <SelectItem value="07">07</SelectItem>
                      <SelectItem value="08">08</SelectItem>
                      <SelectItem value="09">09</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-exp-year-f59">Year</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="checkout-7j9-exp-year-f59">
                      <SelectValue placeholder="YYYY" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                      <SelectItem value="2029">2029</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-7j9-cvv">CVV</FieldLabel>
                  <Input id="checkout-7j9-cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>The billing address associated with your payment method</FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox defaultChecked id="checkout-7j9-same-as-shipping-wgm" />
                <FieldLabel className="font-normal" htmlFor="checkout-7j9-same-as-shipping-wgm">
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-optional-comments">Comments</FieldLabel>
                <Textarea
                  className="resize-none"
                  id="checkout-7j9-optional-comments"
                  placeholder="Add any additional comments"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
```

## Philosophy

Fields are the structural glue between form controls and their metadata  -  labels, descriptions, error messages. Rather than baking this structure into every input component, Field composes around any control. This means the same label/error pattern works for Input, Select, Textarea, or your custom components.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add field
```

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/variants
```

The `field` component depends on the [`label`](/duck-ui/components/label) and [`separator`](/duck-ui/components/separator) components.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx showLineNumbers
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
```

```tsx showLineNumbers
<FieldSet>
  <FieldLegend>Profile</FieldLegend>
  <FieldDescription>This appears on invoices and emails.</FieldDescription>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">Full name</FieldLabel>
      <Input id="name" autoComplete="off" placeholder="Evil Rabbit" />
      <FieldDescription>This appears on invoices and emails.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
      <Input id="username" autoComplete="off" aria-invalid />
      <FieldError>Choose another username.</FieldError>
    </Field>
    <Field orientation="horizontal">
      <Switch id="newsletter" />
      <FieldLabel htmlFor="newsletter">Subscribe to the newsletter</FieldLabel>
    </Field>
  </FieldGroup>
</FieldSet>
```

## Examples

### Input

```tsx title="components/field-2.tsx"
// import from your project: import Demo from '@/components/field-2'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input id="username" placeholder="Max Leiter" type="text" />
            <FieldDescription>Choose a unique username for your account.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <FieldDescription>Must be at least 8 characters long.</FieldDescription>
            <Input id="password" placeholder="********" type="password" />
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
```

### Textarea

```tsx title="components/field-3.tsx"
// import from your project: import Demo from '@/components/field-3'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '@gentleduck/registry-ui/field'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
            <Textarea id="feedback" placeholder="Your feedback helps us improve..." rows={4} />
            <FieldDescription>Share your thoughts about our service.</FieldDescription>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
```

### Select

```tsx title="components/field-4.tsx"
// import from your project: import Demo from '@/components/field-4'
import { Field, FieldDescription, FieldLabel } from '@gentleduck/registry-ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <Field>
        <FieldLabel>Department</FieldLabel>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="support">Customer Support</SelectItem>
            <SelectItem value="hr">Human Resources</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        <FieldDescription>Select your department or area of work.</FieldDescription>
      </Field>
    </div>
  )
}
```

### Slider

```tsx title="components/field-5.tsx"
// import from your project: import Demo from '@/components/field-5'
'use client'

import { Field, FieldDescription, FieldTitle } from '@gentleduck/registry-ui/field'
import { Slider } from '@gentleduck/registry-ui/slider'
import { useState } from 'react'

export default function Demo() {
  const [value, setValue] = useState([200, 800])
  return (
    <div className="w-full max-w-md">
      <Field>
        <FieldTitle>Price Range</FieldTitle>
        <FieldDescription>
          Set your budget range ($
          <span className="font-medium tabular-nums">{value[0]}</span> -{' '}
          <span className="font-medium tabular-nums">{value[1]}</span>).
        </FieldDescription>
        <Slider
          aria-label="Price Range"
          className="mt-2 w-full"
          max={1000}
          min={0}
          onValueChange={setValue}
          step={10}
          value={value}
        />
      </Field>
    </div>
  )
}
```

### Fieldset

```tsx title="components/field-6.tsx"
// import from your project: import Demo from '@/components/field-6'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <div className="w-full max-w-md space-y-6">
      <FieldSet>
        <FieldLegend>Address Information</FieldLegend>
        <FieldDescription>We need your address to deliver your order.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="street">Street Address</FieldLabel>
            <Input id="street" placeholder="123 Main St" type="text" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input id="city" placeholder="New York" type="text" />
            </Field>
            <Field>
              <FieldLabel htmlFor="zip">Postal Code</FieldLabel>
              <Input id="zip" placeholder="90502" type="text" />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>
    </div>
  )
}
```

### Checkbox

```tsx title="components/field-7.tsx"
// import from your project: import Demo from '@/components/field-7'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@gentleduck/registry-ui/field'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Show these items on the desktop</FieldLegend>
          <FieldDescription>Select the items you want to show on the desktop.</FieldDescription>
          <FieldGroup className="gap-3">
            <Field orientation="horizontal">
              <Checkbox id="finder-pref-9k2-hard-disks-ljj" />
              <FieldLabel className="font-normal" defaultChecked htmlFor="finder-pref-9k2-hard-disks-ljj">
                Hard disks
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="finder-pref-9k2-external-disks-1yg" />
              <FieldLabel className="font-normal" htmlFor="finder-pref-9k2-external-disks-1yg">
                External disks
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="finder-pref-9k2-cds-dvds-fzt" />
              <FieldLabel className="font-normal" htmlFor="finder-pref-9k2-cds-dvds-fzt">
                CDs, DVDs, and iPods
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="finder-pref-9k2-connected-servers-6l2" />
              <FieldLabel className="font-normal" htmlFor="finder-pref-9k2-connected-servers-6l2">
                Connected servers
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <Field orientation="horizontal">
          <Checkbox defaultChecked id="finder-pref-9k2-sync-folders-nep" />
          <FieldContent>
            <FieldLabel htmlFor="finder-pref-9k2-sync-folders-nep">Sync Desktop & Documents folders</FieldLabel>
            <FieldDescription>
              Your Desktop & Documents folders are being synced with iCloud Drive. You can access them from other
              devices.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>
    </div>
  )
}
```

### Radio

```tsx title="components/field-8.tsx"
// import from your project: import Demo from '@/components/field-8'
import { Field, FieldDescription, FieldLabel, FieldSet } from '@gentleduck/registry-ui/field'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <FieldSet>
        <FieldLabel>Subscription Plan</FieldLabel>
        <FieldDescription>Yearly and lifetime plans offer significant savings.</FieldDescription>
        <RadioGroup defaultValue="monthly">
          <Field orientation="horizontal">
            <RadioGroupItem id="plan-monthly" value="monthly" />
            <FieldLabel className="font-normal" htmlFor="plan-monthly">
              Monthly ($9.99/month)
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem id="plan-yearly" value="yearly" />
            <FieldLabel className="font-normal" htmlFor="plan-yearly">
              Yearly ($99.99/year)
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem id="plan-lifetime" value="lifetime" />
            <FieldLabel className="font-normal" htmlFor="plan-lifetime">
              Lifetime ($299.99)
            </FieldLabel>
          </Field>
        </RadioGroup>
      </FieldSet>
    </div>
  )
}
```

### Switch

```tsx title="components/field-9.tsx"
// import from your project: import Demo from '@/components/field-9'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@gentleduck/registry-ui/field'
import { Switch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="2fa">Multi-factor authentication</FieldLabel>
          <FieldDescription>
            Enable multi-factor authentication. If you do not have a two-factor device, you can use a one-time code sent
            to your email.
          </FieldDescription>
        </FieldContent>
        <Switch id="2fa" />
      </Field>
    </div>
  )
}
```

### Choice Card

Wrap `Field` components inside `FieldLabel` to create selectable field groups. This works with `RadioItem`, `Checkbox` and `Switch` components.

```tsx title="components/field-10.tsx"
// import from your project: import Demo from '@/components/field-10'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from '@gentleduck/registry-ui/field'
import { RadioGroup, RadioGroupItem } from '@gentleduck/registry-ui/radio-group'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLabel htmlFor="compute-environment-p8w">Compute Environment</FieldLabel>
          <FieldDescription>Select the compute environment for your cluster.</FieldDescription>
          <RadioGroup defaultValue="kubernetes">
            <FieldLabel htmlFor="kubernetes-r2h">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Kubernetes</FieldTitle>
                  <FieldDescription>Run GPU workloads on a K8s configured cluster.</FieldDescription>
                </FieldContent>
                <RadioGroupItem id="kubernetes-r2h" value="kubernetes" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="vm-z4k">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Virtual Machine</FieldTitle>
                  <FieldDescription>Access a VM configured cluster to run GPU workloads.</FieldDescription>
                </FieldContent>
                <RadioGroupItem id="vm-z4k" value="vm" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  )
}
```

A card shows as checked when the checkbox, switch or radio item inside it is.

```tsx title="components/field-15.tsx"
// import from your project: import Demo from '@/components/field-15'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@gentleduck/registry-ui/field'
import { Switch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend variant="label">Notifications</FieldLegend>
          <FieldDescription>Pick where updates reach you.</FieldDescription>
          <FieldGroup className="gap-3">
            <FieldLabel htmlFor="notify-email-c7q">
              <Field orientation="horizontal">
                <Checkbox defaultChecked id="notify-email-c7q" />
                <FieldContent>
                  <FieldTitle>Email</FieldTitle>
                  <FieldDescription>A digest of the day&apos;s activity.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="notify-push-m2d">
              <Field orientation="horizontal">
                <Checkbox id="notify-push-m2d" />
                <FieldContent>
                  <FieldTitle>Push</FieldTitle>
                  <FieldDescription>Mentions and replies, as they happen.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          </FieldGroup>
        </FieldSet>
        <FieldLabel htmlFor="share-usage-k8v">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Share usage data</FieldTitle>
              <FieldDescription>Help improve the product with anonymous usage data.</FieldDescription>
            </FieldContent>
            <Switch id="share-usage-k8v" />
          </Field>
        </FieldLabel>
      </FieldGroup>
    </div>
  )
}
```

### Field Group

Stack `Field` components with `FieldGroup`. Add `FieldSeparator` to divide them.

```tsx title="components/field-11.tsx"
// import from your project: import Demo from '@/components/field-11'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@gentleduck/registry-ui/field'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLabel>Responses</FieldLabel>
          <FieldDescription>
            Get notified when ChatGPT responds to requests that take time, like research or image generation.
          </FieldDescription>
          <FieldGroup data-slot="checkbox-group">
            <Field orientation="horizontal">
              <Checkbox defaultChecked disabled id="push" />
              <FieldLabel className="font-normal" htmlFor="push">
                Push notifications
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLabel>Tasks</FieldLabel>
          <FieldDescription>
            {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
            Get notified when tasks you&apos;ve created have updates. <a href="#">Manage tasks</a>
          </FieldDescription>
          <FieldGroup data-slot="checkbox-group">
            <Field orientation="horizontal">
              <Checkbox id="push-tasks" />
              <FieldLabel className="font-normal" htmlFor="push-tasks">
                Push notifications
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="email-tasks" />
              <FieldLabel className="font-normal" htmlFor="email-tasks">
                Email notifications
              </FieldLabel>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  )
}
```

### Separator with text

Give `FieldSeparator` children to write them across the line.

```tsx title="components/field-17.tsx"
// import from your project: import Demo from '@/components/field-17'
import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldGroup, FieldLabel, FieldSeparator } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <div className="w-full max-w-sm">
      <FieldGroup>
        <Field>
          <Button variant="outline">Continue with a passkey</Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="email-s4p">Email</FieldLabel>
          <Input id="email-s4p" placeholder="you@example.com" type="email" />
        </Field>
        <Field>
          <Button>Sign in</Button>
        </Field>
      </FieldGroup>
    </div>
  )
}
```

### Responsive Layout

```tsx title="components/field-12.tsx"
// import from your project: import Demo from '@/components/field-12'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="w-full max-w-4xl">
      <form>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Fill in your profile information.</FieldDescription>
          <FieldSeparator />
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldDescription>Provide your full name for identification</FieldDescription>
              </FieldContent>
              <Input id="name" placeholder="Evil Rabbit" required />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="message">Message</FieldLabel>
                <FieldDescription>
                  You can write your message here. Keep it short, preferably under 100 characters.
                </FieldDescription>
              </FieldContent>
              <Textarea
                className="min-h-[100px] resize-none sm:min-w-[300px]"
                id="message"
                placeholder="Hello, world!"
                required
              />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}
```

### An animated error

```tsx title="components/field-18.tsx"
// import from your project: import Demo from '@/components/field-18'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Field, FieldLabel, MotionFieldError } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import * as React from 'react'

export default function Demo() {
  const [error, setError] = React.useState<string | null>(null)

  return (
    <form
      className="flex w-[300px] flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        const value = String(new FormData(event.currentTarget).get('username'))
        setError(value.length < 3 ? 'Use at least three characters.' : null)
      }}>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="field-18-username">Username</FieldLabel>
        <Input aria-invalid={error ? true : undefined} id="field-18-username" name="username" />
        {error ? <MotionFieldError errors={[{ message: error }]} key={error} /> : null}
      </Field>
      <Button className="self-start" type="submit">
        Check
      </Button>
    </form>
  )
}
```

## Component Composition

## Anatomy

The `Field` family is designed for composing accessible forms. A typical field is structured as follows:

```tsx showLineNumbers
<Field>
  <FieldLabel htmlFor="input-id">Label</FieldLabel>
  {/* Input, Select, Switch, etc. */}
  <FieldDescription>Optional helper text.</FieldDescription>
  <FieldError>Validation message.</FieldError>
</Field>
```

* `Field` is the core wrapper for a single field.
* `FieldContent` is a flex column that groups label and description. Not required if you have no description.
* Wrap related fields with `FieldGroup`, and use `FieldSet` with `FieldLegend` for semantic grouping.

## Responsive Layout

* **Vertical fields:** Default orientation stacks label, control, and helper text  -  ideal for mobile-first layouts.
* **Horizontal fields:** Set `orientation="horizontal"` on `Field` to align the label and control side-by-side. Pair with `FieldContent` to keep descriptions aligned. With a `FieldContent` the row aligns to the top, and a `Checkbox` or `RadioGroupItem` drops a pixel to line up with the title.
* **Responsive fields:** Set `orientation="responsive"` for automatic column layouts inside container-aware parents. Apply `@container/field-group` classes on `FieldGroup` to switch orientations at specific breakpoints.

```tsx title="components/field-12.tsx"
// import from your project: import Demo from '@/components/field-12'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="w-full max-w-4xl">
      <form>
        <FieldSet>
          <FieldLegend>Profile</FieldLegend>
          <FieldDescription>Fill in your profile information.</FieldDescription>
          <FieldSeparator />
          <FieldGroup>
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <FieldDescription>Provide your full name for identification</FieldDescription>
              </FieldContent>
              <Input id="name" placeholder="Evil Rabbit" required />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel htmlFor="message">Message</FieldLabel>
                <FieldDescription>
                  You can write your message here. Keep it short, preferably under 100 characters.
                </FieldDescription>
              </FieldContent>
              <Textarea
                className="min-h-[100px] resize-none sm:min-w-[300px]"
                id="message"
                placeholder="Hello, world!"
                required
              />
            </Field>
            <FieldSeparator />
            <Field orientation="responsive">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
  )
}
```

## Validation and Errors

* Add `data-invalid` to `Field` to switch the entire block into an error state.
* Add `aria-invalid` on the input itself for assistive technologies.
* Render `FieldError` immediately after the control or inside `FieldContent` to keep error messages aligned with the field.

```tsx showLineNumbers /data-invalid/ /aria-invalid/
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" type="email" aria-invalid />
  <FieldError>Enter a valid email address.</FieldError>
</Field>
```

Pass `errors` to `FieldError` to show what a form library or your own rules report: one message as text, several as a list.

```tsx title="components/field-16.tsx"
// import from your project: import Demo from '@/components/field-16'
'use client'

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import * as React from 'react'

const rules = [
  { message: 'Use at least 8 characters.', test: (value: string) => value.length >= 8 },
  { message: 'Include a number.', test: (value: string) => /\d/.test(value) },
]

export default function Demo() {
  const [password, setPassword] = React.useState('duck')
  const errors = rules.filter((rule) => !rule.test(password))
  const invalid = errors.length > 0

  return (
    <div className="w-full max-w-md">
      <FieldGroup>
        <Field data-invalid={invalid}>
          <FieldLabel htmlFor="password-v3n">Password</FieldLabel>
          <Input
            aria-invalid={invalid}
            id="password-v3n"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <FieldDescription>Type to see which rules it still breaks.</FieldDescription>
          <FieldError errors={errors} />
        </Field>
      </FieldGroup>
    </div>
  )
}
```

## Accessibility

* `FieldSet` and `FieldLegend` keep related controls grouped for keyboard and assistive tech users.
* `Field` outputs `role="group"` so nested controls inherit labeling from `FieldLabel` and `FieldLegend` when combined.
* Apply `FieldSeparator` sparingly to ensure screen readers encounter clear section boundaries.

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and `Field` and the controls inside it follow. No `dir` prop or `rtl:` classes needed.

```tsx title="components/field-13.tsx"
// import from your project: import Demo from '@/components/field-13'
import { Button } from '@gentleduck/registry-ui/button'
import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <div className="w-full max-w-lg">
        <form>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>طريقة الدفع</FieldLegend>
              <FieldDescription>جميع المعاملات آمنة ومشفرة</FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="checkout-rtl-7j9-card-name-43j">الاسم على البطاقة</FieldLabel>
                  <Input id="checkout-rtl-7j9-card-name-43j" placeholder="أحمد خالد" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="checkout-rtl-7j9-card-number-uw1">رقم البطاقة</FieldLabel>
                  <Input id="checkout-rtl-7j9-card-number-uw1" placeholder="0000 0000 0000 0000" required />
                  <FieldDescription>أدخل رقم البطاقة المكوّن من 16 رقمًا</FieldDescription>
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="checkout-rtl-exp-month-ts6">الشهر</FieldLabel>
                    <Select defaultValue="">
                      <SelectTrigger id="checkout-rtl-exp-month-ts6">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">01</SelectItem>
                        <SelectItem value="02">02</SelectItem>
                        <SelectItem value="03">03</SelectItem>
                        <SelectItem value="04">04</SelectItem>
                        <SelectItem value="05">05</SelectItem>
                        <SelectItem value="06">06</SelectItem>
                        <SelectItem value="07">07</SelectItem>
                        <SelectItem value="08">08</SelectItem>
                        <SelectItem value="09">09</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="checkout-rtl-7j9-exp-year-f59">السنة</FieldLabel>
                    <Select defaultValue="">
                      <SelectTrigger id="checkout-rtl-7j9-exp-year-f59">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                        <SelectItem value="2027">2027</SelectItem>
                        <SelectItem value="2028">2028</SelectItem>
                        <SelectItem value="2029">2029</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="checkout-rtl-7j9-cvv">رمز الأمان</FieldLabel>
                    <Input id="checkout-rtl-7j9-cvv" placeholder="123" required />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>عنوان الفواتير</FieldLegend>
              <FieldDescription>عنوان الفواتير المرتبط بطريقة الدفع الخاصة بك</FieldDescription>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox defaultChecked id="checkout-rtl-7j9-same-as-shipping-wgm" />
                  <FieldLabel className="font-normal" htmlFor="checkout-rtl-7j9-same-as-shipping-wgm">
                    مطابق لعنوان الشحن
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="checkout-rtl-7j9-optional-comments">تعليقات</FieldLabel>
                  <Textarea
                    className="resize-none"
                    id="checkout-rtl-7j9-optional-comments"
                    placeholder="أضف أي تعليقات إضافية"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <Field orientation="horizontal">
              <Button type="submit">إرسال</Button>
              <Button type="button" variant="outline">
                إلغاء
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionField` and `MotionFieldGroup` for staggered `scaleIn` entrance animations (fade, scale, and blur) powered by [motion](https://motion.dev). Pass `index` to `MotionField` for stagger delay.

```tsx title="components/field-14.tsx"
// import from your project: import Demo from '@/components/field-14'
'use client'

import { MotionButton } from '@gentleduck/registry-ui/button'
import {
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  MotionField,
  MotionFieldGroup,
} from '@gentleduck/registry-ui/field'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <div className="w-full max-w-md">
      <form>
        <MotionFieldGroup>
          <FieldSet>
            <FieldLegend>Contact Info</FieldLegend>
            <FieldDescription>We will use this to reach you</FieldDescription>
            <MotionField index={0}>
              <FieldLabel htmlFor="motion-name">Full name</FieldLabel>
              <Input id="motion-name" placeholder="Jane Doe" />
            </MotionField>
            <MotionField index={1}>
              <FieldLabel htmlFor="motion-email">Email</FieldLabel>
              <Input id="motion-email" type="email" placeholder="jane@example.com" />
            </MotionField>
            <MotionField index={2}>
              <FieldLabel htmlFor="motion-phone">Phone</FieldLabel>
              <Input id="motion-phone" type="tel" placeholder="+1 (555) 000-0000" />
              <FieldDescription>Optional — for urgent inquiries only</FieldDescription>
            </MotionField>
          </FieldSet>
          <MotionField index={3} orientation="horizontal">
            <MotionButton type="submit">Submit</MotionButton>
            <MotionButton type="button" variant="outline">
              Cancel
            </MotionButton>
          </MotionField>
        </MotionFieldGroup>
      </form>
    </div>
  )
}
```

}>
  Requires the `motion` package. Use `MotionField` instead of `Field` and `MotionFieldGroup` instead of `FieldGroup`. All other sub-components (`FieldLabel`, `FieldDescription`, `FieldSet`, etc.) stay the same.

## API Reference

### FieldSet

Container that renders a semantic `fieldset` with spacing presets.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction override. Resolved via `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`). |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Fieldset content |
| `...props` | `React.HTMLProps<HTMLFieldSetElement>` | - | Additional props to spread to the fieldset element |

### FieldLegend

Legend element for a `FieldSet`. Switch to the `label` variant to align with label sizing.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'legend' \| 'label'` | `'legend'` | Visual variant controlling text size |
| `className` | `string` | `--` | Additional CSS classes |
| `...props` | `React.HTMLProps<HTMLLegendElement>` | - | Additional props to spread to the legend element |

### FieldGroup

Layout wrapper that stacks `Field` components and enables container queries for responsive orientations.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Field components |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### Field

The core wrapper for a single field. Provides orientation control, invalid state styling, and spacing.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `'vertical' \| 'horizontal' \| 'responsive'` | `'vertical'` | Layout orientation of the field |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Field content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div; set `data-invalid` to render in an error state |

### FieldContent

Flex column that groups control and descriptions when the label sits beside the control. Not required if you have no description.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Label, description, and control content |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### FieldLabel

Label styled for both direct inputs and nested `Field` children. Wrapped around a `Field`, it draws a choice card that shows as checked when the checkbox, switch or radio item inside it is.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Label text or nested field content |
| `...props` | `React.ComponentPropsWithoutRef<typeof Label>` | - | Additional props inherited from `Label`. |

### FieldTitle

Renders a title with label styling inside `FieldContent`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Title text |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### FieldDescription

Helper text in small muted type (`text-xs`) that balances long lines in horizontal layouts. Directly under a label or control in a vertical field it tucks up against it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `--` | Additional CSS classes |
| `children` | `React.ReactNode` | `--` | Description text |
| `...props` | `React.HTMLProps<HTMLParagraphElement>` | - | Additional props to spread to the p element |

### FieldSeparator

Visual divider to separate sections inside a `FieldGroup`. Accepts optional inline content.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `--` | Optional inline content displayed over the separator |
| `className` | `string` | `--` | Additional CSS classes |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

### FieldError

Accessible error container that accepts children or an `errors` array (e.g., from `react-hook-form`).

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `errors` | `Array<{ message?: string } \| undefined>` | `--` | Array of error objects from a form library |
| `children` | `React.ReactNode` | `--` | Custom error content (takes precedence over `errors`) |
| `className` | `string` | `--` | Additional CSS classes |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the content div |

Entries without a `message` are skipped. One message renders as plain text, several render as a list, and none renders nothing.

### MotionField

Same props as `Field` plus an optional `index` prop for stagger delay (50ms per index). Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.

### MotionFieldGroup

Same props as `FieldGroup`. Adds a `scaleIn` entrance animation (fade, scale, and blur) with a bouncy spring transition. Requires the `motion` package.

### MotionFieldError

Same props as `FieldError`. Adds a `scaleIn` entrance (fade, scale, and blur) with a bouncy spring transition and a 50ms delay. Requires the `motion` package.