import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

const countries = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'India',
  'Indonesia',
  'Ireland',
  'Italy',
  'Japan',
  'Jordan',
  'Kenya',
  'Mexico',
  'Morocco',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Norway',
  'Peru',
  'Poland',
  'Portugal',
  'Saudi Arabia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'Tunisia',
  'Turkey',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
]

export default function Demo() {
  return (
    <Select defaultValue={['Egypt', 'Japan']} multiple>
      <SelectTrigger aria-label="Countries" className="w-[280px]">
        <SelectValue placeholder="Pick the countries you ship to" />
      </SelectTrigger>
      <SelectContent className="h-[320px]">
        {countries.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
