export interface DialogContextType {
  open: boolean
  ref: React.RefObject<HTMLDialogElement | null>
  onOpenChange: (open: boolean) => void
  id: string
  triggerRef: React.RefObject<HTMLElement | HTMLButtonElement |  null>
}

export type DialogProps = {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  id?: string
  openProp?: boolean 
  lockScroll?: boolean 
  hoverable?: boolean
  mode?: "dialog" | "popover"
}