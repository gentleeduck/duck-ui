import type { Adapter } from '../../adapter'

export namespace UseKeyboard {
  export interface IKeyboardConfig<TDate> {
    focusedDate: TDate
    onFocusChange: (date: TDate) => void
    onSelect: (date: TDate, options?: { shiftKey?: boolean }) => void
    onDismiss?: (() => void) | undefined
    isDisabled: (date: TDate) => boolean
    adapter: Adapter.IDateAdapter<TDate>
    weekStartDay?: Adapter.WeekStartDay | undefined
    /** Months PageUp and PageDown move. Default `1`. */
    pageSize?: number | undefined
    /** Text direction. In `rtl` the grid runs right-to-left, so ArrowLeft/ArrowRight swap to follow it. */
    direction?: 'ltr' | 'rtl' | undefined
  }

  export interface IKeyboardReturn {
    onKeyDown: React.KeyboardEventHandler
  }
}
