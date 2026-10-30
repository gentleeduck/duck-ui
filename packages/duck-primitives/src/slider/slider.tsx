import * as React from 'react'
import { useDirection } from '../direction'
import { useControllableState } from '../hooks/use-controllable-state'
import { getAssociatedForm } from '../libs/associated-form'
import { clamp } from '../libs/clamp'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { createCollection } from '../libs/create-collection'
import { createContextScope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import {
  getClosestValueIndex,
  getDecimalCount,
  getNextSortedValues,
  getNextStepValue,
  hasMinStepsBetweenValues,
  linearScale,
  roundValue,
} from './slider.libs'
import type { ISlider } from './slider.types'

const PAGE_KEYS = ['PageUp', 'PageDown']
const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

const BACK_KEYS: Record<ISlider.SlideDirection, string[]> = {
  'from-left': ['Home', 'PageDown', 'ArrowDown', 'ArrowLeft'],
  'from-right': ['Home', 'PageDown', 'ArrowDown', 'ArrowRight'],
  'from-bottom': ['Home', 'PageDown', 'ArrowDown', 'ArrowLeft'],
  'from-top': ['Home', 'PageDown', 'ArrowUp', 'ArrowLeft'],
}

const SLIDER_NAME = 'Slider'

const [Collection, useCollection, createCollectionScope] = createCollection<ISlider.ThumbElement>(SLIDER_NAME)

const [createSliderContext, createSliderScope] = createContextScope(SLIDER_NAME, [createCollectionScope])

const [SliderProvider, useSliderContext] = createSliderContext<ISlider.IContext>(SLIDER_NAME)

const [SliderThumbContextProvider, useSliderThumbContext] = createSliderContext<ISlider.IThumbContext>('SliderThumb')

type SliderElement = SliderHorizontalElement | SliderVerticalElement

const Slider = React.forwardRef<SliderElement, ISlider.IProps>(
  (props: ISlider.IScoped<ISlider.IProps>, forwardedRef) => {
    const {
      name,
      min = 0,
      max = 100,
      step = 1,
      largeStep,
      orientation = 'horizontal',
      disabled = false,
      minStepsBetweenThumbs = 0,
      preserveThumbOrder = false,
      defaultValue = [min],
      value,
      onValueChange = () => {},
      onValueCommit = () => {},
      inverted = false,
      dir,
      form,
      ...sliderProps
    } = props
    const direction = useDirection(dir)
    const thumbRefs = React.useRef<ISlider.IContext['thumbs']>(new Set())
    const valueIndexToChangeRef = React.useRef<number>(0)
    // What moved the values, so the thumb that moved takes focus. A form reset moves no focus.
    const interactionRef = React.useRef<'keyboard' | 'pointer' | null>(null)
    // What the latest interaction asked for, so a hidden input can tell the user's changes from a parent's.
    const [userRequestedValues, setUserRequestedValues] = React.useState<number[] | null>(null)
    const isHorizontal = orientation === 'horizontal'
    const SliderOrientation = isHorizontal ? SliderHorizontal : SliderVertical
    const controlRef = React.useRef<SliderElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, controlRef)

    const [values, setValues] = useControllableState({
      prop: value,
      defaultProp: defaultValue,
      onChange: (value) => {
        if (interactionRef.current) {
          Array.from(thumbRefs.current)[valueIndexToChangeRef.current]?.focus({
            preventScroll: true,
            focusVisible: interactionRef.current === 'keyboard',
          })
        }
        onValueChange(value)
      },
      caller: SLIDER_NAME,
    })
    const valuesBeforeSlideStartRef = React.useRef(values)
    // A release can land before React renders the move before it, so the slide keeps the values it last asked for.
    const slideValuesRef = React.useRef(values)
    // React replays an update queued behind one it skipped, and a second array of the same values would report it twice.
    const lastChangedValuesRef = React.useRef(values)

    const initialValuesRef = React.useRef(values)
    React.useEffect(() => {
      const associatedForm = getAssociatedForm(controlRef.current, form)
      if (associatedForm) {
        const reset = () => {
          interactionRef.current = null
          setValues(initialValuesRef.current)
        }
        associatedForm.addEventListener('reset', reset)
        return () => associatedForm.removeEventListener('reset', reset)
      }
    }, [form, setValues])

    function handleSlideStart(value: number) {
      const closestIndex = getClosestValueIndex(values, value)
      // A press that leaves the value where it was changes nothing, so the change handler focuses nothing.
      Array.from(thumbRefs.current)[closestIndex]?.focus({ preventScroll: true, focusVisible: false })
      updateValues(value, closestIndex)
    }

    function handleSlideMove(value: number) {
      updateValues(value, valueIndexToChangeRef.current)
    }

    function handleSlideEnd() {
      const slideValues = slideValuesRef.current
      if (String(slideValues) !== String(valuesBeforeSlideStartRef.current)) onValueCommit(slideValues)
    }

    function updateValues(value: number, atIndex: number, { commit } = { commit: false }) {
      const decimalCount = getDecimalCount(step)
      const snapToStep = roundValue(Math.round((value - min) / step) * step + min, decimalCount)
      const nextValue = clamp(snapToStep, [min, max])
      const minStepsDistance = minStepsBetweenThumbs * step

      function getNextValues(prevValues: number[]) {
        const before = prevValues[atIndex - 1]
        const after = prevValues[atIndex + 1]
        const constrainedValue = preserveThumbOrder
          ? clamp(nextValue, [
              before === undefined ? min : before + minStepsDistance,
              after === undefined ? max : after - minStepsDistance,
            ])
          : nextValue
        const nextValues = getNextSortedValues(prevValues, constrainedValue, atIndex)
        if (!hasMinStepsBetweenValues(nextValues, minStepsDistance)) return null
        return {
          nextValues,
          changedIndex: preserveThumbOrder ? atIndex : nextValues.indexOf(constrainedValue),
          hasChanged: String(nextValues) !== String(prevValues),
        }
      }

      // Only a request that changes the values is recorded, so a pointer move within one step renders nothing.
      const requested = getNextValues(values)
      if (requested?.hasChanged) {
        setUserRequestedValues(requested.nextValues)
        slideValuesRef.current = requested.nextValues
        // Outside the updater, which StrictMode runs twice. Only a key commits, and React renders between two keys.
        if (commit) onValueCommit(requested.nextValues)
      }

      setValues((prevValues) => {
        const next = getNextValues(prevValues)
        if (!next) return prevValues
        valueIndexToChangeRef.current = next.changedIndex
        if (!next.hasChanged) return prevValues
        if (String(next.nextValues) === String(lastChangedValuesRef.current)) return lastChangedValuesRef.current
        lastChangedValuesRef.current = next.nextValues
        return next.nextValues
      })
    }

    return (
      <SliderProvider
        scope={props.__scopeSlider}
        name={name}
        disabled={disabled}
        min={min}
        max={max}
        valueIndexToChangeRef={valueIndexToChangeRef}
        thumbs={thumbRefs.current}
        values={values}
        orientation={orientation}
        dir={direction}
        form={form}
        userRequestedValues={userRequestedValues}>
        <Collection.Provider scope={props.__scopeSlider}>
          <Collection.Slot scope={props.__scopeSlider}>
            <SliderOrientation
              aria-disabled={disabled}
              data-disabled={disabled ? '' : undefined}
              {...sliderProps}
              dir={direction}
              ref={composedRefs}
              onPointerDown={composeEventHandlers(sliderProps.onPointerDown, () => {
                valuesBeforeSlideStartRef.current = values
                slideValuesRef.current = values
                interactionRef.current = 'pointer'
              })}
              min={min}
              max={max}
              inverted={inverted}
              onSlideStart={disabled ? undefined : handleSlideStart}
              onSlideMove={disabled ? undefined : handleSlideMove}
              onSlideEnd={disabled ? undefined : handleSlideEnd}
              onHomeKeyDown={() => {
                if (!disabled) {
                  interactionRef.current = 'keyboard'
                  updateValues(min, valueIndexToChangeRef.current, { commit: true })
                }
              }}
              onEndKeyDown={() => {
                if (!disabled) {
                  interactionRef.current = 'keyboard'
                  updateValues(max, valueIndexToChangeRef.current, { commit: true })
                }
              }}
              onStepKeyDown={({ event, direction: stepDirection }) => {
                if (!disabled) {
                  interactionRef.current = 'keyboard'
                  const isPageKey = PAGE_KEYS.includes(event.key)
                  const isSkipKey = isPageKey || event.shiftKey
                  const multiplier = isSkipKey ? (largeStep === undefined ? 10 : largeStep / step) : 1
                  const atIndex = valueIndexToChangeRef.current
                  const value = values[atIndex]
                  if (value === undefined) return
                  const nextValue = getNextStepValue(value, { min, step, direction: stepDirection, multiplier })
                  updateValues(nextValue, atIndex, { commit: true })
                }
              }}
            />
          </Collection.Slot>
        </Collection.Provider>
      </SliderProvider>
    )
  },
)

