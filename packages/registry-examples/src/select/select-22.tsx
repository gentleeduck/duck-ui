'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

const ZONES = Array.from({ length: 24 }, (_, hour) => `UTC${hour - 11 >= 0 ? '+' : ''}${hour - 11}`)

export default function Demo() {
  return (
    <Select defaultValue="UTC+0">
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="end"
        alignOffset={-4}
        avoidCollisions
        className="max-h-64"
        collisionPadding={16}
        position="popper"
        side="top"
        sideOffset={8}>
        <SelectScrollUpButton />
        {ZONES.map((zone) => (
          <SelectItem key={zone} textValue={zone.replace('UTC', 'utc ')} value={zone}>
            {zone}
          </SelectItem>
        ))}
        <SelectScrollDownButton />
      </SelectContent>
    </Select>
  )
}
