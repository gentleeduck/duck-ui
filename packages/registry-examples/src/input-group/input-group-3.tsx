import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@gentleduck/registry-ui/input-group'

export default function Demo() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="0.0" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>kg</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>EUR</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput className="!ps-0.5" placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>.00</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput className="!ps-0.5" placeholder="handle" />
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea placeholder="Write release notes..." />
        <InputGroupAddon align="block-end">
          <InputGroupText className="text-muted-foreground text-xs">500 characters remaining</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
