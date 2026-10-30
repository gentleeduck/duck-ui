import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useSliderContext } from './slider'
import type { ISlider } from './slider.types'

const TRACK_NAME = 'SliderTrack'

type SliderTrackElement = React.ComponentRef<typeof Primitive.span>

const SliderTrack = React.forwardRef<SliderTrackElement, ISlider.ITrackProps>(
  (props: ISlider.IScoped<ISlider.ITrackProps>, forwardedRef) => {
    const { __scopeSlider, ...trackProps } = props
    const context = useSliderContext(TRACK_NAME, __scopeSlider)
    return (
      <Primitive.span
        data-slot="slider-track"
        data-disabled={context.disabled ? '' : undefined}
        data-orientation={context.orientation}
        {...trackProps}
        ref={forwardedRef}
      />
    )
  },
)

SliderTrack.displayName = TRACK_NAME

export { SliderTrack }
