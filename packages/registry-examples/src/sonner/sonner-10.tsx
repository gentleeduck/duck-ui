'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { toast } from 'sonner'

export default function Demo() {
  return (
    <Button
      onClick={() =>
        toast('Message archived', {
          action: { label: 'Undo', onClick: () => toast.success('Message restored') },
          cancel: { label: 'Dismiss', onClick: () => {} },
        })
      }
      variant="outline">
      Archive Message
    </Button>
  )
}
