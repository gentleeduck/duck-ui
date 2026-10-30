import type * as React from 'react'
import * as accordion from '../accordion/__stories__/accordion.stories'
import * as arrow from '../arrow/__stories__/arrow.stories'
import * as avatar from '../avatar/__stories__/avatar.stories'
import * as direction from '../direction/__stories__/direction.stories'
import * as dismissableLayer from '../dismissable-layer/__stories__/dismissable-layer.stories'
import * as focusScope from '../focus-scope/__stories__/focus-scope.stories'
import * as hooks from '../hooks/__stories__/hooks.stories'
import * as mount from '../mount/__stories__/mount.stories'
import * as pagination from '../pagination/__stories__/pagination.stories'
import * as popper from '../popper/__stories__/popper.stories'
import * as portal from '../portal/__stories__/portal.stories'
import * as presence from '../presence/__stories__/presence.stories'
import * as primitive from '../primitive-elements/__stories__/primitive-elements.stories'
import * as progress from '../progress/__stories__/progress.stories'
import * as radioGroup from '../radio-group/__stories__/radio-group.stories'
import * as rovingFocus from '../roving-focus/__stories__/roving-focus.stories'
import * as slot from '../slot/__stories__/slot.stories'
import * as visuallyHidden from '../visibility-hidden/__stories__/visibility-hidden.stories'

type StoryModule = { default: { title: string } } & Record<string, unknown>

// Storybook's id: the title, and the export name split into words, each lowercased and kebab-joined.
const kebab = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export interface IStoryEntry {
  title: string
  name: string
  Story: React.ComponentType
}

export const stories = new Map<string, IStoryEntry>()

for (const module of [
  accordion,
  arrow,
  avatar,
  direction,
  dismissableLayer,
  focusScope,
  hooks,
  mount,
  pagination,
  popper,
  portal,
  presence,
  primitive,
  progress,
  radioGroup,
  rovingFocus,
  slot,
  visuallyHidden,
] as StoryModule[]) {
  for (const [name, story] of Object.entries(module)) {
    if (name === 'default' || typeof story !== 'function') continue
    const words = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    stories.set(`${kebab(module.default.title)}--${kebab(words)}`, {
      title: module.default.title,
      name: words,
      Story: story as React.ComponentType,
    })
  }
}
