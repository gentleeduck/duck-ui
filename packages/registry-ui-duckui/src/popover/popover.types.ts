import * as PopoverPrimitive from '@gentleduck/aria-feather/popover'
import { AnimPopoverVariants } from '@gentleduck/motion/anim'
import { VariantProps } from '@gentleduck/variants'

export type PopoverContentProps = React.ComponentPropsWithRef<typeof PopoverPrimitive.Content> &
  VariantProps<typeof AnimPopoverVariants> & {
    sideOffset?: number
    alignOffset?: number
  }
