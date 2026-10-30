import type * as React from 'react'
import type { IDirection } from '../direction'
import type { useSize } from '../hooks/use-size'
import type { Scope } from '../libs/create-context'
import type { Primitive } from '../primitive-elements'

export namespace ISlider {
  export type IScoped<TProps> = TProps & { __scopeSlider?: Scope }

  export type ThumbElement = React.ComponentRef<typeof Primitive.span>
  export type Side = 'top' | 'right' | 'bottom' | 'left'
  export type SlideDirection = 'from-left' | 'from-right' | 'from-bottom' | 'from-top'

  export interface IContext {
    name: string | undefined
    disabled: boolean | undefined
    min: number
    max: number
    values: number[]
    valueIndexToChangeRef: React.RefObject<number>
    thumbs: Set<ThumbElement>
    orientation: IProps['orientation']
    dir: IDirection.Kind
    form: string | undefined
    userRequestedValues: number[] | null
  }

  export interface IThumbContext {
    value: number | undefined
    name: string | undefined
    form: string | undefined
    isFormControl: boolean
    index: number
    percent: number
    size: ReturnType<typeof useSize>
    onThumbChange(thumb: ThumbElement | null): void
  }

  export interface IOrientationContext {
    startEdge: Side
    endEdge: Side
    size: keyof NonNullable<ReturnType<typeof useSize>>
    direction: number
  }

  type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>
  type PrimitiveInputProps = React.ComponentPropsWithoutRef<typeof Primitive.input>

  export interface IOrientationPrivateProps {
    min: number
    max: number
    inverted: boolean
    onSlideStart?: ((value: number) => void) | undefined
    onSlideMove?: ((value: number) => void) | undefined
    onSlideEnd?: (() => void) | undefined
    onHomeKeyDown(event: React.KeyboardEvent): void
    onEndKeyDown(event: React.KeyboardEvent): void
    onStepKeyDown(step: { event: React.KeyboardEvent; direction: number }): void
  }

  export interface IImplPrivateProps {
    onSlideStart(event: React.PointerEvent): void
    onSlideMove(event: React.PointerEvent): void
    onSlideEnd(event: React.PointerEvent): void
    onHomeKeyDown(event: React.KeyboardEvent): void
    onEndKeyDown(event: React.KeyboardEvent): void
    onStepKeyDown(event: React.KeyboardEvent): void
  }

  export interface IImplProps extends PrimitiveSpanProps, IImplPrivateProps {}

  export interface IOrientationProps extends Omit<IImplProps, keyof IImplPrivateProps>, IOrientationPrivateProps {}

  export interface IHorizontalProps extends IOrientationProps {
    dir?: IDirection.Kind | undefined
    'data-disabled'?: string | undefined
  }

  export interface IVerticalProps extends IOrientationProps {}

  export interface IProps
    extends Omit<IHorizontalProps | IVerticalProps, keyof IOrientationPrivateProps | 'defaultValue'> {
    name?: string
    disabled?: boolean
    orientation?: React.AriaAttributes['aria-orientation']
    dir?: IDirection.Kind
    min?: number
    max?: number
    step?: number
    /** How far Page Up, Page Down and Shift with an arrow key move a thumb. Ten steps when unset. */
    largeStep?: number
    minStepsBetweenThumbs?: number
    preserveThumbOrder?: boolean
    value?: number[]
    defaultValue?: number[]
    onValueChange?(value: number[]): void
    onValueCommit?(value: number[]): void
    inverted?: boolean
    form?: string
  }

  export interface IRangeProps extends PrimitiveSpanProps {}
  export interface IValueProps extends Omit<PrimitiveSpanProps, 'children'> {
    children?: React.ReactNode | ((values: number[]) => React.ReactNode)
  }
  export interface ITrackProps extends PrimitiveSpanProps {}

  export interface IThumbProviderProps {
    name?: string
    /** Where the thumb sits among the values until it mounts, so a range renders its thumbs on the server. */
    index?: number | undefined
    children?: React.ReactNode
  }

  export interface IThumbTriggerProps extends PrimitiveSpanProps {}

  export interface IThumbProps extends IThumbTriggerProps {
    name?: string
    /** Where the thumb sits among the values until it mounts, so a range renders its thumbs on the server. */
    index?: number | undefined
  }

  export interface IBubbleInputProps extends Omit<PrimitiveInputProps, 'value'> {}
}
