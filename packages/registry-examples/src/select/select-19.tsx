'use client'

import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

const fruits = [
  { value: 'apple', label: 'تفاح' },
  { value: 'banana', label: 'موز' },
  { value: 'blueberry', label: 'توت أزرق' },
  { value: 'grapes', label: 'عنب' },
  { value: 'pineapple', label: 'أناناس' },
]

const labelOf = (value: string) => fruits.find((fruit) => fruit.value === value)?.label

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Select defaultValue={['grapes', 'apple']} multiple>
        <SelectTrigger aria-label="الفواكه" className="w-[240px]">
          <SelectValue placeholder="اختر بعض الفواكه">{(picked) => picked.map(labelOf).join('، ')}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>الفواكه</SelectLabel>
            {fruits.map((fruit) => (
              <SelectItem key={fruit.value} value={fruit.value}>
                {fruit.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </DirectionProvider>
  )
}
