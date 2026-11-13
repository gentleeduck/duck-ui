/**
 * Shared Intl.DateTimeFormat cache to avoid re-instantiation on every format() call.
 * Bounded to MAX_SIZE entries with LRU eviction to prevent unbounded growth in long-lived SPAs.
 */
const MAX_SIZE = 50
const FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>()

/**
 * Fixed-order template of every `Intl.DateTimeFormatOptions` field we look up.
 * Reading by fixed index drops the `Object.keys().sort()` + `JSON.stringify` cost
 * the audit flagged on hot `format()` paths.
 *
 * Order is stable so two calls with the same options always produce the same key.
 */
const OPTION_FIELDS = [
  'weekday',
  'era',
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'timeZoneName',
  'timeZone',
  'hour12',
  'hourCycle',
  'dateStyle',
  'timeStyle',
  'fractionalSecondDigits',
  'dayPeriod',
  'calendar',
  'numberingSystem',
  'formatMatcher',
  'localeMatcher',
] as const

/** Build a deterministic cache key by reading a fixed template of option fields. */
function buildKey(locale: string | undefined, options: Intl.DateTimeFormatOptions): string {
  let key = locale ?? ''
  const opts = options as Record<string, unknown>
  for (const field of OPTION_FIELDS) {
    const v = opts[field]
    // `|` + value (or empty) keeps slots positional so `{year:'2-digit'}` and
    // `{month:'2-digit'}` can never collide.
    key += `|${v === undefined ? '' : String(v)}`
  }
  return key
}

export function getCachedFormatter(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = buildKey(locale, options)
  let f = FORMATTER_CACHE.get(key)
  if (f) {
    // LRU: move to end so recently-used entries are evicted last
    FORMATTER_CACHE.delete(key)
    FORMATTER_CACHE.set(key, f)
    return f
  }
  f = new Intl.DateTimeFormat(locale, options)
  if (FORMATTER_CACHE.size >= MAX_SIZE) {
    // Evict the least-recently-used entry (first key in insertion order)
    const [oldest] = FORMATTER_CACHE.keys()
    FORMATTER_CACHE.delete(oldest)
  }
  FORMATTER_CACHE.set(key, f)
  return f
}

/** Clears the formatter cache. Useful when switching locales in long-lived SPAs. */
export function clearFormatterCache(): void {
  FORMATTER_CACHE.clear()
}
