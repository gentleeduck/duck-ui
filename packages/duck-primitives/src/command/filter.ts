const ACCENTS = /[̀-ͯ]/g
const SEPARATOR = /[\s\-_/.:]/

/** Lower case with the accents taken off Latin, Greek and Cyrillic letters, so "cafe" finds "Café". */
export function fold(text: string) {
  return text.toLowerCase().normalize('NFD').replace(ACCENTS, '')
}

const startsWord = (text: string, at: number) => at === 0 || SEPARATOR.test(text.charAt(at - 1))

// Each letter of the search earns 3 beside the one before it or at the start, 2 at the start of a word and 1
// elsewhere, taken at the first place it follows the letter before. Every place the first letter appears is tried.
function score(text: string, query: string) {
  let best = 0
  for (let start = text.indexOf(query[0]); start !== -1; start = text.indexOf(query[0], start + 1)) {
    let points = start === 0 ? 3 : startsWord(text, start) ? 2 : 1
    let at = start
    for (let index = 1; index < query.length && at !== -1; index++) {
      const found = text.indexOf(query[index], at + 1)
      if (found !== -1) points += found === at + 1 ? 3 : startsWord(text, found) ? 2 : 1
      at = found
    }
    // A start that leaves a letter unmatched leaves it unmatched from every later start too.
    if (at === -1) break
    best = Math.max(best, points)
  }
  // A shorter text scores a little higher, so the whole of "Apple" ranks over the start of "Applesauce".
  return (best / (3 * query.length)) * (0.9 + (0.1 * query.length) / text.length)
}

/**
 * A `filter` for `Command` that finds an item by the letters of the search in order, so "apl" finds "Apple", and ranks
 * the match at the start of the text, then at the start of a word, then letters side by side, first. Case and accents
 * are ignored.
 */
export function fuzzyFilter(text: string, search: string, keywords: string[]) {
  const query = fold(search)
  if (query === '') return 1
  return Math.max(score(fold(text), query), ...keywords.map((keyword) => score(fold(keyword), query)))
}
