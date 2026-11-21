'use client'

import {
  MotionTypographyH4,
  MotionTypographyLarge,
  MotionTypographyList,
  MotionTypographyListItem,
  MotionTypographySmall,
} from '@gentleduck/registry-ui/typography'

export default function Demo() {
  return (
    <div className="flex max-w-md flex-col gap-3">
      <MotionTypographyH4>Release 2.4</MotionTypographyH4>
      <MotionTypographyLarge>Faster startup, smaller bundles.</MotionTypographyLarge>
      <MotionTypographyList>
        <MotionTypographyListItem>Cold start down by 30%</MotionTypographyListItem>
        <MotionTypographyListItem>Twelve fewer dependencies</MotionTypographyListItem>
      </MotionTypographyList>
      <MotionTypographySmall>Each part animates in as it mounts.</MotionTypographySmall>
    </div>
  )
}
