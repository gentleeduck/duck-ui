import { cn } from '@gentleduck/libs/cn'
import { Slider } from '@gentleduck/registry-ui/slider'

export default function Demo() {
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Slider aria-label="Opacity" className={cn('w-[60%]')} defaultValue={[33]} max={100} orientation="horizontal" />
    </div>
  )
}
