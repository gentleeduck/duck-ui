import * as SheetPrimitive from '@radix-ui/react-dialog'
import { UseDuckAlertReturnType } from '../alert-dialog'
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../sheet'

/**
 * A wrapper component for the [Radix UI Sheet](https://www.radix-ui.com/docs/primitives/components/sheet)
 */
export type SheetWrapperProps = {
  trigger?: React.ComponentPropsWithoutRef<typeof SheetTrigger>
  content: Partial<React.ComponentPropsWithoutRef<typeof SheetContent>> & {
    _header?: React.ComponentPropsWithoutRef<typeof SheetHeader> & {
      _title?: React.ComponentPropsWithoutRef<typeof SheetTitle>
      _description?: React.ComponentPropsWithoutRef<typeof SheetDescription>
    }
    _footer?: React.ComponentPropsWithoutRef<typeof SheetFooter> & {
      _cancel?: React.ComponentPropsWithoutRef<typeof SheetClose>
      _submit?: React.HTMLProps<HTMLDivElement>
    }
  }
  duckHook?: UseDuckAlertReturnType
} & React.ComponentPropsWithoutRef<typeof SheetPrimitive.Root>
