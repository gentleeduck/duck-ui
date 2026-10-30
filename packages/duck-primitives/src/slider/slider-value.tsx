import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useSliderContext } from './slider'
import type { ISlider } from './slider.types'

const VALUE_NAME = 'SliderValue'

type SliderValueElement = React.ComponentRef<typeof Primitive.span>

const SliderValue = React.forwardRef<SliderValueElement, ISlider.IValueProps>(
  (props: ISlider.IScoped<ISlider.IValueProps>, forwardedRef) => {
    const { __scopeSlider, children, ...valueProps } = props
    const context = useSliderContext(VALUE_NAME, __scopeSlider)
    return (
      // Hidden from assistive technology, since each thumb already announces its own value.
      <Primitive.span
        data-slot="slider-value"
        aria-hidden
        data-orientation={context.orientation}
        data-disabled={context.disabled ? '' : undefined}
        {...valueProps}
        ref={forwardedRef}>
        {typeof children === 'function' ? children(context.values) : (children ?? context.values.join(', '))}
      </Primitive.span>
    )
  },
)

SliderValue.displayName = VALUE_NAME

export { SliderValue }
