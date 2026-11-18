import { Button } from '@gentleduck/registry-ui/button'
import { ButtonGroup, ButtonGroupText } from '@gentleduck/registry-ui/button-group'
import { Input } from '@gentleduck/registry-ui/input'
import { Label } from '@gentleduck/registry-ui/label'

export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Input aria-label="Site address" placeholder="duck.example" />
        <ButtonGroupText>.com</ButtonGroupText>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroupText asChild>
          <Label htmlFor="pond-name">Pond</Label>
        </ButtonGroupText>
        <Input id="pond-name" placeholder="Mill pond" />
        <Button variant="outline">Save</Button>
      </ButtonGroup>
    </div>
  )
}
