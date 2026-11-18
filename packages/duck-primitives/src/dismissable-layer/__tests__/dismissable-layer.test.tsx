import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { DismissableLayer } from '../dismissable-layer'

describe('DismissableLayer', () => {
  it('renders children', () => {
    const { container } = render(
      <DismissableLayer>
        <span>inside layer</span>
      </DismissableLayer>,
    )
    expect(container.textContent).toBe('inside layer')
  })

  it('renders as a div', () => {
    const { container } = render(
      <DismissableLayer>
        <span>content</span>
      </DismissableLayer>,
    )
    expect(container.querySelector('div')).not.toBeNull()
  })

  it('calls onEscapeKeyDown when Escape is pressed', () => {
    const handler = mock(() => {})
    render(
      <DismissableLayer onEscapeKeyDown={handler}>
        <span>content</span>
      </DismissableLayer>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss when Escape is pressed', () => {
    const handler = mock(() => {})
    render(
      <DismissableLayer onDismiss={handler}>
        <span>content</span>
      </DismissableLayer>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <DismissableLayer ref={ref}>
        <span>ref test</span>
      </DismissableLayer>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('does not call onDismiss on non-Escape keys', () => {
    const handler = mock(() => {})
    render(
      <DismissableLayer onDismiss={handler}>
        <span>content</span>
      </DismissableLayer>,
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.keyDown(document, { key: 'ArrowDown' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('onEscapeKeyDown receives the keyboard event', () => {
    let receivedEvent: KeyboardEvent | null = null
    render(
      <DismissableLayer
        onEscapeKeyDown={(e) => {
          receivedEvent = e
        }}>
        <span>content</span>
      </DismissableLayer>,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(receivedEvent).not.toBeNull()
    expect(receivedEvent!.key).toBe('Escape')
  })

  it('passes className through', () => {
    const { container } = render(
      <DismissableLayer className="my-layer">
        <span>content</span>
      </DismissableLayer>,
    )
    expect(container.querySelector('.my-layer')).not.toBeNull()
  })
})
