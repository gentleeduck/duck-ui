import { describe, expect, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Progress } from '../progress'

describe('registry-ui progress', () => {
  test('fills from the left in LTR', () => {
    const html = renderToStaticMarkup(<Progress value={30} />)

    expect(html).toContain('dir="ltr"')
    expect(html).toContain('transform:translateX(-70%)')
  })

  test('fills from the right under a DirectionProvider without a dir prop', () => {
    const html = renderToStaticMarkup(
      <DirectionProvider dir="rtl">
        <Progress value={30} />
      </DirectionProvider>,
    )

    expect(html).toContain('role="progressbar"')
    expect(html).toContain('transform:translateX(70%)')
  })
})
