import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Slider aria-label="مستوى الصوت" className="mx-auto w-full max-w-xs" defaultValue={[75]} max={100} step={1} />
    </DirectionProvider>
  )
}
