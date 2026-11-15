import { AnimationIcon, Button } from '@gentleduck/registry-ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="expandIcon">
        <AnimationIcon animationIcon={{ icon: <ArrowLeft aria-hidden="true" />, iconPlacement: 'left' }}>
          Back
        </AnimationIcon>
      </Button>
      <Button variant="expandIcon">
        <AnimationIcon animationIcon={{ icon: <ArrowRight aria-hidden="true" />, iconPlacement: 'right' }}>
          Next
        </AnimationIcon>
      </Button>
    </div>
  )
}
