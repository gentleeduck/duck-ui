import fs from 'node:fs'
import path from 'node:path'
import { u } from 'unist-builder'
import { visit } from 'unist-util-visit'
import type { IUnistNode, IUnistTree } from '../types'

const EXT_TO_LANG: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.css': 'css',
  '.json': 'json',
  '.md': 'markdown',
  '.mdx': 'mdx',
  '.html': 'html',
  '.sh': 'bash',
}

type RegistryEntry = {
  source?: string
  root_folder?: string
  files?: { path?: string } | Array<{ path?: string }>
}

function loadRegistryIndex(): Record<string, RegistryEntry> {
  const indexPath = path.join(process.cwd(), 'public/r/index.json')
  const raw = fs.readFileSync(indexPath, 'utf8')
  const entries = JSON.parse(raw) as Array<{ name: string } & RegistryEntry>

  return Object.fromEntries(entries.map((entry) => [entry.name, entry]))
}

const registryIndex = loadRegistryIndex()

/**
 * Resolves `<ComponentSource path="…">` and `<ComponentPreview name="…">`
 * by reading referenced source files and replacing children with hast
 * `<pre><code>` blocks.
 */
export function rehypeComponent() {
  return async (tree: IUnistTree) => {
    visit(tree, (node: IUnistNode) => {
      if (node.name === 'ComponentSource') {
        componentSource({ node })
      }
      if (node.name === 'ComponentPreview') {
        componentPreview({ node })
      }
    })
  }
}

function getNodeAttributeByName(node: IUnistNode, name: string) {
  return node.attributes?.find((attribute) => attribute.name === name)
}

function getLangFromExt(filePath: string): string {
  const ext = path.extname(filePath)
  return EXT_TO_LANG[ext] ?? 'plaintext'
}

function resolveFilePath(baseDir: string, filePath: string) {
  const absolute = path.join(baseDir, filePath)
  if (fs.existsSync(absolute)) return absolute

  const ext = path.extname(absolute)
  if (ext === '.ts') {
    const tsxPath = `${absolute.slice(0, -3)}.tsx`
    if (fs.existsSync(tsxPath)) return tsxPath
  }
  if (ext === '.tsx') {
    const tsPath = `${absolute.slice(0, -4)}.ts`
    if (fs.existsSync(tsPath)) return tsPath
  }

  return absolute
}

function resolvePreviewSourcePath(component: RegistryEntry | undefined, src: string) {
  const packagesRoot = path.resolve(process.cwd(), '../../packages')
  const candidates: string[] = []

  if (component?.source) {
    const normalizedSource = component.source.replace(/^\/+/, '')
    const sourceDir = path.resolve(packagesRoot, normalizedSource)
    const fileName = path.basename(src)
    const withoutRootPrefix = component.root_folder ? src.replace(new RegExp(`^${component.root_folder}/`), '') : src
    candidates.push(path.join(sourceDir, fileName))
    candidates.push(path.join(sourceDir, withoutRootPrefix))
    candidates.push(path.join(sourceDir, src))
  }

  candidates.push(path.resolve(packagesRoot, 'registry-examples/src', src))
  candidates.push(path.resolve(packagesRoot, 'registry-internals/src', src))

  for (const candidate of candidates) {
    const resolved = resolveFilePath('', candidate)
    if (fs.existsSync(resolved)) return resolved
  }

  return resolveFilePath(path.resolve(packagesRoot, 'registry-examples/src'), src)
}

// dmc's preprocessor dedents JSX-flow children and re-anchors fence markers
// at column 0, so PrettyCode tokenises every line into `<span class="line">`.
function createCodeNode(source: string, lang: string) {
  return u('code', { lang, value: source })
}

export function componentSource({ node }: { node: IUnistNode }) {
  const sourcePath = getNodeAttributeByName(node, 'path')?.value as string | undefined

  if (!sourcePath) {
    console.warn('[ComponentSource] no path attribute found')
    return null
  }

  try {
    // process.cwd() is apps/duck-ui-docs/, resolve to monorepo root
    const resolved = path.resolve(process.cwd(), '../../', sourcePath)

    if (!fs.existsSync(resolved)) {
      console.warn(`[ComponentSource] path not found: ${resolved}`)
      return null
    }

    const stat = fs.statSync(resolved)

    if (stat.isDirectory()) {
      const entries = fs.readdirSync(resolved).filter((entry) => {
        const entryPath = path.join(resolved, entry)
        return fs.statSync(entryPath).isFile()
      })

      node.children = entries.map((entry) => {
        const filePath = path.join(resolved, entry)
        const lang = getLangFromExt(entry)
        const content = fs.readFileSync(filePath, 'utf8')
        const source = `// ${entry}\n${content}`
        return createCodeNode(source, lang)
      })
    } else {
      const lang = getLangFromExt(resolved)
      const fileName = path.basename(resolved)
      const content = fs.readFileSync(resolved, 'utf8')
      const source = `// ${fileName}\n${content}`
      node.children = [createCodeNode(source, lang)]
    }
  } catch (error) {
    console.error('[ComponentSource]', error)
  }
}

export function componentPreview({ node }: { node: IUnistNode }) {
  const name = getNodeAttributeByName(node, 'name')?.value as string

  if (!name) {
    return null
  }

  try {
    const component = registryIndex[name]
    const files = Array.isArray(component?.files) ? component.files : component?.files ? [component.files] : []
    const src = files[0]?.path
    const docsOnly = path.join(process.cwd(), 'components/benchmarks', `${name}.tsx`)

    if (!src && !fs.existsSync(docsOnly)) {
      console.warn('no src found for', name)
      return null
    }

    const filePath = src ? resolvePreviewSourcePath(component, src) : docsOnly
    let source = fs.readFileSync(filePath, 'utf8')

    source = source.replaceAll(`@gentleduck/registry-ui`, `~/components`)
    source = source.replaceAll('export default', 'export')

    node.children = [createCodeNode(source, 'tsx')]
  } catch (error) {
    console.error(error)
  }
}
