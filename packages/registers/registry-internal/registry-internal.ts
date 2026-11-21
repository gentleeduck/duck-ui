import type { RegistryEntry } from '../registry-schema'

export const registryInternal: RegistryEntry[] = [
  {
    dependencies: ['@gentleduck/calendar', '@gentleduck/primitives'],
    files: [],
    name: 'internal-primitives-examples',
    root_folder: 'internal-primitives',
    type: 'registry:internal',
  },
]
