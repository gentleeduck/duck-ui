import { Button } from '@gentleduck/registry-ui/button'
import { Kbd } from '@gentleduck/registry-ui/kbd'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button className="pe-2" size="sm" variant="outline">
        Confirm <Kbd>Enter</Kbd>
      </Button>
      <Button className="pe-2" size="sm" variant="outline">
        Dismiss <Kbd>Esc</Kbd>
      </Button>
    </div>
  )
}
