export { findNextItem, useTypeaheadListNavigation, useTypeaheadSearch } from '../libs/list-navigation'
export { wrapArray } from '../libs/shared-utils'

export function shouldShowPlaceholder(value?: string) {
  return value === '' || value === undefined
}
