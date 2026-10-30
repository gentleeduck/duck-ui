import * as React from 'react'
import { useComposedRefs } from '../libs/compose-ref'
import { Primitive } from '../primitive-elements'
import { useSliderContext, useSliderOrientationContext } from './slider'
import { convertValueToPercentage } from './slider.libs'
import type { ISlider } from './slider.types'

const RANGE_NAME = 'SliderRange'

type SliderRangeElement = React.ComponentRef<typeof Primitive.span>

const SliderRange = React.forwardRef<SliderRangeElement, ISlider.IRangeProps>(
  (props: ISlider.IScoped<ISlider.IRangeProps>, forwardedRef) => {
    const { __scopeSlider, ...rangeProps } = props
    const context = useSliderContext(RANGE_NAME, __scopeSlider)
    const orientation = useSliderOrientationContext(RANGE_NAME, __scopeSlider)
    const ref = React.useRef<HTMLSpanElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)
    const valuesCount = context.values.length
    const percentages = context.values.map((value) => convertValueToPercentage(value, context.min, context.max))
    const offsetStart = valuesCount > 1 ? Math.min(...percentages) : 0
    const offsetEnd = 100 - Math.max(...percentages)

    return (
      <Primitive.span
        data-slot="slider-range"
        data-orientation={context.orientation}
        data-disabled={context.disabled ? '' : undefined}
        {...rangeProps}
        ref={composedRefs}
        style={{ ...props.style, [orientation.startEdge]: `${offsetStart}%`, [orientation.endEdge]: `${offsetEnd}%` }}
      />
    )
  },
)

SliderRange.displayName = RANGE_NAME

export { SliderRange }
