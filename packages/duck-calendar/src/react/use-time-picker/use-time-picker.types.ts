import type { Time } from '../../time'

export namespace UseTimePicker {
  export interface IUseTimePickerConfig extends Time.ITimePickerConfig {}

  export interface ITimeFieldProps {
    role: 'spinbutton'
    'aria-label': string
    'aria-valuemin': number
    'aria-valuemax': number
    'aria-valuenow': number
    'aria-valuetext': string
    tabIndex: 0
    'data-slot': string
    /** The picker this field belongs to, which moving focus between fields looks up. */
    'data-time-picker': string
    'data-time-field': Time.TimeField
    'data-focused': 'true' | undefined
    onKeyDown: React.KeyboardEventHandler
    onFocus: () => void
  }

  export interface IUseTimePickerReturn {
    state: {
      value: Time.ITimeValue
      focusedField: Time.TimeField
      hourCycle: Time.HourCycle
      displayHour: number
      displayAmPm: 'AM' | 'PM'
    }
    actions: {
      setValue: (value: Time.ITimeValue) => void
      setField: (field: Time.TimeField, value: number) => void
      increment: (field: Time.TimeField, delta?: number) => void
      decrement: (field: Time.TimeField, delta?: number) => void
      toggleAmPm: () => void
      focusField: (field: Time.TimeField) => void
    }
    getFieldProps: (field: Time.TimeField) => ITimeFieldProps
  }
}
