'use client'

import { formatForDisplay } from '@gentleduck/vim/format'
import { detectPlatform } from '@gentleduck/vim/platform'
import * as React from 'react'

const subscribe = () => () => {}
// A server cannot tell the platform, so it draws Linux's keys and the browser swaps in its own once hydrated.
const onServer = () => 'linux' as const

/** Writes a binding such as `mod+k` out for the platform the page runs on, or `null` without one. */
export function useKeysLabel(keys: string | undefined) {
  const platform = React.useSyncExternalStore(subscribe, detectPlatform, onServer)
  return keys ? formatForDisplay(keys, { platform }) : null
}
