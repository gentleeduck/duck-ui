import type * as React from 'react'
import type { Primitive } from '../primitive-elements'

export namespace IFocusScope {
  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>

  export interface IProps extends PrimitiveDivProps {
    loop?: boolean | undefined
    trapped?: boolean | undefined
    /** Nodes outside the scope's DOM, such as a nested layer's portalled content, that focus may move into. */
    branches?: readonly HTMLElement[] | undefined
    onMountAutoFocus?: ((event: Event) => void) | undefined
    onUnmountAutoFocus?: ((event: Event) => void) | undefined
  }

  export interface IBranchRegistry {
    add(node: HTMLElement): void
    remove(node: HTMLElement): void
  }
}
