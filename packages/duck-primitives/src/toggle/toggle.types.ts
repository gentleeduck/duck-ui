import type * as React from 'react'
import type { Primitive } from '../primitive-elements'

export namespace IToggle {
  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>

  export interface IProps extends Omit<PrimitiveButtonProps, 'children'> {
    pressed?: boolean
    defaultPressed?: boolean
    onPressedChange?(pressed: boolean): void
    children?: React.ReactNode | ((pressed: boolean) => React.ReactNode)
  }
}
