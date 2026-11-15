import { cva } from '@gentleduck/variants'

/**
 * Per-level Tailwind class strings keyed by the semantic typography variant.
 * Hoisted here so both `typography.tsx` (static) and `motion-typography.tsx`
 * (animated) consume a single source of truth.
 */
export const typographyVariants = cva('', {
  variants: {
    level: {
      h1: 'scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0',
      h3: 'scroll-m-20 font-semibold text-2xl tracking-tight',
      h4: 'scroll-m-20 font-semibold text-xl tracking-tight',
      p: 'mt-6 leading-7 first:mt-0',
      blockquote: 'mt-6 border-s-2 ps-6 italic rtl:not-italic',
      list: 'my-6 ms-6 list-disc [&>li]:mt-2',
      inlineCode: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm',
      lead: 'text-muted-foreground text-xl',
      large: 'font-semibold text-lg',
      small: 'font-medium text-sm leading-none',
      muted: 'text-muted-foreground text-sm',
      tableWrapper: 'my-6 w-full overflow-y-auto',
      table: 'w-full',
      tr: 'm-0 border-t p-0 even:bg-muted',
      th: 'border px-4 py-2 text-start font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
      td: 'border px-4 py-2 text-start [&[align=center]]:text-center [&[align=right]]:text-right',
    },
  },
})
