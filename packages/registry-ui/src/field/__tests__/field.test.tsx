import { describe, expect, test } from 'bun:test'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { FieldError } from '../field'

describe('registry-ui field error', () => {
  test('renders nothing while no error carries a message', () => {
    expect(renderToStaticMarkup(<FieldError errors={[]} />)).toBe('')
    expect(renderToStaticMarkup(<FieldError errors={[undefined, {}]} />)).toBe('')
  })

  test('shows a lone message as itself, with no list around it', () => {
    expect(renderToStaticMarkup(<FieldError errors={[undefined, { message: 'Required' }]} />)).toMatch(
      /role="alert">Required<\/div>$/,
    )
  })

  test('lists several messages', () => {
    expect(renderToStaticMarkup(<FieldError errors={[{ message: 'Too short' }, { message: 'No digit' }]} />)).toContain(
      '<li>Too short</li><li>No digit</li>',
    )
  })
})
