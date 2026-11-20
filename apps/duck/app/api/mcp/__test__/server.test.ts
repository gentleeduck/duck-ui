import { describe, expect, test } from 'vitest'
import {
  computeIdf,
  computeTf,
  computeTfidfVector,
  cosineSimilarity,
  editDistance,
  expandSearchTerms,
  extractSection,
  extractSummary,
  fuzzyMatch,
  fuzzyScore,
  isContainedPath,
  parseFrontmatter,
  scoreKeywordQuery,
  stem,
  stripMdxSyntax,
  tokenize,
  validateSlug,
} from '../server'

describe('stem', () => {
  test('strips -ing suffix', () => {
    expect(stem('running')).toBe('run')
    expect(stem('testing')).toBe('test')
  })

  test('strips -s suffix', () => {
    expect(stem('buttons')).toBe('button')
    expect(stem('components')).toBe('component')
  })

  test('strips -ed suffix', () => {
    expect(stem('updated')).toBe('updat')
    expect(stem('changed')).toBe('chang')
  })

  test('strips -ies to -y', () => {
    expect(stem('queries')).toBe('query')
    expect(stem('entries')).toBe('entry')
  })

  test('preserves short words', () => {
    expect(stem('run')).toBe('run')
    expect(stem('use')).toBe('use')
    expect(stem('add')).toBe('add')
  })

  test('strips -ly suffix', () => {
    expect(stem('quickly')).toBe('quick')
  })

  test('strips -ness suffix', () => {
    expect(stem('darkness')).toBe('dark')
  })

  test('collapses doubled consonants after suffix stripping', () => {
    expect(stem('stopped')).toBe('stop')
    expect(stem('runner')).toBe('run')
  })
})

describe('tokenize', () => {
  test('lowercases and splits on whitespace', () => {
    const tokens = tokenize('Hello World')
    expect(tokens).toContain('hello')
    expect(tokens).toContain('world')
  })

  test('removes stop words', () => {
    const tokens = tokenize('the quick brown fox and the lazy dog')
    expect(tokens).not.toContain('the')
    expect(tokens).not.toContain('and')
  })

  test('filters short tokens', () => {
    const tokens = tokenize('I am a test')
    expect(tokens).not.toContain('i')
    expect(tokens).not.toContain('a')
  })

  test('generates bigrams', () => {
    const tokens = tokenize('button component dialog')
    expect(tokens).toContain('button_component')
    expect(tokens).toContain('component_dialog')
  })

  test('applies stemming', () => {
    const tokens = tokenize('running buttons testing')
    expect(tokens.some((t) => t === 'runn' || t === 'run')).toBe(true)
    expect(tokens.some((t) => t === 'button')).toBe(true)
    expect(tokens.some((t) => t === 'test')).toBe(true)
  })
})

describe('expandSearchTerms', () => {
  test('adds term synonyms for common UI language', () => {
    const terms = expandSearchTerms('popup dropdown')
    expect(terms).toContain('dialog')
    expect(terms).toContain('modal')
    expect(terms).toContain('select')
  })

  test('adds phrase synonyms for compound queries', () => {
    const terms = expandSearchTerms('date picker')
    expect(terms).toContain('calendar')
    expect(terms).toContain('datepicker')
  })
})

describe('stripMdxSyntax', () => {
  test('removes import statements', () => {
    const input = `import { Button } from '@/components'\nimport React from 'react'\n\n# Hello`
    expect(stripMdxSyntax(input)).toBe('# Hello')
  })

  test('removes self-closing JSX tags', () => {
    const input = '# Title\n\n<ComponentPreview name="button-demo" />\n\nSome text'
    const result = stripMdxSyntax(input)
    expect(result).not.toContain('ComponentPreview')
    expect(result).toContain('Some text')
  })

  test('collapses excessive blank lines', () => {
    const input = 'Line 1\n\n\n\n\nLine 2'
    expect(stripMdxSyntax(input)).toBe('Line 1\n\nLine 2')
  })

  test('preserves regular markdown', () => {
    const input = '# Heading\n\nParagraph with **bold** and `code`.'
    expect(stripMdxSyntax(input)).toBe(input)
  })

  test('unwraps step and tab containers while preserving their markdown content', () => {
    const input = `<Steps>\n<Step>Create project</Step>\n<TabsContent value="cli">\n\`\`\`bash\nnpx @gentleduck/cli init\n\`\`\`\n</TabsContent>\n</Steps>`
    const result = stripMdxSyntax(input)

    expect(result).toContain('Create project')
    expect(result).toContain('```bash')
    expect(result).toContain('npx @gentleduck/cli init')
    expect(result).not.toContain('<Steps>')
    expect(result).not.toContain('<TabsContent')
  })
})

