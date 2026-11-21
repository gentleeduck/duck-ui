import type { RegistryEntry } from '../registry-schema'

export const registryDashboards: RegistryEntry[] = [
  {
    categories: ['dashboards', 'dashboard'],
    dependencies: [
      '@dnd-kit/core',
      '@dnd-kit/modifiers',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      '@tanstack/react-table',
      'sonner',
      'zod',
    ],
    files: [],
    name: 'dashboard-1',
    registryDependencies: [
      'button',
      'input',
      'avatar',
      'separator',
      'label',
      'badge',
      'card',
      'chart',
      'checkbox',
      'dropdown-menu',
      'select',
      'sheet',
      'sidebar',
      'table',
      'tabs',
      'toggle-group',
    ],
    root_folder: 'dashboards/dashboard-1',
    type: 'registry:block',
  },
]
