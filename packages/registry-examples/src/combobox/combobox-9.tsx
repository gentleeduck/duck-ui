'use client'

import { Combobox, ComboboxItem } from '@gentleduck/registry-ui/combobox'
import * as React from 'react'

const frameworks = [
  { label: 'Next.js', value: 'next.js' },
  { label: 'SvelteKit', value: 'sveltekit' },
  { label: 'Nuxt.js', value: 'nuxt.js' },
  { label: 'Remix', value: 'remix' },
  { label: 'Astro', value: 'astro' },
]

export default function Demo() {
  const [framework, setFramework] = React.useState('')

  return (
    <div className="flex flex-col items-center gap-3">
      <Combobox
        commandEmpty="No framework found."
        commandInput={{ placeholder: 'Search framework...' }}
        commandTriggerPlaceholder="Select framework..."
        items={frameworks}
        onValueChange={setFramework}
        popoverTrigger={{ className: 'w-57.5 justify-start', variant: 'outline' }}
        value={framework}>
        {(items) => items.map((item) => <ComboboxItem item={item} key={item.value} />)}
      </Combobox>
      <p className="text-muted-foreground text-sm">{framework ? `Value: ${framework}` : 'Nothing picked.'}</p>
    </div>
  )
}
