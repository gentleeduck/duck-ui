import type { Variants } from '@gentleduck/variants'
import { cva } from '@gentleduck/variants'

/** Checkbox/radio/switch input styling: indicator masks, checked state, LTR/RTL toggle positioning. */
export const checkersStylePattern = cva(
  `peer appearance-none relative p-2 size-[1em] flex items-center m-0
  border bg-border border-border checked:bg-primary checked:border-primary text-primary-foreground
  ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  disabled:cursor-not-allowed disabled:opacity-50
  after:absolute after:drop-shadow after:bg-current after:size-[1em] after:rounded-[inherit] after:block after:mask-type-alpha after:mask-contain
  after:opacity-0 checked:after:opacity-100 `,
  {
    defaultVariants: {
      indicatorState: 'default',
      type: 'checkbox',
    },
    variants: {
      indicatorState: {
        both: 'after:mask-[var(--svg-off)] checked:after:mask-[var(--svg-on)]',
        checkedIndicatorReady: 'checked:after:mask-[var(--svg-on)]',
        default: '',
        indicatorReady: 'after:mask-[var(--svg-off)]',
      },
      type: {
        checkbox: `
          justify-center rounded-sm
          after:rounded-none after:text-base
          after:translate-y-1/3 after:scale-0 after:rotate-[20deg]
          checked:after:translate-y-0 checked:after:scale-100 checked:after:rotate-45
          text-xs
            `,
        radio: `
          justify-center rounded-full after:text-[10px]
          after:scale-0 checked:after:scale-100
          `,
        switch: `
          justify-end rounded-full px-4.5 py-2.5
          ltr:after:translate-x-0 ltr:checked:after:translate-x-full
          rtl:after:translate-x-full rtl:checked:after:translate-x-0
          after:opacity-100
            `,
      },
    },
  },
)

export type CheckersStylePatternProps = Variants.VariantProps<typeof checkersStylePattern>