describe('parseFrontmatter', () => {
  test('extracts title, description, and body', () => {
    const input = `---\ntitle: Button\ndescription: Click things\n---\n\n# Heading`
    expect(parseFrontmatter(input)).toEqual({
      title: 'Button',
      description: 'Click things',
      body: '\n# Heading',
    })
  })

  test('falls back when frontmatter is missing', () => {
    expect(parseFrontmatter('# Heading')).toEqual({
      title: '',
      description: '',
      body: '# Heading',
    })
  })
})

describe('extractSummary', () => {
  test('returns headings and first paragraph for each section', () => {
    const input = '# Intro\n\nFirst paragraph.\n\nSecond paragraph.\n\n## Usage\n\nUse it here.\n\nMore details.'
    expect(extractSummary(input)).toBe('# Intro\nFirst paragraph.\n## Usage\nUse it here.')
  })
})

describe('extractSection', () => {
  test('extracts a section until the next heading of same or higher level', () => {
    const input = '# Intro\n\nHello\n\n## Usage\n\nUse it.\n\n### Deep Dive\n\nDetails.\n\n## API\n\nProps.'
    expect(extractSection(input, 'Usage')).toEqual({
      found: true,
      content: '## Usage\n\nUse it.\n\n### Deep Dive\n\nDetails.',
      headings: ['# Intro', '## Usage', '### Deep Dive', '## API'],
    })
  })

  test('returns headings even when section is missing', () => {
    const input = '# Intro\n\nHello\n\n## API\n\nProps.'
    expect(extractSection(input, 'Missing')).toEqual({
      found: false,
      content: '',
      headings: ['# Intro', '## API'],
    })
  })
})

describe('editDistance', () => {
  test('identical strings = 0', () => {
    expect(editDistance('button', 'button')).toBe(0)
  })

  test('single substitution = 1', () => {
    expect(editDistance('button', 'buttan')).toBe(1)
  })

  test('single insertion = 1', () => {
    expect(editDistance('buton', 'button')).toBe(1)
  })

  test('single deletion = 1', () => {
    expect(editDistance('button', 'buton')).toBe(1)
  })

  test('empty strings', () => {
    expect(editDistance('', '')).toBe(0)
    expect(editDistance('abc', '')).toBe(3)
    expect(editDistance('', 'abc')).toBe(3)
  })

  test('completely different strings', () => {
    expect(editDistance('abc', 'xyz')).toBe(3)
  })
})

describe('fuzzyMatch', () => {
  test('exact substring match', () => {
    expect(fuzzyMatch('button', 'my button component')).toBe(true)
  })

  test('single typo match', () => {
    expect(fuzzyMatch('buton', 'button')).toBe(true)
  })

  test('no match for very different strings', () => {
    expect(fuzzyMatch('zzzzz', 'button')).toBe(false)
  })

  test('short terms skip fuzzy (< 3 chars)', () => {
    expect(fuzzyMatch('zz', 'button')).toBe(false)
  })
})

describe('fuzzyScore', () => {
  test('exact substring scores highest', () => {
    expect(fuzzyScore('button', 'button component')).toBe(3)
  })

  test('close edit distance scores > 0', () => {
    expect(fuzzyScore('buton', 'button')).toBeGreaterThan(0)
  })

  test('no match scores 0', () => {
    expect(fuzzyScore('zzzzz', 'button')).toBe(0)
  })

  test('short terms score 0 on non-substring', () => {
    expect(fuzzyScore('zz', 'button')).toBe(0)
  })
})

describe('computeTf', () => {
  test('computes sublinear TF', () => {
    const tf = computeTf(['hello', 'world', 'hello'])
    expect(tf.get('hello')).toBeGreaterThan(tf.get('world')!)
    // sublinear: 1 + log(2) > 1 + log(1)
    expect(tf.get('hello')).toBeCloseTo(1 + Math.log(2))
    expect(tf.get('world')).toBeCloseTo(1 + Math.log(1))
  })

  test('empty input returns empty map', () => {
    const tf = computeTf([])
    expect(tf.size).toBe(0)
  })
})

