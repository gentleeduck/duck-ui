import React from 'react'

let globalIdCounter = 0

export function useStableId(prefix = 'id') {
  const idRef = React.useRef<string>(null)
  if (!idRef.current) {
    idRef.current = `${prefix}-${++globalIdCounter}`
  }
  return idRef.current
}
