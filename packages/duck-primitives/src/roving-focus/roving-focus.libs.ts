import type * as React from 'react'
import type { IDirection } from '../direction'
import { byDocumentPosition } from '../libs/shared-utils'
import type { IRovingFocus } from './roving-focus.types'

export { focusFirst, wrapArray } from '../libs/shared-utils'

const MAP_KEY_TO_FOCUS_INTENT: Record<string, IRovingFocus.FocusIntent> = {
  ArrowLeft: 'prev',
  ArrowUp: 'prev',
  ArrowRight: 'next',
  ArrowDown: 'next',
  PageUp: 'first',
  Home: 'first',
  PageDown: 'last',
  End: 'last',
}

function getDirectionAwareKey(key: string, dir?: IDirection.Kind) {
  if (dir !== 'rtl') return key
  return key === 'ArrowLeft' ? 'ArrowRight' : key === 'ArrowRight' ? 'ArrowLeft' : key
}

/** Determines the focus intent from a keyboard event based on orientation and direction. */
function getFocusIntent(event: React.KeyboardEvent, orientation?: IRovingFocus.Orientation, dir?: IDirection.Kind) {
  const key = getDirectionAwareKey(event.key, dir)
  if (orientation === 'vertical' && ['ArrowLeft', 'ArrowRight'].includes(key)) return undefined
  if (orientation === 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(key)) return undefined
  return MAP_KEY_TO_FOCUS_INTENT[key]
}

/** The items that can take focus and have an element, in document order. */
function getFocusableItems(items: Iterable<IRovingFocus.IItem>) {
  const found: { item: IRovingFocus.IItem; node: HTMLElement }[] = []
  for (const item of items) {
    const node = item.ref.current
    if (item.focusable && node) found.push({ item, node })
  }
  return found.sort((a, b) => byDocumentPosition(a.node, b.node))
}

export { getFocusableItems, getFocusIntent }
