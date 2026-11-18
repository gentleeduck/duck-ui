'use client'

import { Card, CardContent } from '@gentleduck/registry-ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@gentleduck/registry-ui/carousel'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ponds = ['Mill pond', 'Lake', 'Marsh', 'Canal']

export default function Demo() {
  return (
    <Carousel aria-label="Ponds" className="w-full max-w-xs" opts={{ loop: true }}>
      <CarouselContent>
        {ponds.map((pond) => (
          <CarouselItem key={pond}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6">
                  <span className="font-semibold text-2xl">{pond}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious icon={<ChevronLeft aria-hidden="true" className="rtl:rotate-180" />} text="Previous pond" />
      <CarouselNext icon={<ChevronRight aria-hidden="true" className="rtl:rotate-180" />} text="Next pond" />
    </Carousel>
  )
}
