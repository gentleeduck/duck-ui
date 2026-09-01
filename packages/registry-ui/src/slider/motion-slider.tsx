'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import * as SliderPrimitive from '@gentleduck/primitives/slider'
import { LazyMotion, m } from 'motion/react'
import * as React from 'react'

function MotionSliderThumb(props: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>) {
  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className="relative block size-4 shrink-0 select-none rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow,scale] after:absolute after:-inset-2 hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:scale-97 active:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50"
      {...props}
    />
  )
}

const MOTION_SLIDER_OPTIONS = { transition: springBouncy } as const

const MotionSlider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentProps<typeof SliderPrimitive.Root>
>(({ className, defaultValue, orientation = 'horizontal', value, min = 0, max = 100, ...props }, ref) => {
  const content = useMotionPreset(scaleIn, MOTION_SLIDER_OPTIONS)
  const values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
    <LazyMotion features={loadDomAnimation}>
      <m.div initial={content.initial} animate={content.animate} transition={content.transition} className="w-full">
        <SliderPrimitive.Root
          ref={ref}
          data-slot="slider"
          data-orientation={orientation}
          defaultValue={defaultValue}
          orientation={orientation}
          value={value}
          min={min}
          max={max}
          className={cn(
            "relative flex w-full touch-none select-none items-center data-[orientation='vertical']:h-full data-[orientation='vertical']:min-h-40 data-[orientation='vertical']:w-auto data-disabled:cursor-not-allowed data-[orientation='vertical']:flex-col data-disabled:opacity-50",
            className,
          )}
          {...props}>
          <SliderPrimitive.Track
            data-orientation={orientation}
            data-slot="slider-track"
            className="relative grow overflow-hidden rounded-full bg-muted data-[orientation='horizontal']:h-1 data-[orientation='vertical']:h-full data-[orientation='horizontal']:w-full data-[orientation='vertical']:w-1">
            <SliderPrimitive.Range
              data-slot="slider-range"
              data-orientation={orientation}
              className="absolute select-none bg-primary data-[orientation='horizontal']:h-full data-[orientation='vertical']:w-full"
            />
          </SliderPrimitive.Track>
          {Array.from({ length: values.length }, (_, index) => (
            <MotionSliderThumb
              // biome-ignore lint/suspicious/noArrayIndexKey: thumb identity is positional
              key={index}
              data-orientation={orientation}
            />
          ))}
        </SliderPrimitive.Root>
      </m.div>
    </LazyMotion>
  )
})
MotionSlider.displayName = 'MotionSlider'

export { MotionSlider }
