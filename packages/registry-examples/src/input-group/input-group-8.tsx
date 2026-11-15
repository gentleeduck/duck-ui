import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Label } from '@gentleduck/registry-ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { InfoIcon } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-4">
        <InputGroup>
          <InputGroupInput id="project" placeholder="my-project" />
          <InputGroupAddon>
            <Label htmlFor="project">/</Label>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput id="workspace" placeholder="acme-workspace" />
          <InputGroupAddon align="block-start">
            <Label className="text-foreground" htmlFor="workspace">
              Workspace
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton aria-label="Help" className="ms-auto rounded-full" size="icon-xs" variant="ghost">
                  <InfoIcon />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Workspace names must be unique across your organization</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
