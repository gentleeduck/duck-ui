import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return (
    <div className="mx-auto flex w-full max-w-xs items-center justify-center gap-6">
      <Slider aria-label="Bass" defaultValue={[50]} max={100} step={1} orientation="vertical" className="h-40" />
      <Slider aria-label="Treble" defaultValue={[25]} max={100} step={1} orientation="vertical" className="h-40" />
    </div>
  )
}
