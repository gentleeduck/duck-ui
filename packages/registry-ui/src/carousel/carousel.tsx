'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import * as React from 'react'
import { Button } from '../button'
import { toDirection } from '../direction/direction.libs'
import type { CarouselApi, ICarouselContextProps, ICarouselProps } from './carousel.types'

const CarouselContext = React.createContext<ICarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />')
  }

  return context
}

const Carousel = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLDivElement> & ICarouselProps>(
  ({ orientation = 'horizontal', opts, setApi, plugins, className, children, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === 'horizontal' ? 'x' : 'y',
        // Embla reads `direction` for its scroll math; the `dir` attribute below handles layout.
        direction: opts?.direction ?? direction,
      },
      plugins,
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback((api: NonNullable<CarouselApi>) => {
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [])

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev()
    }, [api])

    const scrollNext = React.useCallback(() => {
      api?.scrollNext()
    }, [api])

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if ((event.key === 'ArrowLeft' && direction === 'ltr') || (event.key === 'ArrowRight' && direction === 'rtl')) {
          event.preventDefault()
          scrollPrev()
        } else if (
          (event.key === 'ArrowRight' && direction === 'ltr') ||
          (event.key === 'ArrowLeft' && direction === 'rtl')
        ) {
          event.preventDefault()
          scrollNext()
        }
      },
      [scrollPrev, scrollNext, direction],
    )

    React.useEffect(() => {
      if (!api || !setApi) {
        return
      }

      setApi(api)
    }, [api, setApi])

    React.useEffect(() => {
      if (!api) {
        return
      }

      onSelect(api)
      api.on('reInit', onSelect)
      api.on('select', onSelect)

      return () => {
        api?.off('select', onSelect)
      }
    }, [api, onSelect])

    return (
      <CarouselContext.Provider
        value={{
          api: api,
          canScrollNext,
          canScrollPrev,
          carouselRef,
          opts,
          orientation,
          scrollNext,
          scrollPrev,
        }}>
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: carousel is a custom widget needing roledescription */}
        <section
          aria-roledescription="carousel"
          className={cn('relative', className)}
          data-slot="carousel"
          dir={direction}
          onKeyDownCapture={handleKeyDown}
          ref={ref}
          {...props}>
          {children}
        </section>
      </CarouselContext.Provider>
    )
  },
)
Carousel.displayName = 'Carousel'

const CarouselContent = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel()

    return (
      <div className="overflow-hidden" data-slot="carousel-content" ref={carouselRef}>
        <ul
          className={cn('flex', orientation === 'horizontal' ? '-ms-4' : '-mt-4 flex-col', className)}
          ref={ref}
          {...props}
        />
      </div>
    )
  },
)
CarouselContent.displayName = 'CarouselContent'

const CarouselItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel()

    return (
      <li
        className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'ps-4' : 'pt-4', className)}
        data-slot="carousel-item"
        ref={ref}
        {...props}
        aria-roledescription="slide"
      />
    )
  },
)
CarouselItem.displayName = 'CarouselItem'

const CarouselPrevious = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & { text?: string }
>(({ className, icon, variant = 'outline', size = 'icon', text = 'Previous slide', ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      className={cn(
        'absolute size-8 rounded-full',
        orientation === 'horizontal'
          ? '-start-12 top-1/2 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      ref={ref}
      size={size}
      variant={variant}
      icon={
        icon === undefined ? (
          <ArrowLeft aria-hidden="true" className={cn('size-4', orientation === 'horizontal' && 'rtl:rotate-180')} />
        ) : (
          icon
        )
      }
      {...props}>
      <span className="sr-only">{text}</span>
    </Button>
  )
})
CarouselPrevious.displayName = 'CarouselPrevious'

const CarouselNext = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & { text?: string }
>(({ className, icon, variant = 'outline', size = 'icon', text = 'Next slide', ...props }, ref) => {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      className={cn(
        'absolute size-8 rounded-full',
        orientation === 'horizontal'
          ? '-end-12 top-1/2 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className,
      )}
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      ref={ref}
      size={size}
      variant={variant}
      icon={
        icon === undefined ? (
          <ArrowRight aria-hidden="true" className={cn('size-4', orientation === 'horizontal' && 'rtl:rotate-180')} />
        ) : (
          icon
        )
      }
      {...props}>
      <span className="sr-only">{text}</span>
    </Button>
  )
})
CarouselNext.displayName = 'CarouselNext'

export { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious }
