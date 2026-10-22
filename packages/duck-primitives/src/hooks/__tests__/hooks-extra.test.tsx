import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { useLayoutEffect } from '../use-layout-effect'

// --- useLayoutEffect ---

describe('useLayoutEffect', () => {
  it('is a function', () => {
    expect(typeof useLayoutEffect).toBe('function')
  })

  it('runs synchronously during render in jsdom', () => {
    let ran = false
    function Comp() {
      useLayoutEffect(() => {
        ran = true
      }, [])
      return null
    }
    render(<Comp />)
    expect(ran).toBe(true)
  })
})
