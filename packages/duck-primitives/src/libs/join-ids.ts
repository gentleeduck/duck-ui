/** Joins id lists, dropping blanks, repeats and anything not a string, and keeping the first order seen. */
export function joinIds(...lists: unknown[]) {
  const ids = new Set(
    lists
      .filter((list) => typeof list === 'string')
      .join(' ')
      .split(/\s+/)
      .filter(Boolean),
  )
  return ids.size ? [...ids].join(' ') : undefined
}
