import * as React from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getComponentRef } from '../get-component-ref'

const warnings: string[] = []
const warningGetter = (side: string) =>
  Object.assign(
    () => {
      warnings.push(side)
      return undefined
    },
    { isReactWarning: true },
  )

describe('getComponentRef', () => {
  beforeEach(() => {
    warnings.length = 0
  })

  it('reads element.ref, never the props.ref that warns under React 18', () => {
    const ref = React.createRef<HTMLDivElement>()
    const element = {
      type: 'div',
      key: null,
      props: Object.defineProperty({}, 'ref', { get: warningGetter('props') }),
      ref,
    }

    expect([getComponentRef(element), warnings]).toEqual([ref, []])
  })

  it('reads props.ref, never the element.ref that warns under React 19, even with no ref given', () => {
    const ref = React.createRef<HTMLDivElement>()
    const withRef = Object.defineProperty({ type: 'div', key: null, props: { ref } }, 'ref', {
      get: warningGetter('element'),
    })
    const withoutRef = Object.defineProperty({ type: 'div', key: null, props: {} }, 'ref', {
      get: warningGetter('element'),
    })

    expect([getComponentRef(withRef), getComponentRef(withoutRef), warnings]).toEqual([ref, undefined, []])
  })

  it('reads props.ref off an element with no ref field of its own, as React has once it drops element.ref', () => {
    const ref = React.createRef<HTMLDivElement>()

    expect(getComponentRef({ type: 'div', key: null, props: { ref } })).toBe(ref)
  })

  it('reads the ref off an element React made', () => {
    const ref = React.createRef<HTMLDivElement>()

    expect(getComponentRef(React.createElement('div', { ref }))).toBe(ref)
  })
})
