import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from '@gentleduck/registry-ui/input-group'
import { IconCopy, IconCornerDownLeft, IconDatabase, IconRefresh } from '@tabler/icons-react'

export default function Demo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <InputGroup>
        <InputGroupTextarea
          className="min-h-[200px]"
          id="textarea-code-32"
          placeholder="SELECT * FROM users WHERE active = true;"
        />
        <InputGroupAddon align="block-end" className="border-t">
          <InputGroupText>Row 1, Col 1</InputGroupText>
          <InputGroupButton className="ms-auto" size="sm" variant="default">
            Execute <IconCornerDownLeft />
          </InputGroupButton>
        </InputGroupAddon>
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText className="font-medium font-mono">
            <IconDatabase />
            production.sql
          </InputGroupText>
          <InputGroupButton aria-label="Refresh" className="ms-auto" size="icon-xs">
            <IconRefresh aria-hidden="true" />
          </InputGroupButton>
          <InputGroupButton aria-label="Copy" size="icon-xs" variant="ghost">
            <IconCopy aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