Slider.displayName = SLIDER_NAME

const [SliderOrientationProvider, useSliderOrientationContext] = createSliderContext<ISlider.IOrientationContext>(
  SLIDER_NAME,
  { startEdge: 'left', endEdge: 'right', size: 'width', direction: 1 },
)

type SliderHorizontalElement = SliderImplElement

const SliderHorizontal = React.forwardRef<SliderHorizontalElement, ISlider.IHorizontalProps>(
  (props: ISlider.IScoped<ISlider.IHorizontalProps>, forwardedRef) => {
    const { min, max, dir, inverted, onSlideStart, onSlideMove, onSlideEnd, onStepKeyDown, ...sliderProps } = props
    const rectRef = React.useRef<DOMRect>(undefined)
    const direction = useDirection(dir)
    const isDirectionLTR = direction === 'ltr'
    const isSlidingFromLeft = (isDirectionLTR && !inverted) || (!isDirectionLTR && inverted)

    function getValueFromPointer(event: React.PointerEvent) {
      const rect = rectRef.current ?? event.currentTarget.getBoundingClientRect()
      const input: [number, number] = [0, rect.width]
      const output: [number, number] = isSlidingFromLeft ? [min, max] : [max, min]
      const value = linearScale(input, output)

      rectRef.current = rect
      return value(event.clientX - rect.left)
    }

    return (
      <SliderOrientationProvider
        scope={props.__scopeSlider}
        startEdge={isSlidingFromLeft ? 'left' : 'right'}
        endEdge={isSlidingFromLeft ? 'right' : 'left'}
        direction={isSlidingFromLeft ? 1 : -1}
        size="width">
        <SliderImpl
          dir={direction}
          data-orientation="horizontal"
          {...sliderProps}
          ref={forwardedRef}
          style={{ ...sliderProps.style, ['--gentleduck-slider-thumb-transform' as string]: 'translateX(-50%)' }}
          onSlideStart={(event) => {
            const value = getValueFromPointer(event)
            onSlideStart?.(value)
          }}
          onSlideMove={(event) => {
            const value = getValueFromPointer(event)
            onSlideMove?.(value)
          }}
          onSlideEnd={() => {
            rectRef.current = undefined
            onSlideEnd?.()
          }}
          onStepKeyDown={(event) => {
            const slideDirection = isSlidingFromLeft ? 'from-left' : 'from-right'
            const isBackKey = BACK_KEYS[slideDirection].includes(event.key)
            onStepKeyDown?.({ event, direction: isBackKey ? -1 : 1 })
          }}
        />
      </SliderOrientationProvider>
    )
  },
)

