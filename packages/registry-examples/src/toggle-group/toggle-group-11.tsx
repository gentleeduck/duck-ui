import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'

export default function Demo() {
  return (
    <ToggleGroup
      aria-label="Map style"
      className="w-40"
      defaultValue="map"
      deselectable={false}
      orientation="vertical"
      type="single"
      variant="outline">
      <ToggleGroupItem value="map">Map</ToggleGroupItem>
      <ToggleGroupItem value="satellite">Satellite</ToggleGroupItem>
      <ToggleGroupItem disabled title="Terrain is not available for this area" value="terrain">
        Terrain
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
