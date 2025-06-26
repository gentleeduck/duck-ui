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
        'backdrop:transition-[inherit] backdrop:duration-[inherit] backdrop:ease-[inherit] backdrop:bg-black/50  backdrop:opacity-0 starting:open:backdrop:opacity-0 open:backdrop:opacity-100',
      nothing: 'backdrop:opacity-0',
    },
    alive: {
      default: 'transition-all transition-discrete ease-(--duck-motion-ease) duration-[200ms,150ms]',
    },
    accelerated: {
      default: 'will-change-[opacity,transform,translate,blur] backdrop:will-change-[opacity,blur] transform-gpu',
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
      default: 'opacity-0 scale-90 starting:open:opacity-0 starting:open:scale-90 open:opacity-100 open:scale-100',
      nothing: '',
    },
  },
  defaultVariants: {
    animation: 'default',
  },
})

export const AnimPopoverVariants = cva(
  `bg-popover text-popover-foreground inset-auto absolute max-h-none p-4 w-fit
  [position-anchor:var(--position-anchor)] m-(--sideOffset)
  [position-try:flip-block,flip-inline,flip-start] [position-visibility:anchors-visible]`,
  {
    variants: {
      side: {
        top: `
          [position-area:_block-start_var(--position-area-align)] origin-bottom
        `,
        bottom: `
          [position-area:_block-end_var(--position-area-align)] origin-top
        `,
        left: `
          [position-area:_inline-start_var(--position-area-align)] origin-right
        `,
        right: `
          [position-area:_inline-end_var(--position-area-align)] origin-left
        `,
      },
      align: {
        default: '[--position-area-align:span-all]',
        end: `
				[--position-area-align:inline-start] 
			`,
        start: `
				[--position-area-align:inline-end] 
			`,
        'span-end': `
				[--position-area-align:span-inline-start] 
			`,
        'span-start': `
				[--position-area-align:span-inline-end] 
			`,
        top: `
				[--position-area-align:block-start] 
			`,
        bottom: `
				[--position-area-align:block-end] 
			`,
        'span-top': `
				[--position-area-align:span-block-start] 
			`,
        'span-bottom': `
				[--position-area-align:span-block-end] 
			`,
        center: `
			[position-area:_center] origin-center
		`,
      },
    },
    defaultVariants: {
      side: 'bottom',
      align: 'default',
    },
  },
)

export const AnimTooltipVariants = cva(
  `px-3 py-1.5 !text-primary-foreground bg-primary border-primary text-xs text-balance select-none`,
)

export const AnimDialogModalVariants = cva(`inset-1/2 -translate-1/2 rtl:translate-x-1/2 sm:max-w-lg w-full`)

// export const AnimPopoverArrowVariants = cva(
//   `after:-translate-x-7 overflow-visible after:border-[inherit] after:w-0 after:h-0 after:absolute after:border-[inherit] after:[position-anchor:var(--position-anchor)] after:[position-area:inherit]`,
//   {
//     variants: {
//       side: {
//         top: `
//             after:border-x-8 after:border-x-transparent after:border-t-10
//           `,
//         bottom: `
//             after:border-x-8 after:border-x-transparent after:border-b-10
//         `,
//         left: `
//             after:border-y-8 after:border-y-transparent after:border-r-10
//             `,
//         right: `
//             after:border-y-8 after:border-y-transparent after:border-l-10
//         `,
//       },
//     },
//     defaultVariants: {
//       side: 'left',
//     },
//   },
// )

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
