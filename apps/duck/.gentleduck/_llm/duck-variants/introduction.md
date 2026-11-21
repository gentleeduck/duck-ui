```tsx title="components/cva-1.tsx"
// import from your project: import Demo from '@/components/cva-1'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'
import type { Variants } from '@gentleduck/variants'
import { cva } from '@gentleduck/variants'
import React from 'react'

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",

  {
    defaultVariants: {
      border: 'default',
      size: 'default',
      variant: 'default',
    },
    variants: {
      border: {
        default: '',
        destructive: 'border border-destructive/40 bg-destructive/40 hover:border-destructive hover:bg-destructive/65',
        primary: 'border border-border/40 hover:border-border/80',
        secondary: 'border border-secondary/40 bg-secondary/40 hover:border-secondary hover:bg-secondary/65',
        warning: 'border border-warning/40 bg-warning/40 hover:border-warning hover:bg-warning/65',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        icon: 'size-9',
        'icon-lg': 'size-10',
        'icon-sm': 'size-8',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
      },
      variant: {
        dashed:
          'border border-input border-dashed bg-background text-accent-foreground shadow-xs hover:bg-accent/50 hover:text-accent-foreground',
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        destructive: 'bg-destructive/90 text-destructive-foreground shadow-xs hover:bg-destructive/70',
        expandIcon: 'group relative bg-primary text-primary-foreground hover:bg-primary/90',
        ghost: 'text-accent-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        nothing: '',
        outline:
          'border border-input bg-background text-accent-foreground shadow-xs hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        warning: 'bg-warning/90 text-warning-foreground shadow-xs hover:bg-warning/70',
      },
    },
  },
)

type ButtonVariantProps = Variants.VariantProps<typeof buttonVariants>

export default function Demo() {
  const [variant, setVariant] = React.useState<ButtonVariantProps['variant']>('default')
  const [size, setSize] = React.useState<ButtonVariantProps['size']>('default')
  const [border, setBorder] = React.useState<ButtonVariantProps['border']>('default')

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 p-6">
      <div className="absolute start-0 top-0 flex flex-col gap-4">
        {/* Variant Select */}
        <Select onValueChange={(val) => setVariant(val as ButtonVariantProps['variant'])}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choose Variant" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Variant</SelectLabel>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="link">Link</SelectItem>
              <SelectItem value="nothing">Nothing</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Size Select */}
        <Select onValueChange={(val) => setSize(val as ButtonVariantProps['size'])}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choose Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Size</SelectLabel>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="sm">SM</SelectItem>
              <SelectItem value="lg">LG</SelectItem>
              <SelectItem value="icon">Icon</SelectItem>
              <SelectItem value="icon-sm">Icon SM</SelectItem>
              <SelectItem value="icon-lg">Icon LG</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Border Select */}
        <Select onValueChange={(val) => setBorder(val as ButtonVariantProps['border'])}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choose Border" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Border</SelectLabel>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Preview Button */}
      <Button border={border} size={size} variant={variant}>
        Button
      </Button>
    </div>
  )
}
```

## Philosophy

gentleduck/variants maps component variant props (size, color, state) to CSS classes with compile-time type checks. It replaces ad-hoc conditional class logic with a declarative schema that catches invalid combinations before the build runs.

***

## Installation

```bash
npm install @gentleduck/variants
```

## Usage

```tsx
import { cva } from '@gentleduck/variants'

const button = cva('btn', {
  variants: {
    size: { sm: 'px-2 py-1 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3' },
    tone: { default: 'bg-blue-500 text-white', subtle: 'bg-gray-100 text-gray-800' }
  },
  defaultVariants: { size: 'md', tone: 'default' }
})

// Use it in JSX
<button className={button({ size: 'lg' })}>Click</button>
```

The output `className` is deduplicated and deterministic. Repeated calls with identical props are memoized.

***

## Core concepts

