import * as React from 'react'

// False on the server, and in a test DOM such as jsdom, which has no matchMedia.
function supported(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

export function useMediaQuery(query: string): boolean {
  // Lazy initializer: read the actual match on the client to avoid the
  // one-frame "non-matching" flash on mount. Falls back to `false` during SSR.
  const [value, setValue] = React.useState<boolean>(() => supported() && window.matchMedia(query).matches)

  React.useEffect(() => {
    if (!supported()) return

    function onChange(event: MediaQueryListEvent): void {
      setValue(event.matches)
    }

    const result = window.matchMedia(query)
    result.addEventListener('change', onChange)
    setValue(result.matches)

    return () => result.removeEventListener('change', onChange)
  }, [query])

  return value
}
