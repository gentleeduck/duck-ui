import type * as React from 'react'
import type { Primitive } from '../primitive-elements'

export namespace IPortal {
  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>

  export interface IProps extends PrimitiveDivProps {
    /** The element to portal into, or a ref to it. Defaults to document.body. */
    container?: Element | DocumentFragment | React.RefObject<Element | DocumentFragment | null> | null | undefined
  }
}
