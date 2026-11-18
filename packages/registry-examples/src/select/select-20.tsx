'use client'

import {
  MotionSelect,
  MotionSelectContent,
  MotionSelectTrigger,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <MotionSelect defaultValue={['blueberry']} multiple>
      <MotionSelectTrigger aria-label="Fruits" className="w-[240px]">
        <SelectValue placeholder="Pick some fruits" />
      </MotionSelectTrigger>
      <MotionSelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </MotionSelectContent>
    </MotionSelect>
  )
}
