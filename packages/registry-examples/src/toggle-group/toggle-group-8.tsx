import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <ToggleGroup aria-label="تنسيق النص" type="multiple" variant="outline">
        <ToggleGroupItem aria-label="غامق" value="bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="مائل" value="italic">
          <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="تسطير" value="underline">
          <Underline />
        </ToggleGroupItem>
      </ToggleGroup>
    </DirectionProvider>
  )
}
