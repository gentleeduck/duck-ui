import { describe, expect, it, mock, spyOn } from 'bun:test'
import { freshDom } from '../../__tests__/dom'
import { focusOn } from '../focus-on'

freshDom()

const autoFocus = () => new Event('focusScope.autoFocusOnMount', { cancelable: true })

describe('focusOn', () => {
  it('hands back the handler it is given when no target is named', () => {
    const handler = mock((_event: Event) => {})

    expect(focusOn(handler, undefined)).toBe(handler)
  })

  it('calls the handler, keeps the focus scope from moving focus, and focuses the target without scrolling', () => {
    const target = document.body.appendChild(document.createElement('button'))
    const focus = spyOn(target, 'focus')
    const handler = mock((_event: Event) => {})
    const event = autoFocus()

    focusOn(handler, { current: target })?.(event)

    expect([handler.mock.calls.length, event.defaultPrevented, focus.mock.calls]).toEqual([
      1,
      true,
      [[{ preventScroll: true }]],
    ])
    expect(document.activeElement).toBe(target)
    target.remove()
  })

  it('keeps the focus scope from moving focus and focuses nothing for a target of false', () => {
    const event = autoFocus()

    focusOn(undefined, false)?.(event)

    expect([event.defaultPrevented, document.activeElement]).toEqual([true, document.body])
  })

  it('leaves focus to a handler that prevents the default itself', () => {
    const target = document.body.appendChild(document.createElement('button'))
    const event = autoFocus()

    focusOn((handled) => handled.preventDefault(), { current: target })?.(event)

    expect(document.activeElement).toBe(document.body)
    target.remove()
  })
})
