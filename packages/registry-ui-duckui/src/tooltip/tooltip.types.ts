import { VariantProps } from '@gentleduck/variants'
import { Button } from '../button'
import { tooltipVariants } from './tooltip.constants'

export interface TooltipProps extends React.HTMLProps<HTMLDivElement> {
  /** If true, the tooltip will render its child element directly, inheriting its styles. */
  asChild?: boolean
  /** The delay in milliseconds before the tooltip is shown after hover or focus. */
  delayDuration?: number
  /** The offset distance in pixels between the tooltip and the trigger element. */
  sideOffset?: number
  /** The open state of the tooltip. */
  open?: boolean
}

export interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<typeof Button> {}

export interface TooltipContentProps extends React.HTMLProps<HTMLDivElement>, VariantProps<typeof tooltipVariants> {
  /** Determines whether an arrow should be rendered on the tooltip to point at the trigger element.*/
  showArrow?: boolean
}
