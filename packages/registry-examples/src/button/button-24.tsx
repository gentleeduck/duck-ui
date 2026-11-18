import { MotionButton } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <MotionButton asChild variant="outline">
        <a href="#ponds">Ponds</a>
      </MotionButton>
      <MotionButton asChild disabled variant="outline">
        <a href="#lakes">Lakes</a>
      </MotionButton>
    </div>
  )
}
