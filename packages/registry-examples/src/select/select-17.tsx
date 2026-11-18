'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { Bike, Bus, Car, Plane, Ship, TrainFront } from 'lucide-react'

const transport = [
  { value: 'bike', label: 'Bike', icon: Bike },
  { value: 'bus', label: 'Bus', icon: Bus },
  { value: 'car', label: 'Car', icon: Car },
  { value: 'train', label: 'Train', icon: TrainFront },
  { value: 'ferry', label: 'Ferry', icon: Ship },
  { value: 'plane', label: 'Plane', icon: Plane, disabled: true },
]

export default function Demo() {
  return (
    <Select defaultValue={['bike', 'train']} items={transport} multiple>
      <SelectTrigger aria-label="Ways to travel" className="w-[260px]">
        <SelectValue placeholder="Pick ways to travel" />
      </SelectTrigger>
      <SelectContent>
        {transport.map(({ icon: Icon, ...item }) => (
          <SelectItem disabled={item.disabled} key={item.value} value={item.value}>
            <span className="flex items-center gap-2">
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
