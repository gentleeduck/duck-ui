import { Project } from 'ts-morph'
import { describe, expect, test } from 'vitest'
import { stripSourceVariables } from '../ts-morph'

const project = new Project({ useInMemoryFileSystem: true })

describe('stripSourceVariables', () => {
  test('removes the listed variables from script files', () => {
    const content = "export const description = 'demo'\nexport const Demo = () => null\n"
    const result = stripSourceVariables({
      content,
      filePath: 'demo/demo.tsx',
      project,
      stripVariables: ['description'],
    })

    expect(result).not.toContain('description')
    expect(result).toContain('Demo')
  })

  test('returns non-script files untouched, leading comment included', () => {
    const content = '/* header */\n.typeset {\n  font-size: 1em;\n}\n'
    const result = stripSourceVariables({
      content,
      filePath: 'typeset/typeset.css',
      project,
      stripVariables: ['description'],
    })

    expect(result).toBe(content)
  })
})