SliderHorizontal.displayName = 'SliderHorizontal'

type SliderVerticalElement = SliderImplElement
const SliderVertical = React.forwardRef<SliderVerticalElement, ISlider.IVerticalProps>(
  (props: ISlider.IScoped<ISlider.IVerticalProps>, forwardedRef) => {
    const { min, max, inverted, onSlideStart, onSlideMove, onSlideEnd, onStepKeyDown, ...sliderProps } = props
    const rectRef = React.useRef<DOMRect>(undefined)
    const isSlidingFromBottom = !inverted

    function getValueFromPointer(event: React.PointerEvent) {
      const rect = rectRef.current ?? event.currentTarget.getBoundingClientRect()
      const input: [number, number] = [0, rect.height]
      const output: [number, number] = isSlidingFromBottom ? [max, min] : [min, max]
      const value = linearScale(input, output)

      rectRef.current = rect
      return value(event.clientY - rect.top)
    }

    return (
      <SliderOrientationProvider
        scope={props.__scopeSlider}
        startEdge={isSlidingFromBottom ? 'bottom' : 'top'}
        endEdge={isSlidingFromBottom ? 'top' : 'bottom'}
        size="height"
        direction={isSlidingFromBottom ? 1 : -1}>
        <SliderImpl
          data-orientation="vertical"
          {...sliderProps}
          ref={forwardedRef}
          style={{ ...sliderProps.style, ['--gentleduck-slider-thumb-transform' as string]: 'translateY(50%)' }}
          onSlideStart={(event) => {
            const value = getValueFromPointer(event)
            onSlideStart?.(value)
          }}
          onSlideMove={(event) => {
            const value = getValueFromPointer(event)
            onSlideMove?.(value)
          }}
          onSlideEnd={() => {
            rectRef.current = undefined
            onSlideEnd?.()
          }}
          onStepKeyDown={(event) => {
            const slideDirection = isSlidingFromBottom ? 'from-bottom' : 'from-top'
            const isBackKey = BACK_KEYS[slideDirection].includes(event.key)
            onStepKeyDown?.({ event, direction: isBackKey ? -1 : 1 })
          }}
        />
      </SliderOrientationProvider>
    )
  },
)

