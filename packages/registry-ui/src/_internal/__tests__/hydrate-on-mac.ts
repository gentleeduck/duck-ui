import { _resetPlatformCache } from '@gentleduck/vim/platform'
import { act } from '@testing-library/react'
import type * as React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'

const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15'

function asPlatform(navigator: { userAgent: string } | undefined) {
  _resetPlatformCache()
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: navigator })
}

/** Draws the element as a server does, with no `navigator`, then hydrates that HTML in a Mac browser. */
export async function hydrateOnMac(element: React.ReactElement) {
  const navigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const errors: unknown[] = []
  const container = document.createElement('div')
  try {
    asPlatform(undefined)
    const html = renderToString(element)
    asPlatform({ userAgent: MAC })
    container.innerHTML = html
    document.body.append(container)
    const root = await act(async () =>
      hydrateRoot(container, element, { onRecoverableError: errors.push.bind(errors) }),
    )
    return {
      container,
      errors,
      html,
      unmount: () => {
        act(() => root.unmount())
        container.remove()
      },
    }
  } finally {
    _resetPlatformCache()
    if (navigator) Object.defineProperty(globalThis, 'navigator', navigator)
  }
}
