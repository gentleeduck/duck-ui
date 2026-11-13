import { describe, expect, it } from 'vitest'
import { hebrewMonthsInYear, hebrewToGregorian, isLeapHebrewYear, toHebrew } from '../hebrew'
import { toGregorian as hijriToGregorian, toHijri } from '../hijri'
import { toGregorian as jalaaliToGregorian, toJalaali } from '../jalaali'

type Ymd = [number, number, number]

const DAY = 86_400_000

function utc([gy, gm, gd]: Ymd): Date {
  const date = new Date(0)
  date.setUTCFullYear(gy, gm - 1, gd)
  return date
}

function ymd(date: Date): Ymd {
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]
}

function intl(calendar: string, month: 'long' | 'numeric', toMonth: (year: number, month: string) => number) {
  const format = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, {
    timeZone: 'UTC',
    year: 'numeric',
    month,
    day: 'numeric',
  })
  return (date: Date): Ymd => {
    const parts = Object.fromEntries(format.formatToParts(date).map((part) => [part.type, part.value]))
    const year = Number(parts.year)
    return [year, toMonth(year, String(parts.month)), Number(parts.day)]
  }
}

const COMMON = [
  'Tishri',
  'Heshvan',
  'Kislev',
  'Tevet',
  'Shevat',
  'Adar',
  'Nisan',
  'Iyar',
  'Sivan',
  'Tamuz',
  'Av',
  'Elul',
]
const LEAP = [...COMMON.slice(0, 5), 'Adar I', 'Adar II', ...COMMON.slice(6)]

const hebrew = intl('hebrew', 'long', (year, name) => (isLeapHebrewYear(year) ? LEAP : COMMON).indexOf(name) + 1)
const hijri = intl('islamic-civil', 'numeric', (_, month) => Number(month))
const persian = intl('persian', 'numeric', (_, month) => Number(month))

// Each month's first day both ways, and the day before it, which is the last day of the month before.
function disagreements(
  years: [number, number],
  monthsInYear: (year: number) => number,
  toGregorian: (year: number, month: number, day: number) => { gy: number; gm: number; gd: number },
  fromGregorian: (gy: number, gm: number, gd: number) => Ymd,
  read: (date: Date) => Ymd,
): string[] {
  const wrong: string[] = []
  for (let year = years[0]; year <= years[1]; year++) {
    for (let month = 1; month <= monthsInYear(year); month++) {
      const { gy, gm, gd } = toGregorian(year, month, 1)
      const first = utc([gy, gm, gd])
      const before = new Date(first.getTime() - DAY)
      const checks: [string, Ymd, Ymd][] = [
        ['written', [year, month, 1], read(first)],
        ['read', fromGregorian(gy, gm, gd), [year, month, 1]],
        ['read the day before', fromGregorian(...ymd(before)), read(before)],
      ]
      for (const [what, ours, theirs] of checks) {
        if (ours.join('-') !== theirs.join('-'))
          wrong.push(`${year}-${month} ${what}: ${ours.join('-')}, Intl ${theirs.join('-')}`)
      }
    }
  }
  return wrong
}

function verdict(wrong: string[]) {
  return { count: wrong.length, first: wrong.slice(0, 3) }
}

// About 1.2s alone for the Hebrew years, and past 5s beside the rest of the suite under coverage
describe('calendar systems against Intl', { timeout: 30_000 }, () => {
  it('starts and ends every Hebrew month from 1 CE to 6239 CE where Intl does', () => {
    const wrong = disagreements(
      [3762, 9999],
      hebrewMonthsInYear,
      hebrewToGregorian,
      (gy, gm, gd) => {
        const { hy, hm, hd } = toHebrew(gy, gm, gd)
        return [hy, hm, hd]
      },
      hebrew,
    )

    expect(verdict(wrong)).toEqual({ count: 0, first: [] })
  })

  it('starts and ends every tabular Hijri month from 622 CE to 3532 CE where Intl islamic-civil does', () => {
    const wrong = disagreements(
      [1, 3000],
      () => 12,
      hijriToGregorian,
      (gy, gm, gd) => {
        const { hy, hm, hd } = toHijri(gy, gm, gd)
        return [hy, hm, hd]
      },
      hijri,
    )

    expect(verdict(wrong)).toEqual({ count: 0, first: [] })
  })

  // Outside these years ICU's 33-year leap rule and the Borkowski rule this module follows part on some years.
  it('starts and ends every Persian month from 1800 CE to 2124 CE where Intl does', () => {
    const wrong = disagreements(
      [1179, 1502],
      () => 12,
      jalaaliToGregorian,
      (gy, gm, gd) => {
        const { jy, jm, jd } = toJalaali(gy, gm, gd)
        return [jy, jm, jd]
      },
      persian,
    )

    expect(verdict(wrong)).toEqual({ count: 0, first: [] })
  })
})
