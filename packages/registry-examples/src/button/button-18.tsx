import { Button } from '@gentleduck/registry-ui/button'
import { Inbox } from 'lucide-react'
import React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState<boolean>(false)

  return (
    <Button
      aria-label={open ? 'Inbox' : undefined}
      icon={<Inbox />}
      isCollapsed={open}
      onClick={() => setOpen(!open)}
      type="button">
      Inbox
    </Button>
  )
}
