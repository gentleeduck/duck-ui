import type * as React from 'react'
import type { IDirection } from '../direction'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'
import type { IRovingFocus } from '../roving-focus'

export namespace IRadioGroup {
  export type IScoped<TProps> = TProps & { __scopeRadioGroup?: Scope }

  export interface IContext {
    value: string | null
    onValueChange(value: string): void
    disabled: boolean
    readOnly: boolean
    required: boolean
    name: string | undefined
    form: string | undefined
    groupRef: React.RefObject<HTMLDivElement | null>
    isNavigationKeyPressedRef: React.RefObject<boolean>
    silentValueRef: React.RefObject<string | null | undefined>
  }

  export interface IItemContext {
    value: string
    checked: boolean
    disabled: boolean
  }

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>
  type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>
  type PrimitiveInputProps = React.ComponentPropsWithoutRef<typeof Primitive.input>

  export interface IProps extends PrimitiveDivProps {
    value?: string | null
    defaultValue?: string
    onValueChange?(value: string | null): void
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    name?: string
    form?: string
    dir?: IDirection.Kind
    orientation?: IRovingFocus.IGroupProps['orientation']
    loop?: IRovingFocus.IGroupProps['loop']
  }

  export interface IItemProviderProps {
    value: string
    disabled?: boolean
    children?: React.ReactNode
  }

  export interface IItemTriggerProps extends Omit<PrimitiveButtonProps, 'disabled' | 'value'> {
    textValue?: string
  }

  export interface IItemProps extends IItemTriggerProps {
    value: string
    disabled?: boolean
  }

  export interface IIndicatorProps extends PrimitiveSpanProps {
    forceMount?: true
  }

  export interface IItemBubbleInputProps extends PrimitiveInputProps {}
}
