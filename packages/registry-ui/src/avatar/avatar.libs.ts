const letters = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

// By grapheme, since a UTF-16 slice cuts a flag, an emoji sequence or a letter with a combining mark in half.
export function overflowLabel(count: number) {
  return `${count} more`
}

export function firstTwoLetters(text: string) {
  return Array.from(letters.segment(text), ({ segment }) => segment)
    .slice(0, 2)
    .join('')
}
