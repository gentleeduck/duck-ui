'use client'

import { InputGroup, InputGroupAddon, InputGroupButton } from '@gentleduck/registry-ui/input-group'
import { Textarea } from '@gentleduck/registry-ui/textarea'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <Textarea
          className="field-sizing-content flex min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base outline-none transition-[color,box-shadow] md:text-sm"
          data-slot="input-group-control"
          placeholder="Share your feedback..."
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton className="ms-auto" size="sm" variant="default">
            Send
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
