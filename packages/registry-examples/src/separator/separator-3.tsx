import { MotionSeparator } from '@gentleduck/registry-ui/separator'

export default function Demo() {
  return (
    <div>
      <div className="space-y-1">
        <h4 className="font-medium text-sm leading-none">Duck UI</h4>
        <p className="text-muted-foreground text-sm">An open-source UI component library.</p>
      </div>
      <MotionSeparator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <MotionSeparator orientation="vertical" />
        <div>Docs</div>
        <MotionSeparator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  )
}
