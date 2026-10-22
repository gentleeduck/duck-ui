import type * as React from 'react'
import type { IArrow } from '../arrow'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

declare module '@floating-ui/react-dom' {
  interface MiddlewareData {
    transformOrigin?: { x: string; y: string }
  }
}

export namespace IPopper {
  export type IScoped<TProps> = TProps & { __scopePopper?: Scope }

  export type Side = 'top' | 'right' | 'bottom' | 'left'
  export type Align = 'start' | 'center' | 'end'
  export type Boundary = Element | null
  export type CollisionPadding = number | Partial<Record<Side, number>>

  export interface IMeasurable {
    getBoundingClientRect(): DOMRect
  }

  export interface IContext {
    anchor: IMeasurable | null
    onAnchorChange(anchor: IMeasurable | null): void
  }

  export interface IContentContext {
    placedSide: Side
    onArrowChange(arrow: HTMLSpanElement | null): void
    arrowX?: number | undefined
    arrowY?: number | undefined
    shouldHideArrow: boolean
  }

  export interface IProps {
    children?: React.ReactNode
    /** The element to place against, for a component that already holds it, in place of a `PopperAnchor`. */
    anchor?: IMeasurable | null
  }

  type PrimitiveDivProps = React.ComponentPropsWithRef<typeof Primitive.div>

  export interface IAnchorProps extends PrimitiveDivProps {
    virtualRef?: React.RefObject<IMeasurable | null>
  }

  export interface IArrowProps extends IArrow.IProps {}

  export interface IContentProps extends PrimitiveDivProps {
    side?: Side | undefined
    sideOffset?: number | undefined
    align?: Align | undefined
    alignOffset?: number | undefined
    arrowPadding?: number | undefined
    avoidCollisions?: boolean | undefined
    collisionBoundary?: Boundary | Boundary[] | undefined
    collisionPadding?: CollisionPadding | undefined
    sticky?: 'partial' | 'always' | undefined
    hideWhenDetached?: boolean | undefined
    updatePositionStrategy?: 'optimized' | 'always' | undefined
    /** Off for content that closes when its anchor scrolls, which has no scroll to follow. */
    updateOnScroll?: boolean | undefined
    onPlaced?: (() => void) | undefined
    /** Lets a shift also correct along the side's own axis, such as vertically for a top or bottom placement. */
    shiftCrossAxis?: boolean | undefined
  }
}
