import { afterAll } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { transformSync } from '@babel/core'
import transformTypescript from '@babel/plugin-transform-typescript'
import istanbul from 'babel-plugin-istanbul'
import { plugin } from 'bun'

const SRC = join(import.meta.dir, '../..')
const OUT = process.env.DUCK_COVERAGE_OUT ?? join(SRC, '../coverage/coverage-final.json')
const escaped = SRC.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// bun reports no branches, so istanbul instruments each source file as bun loads it.
plugin({
  name: 'istanbul',
  setup(build) {
    // A `?query` import is a second copy of a module, such as one evaluated with no window; it counts as the same file.
    build.onLoad(
      { filter: new RegExp(`^${escaped}/(?!.*__(tests|benches|stories)__/).*\\.tsx?(\\?.*)?$`) },
      async (args) => {
        const path = args.path.replace(/\?.*$/, '')
        const isTSX = path.endsWith('.tsx')
        const out = transformSync(await Bun.file(path).text(), {
          filename: path,
          babelrc: false,
          configFile: false,
          sourceType: 'module',
          parserOpts: { plugins: isTSX ? ['typescript', 'jsx'] : ['typescript'] },
          plugins: [
            [transformTypescript, { isTSX, onlyRemoveTypeImports: false }],
            [istanbul, { cwd: '/', exclude: [], useInlineSourceMaps: false }],
          ],
        })
        return { contents: out?.code ?? '', loader: isTSX ? 'jsx' : 'js' }
      },
    )
  },
})

afterAll(() => {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify((globalThis as { __coverage__?: object }).__coverage__ ?? {}))
})
