import { cva } from '@gentleduck/variants'

export const AnimVariants = cva('', {
  variants: {
    blur: {
      default:
        // 'blur-xs starting:open:blur-xs open:blur-none',
        '',
    },
    overlay: {
      default:
        'backdrop:bg-black/50 backdrop:opacity-0 backdrop:transition-[inherit] backdrop:duration-[inherit] backdrop:ease-[inherit] open:backdrop:opacity-100 starting:open:backdrop:opacity-0',
      nothing: 'backdrop:opacity-0',
    },
    alive: {
      default: 'transition-all transition-discrete duration-[200ms,150ms] ease-(--duck-motion-ease)',
    },
    pseudo: {
      animate:
        ' [&:before,&:after]:transition-gpu [&:before,&:after]:duration-[inherit] [&:before,&:after]:ease-[inherit] [&:before,&:after]:will-change-[inherit]',
      default: '',
    },
    accelerated: {
      default: 'transform-gpu will-change-[opacity,transform,translate,blur] backdrop:will-change-[opacity,blur]',
    },
  },
  defaultVariants: {
    alive: 'default',
    blur: 'default',
    overlay: 'default',
    accelerated: 'default',
  },
})

export const AnimDialogVariants = cva(`border border-border bg-background rounded-lg shadow-sm outline-hidden p-6`, {
  variants: {
    animation: {
      default: 'scale-90 opacity-0 open:scale-100 starting:open:scale-90 open:opacity-100 starting:open:opacity-0',
      nothing: '',
    },
  },
  defaultVariants: {
    animation: 'default',
  },
})

export const AnimPopoverVariants = cva(
  `bg-popover text-popover-foreground inset-auto absolute p-4 w-fit m-(--sideOffset)
  [position-anchor:var(--position-anchor)] [position-visibility:anchors-visible]
  [position-try-fallbacks:flip-block,flip-inline,flip-block_flip-inline] [position-try-order:most-height,most-width,most-height_most-width] 
  `,
  {
    variants: {
      side: {
        top: `[position-area:block-start_var(--position-area-align)] origin-bottom `,
        bottom: `[position-area:block-end_var(--position-area-align)] origin-top`,
        left: `[position-area:start_var(--position-area-align)] origin-right`,
        right: `[position-area:end_var(--position-area-align)] origin-left`,
        inset: `[position-area:center] origin-center`,
      },
      align: {
        center: '[--position-area-align:span-all]',
        end: `[--position-area-align:span-start]`,
        start: `[--position-area-align:span-end]`,
        'out-start': `[--position-area-align-start]`,
        'out-end': `[--position-area-align-end]`,
        top: `[--position-area-align:block-start]`,
        bottom: `[--position-area-align:block-end]`,
        'out-top': `[--position-area-align:span-block-start]`,
        'out-bottom': `[--position-area-align:span-block-end]`,
      },
    },
    defaultVariants: {
      side: 'bottom',
      align: 'center',
    },
  },
)

export const AnimTooltipVariants = cva(`px-3 py-1.5 text-xs text-balance select-none rounded-sm shadow-xs`)

export const AnimDialogModalVariants = cva(`inset-1/2 -translate-1/2 rtl:translate-x-1/2 sm:max-w-lg w-full`)

export const AnimPopoverArrowVariants = cva(
  `overflow-visible after:border-background after:w-0 after:h-0 after:absolute after:[position-anchor:var(--position-anchor)] after:[po ition-area:inherit] 
`,
  {
    variants: {
      side: {
        top: `
            after:border-x-8 after:border-x-transparent after:border-t-10
            after:-bottom-2.5 
          `,
        bottom: `
            after:border-x-8 after:border-x-transparent after:border-b-10 
            after:-top-2.5 after:left-[50%] after:-translate-x-[50%]
        `,
        left: `after:border-y-8 after:border-y-transparent after:border-l-10
              after:-right-2.5 after:top-[50%] after:-translate-y-[50%]`,
        right: `
            after:border-y-8 after:border-y-transparent after:border-r-10
            after:-left-2.5 after:top-[50%] after:-translate-y-[50%]
            after:bg-red-600
        `,
      },
    },
    defaultVariants: {
      side: 'left',
    },
  },
)

export const AnimSheetVariants = cva(`duration-400 pointer-events-auto border-0 rounded-none`, {
  variants: {
    side: {
      top: `
          max-w-full w-full
          border-b
          rounded-b-lg
          -translate-y-full starting:open:-translate-y-full open:translate-y-0  
          bottom-auto
          `,
      bottom: `
          max-w-full w-full
          border-t
          rounded-t-lg
          translate-y-full starting:open:translate-y-full open:translate-y-0
          top-auto
        `,
      left: `
          max-h-screen h-screen
          border-e 
          rtl:translate-x-full rtl:starting:open:translate-x-full rtl:open:translate-x-0
          -translate-x-full starting:open:-translate-x-full open:translate-x-0
          rounded-e-lg
          end-auto
          `,
      right: `
          max-h-screen h-screen
          border-s 
          rounded-s-lg
          translate-x-full starting:open:translate-x-full open:translate-x-0
          rtl:-translate-x-full rtl:starting:open:-translate-x-full rtl:open:translate-x-0
          start-auto
        `,
    },
  },
  defaultVariants: {
    side: 'left',
  },
})

export const checkersStylePattern = cva(
  `appearance-none relative p-2 size-[1em] flex items-center rounded-full m-0
  border bg-border border-border checked:bg-primary checked:border-primary text-primary-foreground
  ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  disabled:cursor-not-allowed disabled:opacity-50 
  after:absolute after:drop-shadow after:bg-current after:size-[1em] after:rounded-[inherit] after:block after:mask-type-alpha after:mask-contain 
  after:opacity-0 checked:after:opacity-100 `,
  {
    variants: {
      type: {
        checkbox: `
          justify-center rounded p-2
          after:rounded-none after:text-base
          checked:after:translate-y-0 after:translate-y-1/3 text-xs
          
            `,
        radio: `
          justify-center p-2 after:text-[10px]
          after:scale-0 checked:after:scale-100 
          `,
        switch: `
          px-4 py-2 justify-end after:text-md
          px-4.5 py-2.5 
          checked:after:translate-x-full after:opacity-100
            `,
      },
      indicatorState: {
        default: '',
        indicatorReady: 'after:mask-[var(--svg-off)]',
        checkedIndicatorReady: 'checked:after:mask-[var(--svg-on)]',
        both: 'after:mask-[var(--svg-off)] checked:after:mask-[var(--svg-on)]',
      },
    },
    defaultVariants: {
      type: 'checkbox',
      indicatorState: 'default',
    },
  },
)
