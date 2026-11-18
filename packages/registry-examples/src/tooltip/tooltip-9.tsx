import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'

const SIDES = [
  { label: 'Top', side: 'top' },
  { label: 'Right', side: 'right' },
  { label: 'Bottom', side: 'bottom' },
  { label: 'Left', side: 'left' },
] as const

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {SIDES.map(({ label, side }) => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button variant="outline">{label}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>Opens on the {side}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
