import { describe, expect, it } from 'vitest'
import { joinIds } from '../join-ids'

describe('joinIds', () => {
  it('joins id lists in the order first seen, dropping blanks and repeats', () => {
    expect(joinIds('a  b', undefined, ' b c ', '', null, 'a')).toBe('a b c')
  })

  it('skips a value that is not a string, such as the false a condition leaves', () => {
    expect(joinIds(false, 'tip', 0, true)).toBe('tip')
  })

  it('hands back nothing when there is no id', () => {
    expect(joinIds(undefined, '', '  ')).toBeUndefined()
  })
})
