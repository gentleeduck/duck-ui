import * as React from 'react'
import { createSlot } from '../slot'
import type { IPrimitive } from './primitive-elements.types'

const NODES = [
  'a',
  'button',
  'div',
  'form',
  'h2',
  'h3',
  'img',
  'input',
  'label',
  'li',
  'nav',
  'ol',
  'p',
  'select',
  'span',
  'svg',
  'ul',
] as const

type Node = (typeof NODES)[number]

type Primitives = { [E in Node]: IPrimitive.IComponent<E> }

// Tag window once at module init (devtools/feature-detection signal); not per-render.
if (typeof window !== 'undefined') {
  ;(window as unknown as Record<symbol, boolean>)[Symbol.for('gentleduck-ui')] = true
}

const slots: Partial<Record<Node, React.ElementType>> = {}

/**
 * What `Primitive[node]` renders, for a component that renders it in place of `Primitive[node]` and so costs one
 * fiber fewer per element. Its own slots, made on first use, keep it out of a bundle that never calls it.
 */
function primitiveElement(node: Node, asChild: boolean | undefined): React.ElementType {
  if (!asChild) return node
  const slot = slots[node] ?? createSlot(`Primitive.${node}`)
  slots[node] = slot
  return slot
}

function createPrimitive<E extends Node>(node: E): IPrimitive.IComponent<E> {
  const Slot = createSlot(`Primitive.${node}`)

  const PrimitiveNode = React.forwardRef<React.ComponentRef<E>, IPrimitive.IPropsWithRef<E>>(
    ({ asChild, ...primitiveProps }, forwardedRef) => {
      const Comp = (asChild ? Slot : node) as React.ElementType
      return <Comp {...primitiveProps} ref={forwardedRef} />
    },
  )

  PrimitiveNode.displayName = `Primitive.${node}`

  return PrimitiveNode as unknown as IPrimitive.IComponent<E>
}

const Primitive = {} as Primitives

for (const node of NODES) {
  Primitive[node] = createPrimitive(node)
}

export { Primitive, Primitive as Root, primitiveElement }
