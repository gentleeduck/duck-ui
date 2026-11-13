import { describe, expect, it } from 'vitest'

import type { IDateAdapter, WeekStartDay } from '../adapter.types'
import { NativeAdapter } from '../native-adapter'

// Try to import optional peer-dep adapters. If a peer dependency is missing
// the adapter is silently excluded from the consistency matrix.
interface IAdapterEntry {
  name: string
  create: () => IDateAdapter<unknown>
  /** Build the adapter's date type from calendar parts (for toDate comparison). */
  toNative: (adapter: IDateAdapter<unknown>, y: number, m: number, d: number) => Date
}

const adapters: IAdapterEntry[] = [
  {
    name: 'NativeAdapter',
    create: () => new NativeAdapter(),
    toNative: (a, y, m, d) => a.toDate(a.create(y, m, d)),
  },
]

try {
  const { DateFnsAdapter } = await import('../date-fns-adapter')
  adapters.push({
    name: 'DateFnsAdapter',
    create: () => new DateFnsAdapter(),
    toNative: (a, y, m, d) => a.toDate(a.create(y, m, d)),
  })
} catch {
  // date-fns not installed - skip
}

try {
  const { DayjsAdapter } = await import('../dayjs-adapter')
  adapters.push({
    name: 'DayjsAdapter',
    create: () => new DayjsAdapter(),
    toNative: (a, y, m, d) => a.toDate(a.create(y, m, d)),
  })
} catch {
  // dayjs not installed - skip
}

try {
  const { LuxonAdapter } = await import('../luxon-adapter')
  adapters.push({
    name: 'LuxonAdapter',
    create: () => new LuxonAdapter(),
    toNative: (a, y, m, d) => a.toDate(a.create(y, m, d)),
  })
} catch {
  // luxon not installed - skip
}

/** Extract y/m/d triple from any adapter date via the adapter itself. */
function triple(adapter: IDateAdapter<unknown>, date: unknown): [number, number, number] {
  return [adapter.getYear(date), adapter.getMonth(date), adapter.getDate(date)]
}

/** Canonical string for easy comparison in assertion messages. */
function label(t: [number, number, number]): string {
  return `${t[0]}-${String(t[1] + 1).padStart(2, '0')}-${String(t[2]).padStart(2, '0')}`
}

const ref = new NativeAdapter()

// Only run cross-adapter tests when at least one non-native adapter is loaded.
const others = adapters.filter((e) => e.name !== 'NativeAdapter')

describe('create()', () => {
  // `new Date(2, 0, 1)` is 1902: a date field passes through these years while one is typed.
  for (const entry of adapters) {
    it(`${entry.name} keeps a year under 100 as given`, () => {
      const adapter = entry.create()

      const dates = [adapter.create(2, 0, 1), adapter.create(99, 11, 31), adapter.create(0, 1, 29)]

      expect(dates.map((date) => triple(adapter, date))).toEqual([
        [2, 0, 1],
        [99, 11, 31],
        [0, 1, 29],
      ])
    })

    it(`${entry.name} makes a date in year 1 and in its last year, the range a date field takes`, () => {
      const adapter = entry.create()
      const last = adapter.maxYear ?? 9999

      const dates = [adapter.create(1, 0, 1), adapter.create(last, 0, 1)]

      expect(dates.map((date) => triple(adapter, date))).toEqual([
        [1, 0, 1],
        [last, 0, 1],
      ])
    })
  }
})

describe('a year under 100 after create()', () => {
  for (const entry of adapters) {
    it(`${entry.name} keeps year 48 through every method that returns a date`, () => {
      const adapter = entry.create()
      const date = adapter.create(48, 1, 10)

      const results = {
        fromDate: adapter.fromDate(adapter.toDate(date)),
        startOfMonth: adapter.startOfMonth(date),
        endOfMonth: adapter.endOfMonth(date),
        startOfWeek: adapter.startOfWeek(date, 0),
        addDays: adapter.addDays(date, 1),
        addMonths: adapter.addMonths(date, 1),
        addYears: adapter.addYears(date, 1),
        setTime: adapter.setTime(date, 9, 5),
      }

      expect(Object.fromEntries(Object.entries(results).map(([name, d]) => [name, label(triple(adapter, d))]))).toEqual(
        {
          fromDate: '48-02-10',
          startOfMonth: '48-02-01',
          endOfMonth: '48-02-29',
          startOfWeek: '48-02-09',
          addDays: '48-02-11',
          addMonths: '48-03-10',
          addYears: '49-02-10',
          setTime: '48-02-10',
        },
      )
      expect([adapter.getHours(results.setTime), adapter.getMinutes(results.setTime)]).toEqual([9, 5])
    })

    // 1900 is a common year and year 0 a leap year, so only February of year 0 tells the two apart.
    it(`${entry.name} gives February of year 0 its leap day`, () => {
      const adapter = entry.create()

      const days = [
        adapter.endOfMonth(adapter.create(0, 1, 1)),
        adapter.addMonths(adapter.create(0, 0, 31), 1),
        adapter.addYears(adapter.create(4, 1, 29), -4),
      ]

      expect(days.map((day) => label(triple(adapter, day)))).toEqual(['0-02-29', '0-02-29', '0-02-29'])
    })
  }
})

