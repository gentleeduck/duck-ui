import type { RegistryEntry } from '../registry-schema'

export const registryCalendar: RegistryEntry[] = [
  {
    categories: ['calendar', 'application'],
    dependencies: ['jotai'],
    files: [],
    name: 'calendar-block-1',
    registryDependencies: [
      'button',
      'input',
      'label',
      'dialog',
      'popover',
      'tabs',
      'breadcrumb',
      'dropdown-menu',
      'select',
      'badge',
      'button-group',
      'calendar',
      'card',
      'command',
      'separator',
    ],
    root_folder: 'calendar/calendar-1',
    type: 'registry:block',
  },
]
