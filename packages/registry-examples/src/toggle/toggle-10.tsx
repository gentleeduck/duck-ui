import { Toggle } from '@gentleduck/registry-ui/toggle'
import { Volume2, VolumeX } from 'lucide-react'

export default function Demo() {
  return (
    <Toggle aria-label="Mute" variant="outline">
      {(pressed) => (pressed ? <VolumeX /> : <Volume2 />)}
    </Toggle>
  )
}
