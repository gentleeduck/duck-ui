import { act, render } from '@testing-library/react'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { freshDom } from '../../__tests__/dom'
import { DIRECTION_DICTIONARY, DirectionProvider, useDirection } from '../direction'

freshDom()

function DirectionDisplay({ localDir }: { localDir?: 'ltr' | 'rtl' }) {
  const dir = useDirection(localDir)
  return <span data-testid="dir">{dir}</span>
}

describe('IDirection.Kind', () => {
  it('defaults to ltr when no provider or local dir', () => {
    const { container } = render(<DirectionDisplay />)
    expect(container.querySelector('[data-testid="dir"]')?.textContent).toBe('ltr')
  })

  it('uses local dir over provider', () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <DirectionDisplay localDir="ltr" />
      </DirectionProvider>,
    )
    expect(container.querySelector('[data-testid="dir"]')?.textContent).toBe('ltr')
  })

  it('uses provider dir when no local dir', () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <DirectionDisplay />
      </DirectionProvider>,
    )
    expect(container.querySelector('[data-testid="dir"]')?.textContent).toBe('rtl')
  })

  it('DirectionProvider renders a wrapper div with dir attribute', () => {
    const { container } = render(
      <DirectionProvider dir="rtl">
        <span>content</span>
      </DirectionProvider>,
    )
    const wrapper = container.querySelector('div[dir="rtl"]')
    expect(wrapper).not.toBeNull()
    expect(wrapper?.style.display).toBe('contents')
    expect(wrapper?.getAttribute('data-slot')).toBe('direction')
  })

  it('names the two directions', () => {
    expect(DIRECTION_DICTIONARY).toEqual({ ltr: 'ltr', rtl: 'rtl' })
  })

  it('falls back to the html dir attribute and follows changes', () => {
    document.documentElement.dir = 'rtl'
    try {
      const { container } = render(<DirectionDisplay />)
      expect(container.querySelector('[data-testid="dir"]')?.textContent).toBe('rtl')
    } finally {
      document.documentElement.removeAttribute('dir')
    }
  })

  it('re-renders when the html dir attribute changes', async () => {
    const { container } = render(<DirectionDisplay />)
    expect(container.querySelector('[data-testid="dir"]')?.textContent).toBe('ltr')
    await act(async () => {
      document.documentElement.dir = 'rtl'
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(container.querySelector('[data-testid="dir"]')?.textContent).toBe('rtl')
    document.documentElement.removeAttribute('dir')
  })

  it('stops reading the html dir once it unmounts', async () => {
    const { unmount } = render(<DirectionDisplay />)
    unmount()
    const html = document.documentElement
    const dir = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dir')!
    let reads = 0
    Object.defineProperty(html, 'dir', {
      configurable: true,
      get() {
        reads++
        return dir.get?.call(this)
      },
      set(value) {
        dir.set?.call(this, value)
      },
    })

    try {
      await act(async () => {
        html.dir = 'rtl'
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(reads).toBe(0)
    } finally {
      Reflect.deleteProperty(html, 'dir')
      html.removeAttribute('dir')
    }
  })

  it('shares one observer of the html dir between every reader', () => {
    const Observer = globalThis.MutationObserver
    let made = 0
    globalThis.MutationObserver = class extends Observer {
      constructor(callback: MutationCallback) {
        super(callback)
        made++
      }
    }

    try {
      render(
        <>
          <DirectionDisplay />
          <DirectionDisplay />
          <DirectionDisplay />
        </>,
      )

      expect(made).toBeLessThanOrEqual(1)
    } finally {
      globalThis.MutationObserver = Observer
    }
  })

  it('follows the dir of an html element that replaced the old one', async () => {
    render(<DirectionDisplay />).unmount()
    const old = document.documentElement
    const next = document.createElement('html')
    next.append(document.createElement('head'), document.createElement('body'))
    document.replaceChild(next, old)

    try {
      const { container, unmount } = render(<DirectionDisplay />)
      await act(async () => {
        next.dir = 'rtl'
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      expect(container.querySelector('[data-testid="dir"]')?.textContent).toBe('rtl')
      unmount()
    } finally {
      document.replaceChild(old, next)
    }
  })
})

describe('useDirection on the server', () => {
  it('renders ltr, since there is no html dir to read there', () => {
    expect(renderToString(<DirectionDisplay />)).toBe('<span data-testid="dir">ltr</span>')
  })
})
