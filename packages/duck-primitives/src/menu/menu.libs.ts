import type * as React from 'react'
import type { Polygon } from '../libs/shared-utils'
import { isPointInPolygon } from '../libs/shared-utils'

export type { IDirection } from '../direction'
export type { IPoint, Polygon } from '../libs/shared-utils'
export { focusFirst, isPointInPolygon, wrapArray } from '../libs/shared-utils'

export type CheckedState = boolean | 'indeterminate'
export type Side = 'left' | 'right'
export type GraceIntent = { area: Polygon; side: Side }

export const SELECTION_KEYS = ['Enter', ' ']
export const FIRST_KEYS = ['ArrowDown', 'PageUp', 'Home']
export const LAST_KEYS = ['ArrowUp', 'PageDown', 'End']
export const FIRST_LAST_KEYS = [...FIRST_KEYS, ...LAST_KEYS]
export const SUB_OPEN_KEYS: Record<'ltr' | 'rtl', string[]> = {
  ltr: [...SELECTION_KEYS, 'ArrowRight'],
  rtl: [...SELECTION_KEYS, 'ArrowLeft'],
}
export const SUB_CLOSE_KEYS: Record<'ltr' | 'rtl', string[]> = {
  ltr: ['ArrowLeft'],
  rtl: ['ArrowRight'],
}

export function getOpenState(open: boolean) {
  return open ? 'open' : 'closed'
}

export function isIndeterminate(checked?: CheckedState): checked is 'indeterminate' {
  return checked === 'indeterminate'
}

export function getCheckedState(checked: CheckedState) {
  return isIndeterminate(checked) ? 'indeterminate' : checked ? 'checked' : 'unchecked'
}

export function isPointerInGraceArea(event: React.PointerEvent, area: Polygon) {
  const cursorPos = { x: event.clientX, y: event.clientY }
  return isPointInPolygon(cursorPos, area)
}

/** A field typed into, whose letters and arrow keys are its own rather than the menu's. */
export function isTextEntry(target: EventTarget | null) {
  const element = target as HTMLElement | null
  return !!element && (element.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName))
}

export function whenMouse<E>(handler: React.PointerEventHandler<E>): React.PointerEventHandler<E> {
  return (event) => (event.pointerType === 'mouse' ? handler(event) : undefined)
}
