import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import * as Sheet from '../index'

describe('Sheet', () => {
  it('re-exports Dialog components', () => {
    expect(Sheet.Root).toBeDefined()
    expect(Sheet.Trigger).toBeDefined()
    expect(Sheet.Close).toBeDefined()
    expect(Sheet.Portal).toBeDefined()
    expect(Sheet.Overlay).toBeDefined()
    expect(Sheet.Content).toBeDefined()
    expect(Sheet.Title).toBeDefined()
    expect(Sheet.Description).toBeDefined()
  })

  it('renders trigger with data-slot="dialog-trigger"', () => {
    const { container } = render(
      <Sheet.Root>
        <Sheet.Trigger>Open Sheet</Sheet.Trigger>
      </Sheet.Root>,
    )
    expect(container.querySelector('[data-slot="dialog-trigger"]')).not.toBeNull()
  })
})
