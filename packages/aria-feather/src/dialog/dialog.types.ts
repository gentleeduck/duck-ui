import { AnimDialogVariants, AnimVariants } from '@gentleduck/motion/anim'
import { VariantProps } from '@gentleduck/variants'
export interface DialogCommonType {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  lockScroll?: boolean
  modal?: boolean
  closeButton?: boolean
  id?: string
}

export interface DialogContentProps
  extends React.HTMLProps<HTMLDialogElement>,
    VariantProps<typeof AnimVariants>,
    VariantProps<typeof AnimDialogVariants> {
  renderOnce?: boolean
  closedby?: 'any' | 'closerequest' | 'none'
  dialogClose: React.FC<
    React.HTMLProps<HTMLButtonElement> & {
      size?: number
    }
  >
}

export interface DialogContextType extends DialogCommonType {
  ref: React.RefObject<HTMLDialogElement | null>
  triggerRef: React.RefObject<HTMLElement | HTMLDivElement | HTMLButtonElement | null>
}

export interface DialogProps extends Omit<DialogCommonType, 'id'> {
  children?: React.ReactNode
}
