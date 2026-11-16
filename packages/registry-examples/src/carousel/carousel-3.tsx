'use client'
import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'

export default function Demo() {
  return (
    <Carousel className="w-full max-w-sm">
      <CarouselContent className="-ms-1">
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list generated from Array.from
          <CarouselItem className="ps-1 md:basis-1/2 lg:basis-1/3" key={`item-${index + 1}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-2xl">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
