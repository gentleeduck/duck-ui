import { InputGroup, InputGroupAddon, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { AtSign } from 'lucide-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <InputGroup>
        <InputGroupInput
          aria-describedby="handle-error-q2w"
          aria-invalid="true"
          aria-label="Handle"
          defaultValue="mill pond"
        />
        <InputGroupAddon>
          <AtSign aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
      <p className="text-destructive text-sm" id="handle-error-q2w">
        A handle has no spaces.
      </p>
    </div>
  )
}
