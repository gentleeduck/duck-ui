'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Calendar } from '@gentleduck/registry-ui/calendar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@gentleduck/registry-ui/dialog'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [until, setUntil] = React.useState<Date | null>(null)
  const [picking, setPicking] = React.useState(false)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Invite a member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a member</DialogTitle>
          <DialogDescription>The role list and the calendar open over the dialog and take focus.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dialog-invite-email">Email</Label>
            <Input id="dialog-invite-email" placeholder="ada@example.com" type="email" />
          </div>
          <div className="grid gap-2">
            <Label id="dialog-invite-role">Role</Label>
            <Select defaultValue="viewer">
              <SelectTrigger aria-labelledby="dialog-invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label id="dialog-invite-until">Access until</Label>
            <Popover onOpenChange={setPicking} open={picking}>
              <PopoverTrigger asChild>
                <Button
                  aria-labelledby="dialog-invite-until dialog-invite-until-value"
                  className="justify-start"
                  variant="outline">
                  <CalendarIcon aria-hidden="true" />
                  <span id="dialog-invite-until-value">{until ? until.toDateString() : 'No end date'}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  defaultMonth={until ?? undefined}
                  mode="single"
                  onSelect={(day) => {
                    setUntil(day)
                    requestAnimationFrame(() => setPicking(false))
                  }}
                  selected={until}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Send invite</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
