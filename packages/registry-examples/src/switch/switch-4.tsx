'use client'

import { Label } from '@gentleduck/registry-ui/label'
import { MotionSwitch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <div className="flex items-center gap-2">
      <MotionSwitch id="motion-wifi" />
      <Label htmlFor="motion-wifi">Wi-Fi</Label>
    </div>
  )
}
