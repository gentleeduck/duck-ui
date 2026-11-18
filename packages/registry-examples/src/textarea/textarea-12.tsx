import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="textarea-grow">Release notes</Label>
      <Textarea className="max-h-40 resize-none" id="textarea-grow" placeholder="Each new line makes the box taller." />
    </div>
  )
}
