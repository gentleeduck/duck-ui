import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select defaultValue="m">
      <SelectTrigger aria-label="T-shirt size" className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="item-aligned">
        <SelectItem value="xs">Extra small</SelectItem>
        <SelectItem value="s">Small</SelectItem>
        <SelectItem value="m">Medium</SelectItem>
        <SelectItem value="l">Large</SelectItem>
        <SelectItem value="xl">Extra large</SelectItem>
      </SelectContent>
    </Select>
  )
}
