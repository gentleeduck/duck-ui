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
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {[1, 2, 3, 4, 5].map((slide) => (
          <CarouselItem key={slide}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="font-semibold text-4xl">{slide}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious size="icon-sm" variant="secondary" />
      <CarouselNext size="icon-sm" variant="secondary" />
    </Carousel>
  )
}
