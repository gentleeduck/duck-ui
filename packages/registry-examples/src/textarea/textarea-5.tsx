import { Label } from '@gentleduck/registry-ui/label'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message-5">Your message</Label>
      <Textarea aria-describedby="message-5-hint" id="message-5" placeholder="Type your message here." />
      <p className="text-muted-foreground text-sm" id="message-5-hint">
        Your message will be copied to the support team.
      </p>
    </div>
  )
}
