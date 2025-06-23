import { DrawerDirection } from './src/types'

export interface DrawerContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
  shouldScaleBackground: boolean
  setBackgroundColorOnScale: boolean
  noBodyStyles: boolean
  direction: 'top' | 'bottom' | 'left' | 'right'
  disablePreventScroll: boolean
  ref: React.RefObject<HTMLDialogElement | null>
}

export type DrawerProps = {
  children: React.ReactNode
} & Partial<Omit<DrawerContextType, 'ref'>>

export interface UseDrawerDragProps {
  ref: React.RefObject<HTMLDialogElement>
  holdUpThreshold?: number
  onOpenChange?: (open: boolean) => void
}

export interface UseDrawerDragReturn {
  isDragging: boolean
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void
  handleTouchEnd: (e: React.TouchEvent<HTMLDivElement>) => void
}

export interface UseDrawerDragProps {
  // ref: React.RefObject<HTMLElement>
  overlayRef?: React.RefObject<HTMLElement>
  direction?: DrawerDirection
  dismissible?: boolean
  snapPoints?: number[]
  holdUpThreshold?: number

  /* Callbacks / helpers from context */
  closeDrawer?: () => void
  resetDrawer?: () => void
  onDragSnapPoints?: (data: { draggedDistance: number }) => void
  onReleaseSnapPoints?: (args: {
    draggedDistance: number
    velocity: number
    closeDrawer: () => void
    dismissible: boolean
  }) => void
  onOpenChange?: (o: boolean) => void
}

export interface UseDrawerDragReturn {
  isDragging: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: (e: React.PointerEvent) => void
  onPointerOut: (e: React.PointerEvent) => void
  onContextMenu: (e: React.PointerEvent) => void
}
