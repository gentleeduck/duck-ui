import { DialogCommonType, DialogContentProps } from '../dialog/dialog.types'

export interface PopoverProps extends Omit<DialogCommonType, 'id' | 'closeButton'> {
  hoverable: boolean
  skipDelayDuration: number
  delayDuration: number
}

export interface PopoverContentProps extends Partial<DialogContentProps> {
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inset'
  align?: 'start' | 'end' | 'center'
  alignOffset?: number
  sideOffset?: number
}

export interface PopoverContextType extends PopoverProps, DialogCommonType {
  ref: React.RefObject<HTMLDialogElement | null>
  triggerRef: React.RefObject<HTMLDivElement | HTMLButtonElement | HTMLElement | null>
}

export interface PopoverRootProps extends Partial<Omit<PopoverProps, 'id'>>, DialogCommonType {
  children?: React.ReactNode
}
