import { describe, expect, test } from 'bun:test'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Input } from '../input'

describe('registry-ui input', () => {
  test('Input is as tall as the select and button beside it, with the same shadow', () => {
    const html = renderToStaticMarkup(<Input />)

    expect(html).toContain('h-9')
    expect(html).toContain('shadow-xs')
  })
})
