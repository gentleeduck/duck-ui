import { PRIMARY_FILE_EXTENSIONS } from '../../../config/defaults'
import type { IIndexedRegistryEntry, RegistryItemTypeMap } from '../../../extensions/ui/ui.registry.types'
import { hashValue } from '../../../lib/hash'
import { normalizeSlashes } from '../../../lib/path'
import type { IRegistryBuildContext } from '../../types'

export function toComponentIdentifier(name: string) {
  return `_${name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}`
}

// Prefers `<name>.{ts,tsx}` or `<rootBasename>.{ts,tsx}` over the first listed
// file, so adapters dynamic-import the conventional entry rather than a sibling.
export function getPrimaryFilePath(item: IIndexedRegistryEntry) {
  const files = item.files ?? []
  if (files.length === 0) {
    return undefined
  }

  const normalizedRootFolder = normalizeSlashes(item.root_folder)
  const rootFolderBaseName = normalizedRootFolder.split('/').pop() ?? item.name
  const preferredRelativeNames = new Set(
    [item.name, rootFolderBaseName].flatMap((base) =>
      PRIMARY_FILE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ),
  )

  const preferredFile = files.find((file) => {
    const normalizedPath = normalizeSlashes(file.path)
    const relativePath = normalizedPath.startsWith(`${normalizedRootFolder}/`)
      ? normalizedPath.slice(normalizedRootFolder.length + 1)
      : normalizedPath

    return preferredRelativeNames.has(relativePath)
  })

  return preferredFile?.path ?? files[0]?.path
}

export function createComponentPath(
  context: IRegistryBuildContext,
  item: IIndexedRegistryEntry,
  packageMappings: RegistryItemTypeMap<string>,
) {
  const source = context.config.sources[item.type]
  const packageBase = packageMappings[item.type] ?? source?.packageName

  if (!packageBase) {
    throw new Error(`No package mapping available for component index entry "${item.name}" of type "${item.type}".`)
  }

  const firstFilePath = getPrimaryFilePath(item)
  const relativeFileImportPath = firstFilePath
    ? normalizeSlashes(firstFilePath)
        .replace(`${normalizeSlashes(item.root_folder)}/`, '')
        .replace(/\.(ts|tsx|js|jsx)$/, '')
    : item.name

  return `${packageBase}/${normalizeSlashes(item.root_folder)}/${relativeFileImportPath}`
}

// `generator` is serialized via toString() so an inline-function change still
// invalidates the cached output even though the function identity is opaque.
export function createComponentIndexSignature(options: {
  filteredItems: IIndexedRegistryEntry[]
  framework: string | undefined
  generator: ((items: IIndexedRegistryEntry[]) => string) | undefined
  header: string
  packageMappings: RegistryItemTypeMap<string>
  ssr: boolean
}) {
  return hashValue({
    framework: options.framework,
    generator: options.generator ? String(options.generator) : null,
    header: options.header,
    items: options.filteredItems.map((item) => ({
      files: (item.files ?? []).map((file) => ({
        path: file.path,
        type: file.type,
      })),
      name: item.name,
      root_folder: item.root_folder,
      type: item.type,
    })),
    packageMappings: options.packageMappings,
    ssr: options.ssr,
  })
}

/** Two items of one name share an index key and a registry file, so one would silently overwrite the other. */
export function assertUniqueNames(items: readonly Pick<IIndexedRegistryEntry, 'name' | 'type'>[]) {
  const types = new Map<string, string>()
  for (const { name, type } of items) {
    const first = types.get(name)
    if (first !== undefined)
      throw new Error(`Two registry items are named "${name}", a ${first} and a ${type}; rename one.`)
    types.set(name, type)
  }
}

export function renderComponentIndexContent(options: {
  adapter: {
    renderEntry: (options: { id: string; item: IIndexedRegistryEntry }) => string
    renderImport: (options: { componentPath: string; id: string; ssr: boolean }) => string
  }
  filteredItems: IIndexedRegistryEntry[]
  header: string
  packageMappings: RegistryItemTypeMap<string>
  ssr: boolean
  context: IRegistryBuildContext
}) {
  assertUniqueNames(options.filteredItems)
  let imports = ''
  let entries = ''

  for (const item of options.filteredItems) {
    const id = toComponentIdentifier(item.name)
    const componentPath = createComponentPath(options.context, item, options.packageMappings)

    imports += options.adapter.renderImport({
      componentPath,
      id,
      ssr: options.ssr,
    })
    entries += options.adapter.renderEntry({
      id,
      item,
    })
  }

  return `${options.header}${imports}
export const Index: Record<string, any> = {${entries}
}
`
}
