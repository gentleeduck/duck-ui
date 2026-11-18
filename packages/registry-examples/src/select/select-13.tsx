'use client'

import { Badge } from '@gentleduck/registry-ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@gentleduck/registry-ui/select'

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'svelte-kit', label: 'SvelteKit' },
  { value: 'solid-start', label: 'SolidStart' },
]

const labelOf = (value: string) => frameworks.find((framework) => framework.value === value)?.label

export default function Demo() {
  return (
    <Select defaultValue={['next', 'astro', 'svelte-kit']} multiple>
      <SelectTrigger aria-label="Frameworks" className="w-[300px]">
        <SelectValue placeholder="Pick frameworks">
          {(picked) => (
            <span className="flex gap-1">
              {picked.slice(0, 2).map((value) => (
                <Badge key={value} size="sm" variant="secondary">
                  {labelOf(value)}
                </Badge>
              ))}
              {picked.length > 2 ? (
                <Badge size="sm" variant="outline">
                  +{picked.length - 2} more
                </Badge>
              ) : null}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {frameworks.map((framework) => (
          <SelectItem key={framework.value} value={framework.value}>
            {framework.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
