import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import type { Time } from '../../../time'
import { useTimePicker } from '../use-time-picker'
import type { UseTimePicker } from '../use-time-picker.types'

type PickerProps = UseTimePicker.IUseTimePickerConfig & {
  onPicker?: (picker: UseTimePicker.IUseTimePickerReturn) => void
}

function Picker({ onPicker, ...config }: PickerProps) {
  const picker = useTimePicker(config)
  onPicker?.(picker)
  const fields: Time.TimeField[] = ['hour', 'minute']
  if (config.showSeconds) fields.push('second')
  if (config.hourCycle === '12') fields.push('ampm')
  return fields.map((field) => <span key={field} {...picker.getFieldProps(field)} />)
}

const field = (name: string) => screen.getByRole('spinbutton', { name })
const text = (name: string) => field(name).getAttribute('aria-valuetext')
const focused = () => document.activeElement?.getAttribute('aria-label')

function press(name: string, ...keys: string[]) {
  act(() => field(name).focus())
  for (const key of keys) fireEvent.keyDown(document.activeElement as HTMLElement, { key })
}

describe('useTimePicker', () => {
  it('default value is { hour: 0, minute: 0 }', () => {
    const { result } = renderHook(() => useTimePicker())

    expect(result.current.state.value).toEqual({ hour: 0, minute: 0 })
  })

  it('controlled value follows prop', () => {
    const controlled = { hour: 14, minute: 30 }
    const { result } = renderHook(() => useTimePicker({ value: controlled }))

    expect(result.current.state.value).toEqual({ hour: 14, minute: 30 })
  })

  it('controlled value updates when prop changes', () => {
    let value = { hour: 14, minute: 30 }
    const { result, rerender } = renderHook(() => useTimePicker({ value }))

    expect(result.current.state.value.hour).toBe(14)

    value = { hour: 9, minute: 15 }
    rerender()

    expect(result.current.state.value).toEqual({ hour: 9, minute: 15 })
  })

  it('increment("hour") advances by 1', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 10, minute: 0 } }))

    act(() => {
      result.current.actions.increment('hour')
    })

    expect(result.current.state.value.hour).toBe(11)
  })

  it('decrement("minute") decreases by 1', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 30 } }))

    act(() => {
      result.current.actions.decrement('minute')
    })

    expect(result.current.state.value.minute).toBe(29)
  })

  it('hour wraps: 23 + 1 = 0', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 23, minute: 0 } }))

    act(() => {
      result.current.actions.increment('hour')
    })

    expect(result.current.state.value.hour).toBe(0)
  })

  it('minute wraps: 0 - 1 = 59', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 0 } }))

    act(() => {
      result.current.actions.decrement('minute')
    })

    expect(result.current.state.value.minute).toBe(59)
  })

  it('toggleAmPm flips AM to PM', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 9, minute: 0 }, hourCycle: '12' }))

    expect(result.current.state.displayAmPm).toBe('AM')

    act(() => {
      result.current.actions.toggleAmPm()
    })

    expect(result.current.state.displayAmPm).toBe('PM')
    expect(result.current.state.value.hour).toBe(21)
  })

  it('toggleAmPm flips PM to AM', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 21, minute: 0 }, hourCycle: '12' }))

    expect(result.current.state.displayAmPm).toBe('PM')

    act(() => {
      result.current.actions.toggleAmPm()
    })

    expect(result.current.state.displayAmPm).toBe('AM')
    expect(result.current.state.value.hour).toBe(9)
  })

  it('12h display: hour 0 shows 12', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 0 }, hourCycle: '12' }))

    expect(result.current.state.displayHour).toBe(12)
    expect(result.current.state.displayAmPm).toBe('AM')
  })

  it('12h display: hour 13 shows 1', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 13, minute: 0 }, hourCycle: '12' }))

    expect(result.current.state.displayHour).toBe(1)
    expect(result.current.state.displayAmPm).toBe('PM')
  })

  it('24h display: hour 13 shows 13', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 13, minute: 0 }, hourCycle: '24' }))

    expect(result.current.state.displayHour).toBe(13)
  })

  describe('getFieldProps', () => {
    it('hour returns correct ARIA attrs', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 14, minute: 30 }, hourCycle: '24' }))

      const props = result.current.getFieldProps('hour')

      expect(props.role).toBe('spinbutton')
      expect(props['aria-label']).toBe('Hour')
      expect(props['aria-valuemin']).toBe(0)
      expect(props['aria-valuemax']).toBe(23)
      expect(props['aria-valuenow']).toBe(14)
      expect(props['aria-valuetext']).toBe('14')
      expect(props['data-slot']).toBe('time-picker-field')
    })

    it('hour in 12h mode returns correct range', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 14, minute: 30 }, hourCycle: '12' }))

      const props = result.current.getFieldProps('hour')

      expect(props['aria-valuemin']).toBe(1)
      expect(props['aria-valuemax']).toBe(12)
      expect(props['aria-valuenow']).toBe(2)
      expect(props['aria-valuetext']).toBe('02')
    })

    it('minute returns correct ARIA attrs', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 45 } }))

      const props = result.current.getFieldProps('minute')

      expect(props['aria-label']).toBe('Minute')
      expect(props['aria-valuemin']).toBe(0)
      expect(props['aria-valuemax']).toBe(59)
      expect(props['aria-valuenow']).toBe(45)
      expect(props['aria-valuetext']).toBe('45')
    })

    it('ampm returns correct ARIA attrs', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 14, minute: 0 }, hourCycle: '12' }))

      const props = result.current.getFieldProps('ampm')

      expect(props['aria-label']).toBe('AM/PM')
      expect(props['aria-valuemin']).toBe(0)
      expect(props['aria-valuemax']).toBe(1)
      expect(props['aria-valuenow']).toBe(1) // PM
      expect(props['aria-valuetext']).toBe('PM')
    })
  })

  it('focusField sets data-focused', () => {
    const { result } = renderHook(() => useTimePicker())

    expect(result.current.getFieldProps('hour')['data-focused']).toBe('true')
    expect(result.current.getFieldProps('minute')['data-focused']).toBeUndefined()

    act(() => {
      result.current.actions.focusField('minute')
    })

    expect(result.current.getFieldProps('hour')['data-focused']).toBeUndefined()
    expect(result.current.getFieldProps('minute')['data-focused']).toBe('true')
  })

  it('setField updates the specific field', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 0 } }))

    act(() => {
      result.current.actions.setField('hour', 15)
    })

    expect(result.current.state.value.hour).toBe(15)
    expect(result.current.state.value.minute).toBe(0)
  })

  it('setField("minute") updates only minute', () => {
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 10, minute: 0 } }))

    act(() => {
      result.current.actions.setField('minute', 45)
    })

    expect(result.current.state.value.hour).toBe(10)
    expect(result.current.state.value.minute).toBe(45)
  })

  it('onChange is called when value changes', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 0 }, onChange }))

    act(() => {
      result.current.actions.increment('hour')
    })

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith({ hour: 1, minute: 0 })
  })

  describe('12h mode edge cases', () => {
    it('12h display: hour 12 (noon) shows 12 PM', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 12, minute: 0 }, hourCycle: '12' }))

      expect(result.current.state.displayHour).toBe(12)
      expect(result.current.state.displayAmPm).toBe('PM')
    })

    it('12h display: hour 23 shows 11 PM', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 23, minute: 59 }, hourCycle: '12' }))

      expect(result.current.state.displayHour).toBe(11)
      expect(result.current.state.displayAmPm).toBe('PM')
    })

    it('12h display: hour 11 shows 11 AM', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 11, minute: 0 }, hourCycle: '12' }))

      expect(result.current.state.displayHour).toBe(11)
      expect(result.current.state.displayAmPm).toBe('AM')
    })

    it('toggleAmPm at midnight (0) flips to noon (12)', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 0 }, hourCycle: '12' }))

      expect(result.current.state.displayAmPm).toBe('AM')
      expect(result.current.state.displayHour).toBe(12)

      act(() => {
        result.current.actions.toggleAmPm()
      })

      expect(result.current.state.displayAmPm).toBe('PM')
      expect(result.current.state.value.hour).toBe(12)
    })

    it('toggleAmPm at noon (12) flips to midnight (0)', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 12, minute: 0 }, hourCycle: '12' }))

      expect(result.current.state.displayAmPm).toBe('PM')

      act(() => {
        result.current.actions.toggleAmPm()
      })

      expect(result.current.state.displayAmPm).toBe('AM')
      expect(result.current.state.value.hour).toBe(0)
    })

    it('increment hour in 12h mode wraps from 12 PM to 1 PM', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 12, minute: 0 }, hourCycle: '12' }))

      act(() => {
        result.current.actions.increment('hour')
      })

      expect(result.current.state.value.hour).toBe(13)
      expect(result.current.state.displayHour).toBe(1)
      expect(result.current.state.displayAmPm).toBe('PM')
    })

    it('decrement hour in 12h mode wraps from 1 AM to 12 AM (midnight)', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 1, minute: 0 }, hourCycle: '12' }))

      act(() => {
        result.current.actions.decrement('hour')
      })

      expect(result.current.state.value.hour).toBe(0)
      expect(result.current.state.displayHour).toBe(12)
      expect(result.current.state.displayAmPm).toBe('AM')
    })
  })

  describe('24h mode edge cases', () => {
    it('24h display: hour 0 shows 0', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 0 }, hourCycle: '24' }))

      expect(result.current.state.displayHour).toBe(0)
    })

    it('hour wraps: 0 - 1 = 23', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 0 } }))

      act(() => {
        result.current.actions.decrement('hour')
      })

      expect(result.current.state.value.hour).toBe(23)
    })

    it('minute wraps: 59 + 1 = 0', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 59 } }))

      act(() => {
        result.current.actions.increment('minute')
      })

      expect(result.current.state.value.minute).toBe(0)
    })
  })

  describe('min/max time boundaries', () => {
    it('increment is clamped at maxTime', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 17, minute: 0 },
          maxTime: { hour: 17, minute: 30 },
        }),
      )

      // Increment minute 31 times past the max
      for (let i = 0; i < 31; i++) {
        act(() => {
          result.current.actions.increment('minute')
        })
      }

      // Should be clamped to maxTime
      expect(result.current.state.value.minute).toBeLessThanOrEqual(30)
    })

    it('decrement is clamped at minTime', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 9, minute: 0 },
          minTime: { hour: 9, minute: 0 },
        }),
      )

      act(() => {
        result.current.actions.decrement('minute')
      })

      // Should be clamped to minTime
      expect(result.current.state.value.hour).toBeGreaterThanOrEqual(9)
      expect(result.current.state.value.minute).toBeGreaterThanOrEqual(0)
    })

    it('setField is clamped to minTime', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 30 },
          minTime: { hour: 9, minute: 0 },
        }),
      )

      act(() => {
        result.current.actions.setField('hour', 5)
      })

      expect(result.current.state.value.hour).toBeGreaterThanOrEqual(9)
    })

    it('setField is clamped to maxTime', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 0 },
          maxTime: { hour: 17, minute: 0 },
        }),
      )

      act(() => {
        result.current.actions.setField('hour', 20)
      })

      expect(result.current.state.value.hour).toBeLessThanOrEqual(17)
    })

    it('toggleAmPm is clamped by minTime/maxTime', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 14, minute: 0 },
          hourCycle: '12',
          minTime: { hour: 12, minute: 0 },
          maxTime: { hour: 23, minute: 59 },
        }),
      )

      expect(result.current.state.displayAmPm).toBe('PM')

      act(() => {
        result.current.actions.toggleAmPm()
      })

      // Should be clamped back to PM since minTime is 12:00
      expect(result.current.state.value.hour).toBeGreaterThanOrEqual(12)
    })
  })

  describe('seconds field', () => {
    it('showSeconds getFieldProps returns second field', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 30, second: 45 },
          showSeconds: true,
        }),
      )

      const props = result.current.getFieldProps('second')

      expect(props.role).toBe('spinbutton')
      expect(props['aria-label']).toBe('Second')
      expect(props['aria-valuemin']).toBe(0)
      expect(props['aria-valuemax']).toBe(59)
      expect(props['aria-valuenow']).toBe(45)
      expect(props['aria-valuetext']).toBe('45')
    })

    it('increment second wraps: 59 + 1 = 0', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 0, second: 59 },
          showSeconds: true,
        }),
      )

      act(() => {
        result.current.actions.increment('second')
      })

      expect(result.current.state.value.second).toBe(0)
    })

    it('decrement second wraps: 0 - 1 = 59', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 0, second: 0 },
          showSeconds: true,
        }),
      )

      act(() => {
        result.current.actions.decrement('second')
      })

      expect(result.current.state.value.second).toBe(59)
    })

    it('setField("second") updates only second', () => {
      const { result } = renderHook(() =>
        useTimePicker({ defaultValue: { hour: 10, minute: 30, second: 0 }, showSeconds: true }),
      )

      act(() => {
        result.current.actions.setField('second', 42)
      })

      expect(result.current.state.value.hour).toBe(10)
      expect(result.current.state.value.minute).toBe(30)
      expect(result.current.state.value.second).toBe(42)
    })
  })

  describe('step increments', () => {
    it('minuteStep=5 increments by 5', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 0 },
          minuteStep: 5,
        }),
      )

      act(() => {
        result.current.actions.increment('minute')
      })

      expect(result.current.state.value.minute).toBe(5)
    })

    it('minuteStep=15 increments by 15', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 0 },
          minuteStep: 15,
        }),
      )

      act(() => {
        result.current.actions.increment('minute')
      })

      expect(result.current.state.value.minute).toBe(15)
    })

    it('minuteStep=5 decrements by 5', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 30 },
          minuteStep: 5,
        }),
      )

      act(() => {
        result.current.actions.decrement('minute')
      })

      expect(result.current.state.value.minute).toBe(25)
    })

    it('secondStep=10 increments by 10', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          defaultValue: { hour: 10, minute: 0, second: 0 },
          showSeconds: true,
          secondStep: 10,
        }),
      )

      act(() => {
        result.current.actions.increment('second')
      })

      expect(result.current.state.value.second).toBe(10)
    })
  })

  describe('setValue', () => {
    it('setValue replaces the entire time value', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 0, minute: 0 } }))

      act(() => {
        result.current.actions.setValue({ hour: 15, minute: 45 })
      })

      expect(result.current.state.value).toEqual({ hour: 15, minute: 45 })
    })

    it('setValue with seconds', () => {
      const { result } = renderHook(() =>
        useTimePicker({ defaultValue: { hour: 0, minute: 0, second: 0 }, showSeconds: true }),
      )

      act(() => {
        result.current.actions.setValue({ hour: 8, minute: 30, second: 15 })
      })

      expect(result.current.state.value).toEqual({ hour: 8, minute: 30, second: 15 })
    })
  })

  describe('onChange callback edge cases', () => {
    it('onChange fires on toggleAmPm', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useTimePicker({ defaultValue: { hour: 9, minute: 0 }, hourCycle: '12', onChange }),
      )

      act(() => {
        result.current.actions.toggleAmPm()
      })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange.mock.calls[0]![0].hour).toBe(21)
    })

    it('onChange fires on setField', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 10, minute: 0 }, onChange }))

      act(() => {
        result.current.actions.setField('minute', 30)
      })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange.mock.calls[0]![0]).toEqual({ hour: 10, minute: 30 })
    })

    it('onChange fires on decrement', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 10, minute: 30 }, onChange }))

      act(() => {
        result.current.actions.decrement('minute')
      })

      expect(onChange).toHaveBeenCalledOnce()
      expect(onChange.mock.calls[0]![0].minute).toBe(29)
    })
  })

  describe('hourCycle state', () => {
    it('state.hourCycle reflects the configured hourCycle', () => {
      const { result } = renderHook(() => useTimePicker({ hourCycle: '12' }))
      expect(result.current.state.hourCycle).toBe('12')
    })

    it('state.hourCycle defaults to 24', () => {
      const { result } = renderHook(() => useTimePicker())
      expect(result.current.state.hourCycle).toBe('24')
    })
  })

  describe('the keyboard', () => {
    it('puts every field in the tab order', () => {
      render(<Picker hourCycle="12" showSeconds />)

      expect(screen.getAllByRole('spinbutton').map((element) => element.tabIndex)).toEqual([0, 0, 0, 0])
    })

    it('moves between the fields with ArrowLeft and ArrowRight', () => {
      render(<Picker hourCycle="12" />)

      press('Hour', 'ArrowRight', 'ArrowRight')
      const last = focused()
      fireEvent.keyDown(field('AM/PM'), { key: 'ArrowRight' })
      fireEvent.keyDown(field('AM/PM'), { key: 'ArrowLeft' })

      expect([last, focused()]).toEqual(['AM/PM', 'Minute'])
    })

    it('moves focus to a field through focusField', () => {
      let picker: UseTimePicker.IUseTimePickerReturn | undefined
      render(<Picker onPicker={(p) => (picker = p)} />)

      act(() => picker?.actions.focusField('minute'))

      expect(focused()).toBe('Minute')
    })

    it('shows a digit as it is typed, and moves on once no further digit fits', () => {
      render(<Picker />)

      press('Hour', '1')
      const afterOne = [text('Hour'), focused()]
      fireEvent.keyDown(field('Hour'), { key: '5' })

      expect([afterOne, [text('Hour'), focused()]]).toEqual([
        ['01', 'Hour'],
        ['15', 'Minute'],
      ])
    })

    it('moves on at once from a digit no second digit could follow', () => {
      render(<Picker showSeconds />)

      press('Hour', '3')
      fireEvent.keyDown(field('Minute'), { key: '7' })

      expect([text('Hour'), text('Minute'), focused()]).toEqual(['03', '07', 'Second'])
    })

    it('starts a new number after an arrow step, not on the digit typed before it', () => {
      render(<Picker />)

      press('Hour', '1', 'ArrowUp', '3')

      expect(text('Hour')).toBe('03')
    })

    it('starts the number over when two digits make no time', () => {
      render(<Picker />)

      press('Hour', '2', '5')

      expect([text('Hour'), focused()]).toEqual(['05', 'Minute'])
    })

    it('keeps a digit typed just before focus moves on', () => {
      render(<Picker />)

      press('Hour', '1')
      press('Minute', '4')

      expect([text('Hour'), text('Minute')]).toEqual(['01', '04'])
    })

    it('types a 12-hour hour within its half of the day', () => {
      render(<Picker hourCycle="12" defaultValue={{ hour: 14, minute: 0 }} />)

      press('Hour', '0', '7')
      const seven = [text('Hour'), text('AM/PM')]
      press('Hour', '1', '2')

      expect([seven, [text('Hour'), text('AM/PM')]]).toEqual([
        ['07', 'PM'],
        ['12', 'PM'],
      ])
    })

    it('sets AM or PM with the A and P keys and toggles it with the arrows', () => {
      render(<Picker hourCycle="12" defaultValue={{ hour: 9, minute: 0 }} />)

      press('AM/PM', 'p')
      const pm = text('AM/PM')
      press('AM/PM', 'P', '5', 'ArrowUp')
      const am = text('AM/PM')
      press('AM/PM', 'a', 'A', 'ArrowDown')
      const toggled = text('AM/PM')
      press('AM/PM', 'a')

      expect([pm, am, toggled, text('AM/PM'), text('Hour')]).toEqual(['PM', 'AM', 'PM', 'AM', '09'])
    })

    it('leaves Tab and letters to the browser', () => {
      render(<Picker defaultValue={{ hour: 9, minute: 0 }} />)
      act(() => field('Hour').focus())

      const passed = [fireEvent.keyDown(field('Hour'), { key: 'Tab' }), fireEvent.keyDown(field('Hour'), { key: 'x' })]

      expect([passed, text('Hour')]).toEqual([[true, true], '09'])
    })

    it('steps a number field with ArrowUp and ArrowDown', () => {
      render(<Picker defaultValue={{ hour: 9, minute: 0 }} />)

      press('Hour', 'ArrowUp', 'ArrowUp')
      press('Minute', 'ArrowDown')

      expect([text('Hour'), text('Minute')]).toEqual(['11', '59'])
    })
  })

  describe('the hour range in 12-hour time', () => {
    it('spans the hours minTime and maxTime leave in the half of the day shown', () => {
      const range = (value: Time.ITimeValue, minTime?: Time.ITimeValue, maxTime?: Time.ITimeValue) => {
        const { result } = renderHook(() => useTimePicker({ hourCycle: '12', value, minTime, maxTime }))
        const props = result.current.getFieldProps('hour')
        return [props['aria-valuemin'], props['aria-valuemax']]
      }

      expect([
        range({ hour: 9, minute: 0 }, { hour: 0, minute: 30 }),
        range({ hour: 12, minute: 30 }, undefined, { hour: 13, minute: 0 }),
        range({ hour: 10, minute: 0 }, { hour: 9, minute: 0 }, { hour: 11, minute: 30 }),
        range({ hour: 15, minute: 0 }, { hour: 14, minute: 0 }, { hour: 18, minute: 0 }),
        range({ hour: 9, minute: 0 }, { hour: 14, minute: 0 }),
      ]).toEqual([
        [1, 12],
        [1, 12],
        [9, 11],
        [2, 6],
        [1, 12],
      ])
    })

    it('spans every hour in 24-hour time when minTime is after maxTime', () => {
      const { result } = renderHook(() =>
        useTimePicker({
          value: { hour: 9, minute: 0 },
          minTime: { hour: 18, minute: 0 },
          maxTime: { hour: 9, minute: 0 },
        }),
      )
      const props = result.current.getFieldProps('hour')

      expect([props['aria-valuemin'], props['aria-valuemax']]).toEqual([0, 23])
    })
  })

  describe('setValue', () => {
    it('refuses a time no clock shows, and holds one past a bound at the bound', () => {
      const { result } = renderHook(() =>
        useTimePicker({ defaultValue: { hour: 10, minute: 0 }, minTime: { hour: 9, minute: 0 } }),
      )

      act(() => result.current.actions.setValue({ hour: 30, minute: 0 }))
      const refused = result.current.state.value
      act(() => result.current.actions.setValue({ hour: 6, minute: 0 }))

      expect([refused, result.current.state.value]).toEqual([
        { hour: 10, minute: 0 },
        { hour: 9, minute: 0 },
      ])
    })
  })

  describe('setField', () => {
    it('refuses a number the field cannot hold', () => {
      const { result } = renderHook(() => useTimePicker({ defaultValue: { hour: 9, minute: 30, second: 0 } }))

      act(() => {
        result.current.actions.setField('minute', 75)
        result.current.actions.setField('hour', 24)
        result.current.actions.setField('second', -1)
        result.current.actions.setField('minute', 1.5)
      })

      expect(result.current.state.value).toEqual({ hour: 9, minute: 30, second: 0 })
    })

    it('sets AM or PM as 0 or 1', () => {
      const { result } = renderHook(() => useTimePicker({ hourCycle: '12', defaultValue: { hour: 9, minute: 0 } }))

      act(() => result.current.actions.setField('ampm', 1))
      const pm = result.current.state.value.hour
      act(() => result.current.actions.setField('ampm', 0))

      expect([pm, result.current.state.value.hour]).toEqual([21, 9])
    })
  })
})
