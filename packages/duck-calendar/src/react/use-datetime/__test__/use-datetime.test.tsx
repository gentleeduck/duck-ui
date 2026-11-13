import { act, renderHook } from '@testing-library/react'
import { NativeAdapter } from '../../../adapter'
import { useDateTime } from '../use-datetime'

const adapter = new NativeAdapter()
const march15At1430 = new Date(2026, 2, 15, 14, 30, 0)

describe('useDateTime', () => {
  describe('initial value', () => {
    it('extracts date and time from defaultValue', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
        }),
      )

      expect(result.current.state.value).not.toBeNull()
      const val = result.current.state.value!
      expect(val.getFullYear()).toBe(2026)
      expect(val.getMonth()).toBe(2)
      expect(val.getDate()).toBe(15)
      expect(val.getHours()).toBe(14)
      expect(val.getMinutes()).toBe(30)
      expect(val.getSeconds()).toBe(0)
    })

    it('value is null when no defaultValue provided', () => {
      const { result } = renderHook(() => useDateTime({ adapter }))

      expect(result.current.state.value).toBeNull()
    })
  })

  describe('date selection preserves time', () => {
    it('selecting a new date keeps the existing time', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          defaultMonth: new Date(2026, 2, 1),
        }),
      )

      const march20 = new Date(2026, 2, 20)
      act(() => {
        result.current.calendar.actions.selectDate(march20)
      })

      const val = result.current.state.value!
      expect(val.getDate()).toBe(20)
      expect(val.getHours()).toBe(14)
      expect(val.getMinutes()).toBe(30)
      expect(val.getSeconds()).toBe(0)
    })
  })

  describe('time change preserves date', () => {
    it('changing time keeps the existing date', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
        }),
      )

      act(() => {
        result.current.timePicker.actions.setValue({ hour: 9, minute: 15, second: 45 })
      })

      const val = result.current.state.value!
      expect(val.getFullYear()).toBe(2026)
      expect(val.getMonth()).toBe(2)
      expect(val.getDate()).toBe(15)
      expect(val.getHours()).toBe(9)
      expect(val.getMinutes()).toBe(15)
      expect(val.getSeconds()).toBe(45)
    })
  })

  describe('controlled value', () => {
    it('follows the controlled value prop', () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useDateTime({
            adapter,
            value,
          }),
        { initialProps: { value: march15At1430 } },
      )

      expect(result.current.state.value!.getHours()).toBe(14)

      const newValue = new Date(2026, 5, 10, 8, 0, 0)
      rerender({ value: newValue })

      expect(result.current.state.value!.getMonth()).toBe(5)
      expect(result.current.state.value!.getDate()).toBe(10)
      expect(result.current.state.value!.getHours()).toBe(8)
    })
  })

  describe('onChange', () => {
    it('fires with combined datetime when date is selected', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          defaultMonth: new Date(2026, 2, 1),
          onChange,
        }),
      )

      const march22 = new Date(2026, 2, 22)
      act(() => {
        result.current.calendar.actions.selectDate(march22)
      })

      expect(onChange).toHaveBeenCalledOnce()
      const received = onChange.mock.calls[0][0] as Date
      expect(received.getDate()).toBe(22)
      expect(received.getHours()).toBe(14)
      expect(received.getMinutes()).toBe(30)
    })

    it('fires with combined datetime when time changes', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          onChange,
        }),
      )

      act(() => {
        result.current.timePicker.actions.setValue({ hour: 18, minute: 0, second: 0 })
      })

      expect(onChange).toHaveBeenCalled()
      const received = onChange.mock.calls[0][0] as Date
      expect(received.getDate()).toBe(15)
      expect(received.getHours()).toBe(18)
      expect(received.getMinutes()).toBe(0)
    })
  })

  describe('sub-returns', () => {
    it('calendar sub-return is accessible with expected shape', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          defaultMonth: new Date(2026, 2, 1),
        }),
      )

      expect(result.current.calendar.state).toBeDefined()
      expect(result.current.calendar.actions).toBeDefined()
      expect(typeof result.current.calendar.getDayProps).toBe('function')
      expect(typeof result.current.calendar.getGridProps).toBe('function')
      expect(typeof result.current.calendar.getNavProps).toBe('function')
      expect(typeof result.current.calendar.getHeaderProps).toBe('function')
    })

    it('timePicker sub-return is accessible with expected shape', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
        }),
      )

      expect(result.current.timePicker.state).toBeDefined()
      expect(result.current.timePicker.actions).toBeDefined()
      expect(typeof result.current.timePicker.getFieldProps).toBe('function')
      expect(result.current.timePicker.state.value).toBeDefined()
      expect(typeof result.current.timePicker.state.value.hour).toBe('number')
      expect(typeof result.current.timePicker.state.value.minute).toBe('number')
    })
  })

  describe('combined date + time selection', () => {
    it('selecting a date when no prior value uses default time (00:00)', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultMonth: new Date(2026, 2, 1),
        }),
      )

      expect(result.current.state.value).toBeNull()

      const march10 = new Date(2026, 2, 10)
      act(() => {
        result.current.calendar.actions.selectDate(march10)
      })

      const val = result.current.state.value!
      expect(val.getDate()).toBe(10)
      expect(val.getHours()).toBe(0)
      expect(val.getMinutes()).toBe(0)
    })

    it('selecting multiple dates in sequence each preserves the current time', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          defaultMonth: new Date(2026, 2, 1),
        }),
      )

      // Select March 20
      const march20 = new Date(2026, 2, 20)
      act(() => {
        result.current.calendar.actions.selectDate(march20)
      })

      expect(result.current.state.value!.getDate()).toBe(20)
      expect(result.current.state.value!.getHours()).toBe(14)
      expect(result.current.state.value!.getMinutes()).toBe(30)

      // Select March 25
      const march25 = new Date(2026, 2, 25)
      act(() => {
        result.current.calendar.actions.selectDate(march25)
      })

      expect(result.current.state.value!.getDate()).toBe(25)
      expect(result.current.state.value!.getHours()).toBe(14)
      expect(result.current.state.value!.getMinutes()).toBe(30)
    })

    it('changing time then selecting date preserves the new time', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          defaultMonth: new Date(2026, 2, 1),
        }),
      )

      // Change time to 18:00
      act(() => {
        result.current.timePicker.actions.setValue({ hour: 18, minute: 0, second: 0 })
      })

      // Select a new date
      const march22 = new Date(2026, 2, 22)
      act(() => {
        result.current.calendar.actions.selectDate(march22)
      })

      const val = result.current.state.value!
      expect(val.getDate()).toBe(22)
      expect(val.getHours()).toBe(18)
      expect(val.getMinutes()).toBe(0)
    })
  })

  describe('a time picked before a date', () => {
    it('shows in the time picker, and goes onto the date picked next', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useDateTime({ adapter, defaultMonth: new Date(2026, 2, 1), onChange }))

      act(() => result.current.timePicker.actions.setValue({ hour: 9, minute: 30 }))
      const shown = result.current.timePicker.state.value
      const changes = onChange.mock.calls.length
      act(() => result.current.calendar.actions.selectDate(new Date(2026, 2, 22)))

      expect([shown, changes, result.current.state.value]).toEqual([
        { hour: 9, minute: 30, second: 0 },
        0,
        new Date(2026, 2, 22, 9, 30, 0),
      ])
    })
  })

  describe('a controlled value', () => {
    it('reports a change and keeps showing the value it is given', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useDateTime({ adapter, value: march15At1430, onChange }))

      act(() => result.current.timePicker.actions.setValue({ hour: 18, minute: 5, second: 0 }))

      expect([onChange.mock.calls, result.current.state.value]).toEqual([
        [[new Date(2026, 2, 15, 18, 5, 0)]],
        march15At1430,
      ])
    })

    it('keeps a time without seconds at 0 seconds', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useDateTime({ adapter, value: march15At1430, onChange }))

      act(() => result.current.timePicker.actions.setValue({ hour: 18, minute: 5 }))

      expect(onChange.mock.calls).toEqual([[new Date(2026, 2, 15, 18, 5, 0)]])
    })
  })

  describe('clearing selection', () => {
    it('deselecting in calendar (toggle) keeps the last known value since onSelect ignores null', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          defaultMonth: new Date(2026, 2, 1),
        }),
      )

      // Select March 15 explicitly
      const march15 = new Date(2026, 2, 15)
      act(() => {
        result.current.calendar.actions.selectDate(march15)
      })

      // Click the same date to deselect in the calendar
      act(() => {
        result.current.calendar.actions.selectDate(march15)
      })

      // useDateTime's handleCalendarSelect ignores null, so value should persist
      expect(result.current.state.value).not.toBeNull()
    })

    it('setValue action directly sets the combined datetime', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
        }),
      )

      const newDate = new Date(2026, 5, 20, 9, 15, 30)
      act(() => {
        result.current.actions.setValue(newDate)
      })

      const val = result.current.state.value!
      expect(val.getMonth()).toBe(5)
      expect(val.getDate()).toBe(20)
      expect(val.getHours()).toBe(9)
      expect(val.getMinutes()).toBe(15)
      expect(val.getSeconds()).toBe(30)
    })
  })

  describe('time extraction', () => {
    it('timePicker state reflects the time portion of the datetime value', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
        }),
      )

      expect(result.current.timePicker.state.value.hour).toBe(14)
      expect(result.current.timePicker.state.value.minute).toBe(30)
    })

    it('timePicker state updates when controlled value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) =>
          useDateTime({
            adapter,
            value,
          }),
        { initialProps: { value: march15At1430 } },
      )

      expect(result.current.timePicker.state.value.hour).toBe(14)

      const newValue = new Date(2026, 5, 10, 8, 45, 0)
      rerender({ value: newValue })

      expect(result.current.timePicker.state.value.hour).toBe(8)
      expect(result.current.timePicker.state.value.minute).toBe(45)
    })
  })

  describe('onChange combined scenarios', () => {
    it('onChange fires once per time change even with rapid increments', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          onChange,
        }),
      )

      act(() => {
        result.current.timePicker.actions.increment('hour')
      })

      act(() => {
        result.current.timePicker.actions.increment('hour')
      })

      expect(onChange).toHaveBeenCalledTimes(2)
      // The last call should have hour=16 (14 + 2)
      const lastCall = onChange.mock.calls[1]![0] as Date
      expect(lastCall.getHours()).toBe(16)
    })

    it('onChange is not called on initial render', () => {
      const onChange = vi.fn()
      renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          onChange,
        }),
      )

      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('hourCycle passthrough', () => {
    it('passes hourCycle to the time picker', () => {
      const { result } = renderHook(() =>
        useDateTime({
          adapter,
          defaultValue: march15At1430,
          hourCycle: '12',
        }),
      )

      expect(result.current.timePicker.state.hourCycle).toBe('12')
      expect(result.current.timePicker.state.displayAmPm).toBe('PM')
      expect(result.current.timePicker.state.displayHour).toBe(2)
    })
  })
})
