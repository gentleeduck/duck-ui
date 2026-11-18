import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="textarea-auto">Review</Label>
      <Textarea
        defaultValue="شكراً، وصل الطلب في موعده."
        dir="auto"
        id="textarea-auto"
        placeholder="Write in any language"
      />
      <p className="text-muted-foreground text-sm">
        With <code>dir="auto"</code> the text sets its own direction: Arabic starts on the right, English on the left.
      </p>
    </div>
  )
}
