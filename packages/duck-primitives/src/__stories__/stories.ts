import type * as React from 'react'
import * as accordion from '../accordion/__stories__/accordion.stories'
import * as alertDialog from '../alert-dialog/__stories__/alert-dialog.stories'
import * as arrow from '../arrow/__stories__/arrow.stories'
import * as avatar from '../avatar/__stories__/avatar.stories'
import * as checkers from '../checkers/__stories__/checkers.stories'
import * as contextMenu from '../context-menu/__stories__/context-menu.stories'
import * as dialog from '../dialog/__stories__/dialog.stories'
import * as direction from '../direction/__stories__/direction.stories'
import * as dismissableLayer from '../dismissable-layer/__stories__/dismissable-layer.stories'
import * as dropdownMenu from '../dropdown-menu/__stories__/dropdown-menu.stories'
import * as focusScope from '../focus-scope/__stories__/focus-scope.stories'
import * as hooks from '../hooks/__stories__/hooks.stories'
import * as hoverCard from '../hover-card/__stories__/hover-card.stories'
import * as inputOtp from '../input-otp/__stories__/input-otp.stories'
import * as menu from '../menu/__stories__/menu.stories'
import * as menubar from '../menubar/__stories__/menubar.stories'
import * as mount from '../mount/__stories__/mount.stories'
import * as navigationMenu from '../navigation-menu/__stories__/navigation-menu.stories'
import * as pagination from '../pagination/__stories__/pagination.stories'
import * as popover from '../popover/__stories__/popover.stories'
import * as popper from '../popper/__stories__/popper.stories'
import * as portal from '../portal/__stories__/portal.stories'
import * as presence from '../presence/__stories__/presence.stories'
import * as primitive from '../primitive-elements/__stories__/primitive-elements.stories'
import * as progress from '../progress/__stories__/progress.stories'
import * as radioGroup from '../radio-group/__stories__/radio-group.stories'
import * as rovingFocus from '../roving-focus/__stories__/roving-focus.stories'
import * as sheet from '../sheet/__stories__/sheet.stories'
import * as slider from '../slider/__stories__/slider.stories'
import * as slot from '../slot/__stories__/slot.stories'
import * as toggle from '../toggle/__stories__/toggle.stories'
import * as toggleGroup from '../toggle-group/__stories__/toggle-group.stories'
import * as tooltip from '../tooltip/__stories__/tooltip.stories'
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
  alertDialog,
  arrow,
  avatar,
  checkers,
  contextMenu,
  dialog,
  direction,
  dismissableLayer,
  dropdownMenu,
  focusScope,
  hooks,
  hoverCard,
  inputOtp,
  menu,
  menubar,
  mount,
  navigationMenu,
  pagination,
  popover,
  popper,
  portal,
  presence,
  primitive,
  progress,
  radioGroup,
  rovingFocus,
  sheet,
  slider,
  slot,
  toggle,
  toggleGroup,
  tooltip,
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
