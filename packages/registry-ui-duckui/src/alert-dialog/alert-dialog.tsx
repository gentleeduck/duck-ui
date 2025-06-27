'use client'

import DialogPrimitive from '@gentleduck/aria-feather/dialog'
// import {
//   AlertDialogDialogProps,
//   AlertDialogDrawerProps,
//   AlertDialogSheetProps,
//   AlertDialogWrapperType,
// } from './alert-dialog.types'
import React from 'react'
import {
  DialogContent,
  DialogContentProps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog'
import { cn } from '@gentleduck/libs/cn'

const AlertDialog = DialogPrimitive.Root

const AlertDialogTrigger = DialogTrigger

function AlertDialogContent({ className, children, ...props }: DialogContentProps): React.JSX.Element {
  return (
    <DialogContent closedby="closerequest" {...props}>
      {children}
    </DialogContent>
  )
}

const AlertDialogHeader = DialogHeader

/**
 * A component that renders the footer of an alert dialog.
 *
 * It uses a flexbox layout to arrange its children in a vertical column
 * on small screens and in a row with space between items on larger screens.
 *
 */
const AlertDialogFooter = DialogFooter

/**
 * `AlertDialogTitle` is a React component that forwards its ref to the `AlertDialogTitle` component.
 * It accepts all props that `AlertDialogTitle` accepts, along with an optional `className` prop
 * to customize its styling.
 *
 */
const AlertDialogTitle = DialogTitle

/**
 * `AlertDialogDescription` is a React component that forwards its ref to the `AlertDialogPrimitive.Description` component.
 * It accepts all props that `AlertDialogPrimitive.Description` accepts, along with an optional `className` prop for additional styling.
 *
 */
const AlertDialogDescription = DialogDescription

/**
 * `AlertDialogAction` is a React component that forwards its ref to the `AlertDialogPrimitive.Action` component.
 * It accepts all the props of `AlertDialogPrimitive.Action` and an additional `className` prop for custom styling.
 *
 */
const AlertDialogAction = AlertDialogTrigger

/**
 * `AlertDialogCancel` is a React forward reference component that renders a cancel button
 * for an alert dialog using `AlertDialogPrimitive.Cancel`. It accepts all props that a
 * `AlertDialogPrimitive.Cancel` component would accept, along with an optional `className`
 * for additional styling.
 *
 */
const AlertDialogCancel = AlertDialogTrigger

// TODO: Fix this
//
// /**
//  * Renders an alert dialog and a sheet component, managing their open states
//  * and handling user interactions through provided callbacks.
//  *
//  * @param {AlertDialogWrapperType} props - The properties for configuring the AlertDialogWrapper.
//  *
//  * The component utilizes the `useDuckAlert` hook for managing its internal state
//  * and provides a structured layout for displaying an alert dialog with a trigger,
//  * content, header, footer, and actions, as well as a sheet with nested content
//  * and customizable headers and footers. The component handles user interactions
//  * with cancel and continue actions, updating the state and invoking provided callbacks.
//  */
// export function AlertDialogWrapper({
//   alertTrigger,
//   alertContent,
//   duckHook,
// }: AlertDialogWrapperType) {
//   const { _header, _footer, ...contentProps } = alertContent ?? {}
//   const { _title, _description, ...headerProps } = _header ?? {}
//   const { _submit, _cancel, ...footerProps } = _footer ?? {}

//   return (
//     <AlertDialog open={duckHook?.state.alert}>
//       <AlertDialogTrigger
//         {...alertTrigger}
//         onClick={(e) => {
//           duckHook?.setState({ shape: true, alert: false })
//           alertTrigger?.onClick?.(e)
//         }}
//       />
//       <AlertDialogContent {...contentProps}>
//         <AlertDialogHeader {...headerProps}>
//           {headerProps.children ? (
//             headerProps.children
//           ) : (
//             <>
//               <AlertDialogTitle {..._title} />
//               <AlertDialogDescription {..._description} />
//             </>
//           )}
//         </AlertDialogHeader>

//         <AlertDialogFooter {...footerProps}>
//           <AlertDialogCancel
//             {..._cancel}
//             onClick={(e) => {
//               duckHook?.handleAlertCancel()
//               _cancel?.onClick?.(e)
//             }}
//             asChild
//           >
//             {_cancel?.children ?? 'Cancel'}
//           </AlertDialogCancel>
//           <AlertDialogAction
//             {..._submit}
//             onClick={(e) => {
//               duckHook?.handleAlertContinue()
//               _submit?.onClick?.(e)
//             }}
//             asChild
//           >
//             {_submit?.children ?? 'Continue'}
//           </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   )
// }

// /**
//  * AlertDialogSheet is a component that provides a structured layout for displaying
//  * an alert dialog with a trigger, content, header, footer, and actions, as well as
//  * a sheet with nested content and customizable headers and footers. The component
//  * handles user interactions with cancel and continue actions, updating the state
//  * and invoking provided callbacks.
//  *
//  * @param {AlertDialogSheetProps} props - The properties for configuring the AlertDialogSheet.
//  *
//  * The component utilizes the `useDuckAlert` hook for managing its internal state
//  * and provides a structured layout for displaying an alert dialog with a trigger,
//  * content, header, footer, and actions, as well as a sheet with nested content
//  * and customizable headers and footers. The component handles user interactions
//  * with cancel and continue actions, updating the state and invoking provided callbacks.
//  */
// function AlertDialogSheet<T = string>({
//   alertTrigger,
//   alertContent,
//   content,
//   state,
// }: AlertDialogSheetProps<T>) {
//   const duckHook = useDuckAlert({ state })

//   return (
//     <>
//       <AlertDialogWrapper
//         alertTrigger={alertTrigger}
//         alertContent={alertContent}
//         duckHook={duckHook}
//       />
//       <SheetWrapper content={content} duckHook={duckHook} />
//     </>
//   )
// }

// AlertDialogSheet.displayName = 'AlertDialogSheet'

// /**
//  * AlertDialogDrawer is a component that provides a structured layout for displaying
//  * an alert dialog with a trigger, content, header, footer, and actions, as well as
//  * a drawer with nested content and customizable headers and footers. The component
//  * handles user interactions with cancel and continue actions, updating the state
//  * and invoking provided callbacks.
//  *
//  * @param {AlertDialogDrawerProps} props - The properties for configuring the AlertDialogDrawer.
//  *
//  * The component utilizes the `useDuckAlert` hook for managing its internal state
//  * and provides a structured layout for displaying an alert dialog with a trigger,
//  * content, header, footer, and actions, as well as a drawer with nested content
//  * and customizable headers and footers. The component handles user interactions
//  * with cancel and continue actions, updating the state and invoking provided callbacks.
//  */

// function AlertDialogDrawer<T = string>({
//   alertTrigger,
//   alertContent,
//   // content,
//   state,
// }: AlertDialogDrawerProps<T>) {
//   const duckHook = useDuckAlert<T>({ state })

//   return (
//     <>
//       <AlertDialogWrapper
//         alertTrigger={alertTrigger}
//         alertContent={alertContent}
//         duckHook={duckHook}
//       />
//     </>
//     // <DrawerWrapper content={content} duckHook={duckHook} />
//   )
// }

// AlertDialogSheet.displayName = 'AlertDialogDrawer'

// /**
//  * Renders an alert dialog and a dialog component, managing their open states
//  * and handling user interactions through provided callbacks.
//  *
//  * @template T
//  * @param {AlertDialogDialogProps} props - The properties for configuring the AlertDialogDialog.
//  *
//  * The component utilizes the `useDuckAlert` hook for managing its internal state
//  * and provides a structured layout for displaying an alert dialog with a trigger,
//  * content, header, footer, and actions, as well as a dialog with nested content
//  * and customizable headers and footers. The component handles user interactions
//  * with cancel and continue actions, updating the state and invoking provided callbacks.
//  */

// function AlertDialogDialog<T = string>({
//   alertTrigger,
//   alertContent,
//   // content,
//   state,
// }: AlertDialogDialogProps<T>) {
//   const duckHook = useDuckAlert<T>({ state })

//   return (
//     <>
//       <AlertDialogWrapper
//         alertTrigger={alertTrigger}
//         alertContent={alertContent}
//         duckHook={duckHook}
//       />
//       {/* ! FIX: create DialogWrapper  */}
//       {/* <DialogWrapper content={content} duckHook={duckHook} /> */}
//     </>
//   )
// }

// AlertDialogSheet.displayName = 'AlertDialogDialog'

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogDescription,
  // AlertDialogSheet,
  // AlertDialogDrawer,
  // AlertDialogDialog,
}
