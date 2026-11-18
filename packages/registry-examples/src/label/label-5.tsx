import { Checkbox } from '@gentleduck/registry-ui/checkbox'
import { Label } from '@gentleduck/registry-ui/label'
import { Switch } from '@gentleduck/registry-ui/switch'

export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Checkbox defaultChecked disabled id="label-disabled-digest" />
        <Label htmlFor="label-disabled-digest">Weekly digest</Label>
      </div>
      <Label className="flex items-center gap-2">
        <Switch disabled />
        Beta features
      </Label>
    </div>
  )
}
