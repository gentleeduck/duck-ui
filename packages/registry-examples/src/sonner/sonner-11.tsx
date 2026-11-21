'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Toaster } from '@gentleduck/registry-ui/sonner'
import * as React from 'react'
import { toast } from 'sonner'

const TOASTER_ID = 'sonner-placement'
const POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const
const THEMES = ['light', 'dark', 'system'] as const

export default function Demo() {
  const [position, setPosition] = React.useState<(typeof POSITIONS)[number]>('top-center')
  const [theme, setTheme] = React.useState<(typeof THEMES)[number]>('dark')

  return (
    <div className="flex flex-col items-center gap-3">
      <Toaster id={TOASTER_ID} position={position} theme={theme} />
      <div className="flex flex-wrap justify-center gap-2">
        {POSITIONS.map((value) => (
          <Button
            key={value}
            onClick={() => setPosition(value)}
            size="sm"
            variant={value === position ? 'default' : 'outline'}>
            {value}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        {THEMES.map((value) => (
          <Button
            key={value}
            onClick={() => setTheme(value)}
            size="sm"
            variant={value === theme ? 'default' : 'outline'}>
            {value}
          </Button>
        ))}
      </div>
      <Button onClick={() => toast('Saved', { description: `${position}, ${theme} theme`, toasterId: TOASTER_ID })}>
        Show a toast
      </Button>
    </div>
  )
}
