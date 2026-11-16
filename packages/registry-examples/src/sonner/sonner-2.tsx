'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function Demo() {
  return (
    <Button
      onClick={() =>
        toast('Your session expires in 5 minutes', {
          action: {
            label: 'Stay signed in',
            onClick: () => toast.success('Session extended'),
          },
          className: 'gap-3',
          description: 'Save your work to keep it.',
          icon: <ShieldAlert />,
        })
      }
      variant="outline">
      Show Toast
    </Button>
  )
}
