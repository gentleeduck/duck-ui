import * as React from 'react'
import type { IDirection } from './direction.types'

const DIRECTION_DICTIONARY = {
  ltr: 'ltr',
  rtl: 'rtl',
} as const

const DirectionContext = React.createContext<IDirection.Kind | undefined>(undefined)

const DirectionProvider: React.FC<IDirection.IProviderProps> = (props) => {
  const { dir, children } = props
  return (
    <DirectionContext.Provider value={dir}>
      {/* `display: contents` keeps the wrapper out of layout; `dir` still flows to descendants. */}
      <div data-slot="direction" dir={dir} style={{ display: 'contents' }}>
        {children}
      </div>
    </DirectionContext.Provider>
  )
}

const documentDirListeners = new Set<() => void>()
let documentDirObserver: MutationObserver | undefined

// One observer for every mounted primitive: one each made unmounting a page of toggles 1.8x slower than Radix.
// Observing again is a no-op on the same root and picks up a replaced one.
function subscribeToDocumentDir(onChange: () => void) {
  documentDirListeners.add(onChange)
  documentDirObserver ??= new MutationObserver(() => {
    for (const listener of documentDirListeners) listener()
  })
  documentDirObserver.observe(document.documentElement, { attributeFilter: ['dir'], attributes: true })
  return () => documentDirListeners.delete(onChange)
}

function getDocumentDir(): IDirection.Kind {
  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
}

function getServerDir(): IDirection.Kind {
  return 'ltr'
}

/** Resolves `dir` prop -> nearest `DirectionProvider` -> `<html dir>`, so setting it once anywhere is enough. */
function useDirection(localDir?: IDirection.Kind): IDirection.Kind {
  const globalDir = React.useContext(DirectionContext)
  const documentDir = React.useSyncExternalStore(subscribeToDocumentDir, getDocumentDir, getServerDir)
  return localDir || globalDir || documentDir
}

const Provider = DirectionProvider

export { DIRECTION_DICTIONARY, DirectionContext, DirectionProvider, Provider, useDirection }
