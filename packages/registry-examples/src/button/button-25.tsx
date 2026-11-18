import { Button } from '@gentleduck/registry-ui/button'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button asChild variant="outline">
        <a href="#ponds">Ponds</a>
      </Button>
      <Button asChild disabled variant="outline">
        <a href="#lakes">Lakes</a>
      </Button>
    </div>
  )
}
