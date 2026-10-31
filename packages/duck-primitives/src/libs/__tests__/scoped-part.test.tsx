import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import type { Scope } from '../create-context'
import { createScopedPart } from '../scoped-part'

freshDom()

function recordingPart() {
  const received: Record<string, unknown>[] = []
  const Part = React.forwardRef<HTMLDivElement, Record<string, unknown>>((props, ref) => {
    received.push(props)
    return <div ref={ref} />
  })
  return { Part, received }
}

const toInnerScope = (scope: Scope) => ({ __scopeInner: scope })

describe('createScopedPart', () => {
  it('hands its own scope on as the inner scope and keeps it off the part', () => {
    const { Part, received } = recordingPart()
    const Item = createScopedPart('__scopeOuter', toInnerScope)(Part, 'OuterItem')
    const scope = { Outer: [] }

    render(<Item {...{ __scopeOuter: scope }} title="New" />)

    expect(received[0]).toEqual({ __scopeInner: scope, title: 'New' })
  })

  it('names the part it makes', () => {
    const { Part } = recordingPart()

    expect(createScopedPart('__scopeOuter', toInnerScope)(Part, 'OuterItem').displayName).toBe('OuterItem')
  })
})
