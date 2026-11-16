'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { SonnerUpload } from '@gentleduck/registry-ui/sonner'
import React from 'react'
import { toast } from 'sonner'

export default function Demo() {
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = React.useRef(0)
  const toastId = 'multi-upload'

  const updateToast = (progress: number) => {
    toast(
      <SonnerUpload
        attachments={5}
        onCancel={handleCancel}
        onComplete={handleComplete}
        progress={progress}
        remainingTime={Math.max(0, Math.round((100 - progress) * 0.6))}
      />,
      { dismissible: false, duration: 60000, id: toastId },
    )
  }

  const startProgress = () => {
    progressRef.current = 0
    updateToast(0)

    intervalRef.current = setInterval(() => {
      const step = Math.floor(Math.random() * 6) + 2
      progressRef.current = Math.min(progressRef.current + step, 100)
      updateToast(progressRef.current)

      if (progressRef.current >= 100) stop()
    }, 600)
  }

  const stop = React.useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  React.useEffect(() => stop, [stop])

  const handleCancel = () => {
    toast.dismiss(toastId)
    stop()
  }

  const handleComplete = () => {
    toast.dismiss(toastId)
    toast.success('All 5 files uploaded successfully')
  }

  const handleClick = () => {
    handleCancel()
    startProgress()
  }

  return (
    <Button border="default" onClick={handleClick} size="sm" variant="outline">
      Upload 5 Files
    </Button>
  )
}
