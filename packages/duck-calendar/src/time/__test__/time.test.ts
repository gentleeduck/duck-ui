import { describe, expect, it } from 'vitest'
import { clampTime, incrementField, isValidTime, parseTimeInput } from '../time'
import { formatTimeField, getAmPm, to12Hour, to24Hour } from '../time.libs'

describe('time', () => {
  describe('isValidTime', () => {
    it('valid: { hour: 0, minute: 0 }', () => {
      expect(isValidTime({ hour: 0, minute: 0 })).toBe(true)
    })

    it('valid: { hour: 23, minute: 59, second: 59 }', () => {
      expect(isValidTime({ hour: 23, minute: 59, second: 59 })).toBe(true)
    })

    it('valid: { hour: 12, minute: 30 }', () => {
      expect(isValidTime({ hour: 12, minute: 30 })).toBe(true)
    })

    it('valid: { hour: 0, minute: 0, second: 0 }', () => {
      expect(isValidTime({ hour: 0, minute: 0, second: 0 })).toBe(true)
    })

    it('invalid: hour < 0', () => {
      expect(isValidTime({ hour: -1, minute: 0 })).toBe(false)
    })

    it('invalid: hour > 23', () => {
      expect(isValidTime({ hour: 24, minute: 0 })).toBe(false)
    })

    it('invalid: minute < 0', () => {
      expect(isValidTime({ hour: 0, minute: -1 })).toBe(false)
    })

    it('invalid: minute > 59', () => {
      expect(isValidTime({ hour: 0, minute: 60 })).toBe(false)
    })

    it('invalid: second < 0', () => {
      expect(isValidTime({ hour: 0, minute: 0, second: -1 })).toBe(false)
    })

    it('invalid: second > 59', () => {
      expect(isValidTime({ hour: 0, minute: 0, second: 60 })).toBe(false)
    })

    it('valid when second is undefined', () => {
      expect(isValidTime({ hour: 10, minute: 30 })).toBe(true)
    })
  })

  describe('clampTime', () => {
    it('within bounds returns no change', () => {
      const time = { hour: 10, minute: 30 }
      const min = { hour: 8, minute: 0 }
      const max = { hour: 18, minute: 0 }
      expect(clampTime(time, min, max)).toEqual({ hour: 10, minute: 30 })
    })

    it('below min clamps to min', () => {
      const time = { hour: 6, minute: 0 }
      const min = { hour: 8, minute: 0 }
      expect(clampTime(time, min)).toEqual({ hour: 8, minute: 0 })
    })

    it('above max clamps to max', () => {
      const time = { hour: 20, minute: 0 }
      const max = { hour: 18, minute: 0 }
      expect(clampTime(time, undefined, max)).toEqual({ hour: 18, minute: 0 })
    })

    it('no min/max returns no change', () => {
      const time = { hour: 14, minute: 45 }
      expect(clampTime(time)).toEqual({ hour: 14, minute: 45 })
    })

    it('preserves second field presence when original has it', () => {
      const time = { hour: 10, minute: 30, second: 15 }
      const result = clampTime(time)
      expect(result).toEqual({ hour: 10, minute: 30, second: 15 })
      expect('second' in result).toBe(true)
    })

    it('strips second field when original lacks it', () => {
      const time = { hour: 6, minute: 0 }
      const min = { hour: 8, minute: 0, second: 30 }
      const result = clampTime(time, min)
      expect(result).toEqual({ hour: 8, minute: 0 })
      expect('second' in result).toBe(false)
    })

    it('clamps using total seconds comparison (minute precision)', () => {
      const time = { hour: 8, minute: 0 }
      const min = { hour: 8, minute: 15 }
      expect(clampTime(time, min)).toEqual({ hour: 8, minute: 15 })
    })

    it('exact min boundary is not clamped', () => {
      const time = { hour: 8, minute: 0 }
      const min = { hour: 8, minute: 0 }
      expect(clampTime(time, min)).toEqual({ hour: 8, minute: 0 })
    })

    it('exact max boundary is not clamped', () => {
      const time = { hour: 18, minute: 0 }
      const max = { hour: 18, minute: 0 }
      expect(clampTime(time, undefined, max)).toEqual({ hour: 18, minute: 0 })
    })
  })

  describe('incrementField', () => {
    it('hour: increments normally', () => {
      const result = incrementField({ hour: 10, minute: 0 }, 'hour', 1)
      expect(result.hour).toBe(11)
    })

    it('hour: wraps 23+1 to 0', () => {
      const result = incrementField({ hour: 23, minute: 0 }, 'hour', 1)
      expect(result.hour).toBe(0)
    })

    it('hour: wraps 0-1 to 23', () => {
      const result = incrementField({ hour: 0, minute: 0 }, 'hour', -1)
      expect(result.hour).toBe(23)
    })

    it('minute: increments normally', () => {
      const result = incrementField({ hour: 10, minute: 30 }, 'minute', 1)
      expect(result.minute).toBe(31)
    })

    it('minute: wraps 59+1 to 0', () => {
      const result = incrementField({ hour: 10, minute: 59 }, 'minute', 1)
      expect(result.minute).toBe(0)
    })

    it('minute: wraps 0-1 to 59', () => {
      const result = incrementField({ hour: 10, minute: 0 }, 'minute', -1)
      expect(result.minute).toBe(59)
    })

    it('second: increments normally', () => {
      const result = incrementField({ hour: 10, minute: 0, second: 30 }, 'second', 1)
      expect(result.second).toBe(31)
    })

    it('second: wraps 59+1 to 0', () => {
      const result = incrementField({ hour: 10, minute: 0, second: 59 }, 'second', 1)
      expect(result.second).toBe(0)
    })

    it('second: wraps 0-1 to 59', () => {
      const result = incrementField({ hour: 10, minute: 0, second: 0 }, 'second', -1)
      expect(result.second).toBe(59)
    })

    it('ampm: toggles AM to PM (0 -> 12)', () => {
      const result = incrementField({ hour: 0, minute: 0 }, 'ampm', 1)
      expect(result.hour).toBe(12)
    })

    it('ampm: toggles PM to AM (13 -> 1)', () => {
      const result = incrementField({ hour: 13, minute: 0 }, 'ampm', 1)
      expect(result.hour).toBe(1)
    })

    it('ampm: toggles PM to AM (12 -> 0)', () => {
      const result = incrementField({ hour: 12, minute: 0 }, 'ampm', 1)
      expect(result.hour).toBe(0)
    })

    it('ampm: toggles AM to PM (11 -> 23)', () => {
      const result = incrementField({ hour: 11, minute: 0 }, 'ampm', 1)
      expect(result.hour).toBe(23)
    })

    it('minuteStep: increment by 5 when step=5', () => {
      const result = incrementField({ hour: 10, minute: 0 }, 'minute', 1, { minuteStep: 5 })
      expect(result.minute).toBe(5)
    })

    it('minuteStep: decrement by 5 when step=5', () => {
      const result = incrementField({ hour: 10, minute: 10 }, 'minute', -1, { minuteStep: 5 })
      expect(result.minute).toBe(5)
    })

    it('minuteStep: wraps with step (55+5 -> 0)', () => {
      const result = incrementField({ hour: 10, minute: 55 }, 'minute', 1, { minuteStep: 5 })
      expect(result.minute).toBe(0)
    })

    it('secondStep: increment by 15 when step=15', () => {
      const result = incrementField({ hour: 10, minute: 0, second: 0 }, 'second', 1, { secondStep: 15 })
      expect(result.second).toBe(15)
    })

    it('respects min clamping after increment', () => {
      const result = incrementField({ hour: 8, minute: 0 }, 'hour', -1, {
        minTime: { hour: 8, minute: 0 },
      })
      expect(result.hour).toBe(8)
      expect(result.minute).toBe(0)
    })

    it('respects max clamping after increment', () => {
      const result = incrementField({ hour: 18, minute: 0 }, 'hour', 1, {
        maxTime: { hour: 18, minute: 0 },
      })
      expect(result.hour).toBe(18)
      expect(result.minute).toBe(0)
    })
  })

  describe('parseTimeInput', () => {
    it('valid "14" for hour (24h) returns 14', () => {
      expect(parseTimeInput('14', 'hour', '24')).toBe(14)
    })

    it('valid "0" for hour (24h) returns 0', () => {
      expect(parseTimeInput('0', 'hour', '24')).toBe(0)
    })

    it('valid "23" for hour (24h) returns 23', () => {
      expect(parseTimeInput('23', 'hour', '24')).toBe(23)
    })

    it('valid "2" for hour (12h) returns 2', () => {
      expect(parseTimeInput('2', 'hour', '12')).toBe(2)
    })

    it('valid "1" for hour (12h) returns 1', () => {
      expect(parseTimeInput('1', 'hour', '12')).toBe(1)
    })

    it('invalid "25" for hour (24h) returns null', () => {
      expect(parseTimeInput('25', 'hour', '24')).toBeNull()
    })

    it('invalid "-1" for hour (24h) returns null', () => {
      expect(parseTimeInput('-1', 'hour', '24')).toBeNull()
    })

    it('invalid "0" for hour (12h) returns null', () => {
      expect(parseTimeInput('0', 'hour', '12')).toBeNull()
    })

    it('invalid "13" for hour (12h) returns null', () => {
      expect(parseTimeInput('13', 'hour', '12')).toBeNull()
    })

    it('"12" in 12h mode returns 0 (noon/midnight)', () => {
      expect(parseTimeInput('12', 'hour', '12')).toBe(0)
    })

    it('valid "30" for minute returns 30', () => {
      expect(parseTimeInput('30', 'minute', '24')).toBe(30)
    })

    it('valid "0" for minute returns 0', () => {
      expect(parseTimeInput('0', 'minute', '24')).toBe(0)
    })

    it('valid "59" for minute returns 59', () => {
      expect(parseTimeInput('59', 'minute', '24')).toBe(59)
    })

    it('invalid "60" for minute returns null', () => {
      expect(parseTimeInput('60', 'minute', '24')).toBeNull()
    })

    it('valid "45" for second returns 45', () => {
      expect(parseTimeInput('45', 'second', '24')).toBe(45)
    })

    it('invalid "60" for second returns null', () => {
      expect(parseTimeInput('60', 'second', '24')).toBeNull()
    })

    it('invalid "abc" returns null', () => {
      expect(parseTimeInput('abc', 'hour', '24')).toBeNull()
    })

    it('invalid empty string returns null', () => {
      expect(parseTimeInput('', 'hour', '24')).toBeNull()
    })

    it('"ampm" field returns null', () => {
      expect(parseTimeInput('1', 'ampm', '24')).toBeNull()
    })
  })

  describe('formatTimeField', () => {
    it('0 returns "00"', () => {
      expect(formatTimeField(0)).toBe('00')
    })

    it('5 returns "05"', () => {
      expect(formatTimeField(5)).toBe('05')
    })

    it('9 returns "09"', () => {
      expect(formatTimeField(9)).toBe('09')
    })

    it('14 returns "14"', () => {
      expect(formatTimeField(14)).toBe('14')
    })

    it('59 returns "59"', () => {
      expect(formatTimeField(59)).toBe('59')
    })
  })

  describe('getAmPm', () => {
    it('hour 0 returns AM', () => {
      expect(getAmPm(0)).toBe('AM')
    })

    it('hour 11 returns AM', () => {
      expect(getAmPm(11)).toBe('AM')
    })

    it('hour 12 returns PM', () => {
      expect(getAmPm(12)).toBe('PM')
    })

    it('hour 23 returns PM', () => {
      expect(getAmPm(23)).toBe('PM')
    })

    it('hour 6 returns AM', () => {
      expect(getAmPm(6)).toBe('AM')
    })

    it('hour 18 returns PM', () => {
      expect(getAmPm(18)).toBe('PM')
    })
  })

  describe('to12Hour', () => {
    it('0 returns 12 (midnight)', () => {
      expect(to12Hour(0)).toBe(12)
    })

    it('1 returns 1', () => {
      expect(to12Hour(1)).toBe(1)
    })

    it('11 returns 11', () => {
      expect(to12Hour(11)).toBe(11)
    })

    it('12 returns 12 (noon)', () => {
      expect(to12Hour(12)).toBe(12)
    })

    it('13 returns 1', () => {
      expect(to12Hour(13)).toBe(1)
    })

    it('23 returns 11', () => {
      expect(to12Hour(23)).toBe(11)
    })
  })

  describe('to24Hour', () => {
    it('(12, AM) returns 0 (midnight)', () => {
      expect(to24Hour(12, 'AM')).toBe(0)
    })

    it('(1, AM) returns 1', () => {
      expect(to24Hour(1, 'AM')).toBe(1)
    })

    it('(11, AM) returns 11', () => {
      expect(to24Hour(11, 'AM')).toBe(11)
    })

    it('(12, PM) returns 12 (noon)', () => {
      expect(to24Hour(12, 'PM')).toBe(12)
    })

    it('(1, PM) returns 13', () => {
      expect(to24Hour(1, 'PM')).toBe(13)
    })

    it('(11, PM) returns 23', () => {
      expect(to24Hour(11, 'PM')).toBe(23)
    })
  })

  describe('clampTime – edge cases', () => {
    it('time exactly at min with seconds is not clamped', () => {
      const time = { hour: 8, minute: 0, second: 0 }
      const min = { hour: 8, minute: 0, second: 0 }
      expect(clampTime(time, min)).toEqual({ hour: 8, minute: 0, second: 0 })
    })

    it('time exactly at max with seconds is not clamped', () => {
      const time = { hour: 18, minute: 30, second: 59 }
      const max = { hour: 18, minute: 30, second: 59 }
      expect(clampTime(time, undefined, max)).toEqual({ hour: 18, minute: 30, second: 59 })
    })

    it('time one second below min with seconds is clamped', () => {
      const time = { hour: 7, minute: 59, second: 59 }
      const min = { hour: 8, minute: 0, second: 0 }
      expect(clampTime(time, min)).toEqual({ hour: 8, minute: 0, second: 0 })
    })

    it('time one second above max with seconds is clamped', () => {
      const time = { hour: 18, minute: 0, second: 1 }
      const max = { hour: 18, minute: 0, second: 0 }
      expect(clampTime(time, undefined, max)).toEqual({ hour: 18, minute: 0, second: 0 })
    })

    it('contradictory min > max returns time unchanged', () => {
      const time = { hour: 12, minute: 0 }
      const min = { hour: 20, minute: 0 }
      const max = { hour: 8, minute: 0 }
      expect(clampTime(time, min, max)).toEqual({ hour: 12, minute: 0 })
    })

    it('midnight (00:00) clamped to min (01:00)', () => {
      const time = { hour: 0, minute: 0 }
      const min = { hour: 1, minute: 0 }
      expect(clampTime(time, min)).toEqual({ hour: 1, minute: 0 })
    })

    it('end of day (23:59:59) clamped to max (22:00:00)', () => {
      const time = { hour: 23, minute: 59, second: 59 }
      const max = { hour: 22, minute: 0, second: 0 }
      expect(clampTime(time, undefined, max)).toEqual({ hour: 22, minute: 0, second: 0 })
    })

    it('both min and max, time between returns unchanged', () => {
      const time = { hour: 12, minute: 30, second: 15 }
      const min = { hour: 9, minute: 0, second: 0 }
      const max = { hour: 17, minute: 0, second: 0 }
      expect(clampTime(time, min, max)).toEqual({ hour: 12, minute: 30, second: 15 })
    })

    it('same min and max forces time to that exact value', () => {
      const time = { hour: 10, minute: 0 }
      const boundary = { hour: 12, minute: 0 }
      expect(clampTime(time, boundary, boundary)).toEqual({ hour: 12, minute: 0 })
    })

    it('same min and max with time already at value returns unchanged', () => {
      const boundary = { hour: 12, minute: 0 }
      expect(clampTime({ hour: 12, minute: 0 }, boundary, boundary)).toEqual({ hour: 12, minute: 0 })
    })
  })

  describe('incrementField – boundary wrapping', () => {
    it('hour 23 + 1 wraps to 0, minute and second unchanged', () => {
      const result = incrementField({ hour: 23, minute: 59, second: 59 }, 'hour', 1)
      expect(result.hour).toBe(0)
      expect(result.minute).toBe(59)
      expect(result.second).toBe(59)
    })

    it('hour 0 - 1 wraps to 23, minute and second unchanged', () => {
      const result = incrementField({ hour: 0, minute: 30, second: 15 }, 'hour', -1)
      expect(result.hour).toBe(23)
      expect(result.minute).toBe(30)
      expect(result.second).toBe(15)
    })

    it('minute 59 + 1 wraps to 0, hour unchanged', () => {
      const result = incrementField({ hour: 10, minute: 59, second: 30 }, 'minute', 1)
      expect(result.minute).toBe(0)
      expect(result.hour).toBe(10)
      expect(result.second).toBe(30)
    })

    it('second 59 + 1 wraps to 0, hour and minute unchanged', () => {
      const result = incrementField({ hour: 23, minute: 59, second: 59 }, 'second', 1)
      expect(result.second).toBe(0)
      expect(result.hour).toBe(23)
      expect(result.minute).toBe(59)
    })

    it('second 0 - 1 wraps to 59', () => {
      const result = incrementField({ hour: 0, minute: 0, second: 0 }, 'second', -1)
      expect(result.second).toBe(59)
    })

    it('minute with step wraps: 50 + step(15) goes to the next step, 0', () => {
      const result = incrementField({ hour: 10, minute: 50 }, 'minute', 1, { minuteStep: 15 })
      expect(result.minute).toBe(0)
    })

    it('minute with step wraps backward: 0 - step(15) wraps to 45', () => {
      const result = incrementField({ hour: 10, minute: 0 }, 'minute', -1, { minuteStep: 15 })
      expect(result.minute).toBe(45)
    })

    it('second with step wraps: 50 + step(15) goes to the next step, 0', () => {
      const result = incrementField({ hour: 10, minute: 0, second: 50 }, 'second', 1, { secondStep: 15 })
      expect(result.second).toBe(0)
    })

    it('second with step wraps backward: 0 - step(15) wraps to 45', () => {
      const result = incrementField({ hour: 10, minute: 0, second: 0 }, 'second', -1, { secondStep: 15 })
      expect(result.second).toBe(45)
    })

    it('multiple increments: hour wraps correctly with delta > 1', () => {
      const result = incrementField({ hour: 22, minute: 0 }, 'hour', 5)
      expect(result.hour).toBe(3)
    })

    it('multiple decrements: hour wraps correctly with negative delta', () => {
      const result = incrementField({ hour: 2, minute: 0 }, 'hour', -5)
      expect(result.hour).toBe(21)
    })
  })

  describe('incrementField – ampm toggle edge cases', () => {
    it('ampm toggle at midnight (0) goes to noon (12)', () => {
      const result = incrementField({ hour: 0, minute: 0, second: 0 }, 'ampm', 1)
      expect(result.hour).toBe(12)
    })

    it('ampm toggle at noon (12) goes to midnight (0)', () => {
      const result = incrementField({ hour: 12, minute: 0, second: 0 }, 'ampm', 1)
      expect(result.hour).toBe(0)
    })

    it('ampm toggle at 1 AM goes to 1 PM (13)', () => {
      const result = incrementField({ hour: 1, minute: 0 }, 'ampm', 1)
      expect(result.hour).toBe(13)
    })

    it('ampm toggle at 1 PM (13) goes to 1 AM (1)', () => {
      const result = incrementField({ hour: 13, minute: 0 }, 'ampm', 1)
      expect(result.hour).toBe(1)
    })

    it('ampm toggle at 11:59:59 AM goes to 23:59:59 PM', () => {
      const result = incrementField({ hour: 11, minute: 59, second: 59 }, 'ampm', 1)
      expect(result.hour).toBe(23)
      expect(result.minute).toBe(59)
      expect(result.second).toBe(59)
    })

    it('ampm toggle at 23:59:59 PM goes to 11:59:59 AM', () => {
      const result = incrementField({ hour: 23, minute: 59, second: 59 }, 'ampm', 1)
      expect(result.hour).toBe(11)
      expect(result.minute).toBe(59)
      expect(result.second).toBe(59)
    })

    it('ampm toggle with -1 delta works the same as +1', () => {
      const result = incrementField({ hour: 5, minute: 30 }, 'ampm', -1)
      expect(result.hour).toBe(17)
    })
  })

  describe('incrementField – min/max clamping interactions', () => {
    it('hour decrement past min clamps to min', () => {
      const result = incrementField({ hour: 9, minute: 0 }, 'hour', -1, {
        minTime: { hour: 9, minute: 0 },
      })
      expect(result.hour).toBe(9)
      expect(result.minute).toBe(0)
    })

    it('hour increment past max clamps to max', () => {
      const result = incrementField({ hour: 17, minute: 0 }, 'hour', 1, {
        maxTime: { hour: 17, minute: 0 },
      })
      expect(result.hour).toBe(17)
      expect(result.minute).toBe(0)
    })

    it('minute wrapping past the hour lands inside maxTime', () => {
      const result = incrementField({ hour: 17, minute: 55 }, 'minute', 1, {
        minuteStep: 10,
        maxTime: { hour: 17, minute: 59 },
      })
      // 55 goes to the next step, 60, which wraps to 0; 17:00 is within range
      expect(result.minute).toBe(0)
    })

    it('second wrapping past the minute lands inside maxTime', () => {
      const result = incrementField({ hour: 17, minute: 0, second: 50 }, 'second', 1, {
        secondStep: 15,
        maxTime: { hour: 17, minute: 0, second: 59 },
      })
      // 50 goes to the next step, 60, which wraps to 0; 17:00:00 is within range
      expect(result.second).toBe(0)
    })
  })

  describe('12h <-> 24h round-trip conversions', () => {
    it('all 24 hours survive to12Hour -> to24Hour round-trip', () => {
      for (let h = 0; h < 24; h++) {
        const h12 = to12Hour(h)
        const ampm = getAmPm(h)
        const back = to24Hour(h12, ampm)
        expect(back).toBe(h)
      }
    })

    it('to12Hour returns values in 1..12 range for all inputs', () => {
      for (let h = 0; h < 24; h++) {
        const h12 = to12Hour(h)
        expect(h12).toBeGreaterThanOrEqual(1)
        expect(h12).toBeLessThanOrEqual(12)
      }
    })

    it('noon: to12Hour(12) = 12, getAmPm(12) = PM, to24Hour(12, PM) = 12', () => {
      expect(to12Hour(12)).toBe(12)
      expect(getAmPm(12)).toBe('PM')
      expect(to24Hour(12, 'PM')).toBe(12)
    })

    it('midnight: to12Hour(0) = 12, getAmPm(0) = AM, to24Hour(12, AM) = 0', () => {
      expect(to12Hour(0)).toBe(12)
      expect(getAmPm(0)).toBe('AM')
      expect(to24Hour(12, 'AM')).toBe(0)
    })

    it('1 AM: to12Hour(1) = 1, getAmPm(1) = AM, to24Hour(1, AM) = 1', () => {
      expect(to12Hour(1)).toBe(1)
      expect(getAmPm(1)).toBe('AM')
      expect(to24Hour(1, 'AM')).toBe(1)
    })

    it('1 PM: to12Hour(13) = 1, getAmPm(13) = PM, to24Hour(1, PM) = 13', () => {
      expect(to12Hour(13)).toBe(1)
      expect(getAmPm(13)).toBe('PM')
      expect(to24Hour(1, 'PM')).toBe(13)
    })

    it('11 AM boundary: to12Hour(11) = 11, getAmPm(11) = AM', () => {
      expect(to12Hour(11)).toBe(11)
      expect(getAmPm(11)).toBe('AM')
    })

    it('11 PM boundary: to12Hour(23) = 11, getAmPm(23) = PM', () => {
      expect(to12Hour(23)).toBe(11)
      expect(getAmPm(23)).toBe('PM')
    })
  })

  describe('formatTimeField – edge cases', () => {
    it('10 returns "10" (no padding needed)', () => {
      expect(formatTimeField(10)).toBe('10')
    })

    it('23 returns "23"', () => {
      expect(formatTimeField(23)).toBe('23')
    })

    it('1 returns "01"', () => {
      expect(formatTimeField(1)).toBe('01')
    })
  })

  describe('parseTimeInput – malformed and edge input', () => {
    it('whitespace-only string returns null', () => {
      expect(parseTimeInput('   ', 'hour', '24')).toBeNull()
    })

    it('refuses anything but digits', () => {
      expect(['10.5', '1a', ' 5', '+5', '1e1', '5.'].map((input) => parseTimeInput(input, 'hour', '24'))).toEqual([
        null,
        null,
        null,
        null,
        null,
        null,
      ])
    })

    it('leading zeros "07" returns 7 for hour (24h)', () => {
      expect(parseTimeInput('07', 'hour', '24')).toBe(7)
    })

    it('leading zeros "00" returns 0 for minute', () => {
      expect(parseTimeInput('00', 'minute', '24')).toBe(0)
    })

    it('leading zeros "00" returns 0 for second', () => {
      expect(parseTimeInput('00', 'second', '24')).toBe(0)
    })

    it('negative "-5" returns null for minute', () => {
      expect(parseTimeInput('-5', 'minute', '24')).toBeNull()
    })

    it('negative "-1" returns null for second', () => {
      expect(parseTimeInput('-1', 'second', '24')).toBeNull()
    })

    it('"24" for hour (24h) returns null', () => {
      expect(parseTimeInput('24', 'hour', '24')).toBeNull()
    })

    it('"12" in 12h returns 0 (maps noon/midnight display to internal 0)', () => {
      expect(parseTimeInput('12', 'hour', '12')).toBe(0)
    })

    it('"1" for hour in 12h returns 1', () => {
      expect(parseTimeInput('1', 'hour', '12')).toBe(1)
    })

    it('"11" for hour in 12h returns 11', () => {
      expect(parseTimeInput('11', 'hour', '12')).toBe(11)
    })

    it('large number "999" for minute returns null', () => {
      expect(parseTimeInput('999', 'minute', '24')).toBeNull()
    })

    it('large number "100" for second returns null', () => {
      expect(parseTimeInput('100', 'second', '24')).toBeNull()
    })

    it('special chars "!@#" returns null', () => {
      expect(parseTimeInput('!@#', 'hour', '24')).toBeNull()
    })

    it('"ampm" field always returns null regardless of value', () => {
      expect(parseTimeInput('AM', 'ampm', '12')).toBeNull()
      expect(parseTimeInput('PM', 'ampm', '12')).toBeNull()
      expect(parseTimeInput('0', 'ampm', '24')).toBeNull()
    })
  })

  describe('isValidTime – additional edge cases', () => {
    it('max valid time { hour: 23, minute: 59, second: 59 } is valid', () => {
      expect(isValidTime({ hour: 23, minute: 59, second: 59 })).toBe(true)
    })

    it('min valid time { hour: 0, minute: 0, second: 0 } is valid', () => {
      expect(isValidTime({ hour: 0, minute: 0, second: 0 })).toBe(true)
    })

    it('boundary invalid: hour 24 is invalid', () => {
      expect(isValidTime({ hour: 24, minute: 0 })).toBe(false)
    })

    it('boundary invalid: minute 60 is invalid', () => {
      expect(isValidTime({ hour: 0, minute: 60 })).toBe(false)
    })

    it('boundary invalid: second 60 is invalid', () => {
      expect(isValidTime({ hour: 0, minute: 0, second: 60 })).toBe(false)
    })

    it('large negative hour is invalid', () => {
      expect(isValidTime({ hour: -100, minute: 0 })).toBe(false)
    })

    it('large positive hour is invalid', () => {
      expect(isValidTime({ hour: 100, minute: 0 })).toBe(false)
    })
  })

  describe('values a picker cannot hold', () => {
    it('refuses a fraction or NaN in any field', () => {
      const times = [
        { hour: Number.NaN, minute: 0 },
        { hour: 9.5, minute: 0 },
        { hour: 9, minute: Number.NaN },
        { hour: 9, minute: 0, second: 1.5 },
      ]

      expect(times.map(isValidTime)).toEqual([false, false, false, false])
    })

    it('keeps the seconds of a time with seconds clamped to a bound without them', () => {
      expect(clampTime({ hour: 8, minute: 0, second: 30 }, { hour: 9, minute: 0 })).toEqual({
        hour: 9,
        minute: 0,
        second: 0,
      })
    })

    it('steps an off-step value to the next or previous step, as a time input does', () => {
      const from = { hour: 10, minute: 7, second: 7 }

      expect([
        incrementField(from, 'minute', 1, { minuteStep: 5 }).minute,
        incrementField(from, 'minute', -1, { minuteStep: 5 }).minute,
        incrementField(from, 'second', 1, { secondStep: 15 }).second,
        incrementField(from, 'second', -1, { secondStep: 15 }).second,
      ]).toEqual([10, 5, 15, 0])
    })

    it('steps the seconds of a time that has none from 0', () => {
      expect(incrementField({ hour: 10, minute: 0 }, 'second', 1)).toEqual({ hour: 10, minute: 0, second: 1 })
    })
  })
})