describe('Cross-adapter consistency', () => {
  if (others.length === 0) {
    it.skip('no peer-dep adapters available - skipping consistency checks', () => {})
    return
  }

  describe('today()', () => {
    for (const entry of others) {
      it(`${entry.name} matches NativeAdapter`, () => {
        const refDate = triple(ref, ref.today())
        const adapter = entry.create()
        const adapterDate = triple(adapter, adapter.today())
        expect(adapterDate).toEqual(refDate)
      })
    }
  })

  describe('addDays()', () => {
    const cases: Array<{ base: [number, number, number]; days: number; label: string }> = [
      { base: [2026, 2, 17], days: 5, label: '+5 days from Mar 17' },
      { base: [2026, 2, 17], days: -5, label: '-5 days from Mar 17' },
      { base: [2026, 2, 30], days: 2, label: 'cross month boundary Mar 30 + 2' },
      { base: [2026, 11, 31], days: 1, label: 'cross year boundary Dec 31 + 1' },
      { base: [2026, 0, 1], days: -1, label: 'cross year boundary Jan 1 - 1' },
      { base: [2024, 1, 28], days: 1, label: 'leap year Feb 28 + 1 (2024)' },
      { base: [2026, 1, 28], days: 1, label: 'non-leap Feb 28 + 1 (2026)' },
    ]

    for (const c of cases) {
      for (const entry of others) {
        it(`${entry.name}: ${c.label}`, () => {
          const adapter = entry.create()
          const refResult = triple(ref, ref.addDays(ref.create(...c.base), c.days))
          const adapterResult = triple(adapter, adapter.addDays(adapter.create(...c.base), c.days))
          expect(adapterResult, `expected ${label(refResult)}, got ${label(adapterResult)}`).toEqual(refResult)
        })
      }
    }
  })

  describe('addMonths()', () => {
    const cases: Array<{ base: [number, number, number]; months: number; label: string }> = [
      { base: [2026, 0, 15], months: 1, label: 'Jan 15 + 1 month' },
      { base: [2026, 2, 15], months: -1, label: 'Mar 15 - 1 month' },
      { base: [2026, 11, 1], months: 1, label: 'Dec 1 + 1 (cross year)' },
      { base: [2026, 0, 1], months: -1, label: 'Jan 1 - 1 (cross year)' },
      { base: [2026, 0, 31], months: 1, label: 'Jan 31 + 1 (day clamp to Feb 28)' },
      { base: [2024, 0, 31], months: 1, label: 'Jan 31 + 1 leap year (day clamp to Feb 29)' },
      { base: [2026, 0, 15], months: 6, label: 'Jan 15 + 6 months' },
      { base: [2026, 2, 31], months: 1, label: 'Mar 31 + 1 (day clamp to Apr 30)' },
    ]

    for (const c of cases) {
      for (const entry of others) {
        it(`${entry.name}: ${c.label}`, () => {
          const adapter = entry.create()
          const refResult = triple(ref, ref.addMonths(ref.create(...c.base), c.months))
          const adapterResult = triple(adapter, adapter.addMonths(adapter.create(...c.base), c.months))
          expect(adapterResult, `expected ${label(refResult)}, got ${label(adapterResult)}`).toEqual(refResult)
        })
      }
    }
  })

  describe('startOfMonth()', () => {
    const dates: Array<[number, number, number]> = [
      [2026, 2, 17],
      [2026, 0, 1],
      [2026, 11, 31],
      [2024, 1, 15],
    ]

    for (const d of dates) {
      for (const entry of others) {
        it(`${entry.name}: startOfMonth(${label(d)})`, () => {
          const adapter = entry.create()
          const refResult = triple(ref, ref.startOfMonth(ref.create(...d)))
          const adapterResult = triple(adapter, adapter.startOfMonth(adapter.create(...d)))
          expect(adapterResult).toEqual(refResult)
        })
      }
    }
  })

  describe('endOfMonth()', () => {
    const dates: Array<[number, number, number]> = [
      [2026, 2, 17], // March -> 31
      [2026, 3, 10], // April -> 30
      [2026, 1, 10], // Feb non-leap -> 28
      [2024, 1, 10], // Feb leap -> 29
      [2026, 11, 1], // December -> 31
    ]

    for (const d of dates) {
      for (const entry of others) {
        it(`${entry.name}: endOfMonth(${label(d)})`, () => {
          const adapter = entry.create()
          const refDay = ref.getDate(ref.endOfMonth(ref.create(...d)))
          const adapterDay = adapter.getDate(adapter.endOfMonth(adapter.create(...d)))
          expect(adapterDay).toBe(refDay)
        })
      }
    }
  })

  describe('getDaysInMonth (via endOfMonth)', () => {
    // Test every month in 2026 plus Feb in leap year 2024
    const months: Array<[number, number]> = [
      [2026, 0],
      [2026, 1],
      [2026, 2],
      [2026, 3],
      [2026, 4],
      [2026, 5],
      [2026, 6],
      [2026, 7],
      [2026, 8],
      [2026, 9],
      [2026, 10],
      [2026, 11],
      [2024, 1],
    ]

    for (const [year, month] of months) {
      for (const entry of others) {
        it(`${entry.name}: days in ${year}-${String(month + 1).padStart(2, '0')}`, () => {
          const adapter = entry.create()
          const refDays = ref.getDate(ref.endOfMonth(ref.create(year, month, 1)))
          const adapterDays = adapter.getDate(adapter.endOfMonth(adapter.create(year, month, 1)))
          expect(adapterDays).toBe(refDays)
        })
      }
    }
  })

  describe('getYear / getMonth / getDate', () => {
    const dates: Array<[number, number, number]> = [
      [2026, 0, 1],
      [2026, 2, 17],
      [2026, 11, 31],
      [2024, 1, 29],
      [1999, 6, 15],
    ]

    for (const d of dates) {
      for (const entry of others) {
        it(`${entry.name}: parts of ${label(d)}`, () => {
          const adapter = entry.create()
          const created = adapter.create(...d)
          expect(adapter.getYear(created)).toBe(d[0])
          expect(adapter.getMonth(created)).toBe(d[1])
          expect(adapter.getDate(created)).toBe(d[2])
        })
      }
    }
  })

  describe('getDayOfWeek', () => {
    // Known weekdays: 2026-03-17 = Tuesday(2), 2026-03-15 = Sunday(0), 2026-03-14 = Saturday(6)
    const cases: Array<{ date: [number, number, number]; expected: number; day: string }> = [
      { date: [2026, 2, 17], expected: 2, day: 'Tuesday' },
      { date: [2026, 2, 15], expected: 0, day: 'Sunday' },
      { date: [2026, 2, 14], expected: 6, day: 'Saturday' },
      { date: [2026, 2, 16], expected: 1, day: 'Monday' },
      { date: [2026, 2, 18], expected: 3, day: 'Wednesday' },
      { date: [2026, 2, 19], expected: 4, day: 'Thursday' },
      { date: [2026, 2, 20], expected: 5, day: 'Friday' },
    ]

    for (const c of cases) {
      for (const entry of others) {
        it(`${entry.name}: ${label(c.date)} is ${c.day} (${c.expected})`, () => {
          const adapter = entry.create()
          expect(adapter.getDayOfWeek(adapter.create(...c.date))).toBe(c.expected)
        })
      }
    }
  })

  describe('isSameDay', () => {
    const cases: Array<{
      a: [number, number, number]
      b: [number, number, number]
      expected: boolean
      label: string
    }> = [
      { a: [2026, 2, 17], b: [2026, 2, 17], expected: true, label: 'same date' },
      { a: [2026, 2, 17], b: [2026, 2, 18], expected: false, label: 'different day' },
      { a: [2026, 2, 17], b: [2026, 3, 17], expected: false, label: 'different month' },
      { a: [2026, 2, 17], b: [2025, 2, 17], expected: false, label: 'different year' },
    ]

    for (const c of cases) {
      for (const entry of others) {
        it(`${entry.name}: ${c.label}`, () => {
          const adapter = entry.create()
          const result = adapter.isSameDay(adapter.create(...c.a), adapter.create(...c.b))
          expect(result).toBe(c.expected)
          // Also verify it matches the reference adapter
          const refResult = ref.isSameDay(ref.create(...c.a), ref.create(...c.b))
          expect(result).toBe(refResult)
        })
      }
    }
  })

  describe('isBefore / isAfter', () => {
    const pairs: Array<{
      a: [number, number, number]
      b: [number, number, number]
      label: string
    }> = [
      { a: [2026, 0, 1], b: [2026, 0, 2], label: 'consecutive days' },
      { a: [2026, 0, 31], b: [2026, 1, 1], label: 'cross month' },
      { a: [2025, 11, 31], b: [2026, 0, 1], label: 'cross year' },
      { a: [2026, 2, 17], b: [2026, 2, 17], label: 'equal dates' },
    ]

    for (const p of pairs) {
      for (const entry of others) {
        it(`${entry.name}: isBefore(${label(p.a)}, ${label(p.b)}) - ${p.label}`, () => {
          const adapter = entry.create()
          const result = adapter.isBefore(adapter.create(...p.a), adapter.create(...p.b))
          const refResult = ref.isBefore(ref.create(...p.a), ref.create(...p.b))
          expect(result).toBe(refResult)
        })

        it(`${entry.name}: isAfter(${label(p.a)}, ${label(p.b)}) - ${p.label}`, () => {
          const adapter = entry.create()
          const result = adapter.isAfter(adapter.create(...p.a), adapter.create(...p.b))
          const refResult = ref.isAfter(ref.create(...p.a), ref.create(...p.b))
          expect(result).toBe(refResult)
        })
      }
    }
  })

  describe('startOfWeek', () => {
    // 2026-03-17 is Tuesday (day 2)
    const weekStarts: WeekStartDay[] = [0, 1, 2, 3, 4, 5, 6]
    const baseDate: [number, number, number] = [2026, 2, 17]

    for (const ws of weekStarts) {
      for (const entry of others) {
        it(`${entry.name}: startOfWeek(Mar 17, weekStartDay=${ws})`, () => {
          const adapter = entry.create()
          const refResult = triple(ref, ref.startOfWeek(ref.create(...baseDate), ws))
          const adapterResult = triple(adapter, adapter.startOfWeek(adapter.create(...baseDate), ws))
          expect(adapterResult, `expected ${label(refResult)}, got ${label(adapterResult)}`).toEqual(refResult)
        })
      }
    }

    // Additional: startOfWeek crossing month boundary
    // 2026-04-01 is Wednesday (day 3), weekStartDay=0 -> walks back to Mar 29 (Sunday)
    for (const entry of others) {
      it(`${entry.name}: startOfWeek crosses month boundary (Apr 1, weekStartDay=0)`, () => {
        const adapter = entry.create()
        const refResult = triple(ref, ref.startOfWeek(ref.create(2026, 3, 1), 0))
        const adapterResult = triple(adapter, adapter.startOfWeek(adapter.create(2026, 3, 1), 0))
        expect(adapterResult).toEqual(refResult)
      })
    }
  })

  describe('addYears()', () => {
    const cases: Array<{ base: [number, number, number]; years: number; label: string }> = [
      { base: [2026, 2, 17], years: 1, label: 'Mar 17 + 1 year' },
      { base: [2026, 2, 17], years: -1, label: 'Mar 17 - 1 year' },
      { base: [2024, 1, 29], years: 1, label: 'leap Feb 29 + 1 (clamp to 28)' },
      { base: [2024, 1, 29], years: 4, label: 'leap Feb 29 + 4 (stays 29)' },
    ]

    for (const c of cases) {
      for (const entry of others) {
        it(`${entry.name}: ${c.label}`, () => {
          const adapter = entry.create()
          const refResult = triple(ref, ref.addYears(ref.create(...c.base), c.years))
          const adapterResult = triple(adapter, adapter.addYears(adapter.create(...c.base), c.years))
          expect(adapterResult, `expected ${label(refResult)}, got ${label(adapterResult)}`).toEqual(refResult)
        })
      }
    }
  })

  describe('toDate / fromDate roundtrip', () => {
    const dates: Array<[number, number, number]> = [
      [2026, 2, 17],
      [2024, 1, 29],
      [2026, 0, 1],
      [2026, 11, 31],
    ]

    for (const d of dates) {
      for (const entry of others) {
        it(`${entry.name}: roundtrip preserves ${label(d)}`, () => {
          const adapter = entry.create()
          const created = adapter.create(...d)
          const native = adapter.toDate(created)
          const roundtripped = adapter.fromDate(native)
          expect(triple(adapter, roundtripped)).toEqual(d)
        })
      }
    }
  })

  describe('format()', () => {
    const cases: Array<{
      date: [number, number, number]
      options: Intl.DateTimeFormatOptions
      locale: string
      label: string
    }> = [
      { date: [2026, 2, 17], options: { month: 'long' }, locale: 'en-US', label: 'month long en-US' },
      { date: [2026, 2, 17], options: { day: 'numeric' }, locale: 'en-US', label: 'day numeric en-US' },
      {
        date: [2026, 2, 17],
        options: { year: 'numeric', month: 'long' },
        locale: 'en-US',
        label: 'year+month en-US',
      },
    ]

    for (const c of cases) {
      for (const entry of others) {
        it(`${entry.name}: ${c.label}`, () => {
          const adapter = entry.create()
          const refResult = ref.format(ref.create(...c.date), c.options, c.locale)
          const adapterResult = adapter.format(adapter.create(...c.date), c.options, c.locale)
          expect(adapterResult).toBe(refResult)
        })
      }
    }
  })
})
