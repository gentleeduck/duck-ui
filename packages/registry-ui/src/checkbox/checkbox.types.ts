import type { Label } from '../label'
import type { Checkbox } from './checkbox'

export type CheckedState = boolean | 'indeterminate'

export interface ICheckboxProps
  extends Omit<React.HTMLProps<HTMLInputElement>, 'checked' | 'onChange' | 'defaultChecked'> {
  indicator?: React.ReactElement
  checkedIndicator?: React.ReactElement
  indeterminateIndicator?: React.ReactElement
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
}

export interface ICheckboxWithLabelProps extends Omit<React.HTMLProps<HTMLDivElement>, 'label'> {
  checkbox: React.ComponentPropsWithoutRef<typeof Checkbox>
  label: React.ComponentPropsWithoutRef<typeof Label>
}

export interface ICheckboxGroupSubtask {
  id: string
  title: string
  checked?: CheckedState
}
export type CheckboxGroupSubtasks = ICheckboxGroupSubtask

export interface ICheckboxGroupProps extends React.HTMLProps<HTMLDivElement> {
  subtasks: ICheckboxGroupSubtask[]
  defaults?: ICheckboxWithLabelProps
}
export type CheckboxGroupProps = ICheckboxGroupProps
