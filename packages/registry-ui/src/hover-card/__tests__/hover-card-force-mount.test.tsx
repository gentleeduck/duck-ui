import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../hover-card'

afterEach(cleanup)

describe('registry-ui hover-card forceMount', () => {
  test('keeps the content in the page while closed, marked closed, for an exit animation to run on', () => {
    render(
      <HoverCard>
        <HoverCardTrigger href="#profile">Profile</HoverCardTrigger>
        <HoverCardContent forceMount>Card</HoverCardContent>
      </HoverCard>,
    )

    expect(document.querySelector('[data-slot="hover-card-content"]')?.getAttribute('data-state')).toBe('closed')
  })
})
