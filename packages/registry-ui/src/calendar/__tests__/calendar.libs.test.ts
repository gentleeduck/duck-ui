import { describe, expect, test } from 'bun:test'
import { getCachedNumberFormat } from '../calendar.libs'

const LOCALES = ['de', 'fr', 'es', 'it', 'pt', 'nl', 'sv', 'da', 'fi', 'pl', 'cs', 'hu', 'ro', 'tr', 'el', 'ru', 'uk']

describe('getCachedNumberFormat', () => {
  test('hands back the formatter it made for a locale and options', () => {
    const grouped = getCachedNumberFormat('en-GB')

    expect(getCachedNumberFormat('en-GB')).toBe(grouped)
    expect(getCachedNumberFormat('en-GB', { useGrouping: false })).not.toBe(grouped)
    expect(getCachedNumberFormat('en-GB', { useGrouping: false }).format(2026)).toBe('2026')
  })

  test('keeps the twenty used last, dropping the one used longest ago', () => {
    const kept = getCachedNumberFormat('ja')
    const dropped = getCachedNumberFormat('ko')
    for (const locale of LOCALES) getCachedNumberFormat(locale)
    getCachedNumberFormat('ja')

    getCachedNumberFormat('zh')
    getCachedNumberFormat('he')

    expect(getCachedNumberFormat('ja')).toBe(kept)
    expect(getCachedNumberFormat('ko')).not.toBe(dropped)
  })
})
