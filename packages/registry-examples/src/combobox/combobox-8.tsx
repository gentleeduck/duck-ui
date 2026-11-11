'use client'

import { MotionCombobox, MotionComboboxItem } from '@gentleduck/registry-ui/combobox'

const frameworks = [
  { label: 'Next.js', value: 'next.js' },
  { label: 'SvelteKit', value: 'sveltekit' },
  { label: 'Nuxt.js', value: 'nuxt.js' },
  { label: 'Remix', value: 'remix' },
  { label: 'Astro', value: 'astro' },
]

export default function Demo() {
  return (
    <MotionCombobox
      commandEmpty="No framework found."
      commandInput={{ placeholder: 'Search framework...' }}
      commandTriggerPlaceholder="Select frameworks..."
      items={frameworks}
      popoverTrigger={{ className: 'min-w-57.5 justify-start', variant: 'outline' }}
      type="multiple">
      {(items) => items.map((item, index) => <MotionComboboxItem index={index} item={item} key={item.value} />)}
    </MotionCombobox>
  )
}
