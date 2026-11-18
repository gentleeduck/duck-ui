// The stories name Radix's parts; each is duck's module for the same part.
import { Portal as PortalRoot } from '../portal'

export * as ContextMenu from '../context-menu'
export * as Dialog from '../dialog'
export * as Direction from '../direction'
export * as DropdownMenu from '../dropdown-menu'
export * as Menubar from '../menubar'
export * as Popover from '../popover'
export * as Popper from '../popper'
export * as Select from '../select'
export * as ToggleGroup from '../toggle-group'

export const Portal = { Root: PortalRoot }

// duck has no Label; Radix's renders a plain label element.
export const Label = { Root: 'label' as const }
