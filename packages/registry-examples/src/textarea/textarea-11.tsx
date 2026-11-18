import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-6">
      <div className="grid gap-1.5">
        <Label htmlFor="textarea-invalid">Reason for refund</Label>
        <Textarea aria-describedby="textarea-invalid-error" aria-invalid="true" defaultValue="" id="textarea-invalid" />
        <p className="text-destructive text-sm" id="textarea-invalid-error">
          Tell us why, so we can process the refund.
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="textarea-warning">Note to the courier</Label>
        <Textarea
          aria-describedby="textarea-warning-hint"
          aria-warning="true"
          defaultValue="Call me on 0100 000 0000 when you arrive."
          id="textarea-warning"
        />
        <p className="text-sm text-warning" id="textarea-warning-hint">
          Couriers see this note. Leave out anything private.
        </p>
      </div>
    </div>
  )
}
