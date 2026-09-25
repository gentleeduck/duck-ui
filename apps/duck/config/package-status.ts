export type PackageLifecycleStatus = 'deprecated' | 'experimental' | 'wip'

type PackageLifecycleMeta = {
  label: string
  variant: 'destructive' | 'outline' | 'warning'
}

export const PACKAGE_LIFECYCLE_STATUS = {
  'duck-auth': 'wip',
  'duck-iam': 'wip',
  'duck-motion': 'wip',
  'duck-shortcut': 'deprecated',
  'duck-state': 'experimental',
  'duck-upload': 'wip',
} as const satisfies Record<string, PackageLifecycleStatus>

const PACKAGE_LIFECYCLE_META: Record<PackageLifecycleStatus, PackageLifecycleMeta> = {
  deprecated: {
    label: 'Deprecated',
    variant: 'destructive',
  },
  experimental: {
    label: 'Experimental',
    variant: 'outline',
  },
  wip: {
    label: 'WIP',
    variant: 'warning',
  },
}

export function getPackageLifecycleMeta(status: PackageLifecycleStatus) {
  return PACKAGE_LIFECYCLE_META[status]
}

export function getPackageLifecycleStatusFromHref(href?: string) {
  const slug = href?.replace(/^\/+/, '').split('/')[0]

  if (!slug) {
    return null
  }

  return PACKAGE_LIFECYCLE_STATUS[slug as keyof typeof PACKAGE_LIFECYCLE_STATUS] ?? null
}
