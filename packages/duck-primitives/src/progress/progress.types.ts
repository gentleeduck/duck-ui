import type * as React from 'react'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace IProgress {
  export type IScoped<TProps> = TProps & { __scopeProgress?: Scope }

  export interface IContext {
    value: number | null
    max: number
    valueLabel: string | undefined
    onLabelIdChange(id: string | undefined): void
  }

  type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>
  type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>

  export interface IProps extends PrimitiveDivProps {
    value?: number | null | undefined
    /** The value an empty bar stands for. */
    min?: number
    max?: number
    getValueLabel?(value: number, max: number, min: number): string
  }

  export interface IIndicatorProps extends PrimitiveDivProps {}

  export interface ILabelProps extends PrimitiveSpanProps {}

  export interface IValueProps extends Omit<PrimitiveSpanProps, 'children'> {
    children?: React.ReactNode | ((valueLabel: string | undefined, value: number | null) => React.ReactNode)
  }
}