* **base** - classes always applied.
* **variants** - named axes of variation, such as `size` or `tone`.
* **defaultVariants** - values used when a prop is omitted.
* **compoundVariants** - classes added when multiple variant selections match.
* **ClassValue** - accepts strings, arrays, objects, and nested combinations.
* **Memoization** - results are cached by a deterministic key.

***

## How it works

## API reference

```ts
// Create a factory
const fn = cva(baseOrOptions, maybeOptions?)

// Call it to get a class string
fn(props?) // returns string
```

**Important types:** `Variants.VariantProps<typeof fn>`, `Variants.Props<TVariants, TDefaults>`,
`Variants.CompoundConditions<TVariants>`, `Variants.ClassValue`.

For complete signatures and the TypeScript definitions, see the Types
Reference section at the bottom.

***

## Examples

### 1) Button component

```tsx
import { cva, type Variants } from '@gentleduck/variants'
import { cn } from '@/lib/utils'

const buttonVariants = cva('inline-flex items-center justify-center rounded', {
  variants: {
    variant: {
      default: 'bg-primary text-white hover:bg-primary/90',
      ghost: 'bg-transparent hover:bg-accent'
    },
    size: { sm: 'h-8 px-3', md: 'h-10 px-4', lg: 'h-12 px-6' }
  },
  defaultVariants: { variant: 'default', size: 'md' }
})

type ButtonProps = Variants.VariantProps<typeof buttonVariants> & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
```

### 2) Compound variants for a card

```ts
const card = cva('rounded border p-4', {
  variants: {
    tone: { default: 'bg-white', success: 'bg-green-50', danger: 'bg-red-50' },
    size: { md: 'p-4', lg: 'p-6' },
    elevated: { true: 'shadow-lg', false: 'shadow-none' }
  },
  compoundVariants: [
    { tone: 'danger', elevated: true, className: 'ring-1 ring-red-200' },
    { size: 'lg', tone: ['default', 'success'], className: 'font-semibold' }
  ]
})
```

### 3) Passing conditional runtime classes

```tsx
const classes = card({ tone: 'success', className: [{ 'animate-pulse': isLoading }, custom] })
```

***

## Benchmarks

Real bundle size and runtime performance compared to class-variance-authority, tailwind-variants, and clsx:

Run `bun run benchmark` in `packages/duck-variants` to regenerate. Data in `public/benchmarks/results.json`.

***

## Best practices

* Use `defaultVariants` for the common case to reduce caller verbosity.
* Use `compoundVariants` to encode rules that would otherwise repeat across components.
* Group classes with arrays for clearer organization in large variant maps.
* Pass runtime state via `className` as an object or array (`{ 'is-loading': isLoading }`).
* Results are memoized, so calling the CVA function inside list renderers is safe.

***

## Troubleshooting & FAQ

**Q: Why aren't my compoundVariants applying?**

A: Ensure the compound object keys exactly match your variant names and that
values are either the exact allowed value or an array of allowed values.
Also confirm you did not pass `'unset'` (used to explicitly disable variant
application).

**Q: My classes are out of order or duplicated.**

A: The library deduplicates tokens and preserves the first-seen ordering where
possible. If ordering matters (rare), restructure base vs variant classes so
base-critical tokens appear first.

**Q: How do I completely disable a variant's default?**

A: Pass the literal string `'unset'` for that variant: e.g.
`button({ size: 'unset' })` will skip size classes.

***

## Migration from class-variance-authority

* The API is close enough that most simple uses are drop-in.
* Type inference is stricter; some loose usages may need small adjustments.
* Memoization behavior differs. Test hot paths if you relied on CVA internals.

***

## Types reference

All types are exported under the `Variants` namespace from `@gentleduck/variants`.

### 1. Variant Params (`Variants.VariantParams`)

Maps each variant key to a single selected value, `Unset` to explicitly skip it, or `null` to
clear a default. Arrays are **not** accepted here - passing one silently stringifies to
`"a,b"` and matches nothing; use `CompoundConditions` below for "match any of these".

