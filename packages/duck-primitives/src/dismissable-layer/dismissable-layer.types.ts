import type * as React from 'react'
import type { Primitive } from '../primitive-elements'

export namespace IDismissableLayer {
  export type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>
  export type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>

  export interface IOptions {
    disableOutsidePointerEvents?: boolean | undefined
    /** Waits for the click after a primary pointer down outside, so code that stops a later event cancels the dismissal. */
    deferPointerDownOutside?: boolean | undefined
    onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined
    onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined
    onFocusOutside?: ((event: FocusOutsideEvent) => void) | undefined
    onInteractOutside?: ((event: PointerDownOutsideEvent | FocusOutsideEvent) => void) | undefined
    onDismiss?: (() => void) | undefined
  }

  export interface IProps extends PrimitiveDivProps, IOptions {}

  export type IHookProps<E extends HTMLElement> = IOptions &
    Pick<React.HTMLAttributes<E>, 'style' | 'onFocusCapture' | 'onBlurCapture' | 'onPointerDownCapture'>

  export type IHookResult<E extends HTMLElement> = Required<
    Pick<React.HTMLAttributes<E>, 'onFocusCapture' | 'onBlurCapture' | 'onPointerDownCapture'>
  > & { ref: React.RefCallback<E> }

  export interface IBranchProps extends PrimitiveDivProps {}
}
