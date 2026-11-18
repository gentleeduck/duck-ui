import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select defaultValue="eu-west" disabled>
      <SelectTrigger aria-label="Region" className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="eu-west">Europe (Ireland)</SelectItem>
        <SelectItem value="us-east">US East (Virginia)</SelectItem>
      </SelectContent>
    </Select>
  )
}
