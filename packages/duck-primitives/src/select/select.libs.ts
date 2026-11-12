import type * as React from 'react'
import type { ISelect } from './select.types'

export { findNextItem, useTypeaheadListNavigation, useTypeaheadSearch } from '../libs/list-navigation'
export { wrapArray } from '../libs/shared-utils'

/** What typeahead matches: `textValue`, else the item text, else the whole item, read as they are now. */
export function getItemText(item: {
  textValue: string | undefined
  textRef: React.RefObject<HTMLElement | null>
  ref: React.RefObject<HTMLElement | null>
}) {
  return (item.textValue || item.textRef.current?.textContent || item.ref.current?.textContent || '').trim()
}

export function shouldShowPlaceholder(value?: ISelect.IValue) {
  return !value?.length
}

export function includesValue(selected: ISelect.IValue | undefined, value: string) {
  return typeof selected === 'string' ? selected === value : !!selected?.includes(value)
}
