import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, test } from 'vitest'
import { Collapsible, CollapsibleTrigger } from '../collapsible'
import { MotionCollapsibleContent } from '../motion-collapsible'

afterEach(cleanup)

describe('registry-ui MotionCollapsibleContent', () => {
  test('keeps closed content in the page but out of reach, and hands it over on open', () => {
    const ref = React.createRef<HTMLElement>()
    const { container } = render(
      <Collapsible>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <MotionCollapsibleContent className="pt-2" ref={ref}>
          Three ducks
        </MotionCollapsibleContent>
      </Collapsible>,
    )
    const content = container.querySelector('[data-slot="collapsible-content"]') as HTMLElement
    expect([content.getAttribute('aria-hidden'), content.hasAttribute('inert')]).toEqual(['true', true])
    expect(screen.getByText('Three ducks').className).toBe('pt-2')

    fireEvent.click(screen.getByRole('button', { name: 'Details' }))

    expect([content.getAttribute('aria-hidden'), content.hasAttribute('inert')]).toEqual(['false', false])
    expect(screen.getByRole('button', { name: 'Details' }).getAttribute('aria-controls')).toBe(content.id)
    expect(ref.current).toBe(content)
  })
})
