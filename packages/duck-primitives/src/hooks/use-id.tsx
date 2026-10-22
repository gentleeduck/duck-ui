import * as React from 'react'

/** A stable id from React's `useId`, unless `deterministicId` is given. */
function useId(deterministicId?: string): string {
  const id = React.useId()
  return deterministicId || `gentleduck-${id}`
}

export { useId }
