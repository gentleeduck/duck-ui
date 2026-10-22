import type * as React from 'react'
import * as arrow from '../arrow/__stories__/arrow.stories'
import * as direction from '../direction/__stories__/direction.stories'
import * as hooks from '../hooks/__stories__/hooks.stories'
import * as mount from '../mount/__stories__/mount.stories'
import * as primitive from '../primitive-elements/__stories__/primitive-elements.stories'
import * as slot from '../slot/__stories__/slot.stories'
import * as visuallyHidden from '../visibility-hidden/__stories__/visibility-hidden.stories'

type StoryModule = { default: { title: string } } & Record<string, unknown>

// Storybook's id: the title, and the export name split into words, each lowercased and kebab-joined.
const kebab = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const stories = new Map<string, React.ComponentType>()

for (const module of [arrow, direction, hooks, mount, primitive, slot, visuallyHidden] as StoryModule[]) {
  for (const [name, story] of Object.entries(module)) {
    if (name === 'default' || typeof story !== 'function') continue
    stories.set(
      `${kebab(module.default.title)}--${kebab(name.replace(/([a-z0-9])([A-Z])/g, '$1 $2'))}`,
      story as React.ComponentType,
    )
  }
}
