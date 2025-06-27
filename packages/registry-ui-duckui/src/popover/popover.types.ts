import * as PopoverPrimitive from '@gentleduck/aria-feather/popover'
import { AnimPopoverVariants } from '@gentleduck/motion/anim'
import { VariantProps } from '@gentleduck/variants'

export type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> &
  PopoverVariantProps & {
    sideOffset?: number | string
  }

type AllVariants = VariantProps<typeof AnimPopoverVariants>

type PopoverVariantProps =
  | (Omit<AllVariants, 'side' | 'align'> & {
      side: 'top' | 'bottom'
      align: Exclude<AllVariants['align'], 'out-start' | 'out-end'>
    })
  | (Omit<AllVariants, 'side' | 'align'> & {
      side: 'left' | 'right'
      align: Exclude<AllVariants['align'], 'out-top' | 'out-bottom'>
    })
