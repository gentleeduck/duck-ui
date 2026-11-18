import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@gentleduck/registry-ui/select'

export default function Demo() {
  return (
    <Select defaultValue={['mozzarella', 'basil']} multiple>
      <SelectTrigger aria-label="Toppings" className="w-[280px]">
        <SelectValue placeholder="Pick your toppings" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Cheese</SelectLabel>
          <SelectItem value="mozzarella">Mozzarella</SelectItem>
          <SelectItem value="parmesan">Parmesan</SelectItem>
          <SelectItem value="gorgonzola">Gorgonzola</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Meat</SelectLabel>
          <SelectItem value="pepperoni">Pepperoni</SelectItem>
          <SelectItem value="ham">Ham</SelectItem>
          <SelectItem disabled value="nduja">
            Nduja (sold out)
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Greens</SelectLabel>
          <SelectItem value="basil">Basil</SelectItem>
          <SelectItem value="rocket">Rocket</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
