import { MotionSlider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return <MotionSlider aria-label="Volume" defaultValue={[75]} max={100} step={1} className="mx-auto w-full max-w-xs" />
}
