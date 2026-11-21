'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@gentleduck/registry-ui/dialog'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Write feedback</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined} className="data-[state=closed]:hidden" forceMount>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
        </DialogHeader>
        <Textarea placeholder="Close and reopen: the text is still here" rows={4} />
      </DialogContent>
    </Dialog>
  )
}
