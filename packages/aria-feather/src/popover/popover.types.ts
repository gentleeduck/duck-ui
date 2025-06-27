import { DialogCommonType, DialogContentProps } from '../dialog/dialog.types'

export interface PopoverProps extends DialogCommonType {
  hoverable: boolean
  skipDelayDuration: number
  delayDuration: number
  openProp?: boolean
}

export interface PopoverContentProps extends DialogContentProps {}

export interface PopoverContextType extends PopoverProps {
  ref: React.RefObject<HTMLDialogElement | null>
  triggerRef: React.RefObject<HTMLElement | HTMLDivElement | HTMLButtonElement | null>
}

export interface PopoverRootProps extends Omit<PopoverProps, 'id'> {
  children?: React.ReactNode
}
