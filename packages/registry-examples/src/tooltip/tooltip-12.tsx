import { Button } from '@gentleduck/registry-ui/button'
import { Kbd, KbdGroup } from '@gentleduck/registry-ui/kbd'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Save } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button aria-label="Save" size="icon" variant="outline">
            <Save aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent aria-label="Command S" className="flex items-center gap-2">
          Save
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>S</Kbd>
          </KbdGroup>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
