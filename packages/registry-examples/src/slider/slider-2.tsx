import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return (
    <Slider aria-label="Price range" defaultValue={[25, 50]} max={100} step={5} className="mx-auto w-full max-w-xs" />
  )
}
