import { Button } from '@gentleduck/registry-ui/button'
import { Plus } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline">
          Small
        </Button>
        <Button variant="outline">Default</Button>
        <Button size="lg" variant="outline">
          Large
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button aria-label="Add, small" size="icon-sm" variant="outline">
          <Plus aria-hidden="true" />
        </Button>
        <Button aria-label="Add" size="icon" variant="outline">
          <Plus aria-hidden="true" />
        </Button>
        <Button aria-label="Add, large" size="icon-lg" variant="outline">
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
