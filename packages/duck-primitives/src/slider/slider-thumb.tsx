import * as React from 'react'
import { useSize } from '../hooks/use-size'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import type { Scope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import {
  Collection,
  SliderThumbContextProvider,
  useCollection,
  useSliderContext,
  useSliderOrientationContext,
  useSliderThumbContext,
} from './slider'
import { convertValueToPercentage, getLabel, getThumbInBoundsOffset } from './slider.libs'
import type { ISlider } from './slider.types'
import { SliderBubbleInput } from './slider-input'

const THUMB_NAME = 'SliderThumb'
const THUMB_PROVIDER_NAME = 'SliderThumbProvider'
const THUMB_TRIGGER_NAME = 'SliderThumbTrigger'

function useSliderThumbState(
  __scopeSlider: Scope,
  name: string | undefined,
  indexProp: number | undefined,
): ISlider.IThumbContext {
  const context = useSliderContext(THUMB_PROVIDER_NAME, __scopeSlider)
  const getItems = useCollection(__scopeSlider)
  const [thumb, setThumb] = React.useState<ISlider.ThumbElement | null>(null)
  const index = React.useMemo(
    () =>
      thumb
        ? getItems().findIndex((item) => item.ref.current === thumb)
        : (indexProp ?? (context.values.length === 1 ? 0 : -1)),
    [getItems, thumb, indexProp, context.values.length],
  )
  const size = useSize(thumb)
  const value = context.values[index] as number | undefined

  React.useEffect(() => {
    if (thumb) {
      context.thumbs.add(thumb)
      return () => {
        context.thumbs.delete(thumb)
      }
    }
  }, [thumb, context.thumbs])

  return {
    value,
    name: name ?? (context.name ? context.name + (context.values.length > 1 ? '[]' : '') : undefined),
    form: context.form,
    // true until mounted, so a form rendered on the server still submits the value
    isFormControl: thumb ? !!context.form || !!thumb.closest('form') : true,
    index,
    percent: value === undefined ? 0 : convertValueToPercentage(value, context.min, context.max),
    size,
    onThumbChange: setThumb,
  }
}

function SliderThumbProvider(props: ISlider.IScoped<ISlider.IThumbProviderProps>) {
  const { __scopeSlider, name, index, children } = props
  const thumb = useSliderThumbState(__scopeSlider, name, index)
  return (
    <SliderThumbContextProvider scope={__scopeSlider} {...thumb}>
      {children}
    </SliderThumbContextProvider>
  )
}

SliderThumbProvider.displayName = THUMB_PROVIDER_NAME

// Thumb calls this instead of rendering ThumbTrigger, so a thumb outside a form needs no thumb context: three fibers fewer.
function useSliderThumbTrigger(
  __scopeSlider: Scope,
  { index, value, percent, size, onThumbChange }: ISlider.IThumbContext,
  thumbProps: ISlider.IThumbTriggerProps,
  forwardedRef: React.ForwardedRef<ISlider.ThumbElement>,
) {
  const context = useSliderContext(THUMB_TRIGGER_NAME, __scopeSlider)
  const orientation = useSliderOrientationContext(THUMB_TRIGGER_NAME, __scopeSlider)
  const composedRefs = useComposedRefs(forwardedRef, onThumbChange)
  const orientationSize = size?.[orientation.size]
  const thumbInBoundsOffset = orientationSize
    ? getThumbInBoundsOffset(orientationSize, percent, orientation.direction)
    : 0

  return (
    <span
      style={{
        transform: 'var(--gentleduck-slider-thumb-transform)',
        position: 'absolute',
        [orientation.startEdge]: `calc(${percent}% + ${thumbInBoundsOffset}px)`,
      }}>
      <Collection.ItemSlot scope={__scopeSlider}>
        <Primitive.span
          data-slot="slider-thumb"
          role="slider"
          aria-label={getLabel(index, context.values.length)}
          aria-valuemin={context.min}
          aria-valuenow={value}
          aria-valuemax={context.max}
          aria-orientation={context.orientation}
          data-orientation={context.orientation}
          aria-disabled={context.disabled || undefined}
          data-disabled={context.disabled ? '' : undefined}
          tabIndex={context.disabled ? undefined : 0}
          {...thumbProps}
          ref={composedRefs}
          style={value === undefined ? { display: 'none' } : thumbProps.style}
          onFocus={composeEventHandlers(thumbProps.onFocus, () => {
            context.valueIndexToChangeRef.current = index
          })}
        />
      </Collection.ItemSlot>
    </span>
  )
}

const SliderThumbTrigger = React.forwardRef<ISlider.ThumbElement, ISlider.IScoped<ISlider.IThumbTriggerProps>>(
  (props, forwardedRef) => {
    const { __scopeSlider, ...thumbProps } = props
    const thumb = useSliderThumbContext(THUMB_TRIGGER_NAME, __scopeSlider)
    return useSliderThumbTrigger(__scopeSlider, thumb, thumbProps, forwardedRef)
  },
)

SliderThumbTrigger.displayName = THUMB_TRIGGER_NAME

const SliderThumb = React.forwardRef<ISlider.ThumbElement, ISlider.IThumbProps>(
  (props: ISlider.IScoped<ISlider.IThumbProps>, forwardedRef) => {
    const { __scopeSlider, name, index, ...thumbProps } = props
    const thumb = useSliderThumbState(__scopeSlider, name, index)
    const trigger = useSliderThumbTrigger(__scopeSlider, thumb, thumbProps, forwardedRef)
    return (
      <>
        {trigger}
        {thumb.isFormControl ? (
          <SliderThumbContextProvider scope={__scopeSlider} {...thumb}>
            <SliderBubbleInput key={thumb.index} __scopeSlider={__scopeSlider} />
          </SliderThumbContextProvider>
        ) : null}
      </>
    )
  },
)

SliderThumb.displayName = THUMB_NAME

export { SliderThumb, SliderThumbProvider, SliderThumbTrigger }
