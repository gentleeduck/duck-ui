import type * as React from 'react'

export interface IAvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** List of avatar images to display */
  imgs: { src?: string; alt?: string; fallback?: string; id?: string }[]
  /** Maximum number of visible avatars */
  maxVisible?: number
  /** Names the `+N` counter for a screen reader. Defaults to `N more`. */
  getOverflowLabel?: (count: number) => string
}
