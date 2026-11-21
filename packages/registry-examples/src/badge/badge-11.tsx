import { Badge } from '@gentleduck/registry-ui/badge'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge border="primary" variant="outline">
          Primary border
        </Badge>
        <Badge border="secondary">Secondary border</Badge>
        <Badge border="destructive">Destructive border</Badge>
        <Badge border="warning">Warning border</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge size="sm">Small</Badge>
        <Badge>Default</Badge>
        <Badge size="lg">Large</Badge>
        <Badge className="underline" variant="nothing">
          Unstyled
        </Badge>
      </div>
    </div>
  )
}
