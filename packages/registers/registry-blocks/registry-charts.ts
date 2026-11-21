import type { RegistryEntry } from '../registry-schema'

// All chart entries share the same shape: registry:block, files: [],
// rooted under `charts/<name>`, depending on `card` and `chart`. Some
// charts also need `select`. Hoisting a builder makes the deps audit-able
// at a glance and shrinks the file from ~580 LoC to ~100 LoC.
function chart(name: string, subcat: string, extraDeps: string[] = [], dependencies: string[] = []): RegistryEntry {
  return {
    categories: ['charts', subcat],
    ...(dependencies.length > 0 && { dependencies }),
    files: [],
    name,
    registryDependencies: ['card', 'chart', ...extraDeps],
    root_folder: `charts/${name}`,
    type: 'registry:block',
  }
}

export const registryCharts: RegistryEntry[] = [
  // Area Charts
  chart('chart-area-axes', 'charts-area', [], ['lucide-react']),
  chart('chart-area-default', 'charts-area', [], ['lucide-react']),
  chart('chart-area-gradient', 'charts-area', [], ['lucide-react']),
  chart('chart-area-icons', 'charts-area', [], ['lucide-react']),
  chart('chart-area-interactive', 'charts-area', ['select']),
  chart('chart-area-legend', 'charts-area', [], ['lucide-react']),
  chart('chart-area-linear', 'charts-area', [], ['lucide-react']),
  chart('chart-area-stacked-expand', 'charts-area', [], ['lucide-react']),
  chart('chart-area-stacked', 'charts-area', [], ['lucide-react']),
  chart('chart-area-step', 'charts-area', [], ['lucide-react']),

  // Bar Charts
  chart('chart-bar-active', 'charts-bar', [], ['lucide-react']),
  chart('chart-bar-default', 'charts-bar', [], ['lucide-react']),
  chart('chart-bar-horizontal', 'charts-bar', [], ['lucide-react']),
  chart('chart-bar-interactive', 'charts-bar'),
  chart('chart-bar-label-custom', 'charts-bar', [], ['lucide-react']),
  chart('chart-bar-label', 'charts-bar', [], ['lucide-react']),
  chart('chart-bar-mixed', 'charts-bar', [], ['lucide-react']),
  chart('chart-bar-multiple', 'charts-bar', [], ['lucide-react']),
  chart('chart-bar-negative', 'charts-bar', [], ['lucide-react']),
  chart('chart-bar-stacked', 'charts-bar', [], ['lucide-react']),

  // Line Charts
  chart('chart-line-default', 'charts-line', [], ['lucide-react']),
  chart('chart-line-dots-colors', 'charts-line', [], ['lucide-react']),
  chart('chart-line-dots-custom', 'charts-line', [], ['lucide-react']),
  chart('chart-line-dots', 'charts-line', [], ['lucide-react']),
  chart('chart-line-interactive', 'charts-line'),
  chart('chart-line-label-custom', 'charts-line', [], ['lucide-react']),
  chart('chart-line-label', 'charts-line', [], ['lucide-react']),
  chart('chart-line-linear', 'charts-line', [], ['lucide-react']),
  chart('chart-line-multiple', 'charts-line', [], ['lucide-react']),
  chart('chart-line-step', 'charts-line', [], ['lucide-react']),

  // Pie Charts
  chart('chart-pie-donut-active', 'charts-pie', [], ['lucide-react']),
  chart('chart-pie-donut-text', 'charts-pie', [], ['lucide-react']),
  chart('chart-pie-donut', 'charts-pie', [], ['lucide-react']),
  chart('chart-pie-interactive', 'charts-pie', ['select']),
  chart('chart-pie-label-custom', 'charts-pie', [], ['lucide-react']),
  chart('chart-pie-label-list', 'charts-pie', [], ['lucide-react']),
  chart('chart-pie-label', 'charts-pie', [], ['lucide-react']),
  chart('chart-pie-legend', 'charts-pie'),
  chart('chart-pie-separator-none', 'charts-pie', [], ['lucide-react']),
  chart('chart-pie-simple', 'charts-pie', [], ['lucide-react']),
  chart('chart-pie-stacked', 'charts-pie', [], ['lucide-react']),

  // Radar Charts
  chart('chart-radar-default', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-dots', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-grid-circle-fill', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-grid-circle-no-lines', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-grid-circle', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-grid-custom', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-grid-fill', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-grid-none', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-icons', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-label-custom', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-legend', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-lines-only', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-multiple', 'charts-radar', [], ['lucide-react']),
  chart('chart-radar-radius', 'charts-radar', [], ['lucide-react']),

  // Radial Charts
  chart('chart-radial-grid', 'charts-radial', [], ['lucide-react']),
  chart('chart-radial-label', 'charts-radial', [], ['lucide-react']),
  chart('chart-radial-shape', 'charts-radial', [], ['lucide-react']),
  chart('chart-radial-simple', 'charts-radial', [], ['lucide-react']),
  chart('chart-radial-stacked', 'charts-radial', [], ['lucide-react']),
  chart('chart-radial-text', 'charts-radial', [], ['lucide-react']),

  // Tooltip Variants
  chart('chart-tooltip-default', 'charts-tooltip'),
  chart('chart-tooltip-indicator-line', 'charts-tooltip'),
  chart('chart-tooltip-indicator-none', 'charts-tooltip'),
  chart('chart-tooltip-label-none', 'charts-tooltip'),
  chart('chart-tooltip-label-custom', 'charts-tooltip'),
  chart('chart-tooltip-label-formatter', 'charts-tooltip'),
  chart('chart-tooltip-formatter', 'charts-tooltip'),
  chart('chart-tooltip-icons', 'charts-tooltip', [], ['lucide-react']),
  chart('chart-tooltip-advanced', 'charts-tooltip'),
]
