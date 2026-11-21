```tsx
import { useTimePicker } from '@gentleduck/calendar'
import type { Time, UseTimePicker } from '@gentleduck/calendar'
```

## Usage

```tsx showLineNumbers
import { useTimePicker } from '@gentleduck/calendar'

function MyTimePicker() {
  const { state, actions, getFieldProps } = useTimePicker({
    hourCycle: '12',
    showSeconds: true,
  })

  return (
    <div>
      <input {...getFieldProps('hour')} />
      <span>:</span>
      <input {...getFieldProps('minute')} />
      <span>:</span>
      <input {...getFieldProps('second')} />
      <button {...getFieldProps('ampm')}>{state.displayAmPm}</button>
    </div>
  )
}
```

***

## Config

`useTimePicker` accepts `UseTimePicker.IUseTimePickerConfig` (extends `Time.ITimePickerConfig`).

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `Time.ITimeValue` | - | Controlled time value |
| `defaultValue` | `Time.ITimeValue` | `{ hour: 0, minute: 0 }` | Default time (uncontrolled) |
| `onChange` | `(value: Time.ITimeValue) => void` | - | Called when time changes |
| `hourCycle` | `Time.HourCycle` | `'24'` | `'12'` or `'24'` hour display |
| `showSeconds` | `boolean` | `false` | Show the seconds field |
| `minTime` | `Time.ITimeValue` | - | Minimum selectable time |
| `maxTime` | `Time.ITimeValue` | - | Maximum selectable time |
| `minuteStep` | `number` | `1` | Step for <Kbd>ArrowUp</Kbd> and <Kbd>ArrowDown</Kbd> on the minutes. A value off the step lands on the next or previous step |
| `secondStep` | `number` | `1` | The same for the seconds |

***

## Return value

`useTimePicker` returns `UseTimePicker.IUseTimePickerReturn`.

### `state`

| Property | Type | Description |
| :--- | :--- | :--- |
| `value` | `Time.ITimeValue` | Current time value `{ hour, minute, second? }` |
| `focusedField` | `Time.TimeField` | Currently focused field |
| `hourCycle` | `Time.HourCycle` | Active hour cycle |
| `displayHour` | `number` | Hour adjusted for 12h display |
| `displayAmPm` | `'AM' \| 'PM'` | Current AM/PM value |

### `actions`

| Method | Signature | Description |
| :--- | :--- | :--- |
| `setValue` | `(value: Time.ITimeValue) => void` | Set the full time value. A time no clock shows is refused, and one past `minTime` or `maxTime` is held at it |
| `setField` | `(field: Time.TimeField, value: number) => void` | Set a single field. A 12-hour hour takes 1 to 12, or 0 for 12, and AM/PM takes 0 or 1; a number the field cannot hold is refused |
| `increment` | `(field: Time.TimeField, delta?: number) => void` | Increment a field |
| `decrement` | `(field: Time.TimeField, delta?: number) => void` | Decrement a field |
| `toggleAmPm` | `() => void` | Toggle between AM and PM |
| `focusField` | `(field: Time.TimeField) => void` | Move focus to a field |

### `getFieldProps`

```tsx
getFieldProps(field: Time.TimeField) => UseTimePicker.ITimeFieldProps
```

Returns props to spread on each time field element:

| Prop | Type | Description |
| :--- | :--- | :--- |
| `role` | `'spinbutton'` | ARIA spinbutton role |
| `aria-label` | `string` | Field label |
| `aria-valuemin` | `number` | Minimum value. A 12-hour hour's range is the hours `minTime` and `maxTime` leave in the half of the day shown |
| `aria-valuemax` | `number` | Maximum value |
| `aria-valuenow` | `number` | Current value |
| `aria-valuetext` | `string` | Display value |
| `tabIndex` | `0` | Every field is a tab stop |
| `data-slot` | `string` | Slot identifier |
| `data-time-picker` | `string` | The picker the field belongs to |
| `data-time-field` | `Time.TimeField` | The field. With `data-time-picker`, how the hook finds a field to move focus to |
| `data-focused` | `'true' \| undefined` | Whether field is focused |
| `onKeyDown` | `KeyboardEventHandler` | Keyboard input handler |
| `onFocus` | `() => void` | Focus handler |

### Keyboard

* A digit shows as soon as it is typed. Focus moves to the next field once no further digit could fit, so `9` in the hour moves on and `1` waits for a second digit. Two digits that make no time start over from the second.
* <Kbd>ArrowLeft</Kbd> and <Kbd>ArrowRight</Kbd> move between the fields, as <Kbd>Tab</Kbd> does.
* <Kbd>ArrowUp</Kbd> and <Kbd>ArrowDown</Kbd> step a field, by `minuteStep` or `secondStep` where one is set.
* On the AM/PM field, <Kbd>A</Kbd> and <Kbd>P</Kbd> set it and the up and down arrows toggle it.