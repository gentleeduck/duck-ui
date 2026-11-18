import { Separator } from '@gentleduck/registry-ui/separator'

export default function Demo() {
  return (
    <div className="grid w-72 gap-6 text-muted-foreground text-sm">
      <div className="grid gap-2">
        Primary
        <Separator className="bg-primary" />
      </div>
      <div className="grid gap-2">
        Thicker
        <Separator className="h-1 rounded-full" />
      </div>
      <div className="grid gap-2">
        Dashed
        <Separator className="border-t border-dashed bg-transparent" />
      </div>
    </div>
  )
}
