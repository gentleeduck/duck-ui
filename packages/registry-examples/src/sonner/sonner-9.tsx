'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { toast } from 'sonner'

export default function Demo() {
  return (
    <Button
      onClick={() => {
        const id = toast.loading('Saving the draft...')
        setTimeout(() => toast.success('Draft saved', { description: 'Saved to your workspace.', id }), 1500)
      }}
      variant="outline">
      Save Draft
    </Button>
  )
}
