import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'
import type { IRovingFocus } from '../roving-focus'

export namespace IToggleGroup {
  export type IScoped<TProps> = TProps & { __scopeToggleGroup?: Scope }

  export interface IContext {
    type: 'single' | 'multiple'
    value: string[]
    onItemActivate(value: string): void
    onItemDeactivate(value: string): void
    rovingFocus: boolean
    disabled: boolean
    deselectable: boolean
    dir: IDirection.Kind
  }

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>

  export interface IImpl extends PrimitiveDivProps {
    type: 'single' | 'multiple'
    rovingFocus?: boolean
    disabled?: boolean
    /** Lets the last item that is on be turned off. Defaults to `true`. */
    deselectable?: boolean
    orientation?: IRovingFocus.IGroupProps['orientation']
    dir?: IRovingFocus.IGroupProps['dir']
    loop?: IRovingFocus.IGroupProps['loop']
  }

  export interface ISingle extends IImpl {
    type: 'single'
    value?: string
    defaultValue?: string
    onValueChange?(value: string): void
  }

  export interface IMultiple extends IImpl {
    type: 'multiple'
    value?: string[]
    defaultValue?: string[]
    onValueChange?(value: string[]): void
  }

  export type IProps = ISingle | IMultiple

  export interface IItemProps extends Omit<PrimitiveButtonProps, 'children'> {
    value: string
    children?: React.ReactNode | ((pressed: boolean) => React.ReactNode)
  }
}
