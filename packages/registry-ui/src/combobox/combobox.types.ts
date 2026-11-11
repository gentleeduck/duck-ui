import type { Button } from '../button'
import type { Checkbox } from '../checkbox'
import type { Command, CommandInput, CommandItem } from '../command'
import type { Popover, PopoverContent } from '../popover'

/** A single combobox option with a display label and underlying value. */
export interface IComboboxItemType {
  label: string
  value: string
}

interface IComboboxBaseProps {
  /** List of items to display in the combobox. */
  items: readonly IComboboxItemType[]
  /** Whether to show a search input inside the popover. */
  withSearch?: boolean
  /** Whether to display the labels of the picked items in the trigger button. */
  showSelected?: boolean
  /** Props forwarded to the Popover root, its `open`, `defaultOpen` and `onOpenChange` included. */
  popover?: React.ComponentPropsWithoutRef<typeof Popover>
  /** Props forwarded to the trigger Button. */
  popoverTrigger?: React.ComponentPropsWithoutRef<typeof Button>
  /** Props forwarded to PopoverContent. */
  popoverContent?: React.ComponentPropsWithoutRef<typeof PopoverContent>
  /** Props forwarded to the Command root. */
  command?: React.ComponentPropsWithoutRef<typeof Command>
  /** Props forwarded to CommandInput. */
  commandInput?: React.ComponentPropsWithoutRef<typeof CommandInput>
  /** Text in the trigger while nothing is picked. */
  commandTriggerPlaceholder?: string
  /** Message shown when no items match the search query. */
  commandEmpty?: string
  /** Renders the list from the items, as `ComboboxItem` elements. */
  children: (items: readonly IComboboxItemType[]) => React.ReactNode
}

/** Picks one item and closes. Picking it again clears the value to an empty string. */
export interface IComboboxSingleProps extends IComboboxBaseProps {
  type?: 'single'
  /** Controlled value, an empty string when nothing is picked. */
  value?: string
  /** Initial value for uncontrolled usage. */
  defaultValue?: string
  onValueChange?: (value: string) => void
}

/** Picks any number of items, and stays open while it does. */
export interface IComboboxMultipleProps extends IComboboxBaseProps {
  type: 'multiple'
  /** Controlled values. */
  value?: string[]
  /** Initial values for uncontrolled usage. */
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export type IComboboxProps = IComboboxSingleProps | IComboboxMultipleProps

/**
 * Props for an individual combobox item (CommandItem wrapper).
 *
 * @template T - The item type extending `IComboboxItemType`.
 */
export interface IComboboxItemProps<T extends IComboboxItemType = IComboboxItemType>
  extends Omit<React.ComponentPropsWithoutRef<typeof CommandItem>, 'onSelect'> {
  /** The combobox item data. */
  item: T
  /** Called with the item's value when it is picked. */
  onSelect?: (value: T['value']) => void
  /** Whether the item shows as picked. Inside a `Combobox` it follows the combobox's value unless given. */
  checked?: React.ComponentPropsWithoutRef<typeof Checkbox>['checked']
}
