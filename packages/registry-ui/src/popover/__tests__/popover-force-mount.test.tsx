import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'

afterEach(cleanup)

describe('registry-ui popover forceMount', () => {
  test('keeps the content in the page while closed, marked closed, for an exit animation to run on', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent forceMount>Body</PopoverContent>
      </Popover>,
    )

    expect(document.querySelector('[role="dialog"]')?.getAttribute('data-state')).toBe('closed')
  })
})
