import { transformSync } from '@babel/core'
import transformTypescript from '@babel/plugin-transform-typescript'
import istanbul from 'babel-plugin-istanbul'

interface ILocation {
  start: { line: number }
}

export interface IFileCoverage {
  statementMap: Record<string, ILocation>
  fnMap: Record<string, { loc: ILocation }>
  branchMap: Record<string, { loc: ILocation; locations: Array<Partial<ILocation>> }>
  s: Record<string, number>
  f: Record<string, number>
  b: Record<string, Array<number>>
}

export function instrument(path: string, code: string, onCover?: (path: string, coverage: IFileCoverage) => void) {
  const isTSX = path.endsWith('.tsx')
  const out = transformSync(code, {
    filename: path,
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    parserOpts: { plugins: isTSX ? ['typescript', 'jsx'] : ['typescript'] },
    plugins: [
      [transformTypescript, { isTSX, onlyRemoveTypeImports: false }],
      [istanbul, { cwd: '/', exclude: [], onCover, useInlineSourceMaps: false }],
    ],
  })
  return out?.code ?? ''
}
