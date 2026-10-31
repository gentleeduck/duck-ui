'use client'

import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { joinIds } from '../libs/join-ids'

/** Ids registered by the parts that mount inside the content, in mount order. */
export function useIdRegistry() {
  const [registry] = React.useState(() => new Map<string, string>())
  const [ids, setIds] = React.useState<string>()
  const onIdChange = React.useCallback(
    (key: string, id?: string) => {
      if (id) registry.set(key, id)
      else registry.delete(key)
      setIds(joinIds(...registry.values()))
    },
    [registry],
  )
  return [ids, onIdChange, registry] as const
}

/** The part's id, its own or a generated one, registered with the content for as long as the part is mounted. */
export function useRegisteredId(idProp: string | undefined, onIdChange: (key: string, id?: string) => void) {
  const key = React.useId()
  const id = idProp || key
  // Split so a changed id keeps its place in the list, and only unmounting removes it.
  useLayoutEffect(() => () => onIdChange(key), [key, onIdChange])
  useLayoutEffect(() => onIdChange(key, id), [key, id, onIdChange])
  return id
}