SliderVertical.displayName = 'SliderVertical'

type SliderImplElement = React.ComponentRef<typeof Primitive.span>

const SliderImpl = React.forwardRef<SliderImplElement, ISlider.IImplProps>(
  (props: ISlider.IScoped<ISlider.IImplProps>, forwardedRef) => {
    const {
      __scopeSlider,
      onSlideStart,
      onSlideMove,
      onSlideEnd,
      onHomeKeyDown,
      onEndKeyDown,
      onStepKeyDown,
      ...sliderProps
    } = props
    const context = useSliderContext(SLIDER_NAME, __scopeSlider)

    function endSlide(event: React.PointerEvent<SliderImplElement>) {
      const target = event.target as HTMLElement
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId)
        onSlideEnd(event)
      }
    }

    return (
      <Primitive.span
        data-slot="slider"
        {...sliderProps}
        ref={forwardedRef}
        onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
          if (event.key === 'Home') {
            onHomeKeyDown(event)
            event.preventDefault()
          } else if (event.key === 'End') {
            onEndKeyDown(event)
            event.preventDefault()
          } else if (PAGE_KEYS.concat(ARROW_KEYS).includes(event.key)) {
            onStepKeyDown(event)
            event.preventDefault()
          }
        })}
        onPointerDown={composeEventHandlers(props.onPointerDown, (event) => {
          // A right click, or a Control click on a Mac, opens the context menu.
          if (event.button !== 0 || event.ctrlKey) return
          const target = event.target as HTMLElement
          target.setPointerCapture(event.pointerId)
          event.preventDefault()
          const thumb = Array.from(context.thumbs).find((thumb) => thumb.contains(target))
          if (thumb) {
            thumb.focus()
          } else {
            onSlideStart(event)
          }
        })}
        onPointerMove={composeEventHandlers(props.onPointerMove, (event) => {
          const target = event.target as HTMLElement
          if (target.hasPointerCapture(event.pointerId)) onSlideMove(event)
        })}
        onPointerUp={composeEventHandlers(props.onPointerUp, endSlide)}
        onPointerCancel={composeEventHandlers(props.onPointerCancel, endSlide)}
      />
    )
  },
)

SliderImpl.displayName = 'SliderImpl'

export {
  Collection,
  createSliderScope,
  Slider,
  SliderThumbContextProvider,
  useCollection,
  useSliderContext,
  useSliderOrientationContext,
  useSliderThumbContext,
}
