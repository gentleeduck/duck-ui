import * as React from 'react'
import { useLayoutEffect } from './use-layout-effect'

type Size = { width: number; height: number }

/** Border-box size via ResizeObserver; initial size delivered synchronously from offset*. */
function useSize(element: HTMLElement | null) {
  const [size, setSize] = React.useState<Size | undefined>(undefined)

  useLayoutEffect(() => {
    if (!element) {
      setSize(undefined)
      return
    }

    // The observer's first report repeats the offset size, so skipping a repeat spares a render per mount.
    let last: Size | undefined
    const update = (width: number, height: number) => {
      if (last?.width === width && last.height === height) return
      last = { width, height }
      setSize(last)
    }
    update(element.offsetWidth, element.offsetHeight)

    let frame = 0
    const observer = new ResizeObserver((entries) => {
      const entry = entries?.[0]
      if (!entry) return
      // A layout change made in the same frame would loop the observer and log "undelivered notifications".
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        if ('borderBoxSize' in entry) {
          const box = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize
          update(box.inlineSize, box.blockSize)
        } else {
          update(element.offsetWidth, element.offsetHeight)
        }
      })
    })
    observer.observe(element, { box: 'border-box' })

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [element])

  return size
}

export { useSize }
