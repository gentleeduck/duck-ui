import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Italic } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Toggle italic" size="sm">
      <Italic />
    </Toggle>
  )
}
