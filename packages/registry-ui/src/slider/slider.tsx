'use client'

import { cn } from '@gentleduck/libs/cn'
import * as SliderPrimitive from '@gentleduck/primitives/slider'
import * as React from 'react'

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentProps<typeof SliderPrimitive.Root>
>(({ className, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...props }, ref) => {
  const thumbCount = (props.value ?? props.defaultValue)?.length ?? 1
  const name = { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy }
  // A lone thumb is the slider and takes the name. Several share it through a group and keep their own.
  const single = thumbCount === 1

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[orientation='vertical']:h-full data-[orientation='vertical']:min-h-40 data-[orientation='vertical']:w-auto data-disabled:cursor-not-allowed data-[orientation='vertical']:flex-col data-disabled:opacity-50",
        className,
      )}
      {...props}
      {...(single ? undefined : { role: 'group', ...name })}>
      <SliderPrimitive.Track className="relative grow overflow-hidden rounded-full bg-muted data-[orientation='horizontal']:h-1 data-[orientation='vertical']:h-full data-[orientation='horizontal']:w-full data-[orientation='vertical']:w-1">
        <SliderPrimitive.Range className="absolute select-none bg-primary data-[orientation='horizontal']:h-full data-[orientation='vertical']:w-full" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }, (_, index) => (
        <SliderPrimitive.Thumb
          // biome-ignore lint/suspicious/noArrayIndexKey: thumbs are positional, index is the stable key
          key={index}
          index={index}
          {...(single ? name : undefined)}
          className="relative block size-4 shrink-0 select-none rounded-full border border-ring bg-background ring-ring/50 transition-[color,box-shadow,scale] after:absolute after:-inset-2 hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:scale-97 active:ring-3 data-disabled:cursor-not-allowed"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = 'Slider'

export { Slider }
