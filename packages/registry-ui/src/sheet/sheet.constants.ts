import { cva } from '@gentleduck/variants'

export const sheetVariants = cva(
  'animation-duration-300 data-[state=closed]:animation-duration-200 fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg ease-(--gentleduck-motion-ease) data-[state=closed]:animate-out data-[state=open]:animate-in',
  {
    variants: {
      side: {
        top: 'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 max-h-dvh border-b',
        bottom:
          'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 max-h-dvh border-t',
        // In RTL, left and right mirror like the rest of the layout.
        left: 'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left rtl:data-[state=closed]:slide-out-to-right rtl:data-[state=open]:slide-in-from-right inset-y-0 start-0 h-full w-3/4 border-e sm:max-w-sm',
        right:
          'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right rtl:data-[state=closed]:slide-out-to-left rtl:data-[state=open]:slide-in-from-left inset-y-0 end-0 h-full w-3/4 border-s sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)
