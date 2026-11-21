'use client'

import { MotionCheckboxGroup } from '@gentleduck/registry-ui/checkbox'

export default function Demo() {
  return (
    <MotionCheckboxGroup
      subtasks={[
        { checked: true, id: 'checkbox-12-design', title: 'Design the page' },
        { id: 'checkbox-12-build', title: 'Build it' },
        { id: 'checkbox-12-ship', title: 'Ship it' },
      ]}
    />
  )
}
