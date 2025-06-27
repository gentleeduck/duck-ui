import { DialogWrapperProps } from '../dialog'
import { DrawerWrapperProps } from './../drawer/drawer.types'
import { SheetWrapperProps } from '../sheet'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

/**
 * Alert Dialog State
 */
export interface StateType {
  shape: boolean
  alert: boolean
}

/**
 * UseDuckAlertReturnType
 */
export type UseDuckAlertReturnType = {
  handleAlertCancel: () => void
  handleAlertContinue: () => void
  handleOpenChange: (drawerState: boolean) => void
  state: StateType
  setState: React.Dispatch<React.SetStateAction<StateType>>
}

/**
 * UserDuckAlertProps
 */
export type UserDuckAlertProps<T> = Pick<AlertDialogSheetProps<T>, 'state'>

export type AlertDialogWrapperType = {
  alertTrigger: React.ComponentPropsWithoutRef<typeof AlertDialogTrigger>
  alertContent: React.ComponentPropsWithoutRef<typeof AlertDialogContent> & {
    /**
     * Header you will use this for nothing
     */
    _header?: React.ComponentPropsWithoutRef<typeof AlertDialogHeader> & {
      _title?: React.ComponentPropsWithoutRef<typeof AlertDialogTitle>
      _description?: React.ComponentPropsWithoutRef<typeof AlertDialogDescription>
    }
    _footer?: React.ComponentPropsWithoutRef<typeof AlertDialogFooter> & {
      _cancel?: React.ComponentPropsWithoutRef<typeof AlertDialogCancel>
      _submit?: React.ComponentPropsWithoutRef<typeof AlertDialogAction>
    }
  }
  duckHook?: UseDuckAlertReturnType
}

/**
 * AlertDialogSheetProps
 */
export type AlertDialogSheetProps<T = string> = {
  state: T
  content: SheetWrapperProps['content']
} & AlertDialogWrapperType

/**
 * AlertDialogDrawerProps
 */
export type AlertDialogDrawerProps<T = string> = {
  state: T
  content: DrawerWrapperProps['content']
} & AlertDialogWrapperType

/**
 * AlertDialogDialogProps
 */
export type AlertDialogDialogProps<T = string> = {
  state: T
  content: DialogWrapperProps['content']
} & AlertDialogWrapperType
