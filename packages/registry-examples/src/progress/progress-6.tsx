import { MotionProgress, Progress } from '@gentleduck/registry-ui/progress'

export default function Demo() {
  return (
    <div className="flex w-[60%] flex-col gap-4">
      <Progress aria-label="Preparing the export" value={null} />
      <MotionProgress aria-label="Preparing the import" value={null} />
    </div>
  )
}
