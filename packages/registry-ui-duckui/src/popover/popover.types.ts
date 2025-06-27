import * as PopoverPrimitive from '@gentleduck/aria-feather/popover'
import { AnimPopoverVariants } from '@gentleduck/motion/anim'
import { VariantProps } from '@gentleduck/variants'

export type PopoverContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  'side' | 'align'
> &
  PopoverVariantProps & {
    sideOffset?: number
    alignOffset?: number
  }

type AllVariants = VariantProps<typeof AnimPopoverVariants>

type PopoverVariantProps =
  | (Omit<AllVariants, 'side' | 'align'> & {
      side: 'top' | 'bottom'
      align: Exclude<AllVariants['align'], 'out-start' | 'out-end' | 'top' | 'bottom'>
    })
  | (Omit<AllVariants, 'side' | 'align'> & {
      side: 'left' | 'right'
      align: Exclude<AllVariants['align'], 'out-top' | 'out-bottom' | 'start' | 'end'>
    })
