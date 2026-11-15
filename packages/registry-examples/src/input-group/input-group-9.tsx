import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { ChevronDownIcon, MoreHorizontal } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Enter commit message" />
        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton aria-label="More" size="icon-xs" variant="ghost">
                <MoreHorizontal aria-hidden="true" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem>Amend last commit</DropdownMenuItem>
              <DropdownMenuItem>Sign commit</DropdownMenuItem>
              <DropdownMenuItem>View history</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup className="[--radius:1rem]">
        <InputGroupInput placeholder="Find components..." />
        <InputGroupAddon align="inline-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton className="!pe-1.5 text-xs" variant="ghost">
                Scope... <ChevronDownIcon className="size-3" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="[--radius:0.95rem]">
              <DropdownMenuItem>All Packages</DropdownMenuItem>
              <DropdownMenuItem>UI Components</DropdownMenuItem>
              <DropdownMenuItem>Primitives</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
