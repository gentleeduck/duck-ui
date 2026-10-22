import * as React from 'react'

function usePrevious<T>(value: T) {
  const ref = React.useRef({ value, previous: value })
  // Recorded on commit, since a render React throws away, as when a transition suspends, never reached the page.
  React.useInsertionEffect(() => {
    if (ref.current.value !== value) ref.current = { value, previous: ref.current.value }
  })
  return ref.current.value === value ? ref.current.previous : ref.current.value
}

export { usePrevious }
