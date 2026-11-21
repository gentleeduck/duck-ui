import type { RegistryEntry } from '../registry-schema'

// All sidebar blocks share the same shell — registry:block, files: [],
// `sidebar` category, rooted under `sidebar/<name>`. A builder collapses
// 16 entries from ~132 LoC to ~30 LoC and surfaces the deps as data.
function sidebar(name: string, deps: string[]): RegistryEntry {
  return {
    categories: ['sidebar'],
    files: [],
    name,
    registryDependencies: deps,
    root_folder: `sidebar/${name}`,
    type: 'registry:block',
  }
}

export const registrySidebar: RegistryEntry[] = [
  sidebar('sidebar-01', ['sidebar', 'breadcrumb', 'separator', 'dropdown-menu', 'label']),
  sidebar('sidebar-02', ['sidebar', 'breadcrumb', 'separator', 'dropdown-menu', 'collapsible', 'label']),
  sidebar('sidebar-03', ['sidebar', 'breadcrumb', 'separator']),
  sidebar('sidebar-04', ['sidebar', 'breadcrumb', 'separator']),
  sidebar('sidebar-05', ['sidebar', 'breadcrumb', 'separator', 'collapsible', 'label']),
  sidebar('sidebar-06', ['sidebar', 'breadcrumb', 'separator', 'collapsible', 'card', 'dropdown-menu']),
  sidebar('sidebar-07', ['sidebar', 'breadcrumb', 'separator', 'collapsible', 'avatar', 'dropdown-menu']),
  sidebar('sidebar-08', ['sidebar', 'breadcrumb', 'separator', 'collapsible', 'avatar', 'dropdown-menu']),
  sidebar('sidebar-09', ['sidebar', 'breadcrumb', 'separator', 'avatar', 'dropdown-menu', 'label', 'switch']),
  sidebar('sidebar-10', ['sidebar', 'breadcrumb', 'separator', 'collapsible', 'dropdown-menu', 'popover']),
  sidebar('sidebar-11', ['sidebar', 'breadcrumb', 'separator', 'collapsible']),
  sidebar('sidebar-12', ['sidebar', 'breadcrumb', 'separator', 'calendar', 'collapsible', 'avatar', 'dropdown-menu']),
  sidebar('sidebar-13', ['sidebar', 'breadcrumb', 'button', 'dialog']),
  sidebar('sidebar-14', ['sidebar', 'breadcrumb']),
  sidebar('sidebar-15', ['sidebar', 'breadcrumb', 'separator', 'calendar', 'collapsible', 'avatar', 'dropdown-menu']),
  sidebar('sidebar-16', [
    'sidebar',
    'breadcrumb',
    'separator',
    'button',
    'collapsible',
    'avatar',
    'dropdown-menu',
    'label',
  ]),
]