```tsx title="variants.types.ts"
export type VariantParams<TVariants extends VariantDefinitions> = {
  readonly [K in keyof TVariants]?: keyof TVariants[K] | Unset | null
}
```

### 2. Compound Conditions (`Variants.CompoundConditions`)

Conditions for matching a `compoundVariants` entry. Unlike `VariantParams`, a value here
**may** be a `ReadonlyArray` of options, meaning "match any of these":

```tsx title="variants.types.ts"
export type CompoundConditions<TVariants extends VariantDefinitions> = {
  readonly [K in keyof TVariants]?: keyof TVariants[K] | ReadonlyArray<keyof TVariants[K]> | Unset | null
}
```

This is what powers `{ size: 'lg', tone: ['default', 'success'], className: '...' }` in the
compound-variants example above.

### 3. CVA Options (`Variants.Options`)

Options for creating a CVA function, without the `base` classes.

| Field | Description |
| --- | --- |
| `variants` | Base mapping of variants -> classes. |
| `defaultVariants` | Defaults applied when no value is passed. |
| `compoundVariants` | Conditional styles that apply when multiple variants match; conditions use `CompoundConditions`, so array values are allowed here even though they are not in `defaultVariants`. |

```tsx title="variants.types.ts"
export type Options<TVariants extends VariantDefinitions> = {
  readonly variants?: TVariants
  readonly defaultVariants?: VariantParams<TVariants>
  readonly compoundVariants?: ReadonlyArray<
    CompoundConditions<TVariants> & {
      readonly class?: ClassValue
      readonly className?: ClassValue
    }
  >
}
```

### 4. CVA Config (`Variants.Config`)

Full configuration accepted by `cva()`: `Options` plus optional `base` classes.

```tsx title="variants.types.ts"
export type Config<TVariants extends VariantDefinitions> = Options<TVariants> & {
  readonly base?: ClassValue
}
```

### 5. CVA Props (`Variants.Props`)

Props that a **CVA-generated function** accepts: one prop per variant key, plus optional
`class`/`className` overrides. A second type parameter, `TDefaults`, controls which variant
keys are optional - a key present in `TDefaults` becomes an optional prop, and a key with no
default becomes a **required** prop. This is the compile-time check the Philosophy section
above refers to: omitting a non-defaulted variant is a type error, not a silent fallback.

```tsx title="variants.types.ts"
export type Props<
  TVariants extends VariantDefinitions,
  TDefaults extends VariantParams<TVariants> | undefined = undefined,
> = {
  readonly [K in Exclude<keyof TVariants, DefaultedKeys<TVariants, TDefaults>>]: keyof TVariants[K] | Unset | null
} & {
  readonly [K in Extract<DefaultedKeys<TVariants, TDefaults>, keyof TVariants>]?: keyof TVariants[K] | Unset | null
} & {
  readonly className?: ClassValue
  readonly class?: ClassValue
}
```

### 6. Variant Props (`Variants.VariantProps`)

Utility type to **extract only the variant-related props** from a CVA function, omitting `class` and `className`.

```tsx title="variants.types.ts"
export type VariantProps<T> = T extends (props?: infer P) => string
  ? Omit<NonNullable<P>, 'class' | 'className'>
  : never
```

### 7. Class Utility Types

Helper types that define the **shape of class names**:

| Type | Purpose |
| --- | --- |
| `Variants.ClassDictionary` | Conditional `{ 'class': boolean \| null \| undefined }`. Readonly. |
| `Variants.ClassArray` | Readonly nested arrays of class values. |
| `Variants.ClassValue` | Union of everything accepted as a class. |
| `Variants.ClassPrimitive` | Primitive scalar values (string, number, bigint, boolean, null, undefined). |

```tsx title="variants.types.ts"
export type ClassPrimitive = string | number | bigint | boolean | null | undefined

export type ClassDictionary = Readonly<Record<string, boolean | null | undefined>>

export type ClassArray = ReadonlyArray<ClassValue>

export type ClassValue = ClassPrimitive | ClassDictionary | ClassArray
```