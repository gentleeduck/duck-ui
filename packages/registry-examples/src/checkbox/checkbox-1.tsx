'use client'

import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox defaultChecked id="terms-2" />
        <div className="grid gap-2">
          <Label htmlFor="terms-2">Accept terms and conditions</Label>
          <p className="text-muted-foreground text-sm">
            By clicking this checkbox, you agree to the terms and conditions.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Checkbox disabled id="toggle" />
        <Label htmlFor="toggle">Enable notifications</Label>
      </div>
      <Label className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-checked:border-blue-600 has-checked:bg-blue-50 dark:has-checked:border-blue-900 dark:has-checked:bg-blue-950">
        <Checkbox
          className="text-white checked:border-blue-600 checked:bg-blue-600 dark:checked:border-blue-700 dark:checked:bg-blue-700"
          defaultChecked
          id="toggle-2"
        />
        <div className="grid gap-1.5 font-normal">
          <p className="font-medium text-sm leading-none">Enable notifications</p>
          <p className="text-muted-foreground text-sm">You can enable or disable notifications at any time.</p>
        </div>
      </Label>
    </div>
  )
}
