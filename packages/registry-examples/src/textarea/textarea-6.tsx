import { Button } from '@gentleduck/registry-ui/button'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full gap-2">
      <Textarea aria-label="Message" placeholder="Type your message here." />
      <Button>Send message</Button>
    </div>
  )
}
