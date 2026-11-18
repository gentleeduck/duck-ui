'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  DialogCloseResponsive,
  DialogContentResponsive,
  DialogDescriptionResponsive,
  DialogFooterResponsive,
  DialogHeaderResponsive,
  DialogResponsive,
  DialogTitleResponsive,
  DialogTriggerResponsive,
} from '@gentleduck/registry-ui/dialog'
import { Input } from '@gentleduck/registry-ui/input'

export default function Demo() {
  return (
    <DialogResponsive>
      <DialogTriggerResponsive asChild>
        <Button variant="outline">Share</Button>
      </DialogTriggerResponsive>
      <DialogContentResponsive className="sm:max-w-md">
        <DialogHeaderResponsive>
          <DialogTitleResponsive>Share the board</DialogTitleResponsive>
          <DialogDescriptionResponsive>
            A dialog at 768px and wider, a drawer from the bottom below that.
          </DialogDescriptionResponsive>
        </DialogHeaderResponsive>
        <div className="px-4 sm:px-0">
          <Input aria-label="Link" defaultValue="https://duck.example/board/42" readOnly />
        </div>
        <DialogFooterResponsive>
          <DialogCloseResponsive asChild>
            <Button>Done</Button>
          </DialogCloseResponsive>
        </DialogFooterResponsive>
      </DialogContentResponsive>
    </DialogResponsive>
  )
}
