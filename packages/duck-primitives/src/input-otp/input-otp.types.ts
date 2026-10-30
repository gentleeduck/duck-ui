import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace IInputOTP {
  export type IScoped<TProps> = TProps & { __scopeInputOTP?: Scope }

  export interface IContext {
    value: string
    name?: string | undefined
    disabled?: boolean | undefined
    readOnly?: boolean | undefined
    type: 'text' | 'password'
    numeric: boolean
  }

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveInputProps = React.ComponentPropsWithoutRef<typeof Primitive.input>

  export interface IProps extends Omit<PrimitiveDivProps, 'onChange' | 'defaultValue'> {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    /** Called with the code once every slot is filled. */
    onComplete?: (value: string) => void
    /** Submits the form the slots sit in once every slot is filled. */
    autoSubmit?: boolean
    pattern?: RegExp
    dir?: IDirection.Kind
    maxLength?: number
    disabled?: boolean
    readOnly?: boolean
    type?: 'text' | 'password'
    /** The name `HiddenInput` submits the code under. */
    name?: string
  }

  export interface IGroupProps extends PrimitiveDivProps {}

  export interface ISeparatorProps extends PrimitiveDivProps {}

  export interface ISlotProps extends PrimitiveInputProps {}

  export interface IHiddenInputProps
    extends Omit<React.ComponentPropsWithoutRef<'input'>, 'value' | 'defaultValue' | 'type'> {}
}
