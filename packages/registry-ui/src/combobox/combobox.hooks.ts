import { useDirection } from '@gentleduck/primitives/direction'
import { useControllableState } from '@gentleduck/primitives/hooks/use-controllable-state'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'
import type { IComboboxItemProps, IComboboxItemType, IComboboxProps } from './combobox.types'

interface IComboboxContext {
  picked: readonly string[]
  pick: (value: string) => void
}

export const ComboboxContext = React.createContext<IComboboxContext | null>(null)

const toList = (value: string | readonly string[] | undefined): readonly string[] =>
  value === undefined || value === '' ? [] : typeof value === 'string' ? [value] : value

/** What `Combobox` and `MotionCombobox` both keep: the items picked, whether the popover is open, and its direction. */
export function useCombobox(props: IComboboxProps) {
  const { dir, open: openProp, defaultOpen = false, onOpenChange } = props.popover ?? {}
  const direction = useDirection(toDirection(dir))
  const multiple = props.type === 'multiple'
  const [open, setOpen] = useControllableState({
    caller: 'Combobox',
    defaultProp: defaultOpen,
    onChange: onOpenChange,
    prop: openProp,
  })
  const [picked, setPicked] = useControllableState<readonly string[]>({
    caller: 'Combobox',
    defaultProp: toList(props.defaultValue),
    onChange: (next) => {
      if (props.type === 'multiple') props.onValueChange?.([...next])
      else props.onValueChange?.(next[0] ?? '')
    },
    prop: props.value === undefined ? undefined : toList(props.value),
  })

  const pick = React.useCallback(
    (value: string) => {
      setPicked((current) => {
        if (!multiple) return current[0] === value ? [] : [value]
        return current.includes(value) ? current.filter((held) => held !== value) : [...current, value]
      })
      if (!multiple) setOpen(false)
    },
    [multiple, setPicked, setOpen],
  )

  return {
    context: { pick, picked },
    direction,
    labels: picked.map((value) => props.items.find((item) => item.value === value)?.label ?? value),
    multiple,
    open,
    setOpen,
  }
}

/** Whether an item shows as picked, and what picking it does, inside a `Combobox` or out of one. */
export function useComboboxItem({ item, checked, onSelect }: IComboboxItemProps<IComboboxItemType>) {
  const combobox = React.useContext(ComboboxContext)
  const select = React.useCallback(() => {
    combobox?.pick(item.value)
    onSelect?.(item.value)
  }, [combobox, item.value, onSelect])

  return { checked: checked ?? combobox?.picked.includes(item.value) ?? false, select }
}