describe('computeIdf', () => {
  test('computes IDF correctly', () => {
    const tfMaps = [
      new Map([
        ['hello', 1],
        ['world', 1],
      ]),
      new Map([
        ['hello', 1],
        ['foo', 1],
      ]),
    ]
    const idf = computeIdf(tfMaps, 2)
    // 'hello' appears in both docs: log(2/2) = 0
    expect(idf.get('hello')).toBeCloseTo(0)
    // 'world' appears in 1 doc: log(2/1)
    expect(idf.get('world')).toBeCloseTo(Math.log(2))
  })

  test('handles empty corpus', () => {
    const idf = computeIdf([], 0)
    expect(idf.size).toBe(0)
  })
})

describe('computeTfidfVector', () => {
  test('produces normalized unit vector', () => {
    const tf = new Map([
      ['hello', 1.5],
      ['world', 1.0],
    ])
    const idf = new Map([
      ['hello', 0.5],
      ['world', 1.0],
    ])
    const vector = computeTfidfVector(tf, idf)

    let mag = 0
    for (const val of vector.values()) mag += val * val
    expect(Math.sqrt(mag)).toBeCloseTo(1.0)
  })

  test('zero IDF terms are excluded', () => {
    const tf = new Map([['common', 1.0]])
    const idf = new Map([['common', 0]]) // appears in every doc
    const vector = computeTfidfVector(tf, idf)
    expect(vector.size).toBe(0)
  })
})

describe('cosineSimilarity', () => {
  test('identical vectors = 1', () => {
    const v = new Map([
      ['a', 0.5],
      ['b', 0.5],
    ])
    expect(cosineSimilarity(v, v)).toBeCloseTo(0.5) // dot product of normalized vectors
  })

  test('orthogonal vectors = 0', () => {
    const a = new Map([['x', 1.0]])
    const b = new Map([['y', 1.0]])
    expect(cosineSimilarity(a, b)).toBe(0)
  })

  test('empty vector = 0', () => {
    const a = new Map([['x', 1.0]])
    const b = new Map<string, number>()
    expect(cosineSimilarity(a, b)).toBe(0)
  })
})

describe('validateSlug', () => {
  test('accepts valid slugs', () => {
    expect(validateSlug('components/button')).toEqual({ valid: true, sanitized: 'components/button' })
    expect(validateSlug('installation/next')).toEqual({ valid: true, sanitized: 'installation/next' })
  })

  test('rejects path traversal', () => {
    const result = validateSlug('../../etc/passwd')
    expect(result.valid).toBe(false)
    expect(result.error).toContain('..')
  })

  test('rejects absolute paths', () => {
    expect(validateSlug('/etc/passwd').valid).toBe(false)
    expect(validateSlug('\\windows\\system32').valid).toBe(false)
  })

  test('rejects invalid characters', () => {
    expect(validateSlug('foo<bar>').valid).toBe(false)
    expect(validateSlug('foo|bar').valid).toBe(false)
  })

  test('trims and normalizes slashes', () => {
    expect(validateSlug('  components/button  ')).toEqual({ valid: true, sanitized: 'components/button' })
    expect(validateSlug('components//button')).toEqual({ valid: true, sanitized: 'components/button' })
  })

  test('rejects empty slug', () => {
    expect(validateSlug('').valid).toBe(false)
    expect(validateSlug('   ').valid).toBe(false)
  })
})

describe('isContainedPath', () => {
  test('accepts files inside the content directory', () => {
    expect(isContainedPath('/repo/content/docs', '/repo/content/docs/components/button.mdx')).toBe(true)
  })

  test('rejects sibling-prefix paths outside the content directory', () => {
    expect(isContainedPath('/repo/content/docs', '/repo/content/docs-evil/components/button.mdx')).toBe(false)
  })
})

describe('scoreKeywordQuery', () => {
  test('scores exact matches higher than fuzzy matches', () => {
    const exact = scoreKeywordQuery({
      terms: ['button'],
      fields: [{ text: 'button component', exactWeight: 10, fuzzyWeight: 2 }],
    })
    const fuzzy = scoreKeywordQuery({
      terms: ['buton'],
      fields: [{ text: 'button component', exactWeight: 10, fuzzyWeight: 2 }],
    })

    expect(exact).toBeGreaterThan(fuzzy)
    expect(fuzzy).toBeGreaterThan(0)
  })

  test('applies stemmed exact weights when provided', () => {
    const score = scoreKeywordQuery({
      terms: ['running'],
      stemmedTerms: ['run'],
      fields: [{ text: 'run command', exactWeight: 10, fuzzyWeight: 1, stemmedExactWeight: 8 }],
    })

    expect(score).toBeGreaterThan(0)
  })
})
