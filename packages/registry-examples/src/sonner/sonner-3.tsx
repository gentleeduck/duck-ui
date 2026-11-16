'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { SonnerUpload } from '@gentleduck/registry-ui/sonner'
import React from 'react'
import { toast } from 'sonner'

const TOAST_ID = 'sonner-upload'

export default function Demo() {
  const controllerRef = React.useRef(new AbortController())
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = React.useRef(0)

  const stop = React.useCallback(() => {
    controllerRef.current.abort()
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  // The toaster outlives the demo, so the toast it owns goes with it.
  React.useEffect(
    () => () => {
      stop()
      toast.dismiss(TOAST_ID)
    },
    [stop],
  )

  const show = (progress: number) => {
    toast(
      <SonnerUpload
        attachments={2}
        onCancel={(_, dismiss) => {
          stop()
          dismiss(TOAST_ID)
        }}
        onComplete={(_, dismiss) => dismiss(TOAST_ID)}
        progress={progress}
        remainingTime={Math.max(0, 3000 - progress * 30)}
      />,
      { dismissible: false, duration: 30000, id: TOAST_ID },
    )
  }

  const start = () => {
    stop()
    controllerRef.current = new AbortController()
    progressRef.current = 0
    show(0)
    intervalRef.current = setInterval(() => {
      progressRef.current = Math.min(progressRef.current + Math.floor(Math.random() * 11) + 5, 100)
      show(progressRef.current)
      if (progressRef.current >= 100) stop()
    }, 400)
  }

  return (
    <Button border="default" onClick={start} size="sm" variant="outline">
      Show Upload Toast
    </Button>
  )
}
