import * as React from 'react'
import { useComposedRefs } from '../libs/compose-ref'
import { getComponentRef } from '../libs/get-component-ref'
import { joinIds } from '../libs/join-ids'
import type { ISlot } from './slot.types'

const REACT_LAZY_TYPE = Symbol.for('react.lazy')
// biome-ignore lint/suspicious/noExplicitAny: accessing React.use without bundler treeshaking it
const reactUse = (React as any)[' use '.trim()] as (<T>(usable: PromiseLike<T>) => T) | undefined

type AnyProps = { ref?: React.Ref<unknown> | undefined; children?: React.ReactNode; [key: string]: unknown }
type LazyReference = { _payload: PromiseLike<React.ReactNode> }
type SlottableElement = React.ReactElement<ISlot.ISlottableProps, ISlot.ISlottableComponent>

/* @__NO_SIDE_EFFECTS__ */ export function createSlot(ownerName: string) {
  const Slot = React.forwardRef<HTMLElement, ISlot.IProps>((props, forwardedRef) => {
    const { children: childrenProp, ...slotProps } = props
    const children = unwrapLazy(childrenProp)
    const target = getTarget(children)
    const targetRef = target ? getComponentRef(target) : undefined
    const composedRef = useComposedRefs(forwardedRef, targetRef)

    if (!target) {
      if (!children && children !== 0) return null
      const slottable = React.Children.toArray(children).some(isSlottable)
      throw new Error(
        `${ownerName} failed to slot onto its ${slottable ? '`Slottable`' : 'children'}. Expected a single React element ${slottable ? 'inside `Slottable`' : 'child or `Slottable`'}.`,
      )
    }

    const merged = mergeProps(slotProps, target.props)
    // React 19 refuses a ref on a Fragment.
    if (target.type !== React.Fragment) merged.ref = forwardedRef ? composedRef : targetRef
    return React.cloneElement(target, merged)
  })

  Slot.displayName = `${ownerName}.Slot`
  return Slot
}

const Slot = createSlot('Slot')

// Shared through the global registry, so another copy of the package's Slottable is still recognized.
const SLOTTABLE_IDENTIFIER = Symbol.for('gentleduck.slottable')

/* @__NO_SIDE_EFFECTS__ */ export function createSlottable(ownerName: string) {
  const Slottable: ISlot.ISlottableComponent = (props) =>
    'child' in props ? props.children(props.child) : props.children
  Slottable.displayName = `${ownerName}.Slottable`
  Slottable.__radixId = SLOTTABLE_IDENTIFIER
  return Slottable
}

const Slottable = createSlottable('Slottable')

function isSlottable(child: React.ReactNode): child is SlottableElement {
  return (
    React.isValidElement(child) &&
    typeof child.type === 'function' &&
    '__radixId' in child.type &&
    child.type.__radixId === SLOTTABLE_IDENTIFIER
  )
}

function isLazyReference(node: unknown): node is LazyReference {
  const payload = (node as { _payload?: { then?: unknown } } | null)?._payload
  return (node as { $$typeof?: unknown } | null)?.$$typeof === REACT_LAZY_TYPE && typeof payload?.then === 'function'
}

// A Flight reference can resolve to another reference, so this runs until it reaches the node. `use` may run in a loop.
function unwrapLazy(node: React.ReactNode) {
  let unwrapped = node
  while (isLazyReference(unwrapped) && reactUse) unwrapped = reactUse(unwrapped._payload)
  return unwrapped
}

/** The element the Slot's props land on: its one element child, or the one inside its Slottable. */
function getTarget(children: React.ReactNode): React.ReactElement<AnyProps> | null {
  if (React.isValidElement<AnyProps>(children) && !isSlottable(children)) return children
  // Unlike toArray, forEach keeps the holes a false child leaves, so the element's children keep their place.
  const nodes: React.ReactNode[] = []
  let slottable: SlottableElement | undefined
  React.Children.forEach(children, (node) => {
    if (!slottable && isSlottable(node)) slottable = node
    nodes.push(node)
  })
  if (!slottable) return null
  const { props } = slottable
  const child = unwrapLazy('child' in props ? props.child : props.children)
  if (!React.isValidElement<AnyProps>(child)) return null
  const element = 'child' in props ? React.cloneElement(child, undefined, props.children(child.props.children)) : child
  // The Slot's other children sit around the element's own.
  return React.cloneElement(
    element,
    undefined,
    nodes.map((node) => (node === slottable ? element.props.children : node)),
  )
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps) {
  const overrideProps = { ...childProps }

  for (const propName in childProps) {
    const slotPropValue = slotProps[propName]
    const childPropValue = childProps[propName]

    const isHandler = /^on[A-Z]/.test(propName)
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args: unknown[]) => {
          const result = (childPropValue as (...a: unknown[]) => unknown)(...args)
          ;(slotPropValue as (...a: unknown[]) => unknown)(...args)
          return result
        }
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue
      }
    } else if (propName === 'style') {
      overrideProps[propName] = { ...(slotPropValue as object), ...(childPropValue as object) }
    } else if (propName === 'className') {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ')
    } else if (propName === 'aria-describedby') {
      overrideProps[propName] = joinIds(childPropValue, slotPropValue)
    }
  }

  const merged: AnyProps = { ...slotProps, ...overrideProps }
  // The Slot owns its content, so `asChild` cannot inject raw HTML. Cleared rather than deleted, since cloneElement
  // keeps a key the new props leave out, and only when set, since a Fragment child refuses the key.
  if ('dangerouslySetInnerHTML' in merged) merged.dangerouslySetInnerHTML = undefined
  return merged
}

export { Slot as Root, Slot, Slottable }
