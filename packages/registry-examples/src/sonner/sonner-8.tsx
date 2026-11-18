'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Toaster } from '@gentleduck/registry-ui/sonner'
import { toast } from 'sonner'

const TOASTER_ID = 'sonner-rich'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toaster closeButton expand id={TOASTER_ID} richColors />
      <Button onClick={() => toast.success('Payment received', { toasterId: TOASTER_ID })} variant="outline">
        Success
      </Button>
      <Button onClick={() => toast.error('Card declined', { toasterId: TOASTER_ID })} variant="outline">
        Error
      </Button>
      <Button onClick={() => toast.warning('Card expires next month', { toasterId: TOASTER_ID })} variant="outline">
        Warning
      </Button>
      <Button onClick={() => toast.info('Receipt sent by email', { toasterId: TOASTER_ID })} variant="outline">
        Info
      </Button>
    </div>
  )
}
