import { renderHook } from '@testing-library/react'
import { NativeAdapter } from '../../../adapter'
import { useKeyboard } from '../use-keyboard'
import type { UseKeyboard } from '../use-keyboard.types'

describe('useKeyboard', () => {
  let adapter: NativeAdapter
  let onFocusChange: ReturnType<typeof vi.fn>
  let onSelect: ReturnType<typeof vi.fn>
  let onDismiss: ReturnType<typeof vi.fn>

  // March 15 2026 is a Sunday
  const baseDate = new Date(2026, 2, 15)

  function makeConfig(overrides?: Partial<UseKeyboard.IKeyboardConfig<Date>>): UseKeyboard.IKeyboardConfig<Date> {
    return {
      focusedDate: baseDate,
      onFocusChange,
      onSelect,
      onDismiss,
      isDisabled: () => false,
      adapter,
      weekStartDay: 0,
      ...overrides,
    }
  }

  /** Creates a fake React keyboard event and invokes the hook's onKeyDown handler. */
  function pressKey(config: UseKeyboard.IKeyboardConfig<Date>, key: string, options?: { shiftKey?: boolean }) {
    const { result } = renderHook(() => useKeyboard(config))

    let wasDefaultPrevented = false
    const fakeEvent = {
      key,
      shiftKey: options?.shiftKey ?? false,
      preventDefault: () => {
        wasDefaultPrevented = true
      },
    } as unknown as React.KeyboardEvent

    result.current.onKeyDown(fakeEvent)

    return { defaultPrevented: wasDefaultPrevented }
  }

  beforeEach(() => {
    adapter = new NativeAdapter()
    onFocusChange = vi.fn()
    onSelect = vi.fn()
    onDismiss = vi.fn()
  })

  describe('arrow keys', () => {
    it('ArrowLeft moves focus -1 day', () => {
      pressKey(makeConfig(), 'ArrowLeft')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(14)
    })

    it('ArrowRight moves focus +1 day', () => {
      pressKey(makeConfig(), 'ArrowRight')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(16)
    })

    it('ArrowUp moves focus -7 days (previous week)', () => {
      pressKey(makeConfig(), 'ArrowUp')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(8)
      expect(result.getMonth()).toBe(2)
    })

    it('ArrowDown moves focus +7 days (next week)', () => {
      pressKey(makeConfig(), 'ArrowDown')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(22)
      expect(result.getMonth()).toBe(2)
    })
  })

  describe('rtl', () => {
    it('ArrowLeft moves focus +1 day, matching the right-to-left grid', () => {
      pressKey(makeConfig({ direction: 'rtl' }), 'ArrowLeft')
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(16)
    })

    it('ArrowRight moves focus -1 day', () => {
      pressKey(makeConfig({ direction: 'rtl' }), 'ArrowRight')
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(14)
    })

    it('leaves vertical keys alone', () => {
      pressKey(makeConfig({ direction: 'rtl' }), 'ArrowUp')
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(8)
    })
  })

  describe('page keys', () => {
    it('PageUp moves focus -1 month', () => {
      pressKey(makeConfig(), 'PageUp')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(15)
      expect(result.getFullYear()).toBe(2026)
    })

    it('PageDown moves focus +1 month', () => {
      pressKey(makeConfig(), 'PageDown')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(3) // April
      expect(result.getDate()).toBe(15)
    })

    it('Shift+PageUp moves focus -1 year', () => {
      pressKey(makeConfig(), 'PageUp', { shiftKey: true })
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(15)
    })

    it('Shift+PageDown moves focus +1 year', () => {
      pressKey(makeConfig(), 'PageDown', { shiftKey: true })
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2027)
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(15)
    })
  })

  describe('Home and End', () => {
    it('Home moves to start of week (weekStartDay=0, Sunday)', () => {
      // March 15 2026 is already Sunday (start of week), so Home returns March 15
      pressKey(makeConfig({ weekStartDay: 0 }), 'Home')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDay()).toBe(0) // Sunday
      expect(result.getDate()).toBe(15)
    })

    it('Home moves to start of week (weekStartDay=1, Monday)', () => {
      // March 15 2026 is Sunday. With weekStartDay=1 (Monday), start of week is March 9
      pressKey(makeConfig({ weekStartDay: 1 }), 'Home')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDay()).toBe(1) // Monday
      expect(result.getDate()).toBe(9)
    })

    it('End moves to end of week (weekStartDay=0)', () => {
      // weekStartDay=0 (Sunday). Week: Sun Mar 15 - Sat Mar 21. End = Mar 21
      pressKey(makeConfig({ weekStartDay: 0 }), 'End')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDay()).toBe(6) // Saturday
      expect(result.getDate()).toBe(21)
    })

    it('Home and End take a week from Sunday when no weekStartDay is given', () => {
      const wednesday = new Date(2026, 2, 18)
      pressKey(makeConfig({ focusedDate: wednesday, weekStartDay: undefined }), 'Home')
      pressKey(makeConfig({ focusedDate: wednesday, weekStartDay: undefined }), 'End')

      expect(onFocusChange.mock.calls).toEqual([[new Date(2026, 2, 15)], [new Date(2026, 2, 21)]])
    })

    it('End moves to end of week (weekStartDay=1)', () => {
      // weekStartDay=1 (Monday). Week: Mon Mar 9 - Sun Mar 15. End = Mar 15 (Sunday)
      pressKey(makeConfig({ weekStartDay: 1 }), 'End')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDay()).toBe(0) // Sunday
      expect(result.getDate()).toBe(15)
    })
  })

  describe('selection', () => {
    it('Enter triggers onSelect with focused date', () => {
      pressKey(makeConfig(), 'Enter')
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith(baseDate, { shiftKey: false })
    })

    it('Space triggers onSelect with focused date', () => {
      pressKey(makeConfig(), ' ')
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith(baseDate, { shiftKey: false })
    })

    it('Enter on disabled date does NOT trigger onSelect', () => {
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() === 15,
        }),
        'Enter',
      )
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('Space on disabled date does NOT trigger onSelect', () => {
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() === 15,
        }),
        ' ',
      )
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('dismiss', () => {
    it('Escape triggers onDismiss', () => {
      pressKey(makeConfig(), 'Escape')
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('Escape does not crash when onDismiss is undefined', () => {
      expect(() => {
        pressKey(makeConfig({ onDismiss: undefined }), 'Escape')
      }).not.toThrow()
    })
  })

  describe('disabled date skipping', () => {
    it('ArrowLeft skips disabled date and lands on next enabled date', () => {
      // March 14 is disabled, so ArrowLeft from March 15 should skip 14 and land on 13
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() === 14,
        }),
        'ArrowLeft',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(13)
    })

    it('ArrowRight skips disabled date', () => {
      // March 16 is disabled, so ArrowRight from March 15 should skip 16 and land on 17
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() === 16,
        }),
        'ArrowRight',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(17)
    })

    it('ArrowUp skips disabled date a week back', () => {
      // March 8 is disabled, so ArrowUp from March 15 should skip 8 and land on March 1
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() === 8,
        }),
        'ArrowUp',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(1)
      expect(result.getMonth()).toBe(2)
    })

    it('ArrowLeft skips multiple consecutive disabled dates', () => {
      // March 12, 13, 14 are disabled, so ArrowLeft from March 15 should land on 11
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() >= 12 && d.getDate() <= 14,
        }),
        'ArrowLeft',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(11)
    })

    it('ArrowRight skips multiple consecutive disabled dates', () => {
      // March 16, 17, 18 are disabled, so ArrowRight from March 15 should land on 19
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() >= 16 && d.getDate() <= 18,
        }),
        'ArrowRight',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(19)
    })

    it('Home skips disabled start-of-week and finds next enabled day', () => {
      // March 15 (Sunday) is start of week with weekStartDay=0.
      // If March 15 is disabled, Home should find March 16
      pressKey(
        makeConfig({
          weekStartDay: 0,
          isDisabled: (d) => d.getDate() === 15,
        }),
        'Home',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(16)
    })
  })

  describe('unknown keys', () => {
    it('pressing "a" does nothing  -  no callbacks called', () => {
      pressKey(makeConfig(), 'a')
      expect(onFocusChange).not.toHaveBeenCalled()
      expect(onSelect).not.toHaveBeenCalled()
      expect(onDismiss).not.toHaveBeenCalled()
    })

    it('pressing "Tab" does nothing', () => {
      pressKey(makeConfig(), 'Tab')
      expect(onFocusChange).not.toHaveBeenCalled()
      expect(onSelect).not.toHaveBeenCalled()
      expect(onDismiss).not.toHaveBeenCalled()
    })
  })

  describe('preventDefault', () => {
    it('ArrowLeft calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'ArrowLeft')
      expect(defaultPrevented).toBe(true)
    })

    it('ArrowRight calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'ArrowRight')
      expect(defaultPrevented).toBe(true)
    })

    it('Enter calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'Enter')
      expect(defaultPrevented).toBe(true)
    })

    it('Space calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), ' ')
      expect(defaultPrevented).toBe(true)
    })

    it('Escape calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'Escape')
      expect(defaultPrevented).toBe(true)
    })

    it('PageUp calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'PageUp')
      expect(defaultPrevented).toBe(true)
    })

    it('unknown key does NOT call preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'a')
      expect(defaultPrevented).toBe(false)
    })
  })

  describe('hook return', () => {
    it('returns an object with onKeyDown function', () => {
      const { result } = renderHook(() => useKeyboard(makeConfig()))
      expect(typeof result.current.onKeyDown).toBe('function')
    })
  })

  describe('arrow keys at month boundaries', () => {
    it('ArrowRight from last day of month moves to first day of next month', () => {
      // March 31 2026 -> April 1 2026
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 31) }), 'ArrowRight')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(3)
      expect(result.getDate()).toBe(1)
    })

    it('ArrowLeft from first day of month moves to last day of previous month', () => {
      // April 1 2026 -> March 31 2026
      pressKey(makeConfig({ focusedDate: new Date(2026, 3, 1) }), 'ArrowLeft')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(31)
    })

    it('ArrowDown from late in month crosses into next month', () => {
      // March 29 2026 + 7 = April 5 2026
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 29) }), 'ArrowDown')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(3)
      expect(result.getDate()).toBe(5)
    })

    it('ArrowUp from early in month crosses into previous month', () => {
      // April 3 2026 - 7 = March 27 2026
      pressKey(makeConfig({ focusedDate: new Date(2026, 3, 3) }), 'ArrowUp')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(27)
    })

    it('ArrowRight from Dec 31 crosses into next year', () => {
      // Dec 31 2026 -> Jan 1 2027
      pressKey(makeConfig({ focusedDate: new Date(2026, 11, 31) }), 'ArrowRight')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2027)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(1)
    })

    it('ArrowLeft from Jan 1 crosses into previous year', () => {
      // Jan 1 2027 -> Dec 31 2026
      pressKey(makeConfig({ focusedDate: new Date(2027, 0, 1) }), 'ArrowLeft')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2026)
      expect(result.getMonth()).toBe(11)
      expect(result.getDate()).toBe(31)
    })

    it('ArrowRight from Feb 28 in non-leap year goes to March 1', () => {
      // Feb 28 2026 (non-leap) -> March 1 2026
      pressKey(makeConfig({ focusedDate: new Date(2026, 1, 28) }), 'ArrowRight')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(1)
    })

    it('ArrowRight from Feb 29 in leap year goes to March 1', () => {
      // Feb 29 2028 (leap year) -> March 1 2028
      pressKey(makeConfig({ focusedDate: new Date(2028, 1, 29) }), 'ArrowRight')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(1)
    })
  })

  describe('Home and End edge cases', () => {
    it('Home from a mid-week day moves to correct start of week', () => {
      // March 18 2026 is Wednesday. weekStartDay=0 (Sun) -> March 15
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 18), weekStartDay: 0 }), 'Home')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(15)
      expect(result.getDay()).toBe(0)
    })

    it('End from a mid-week day moves to correct end of week', () => {
      // March 18 2026 is Wednesday. weekStartDay=0 (Sun) -> Sat March 21
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 18), weekStartDay: 0 }), 'End')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(21)
      expect(result.getDay()).toBe(6)
    })

    it('Home crosses month boundary when week spans two months', () => {
      // April 2 2026 is Thursday. weekStartDay=0 (Sun) -> March 29 (Sunday)
      pressKey(makeConfig({ focusedDate: new Date(2026, 3, 2), weekStartDay: 0 }), 'Home')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(29)
    })

    it('End crosses month boundary when week spans two months', () => {
      // March 30 2026 is Monday. weekStartDay=1 (Mon) -> Sun April 5
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 30), weekStartDay: 1 }), 'End')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(3)
      expect(result.getDate()).toBe(5)
    })

    it('Home with weekStartDay=6 (Saturday)', () => {
      // March 18 2026 is Wednesday. weekStartDay=6 (Sat) -> March 14 (Saturday)
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 18), weekStartDay: 6 }), 'Home')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDay()).toBe(6)
      expect(result.getDate()).toBe(14)
    })

    it('End with weekStartDay=6 (Saturday) gives Friday', () => {
      // March 18 2026 is Wednesday. weekStartDay=6 (Sat) -> Fri March 20
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 18), weekStartDay: 6 }), 'End')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDay()).toBe(5)
      expect(result.getDate()).toBe(20)
    })

    it('End skips disabled end-of-week and finds previous enabled day', () => {
      // March 15 is Sunday, weekStartDay=0. End of week = Sat March 21.
      // If March 21 is disabled, End should find March 20
      pressKey(
        makeConfig({
          weekStartDay: 0,
          isDisabled: (d) => d.getDate() === 21,
        }),
        'End',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(20)
    })
  })

  describe('page keys edge cases', () => {
    it('PageUp clamps day when target month is shorter (Mar 31 -> Feb 28)', () => {
      // March 31 2026 - 1 month = Feb 28 2026 (non-leap year, day clamped)
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 31) }), 'PageUp')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(28)
    })

    it('PageDown clamps day when target month is shorter (Jan 31 -> Feb 28)', () => {
      // Jan 31 2026 + 1 month = Feb 28 2026
      pressKey(makeConfig({ focusedDate: new Date(2026, 0, 31) }), 'PageDown')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(28)
    })

    it('PageUp from January crosses into previous year', () => {
      // Jan 15 2026 - 1 month = Dec 15 2025
      pressKey(makeConfig({ focusedDate: new Date(2026, 0, 15) }), 'PageUp')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(11)
      expect(result.getDate()).toBe(15)
    })

    it('PageDown from December crosses into next year', () => {
      // Dec 15 2026 + 1 month = Jan 15 2027
      pressKey(makeConfig({ focusedDate: new Date(2026, 11, 15) }), 'PageDown')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2027)
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })

    it('PageUp to leap year Feb preserves Feb 29', () => {
      // Mar 29 2028 - 1 month = Feb 29 2028 (leap year)
      pressKey(makeConfig({ focusedDate: new Date(2028, 2, 29) }), 'PageUp')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(29)
    })

    it('PageDown skips disabled target month and moves another month', () => {
      // From March 15 2026: April 15 is disabled, so PageDown should land on May 15
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getMonth() === 3 && d.getDate() === 15,
        }),
        'PageDown',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(4)
      expect(result.getDate()).toBe(15)
    })

    it('PageUp skips disabled target month and moves another month back', () => {
      // From March 15 2026: Feb 15 is disabled, so PageUp should land on Jan 15
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getMonth() === 1 && d.getDate() === 15,
        }),
        'PageUp',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(0)
      expect(result.getDate()).toBe(15)
    })
  })

  describe('shift+page keys edge cases', () => {
    it('Shift+PageUp from Feb 29 leap year clamps to Feb 28 in non-leap year', () => {
      // Feb 29 2028 (leap) - 1 year = Feb 28 2027 (non-leap)
      pressKey(makeConfig({ focusedDate: new Date(2028, 1, 29) }), 'PageUp', { shiftKey: true })
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2027)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(28)
    })

    it('Shift+PageDown from Feb 29 leap year clamps to Feb 28 in non-leap year', () => {
      // Feb 29 2028 (leap) + 1 year = Feb 28 2029 (non-leap)
      pressKey(makeConfig({ focusedDate: new Date(2028, 1, 29) }), 'PageDown', { shiftKey: true })
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2029)
      expect(result.getMonth()).toBe(1)
      expect(result.getDate()).toBe(28)
    })

    it('Shift+PageDown skips disabled target year and goes another year forward', () => {
      // From March 15 2026: March 15 2027 is disabled, should land on March 15 2028
      pressKey(
        makeConfig({
          isDisabled: (d) => d.getFullYear() === 2027 && d.getMonth() === 2 && d.getDate() === 15,
        }),
        'PageDown',
        { shiftKey: true },
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getFullYear()).toBe(2028)
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(15)
    })
  })

  describe('selection edge cases', () => {
    it('Enter passes shiftKey: true when shift is held', () => {
      pressKey(makeConfig(), 'Enter', { shiftKey: true })
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith(baseDate, { shiftKey: true })
    })

    it('Space passes shiftKey: true when shift is held', () => {
      pressKey(makeConfig(), ' ', { shiftKey: true })
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onSelect).toHaveBeenCalledWith(baseDate, { shiftKey: true })
    })

    it('Enter preventDefault is called even on disabled date', () => {
      const { defaultPrevented } = pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() === 15,
        }),
        'Enter',
      )
      expect(defaultPrevented).toBe(true)
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('Space preventDefault is called even on disabled date', () => {
      const { defaultPrevented } = pressKey(
        makeConfig({
          isDisabled: (d) => d.getDate() === 15,
        }),
        ' ',
      )
      expect(defaultPrevented).toBe(true)
      expect(onSelect).not.toHaveBeenCalled()
    })
  })

  describe('tab key', () => {
    it('Tab does not prevent default (allows natural focus movement)', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'Tab')
      expect(defaultPrevented).toBe(false)
    })

    it('Shift+Tab does not prevent default', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'Tab', { shiftKey: true })
      expect(defaultPrevented).toBe(false)
    })

    it('Tab does not call any callbacks', () => {
      pressKey(makeConfig(), 'Tab', { shiftKey: true })
      expect(onFocusChange).not.toHaveBeenCalled()
      expect(onSelect).not.toHaveBeenCalled()
      expect(onDismiss).not.toHaveBeenCalled()
    })
  })

  describe('disabled date interaction via arrows', () => {
    it('ArrowDown skips disabled date at week boundary crossing months', () => {
      // March 29 + 7 = April 5. If April 5 is disabled, should skip to April 12
      pressKey(
        makeConfig({
          focusedDate: new Date(2026, 2, 29),
          isDisabled: (d) => d.getMonth() === 3 && d.getDate() === 5,
        }),
        'ArrowDown',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(3)
      expect(result.getDate()).toBe(12)
    })

    it('ArrowUp skips disabled date at week boundary crossing months', () => {
      // April 5 - 7 = March 29. If March 29 is disabled, should skip to March 22
      pressKey(
        makeConfig({
          focusedDate: new Date(2026, 3, 5),
          isDisabled: (d) => d.getMonth() === 2 && d.getDate() === 29,
        }),
        'ArrowUp',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(22)
    })

    it('ArrowRight through disabled dates crossing month boundary', () => {
      // March 31 + 1 = April 1. If April 1 and April 2 are disabled, should land on April 3
      pressKey(
        makeConfig({
          focusedDate: new Date(2026, 2, 31),
          isDisabled: (d) => d.getMonth() === 3 && d.getDate() <= 2,
        }),
        'ArrowRight',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(3)
      expect(result.getDate()).toBe(3)
    })

    it('ArrowLeft through disabled dates crossing month boundary', () => {
      // April 1 - 1 = March 31. If March 31 and March 30 are disabled, should land on March 29
      pressKey(
        makeConfig({
          focusedDate: new Date(2026, 3, 1),
          isDisabled: (d) => d.getMonth() === 2 && d.getDate() >= 30,
        }),
        'ArrowLeft',
      )
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getMonth()).toBe(2)
      expect(result.getDate()).toBe(29)
    })

    it('does not call onFocusChange when all dates in skip range are disabled (MAX_SKIP)', () => {
      // Every date is disabled - should exhaust MAX_SKIP and call nothing
      pressKey(
        makeConfig({
          isDisabled: () => true,
        }),
        'ArrowRight',
      )
      expect(onFocusChange).not.toHaveBeenCalled()
    })
  })

  describe('Home/End with various weekStartDay values', () => {
    it('Home with weekStartDay=2 (Tuesday)', () => {
      // March 18 2026 is Wednesday. weekStartDay=2 (Tue) -> March 17 (Tuesday)
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 18), weekStartDay: 2 }), 'Home')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDay()).toBe(2)
      expect(result.getDate()).toBe(17)
    })

    it('End with weekStartDay=2 (Tuesday) gives Monday', () => {
      // March 18 2026 is Wednesday. weekStartDay=2 (Tue) -> Mon March 23
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 18), weekStartDay: 2 }), 'End')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDay()).toBe(1)
      expect(result.getDate()).toBe(23)
    })

    it('Home when already on weekStartDay returns same date', () => {
      // March 16 2026 is Monday. weekStartDay=1 (Mon) -> March 16 (already at start)
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 16), weekStartDay: 1 }), 'Home')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(16)
    })

    it('End when already on last day of week returns same date', () => {
      // March 15 2026 is Sunday. weekStartDay=1 (Mon) -> Sun March 15 (already at end)
      pressKey(makeConfig({ focusedDate: new Date(2026, 2, 15), weekStartDay: 1 }), 'End')
      expect(onFocusChange).toHaveBeenCalledTimes(1)
      const result: Date = onFocusChange.mock.calls[0][0]
      expect(result.getDate()).toBe(15)
    })
  })

  describe('preventDefault edge cases', () => {
    it('PageDown calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'PageDown')
      expect(defaultPrevented).toBe(true)
    })

    it('Shift+PageUp calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'PageUp', { shiftKey: true })
      expect(defaultPrevented).toBe(true)
    })

    it('Shift+PageDown calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'PageDown', { shiftKey: true })
      expect(defaultPrevented).toBe(true)
    })

    it('Home calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'Home')
      expect(defaultPrevented).toBe(true)
    })

    it('End calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'End')
      expect(defaultPrevented).toBe(true)
    })

    it('ArrowUp calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'ArrowUp')
      expect(defaultPrevented).toBe(true)
    })

    it('ArrowDown calls preventDefault', () => {
      const { defaultPrevented } = pressKey(makeConfig(), 'ArrowDown')
      expect(defaultPrevented).toBe(true)
    })

    it('arrow key still calls preventDefault even when all dates are disabled', () => {
      const { defaultPrevented } = pressKey(makeConfig({ isDisabled: () => true }), 'ArrowRight')
      expect(defaultPrevented).toBe(true)
    })
  })
})
