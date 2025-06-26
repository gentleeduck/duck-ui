export function useComputedTimeoutTransition(element: HTMLElement | null, callback: () => void, timeout: number = 300) {
  let duration = timeout

  if (!element) {
    const timer = setTimeout(callback, timeout)
    return () => clearTimeout(timer)
  }

  try {
    if (element.isConnected && element.style.transitionDuration !== undefined) {
      const computedDuration = getComputedStyle(element).transitionDuration
      if (computedDuration && computedDuration !== '0s') {
        const parsed = Number.parseFloat(computedDuration) * 1000
        if (parsed > 0 && isFinite(parsed)) {
          duration = parsed
        }
      }
    }
  } catch (error) {
    console.error('ComputedTimeout:', error)
    duration = timeout
  }

  const timer = setTimeout(callback, duration)

  return () => clearTimeout(timer)
}
