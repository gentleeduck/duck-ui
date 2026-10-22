'use client'

import * as React from 'react'
import { getTransitionMs, isTransitioning } from './mount.libs'
import type { IMount } from './mount.types'

// A forwarded ref and not a `ref` prop, which React 18 never hands a function component.
const MountMinimal = React.forwardRef<HTMLElement, IMount.IMinimalProps>(function MountMinimal(
  { forceMount = false, open = false, children, skipWaiting = false, renderOnce = false },
  ref,
) {
  const shouldRender = forceMount || open
  const [mounted, setMounted] = React.useState(shouldRender)
  // Set while rendering, so opening commits the children at once instead of rendering them a second time.
  if (shouldRender && !mounted) setMounted(true)

  React.useEffect(() => {
    if (shouldRender || !mounted || renderOnce) return
    // The ref is read, never written: it points at the element whose transition the children wait out.
    const element = typeof ref === 'function' ? null : ref?.current
    if (skipWaiting || !element || !isTransitioning(element)) {
      setMounted(false)
      return
    }
    const timer = setTimeout(() => setMounted(false), getTransitionMs(element))
    return () => clearTimeout(timer)
  }, [shouldRender, mounted, ref, skipWaiting, renderOnce])

  return mounted ? children : null
})

export { MountMinimal }
