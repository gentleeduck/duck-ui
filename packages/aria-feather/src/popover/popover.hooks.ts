// import React from "react"
// import { useDialog } from "../dialog/_dialog.hooks"
// import { DialogContextType } from "../dialog"

// /**
//  * Context for managing the open state of the popover.
//  *
//  */
// export const PopoverContext = React.createContext<DialogContextType | null>(null)

// export function usePopoverContext(name: string = 'Popover'): DialogContextType {
//   const context = React.useContext(PopoverContext)
//   if (!context) {
//     throw new Error(`usePopoverContext must be used within a ${name}`)
//   }
//   return context
// }

// export { useDialog as usePopover }
