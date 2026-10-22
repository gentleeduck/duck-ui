'use client'

import * as React from 'react'
import type { IMount } from './mount.types'

function Mount({ open, children, animationDuration = 400 }: IMount.IProps) {
  const [mounted, setMounted] = React.useState(open)
  // Set while rendering, so the children appear in the commit that opens it rather than a frame later.
  if (open && !mounted) setMounted(true)

  React.useEffect(() => {
    if (open || !mounted) return
    const timer = setTimeout(() => setMounted(false), animationDuration)
    return () => clearTimeout(timer)
  }, [open, mounted, animationDuration])

  return mounted ? children : null
}

export { Mount }
