'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@gentleduck/registry-ui/input-group'
import { Separator } from '@gentleduck/registry-ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { IconCheck, IconInfoCircle, IconPaperclip } from '@tabler/icons-react'
import { ArrowUpIcon, FilterIcon } from 'lucide-react'

export default function Demo() {
  return (
    <TooltipProvider>
      <div className="grid w-full max-w-sm gap-6">
        <InputGroup>
          <InputGroupInput placeholder="Filter logs..." />
          <InputGroupAddon>
            <FilterIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">24 entries</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput className="!ps-1" placeholder="github.com/acme/repo" />
          <InputGroupAddon>
            <InputGroupText>git clone </InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton aria-label="Info" className="rounded-full" size="icon-xs">
                  <IconInfoCircle aria-hidden="true" />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Repository will be cloned to ~/projects.</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Describe your issue..." />
          <InputGroupAddon align="block-end">
            <InputGroupButton aria-label="Attach file" className="rounded-full" size="icon-xs" variant="outline">
              <IconPaperclip aria-hidden="true" />
            </InputGroupButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton variant="ghost">Low</InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="[--radius:0.95rem]" side="top">
                <DropdownMenuItem>Low</DropdownMenuItem>
                <DropdownMenuItem>Medium</DropdownMenuItem>
                <DropdownMenuItem>High</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupText className="ms-auto">3 attachments</InputGroupText>
            <Separator className="!h-4" orientation="vertical" />
            <InputGroupButton className="rounded-full" disabled size="icon-xs" variant="default">
              <ArrowUpIcon aria-hidden="true" />
              <span className="sr-only">Submit</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="team-alpha" />
          <InputGroupAddon align="inline-end">
            <div className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <IconCheck className="size-3" />
            </div>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </TooltipProvider>
  )
}
