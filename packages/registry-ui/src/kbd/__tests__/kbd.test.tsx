import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import * as React from 'react'
import { hydrateOnMac } from '../../_internal/__tests__/hydrate-on-mac'
import { Kbd, KbdGroup } from '../kbd'
import { MotionKbd } from '../motion-kbd'

afterEach(cleanup)

describe('registry-ui Kbd', () => {
  test('draws a key whose direction follows its own label, unless told otherwise', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <>
        <Kbd className="h-6" ref={ref}>
          Esc
        </Kbd>
        <Kbd dir="ltr">Tab</Kbd>
      </>,
    )

    const key = screen.getByText('Esc')
    expect(ref.current).toBe(key)
    expect(key.tagName).toBe('KBD')
    expect(key.getAttribute('data-slot')).toBe('kbd')
    expect(key.getAttribute('dir')).toBe('auto')
    expect(key.className.split(' ')).toContain('h-6')
    expect(key.className.split(' ')).not.toContain('h-5')
    expect(screen.getByText('Tab').getAttribute('dir')).toBe('ltr')
  })

  test('writes keys out as a label, which children replace', () => {
    render(
      <>
        <Kbd data-testid="combo" keys="shift+enter" />
        <Kbd keys="shift+enter">Send</Kbd>
        <Kbd data-testid="none" />
      </>,
    )

    expect(screen.getByTestId('combo').textContent).toBe('Shift+Enter')
    expect(screen.getByText('Send')).toBeTruthy()
    expect(screen.getByTestId('none').textContent).toBe('')
  })

  test("hydrates the keys a server drew, then shows the browser's own", async () => {
    const { container, errors, html, unmount } = await hydrateOnMac(<Kbd keys="mod+k" />)

    expect(html).toContain('>Ctrl+K</kbd>')
    expect(errors).toEqual([])
    expect(container.textContent).toBe('Cmd+K')
    unmount()
  })
})

describe('registry-ui KbdGroup', () => {
  test('wraps its keys in one kbd, which its ref reaches', () => {
    const ref = React.createRef<HTMLElement>()
    render(
      <KbdGroup className="gap-2" data-testid="group" ref={ref}>
        <Kbd>Ctrl</Kbd>
        <Kbd>S</Kbd>
      </KbdGroup>,
    )

    const group = screen.getByTestId('group')
    expect(ref.current).toBe(group)
    expect(group.tagName).toBe('KBD')
    expect(group.getAttribute('data-slot')).toBe('kbd-group')
    expect(group.getAttribute('dir')).toBe('auto')
    expect(group.className.split(' ')).toContain('gap-2')
    expect(group.querySelectorAll('[data-slot="kbd"]')).toHaveLength(2)
  })
})

describe('registry-ui MotionKbd', () => {
  test('scales a key in, takes keys, and keeps its index off the element', () => {
    render(
      <MotionKbd index={2} keys="shift+k">
        {undefined}
      </MotionKbd>,
    )

    const key = screen.getByText('Shift+K')
    expect((key.parentElement as HTMLElement).style.transform).toContain('scale(')
    expect(key.hasAttribute('index')).toBe(false)
  })
})
