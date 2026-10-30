import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { Bold, Italic, Underline } from 'lucide-react'

export default function Demo() {
  return (
    <ToggleGroup aria-label="Text style" size="sm" type="single" variant="outline">
      <ToggleGroupItem aria-label="Toggle bold" value="bold">
        <Bold className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle italic" value="italic">
        <Italic className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Toggle underline" value="underline">
        <Underline className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
