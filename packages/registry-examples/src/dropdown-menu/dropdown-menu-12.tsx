'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gentleduck/registry-ui/dropdown-menu'

export default function Demo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <a href="#account-profile">Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="#account-billing">Billing</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild disabled>
          <a href="#account-team">Team</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="https://github.com/gentleeduck/gentleduck" rel="noreferrer" target="_blank">
            Source
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
