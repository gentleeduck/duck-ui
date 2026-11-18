import { Button } from '@gentleduck/registry-ui/button'
import { Separator } from '@gentleduck/registry-ui/separator'

export default function Demo() {
  return (
    <div className="grid w-72 gap-4">
      <Button>Sign in with a passkey</Button>
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs uppercase">or</span>
        <Separator className="flex-1" />
      </div>
      <Button variant="outline">Email me a link</Button>
    </div>
  )
}
