import type { RegistryIndex } from '@gentleduck/docs'
import dynamic from 'next/dynamic'

// These read the site's own `public/data/benchmarks`, so they are not registry examples a user can install.
export const benchmarkIndex: RegistryIndex = {
  'chart-benchmark-calendar': {
    component: dynamic(() => import('./chart-benchmark-calendar'), { ssr: false }),
  },
  'chart-benchmark-calendar-compare': {
    component: dynamic(() => import('./chart-benchmark-calendar-compare'), { ssr: false }),
  },
  'chart-benchmark-calendar-vs': {
    component: dynamic(() => import('./chart-benchmark-calendar-vs'), { ssr: false }),
  },
  'chart-benchmark-iam': {
    component: dynamic(() => import('./chart-benchmark-iam'), { ssr: false }),
  },
  'chart-benchmark-iam-compare': {
    component: dynamic(() => import('./chart-benchmark-iam-compare'), { ssr: false }),
  },
  'chart-benchmark-iam-vs': {
    component: dynamic(() => import('./chart-benchmark-iam-vs'), { ssr: false }),
  },
  'chart-benchmark-primitives': {
    component: dynamic(() => import('./chart-benchmark-primitives'), { ssr: false }),
  },
  'chart-benchmark-primitives-all': {
    component: dynamic(() => import('./chart-benchmark-primitives-all'), { ssr: false }),
  },
  'chart-benchmark-primitives-vs': {
    component: dynamic(() => import('./chart-benchmark-primitives-vs'), { ssr: false }),
  },
  'chart-benchmark-variants': {
    component: dynamic(() => import('./chart-benchmark-variants'), { ssr: false }),
  },
}
