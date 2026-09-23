'use client'

import { cn } from '@gentleduck/libs/cn'
import * as SliderPrimitive from '@gentleduck/primitives/slider'
import * as React from 'react'

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentProps<typeof SliderPrimitive.Root>
>(({ className, defaultValue, orientation = 'horizontal', value, min = 0, max = 100, ...props }, ref) => {
  const values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max],
  )

  return (
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
        <SliderPrimitive.Thumb
          data-orientation={orientation}
          data-slot="slider-thumb"
          // biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional, index is the stable key
          key={index}
          className="relative block size-4 shrink-0 select-none rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow,scale] after:absolute after:-inset-2 hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:scale-97 active:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = 'Slider'

export { Slider }
