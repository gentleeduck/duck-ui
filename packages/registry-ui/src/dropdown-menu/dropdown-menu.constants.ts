// The arrow outlines its curve in --dropdown-menu-border-color, so every content defines it.
export const dropdownMenuContentStyle =
  'relative z-50 flex max-h-(--gentleduck-dropdown-menu-content-available-height) min-w-32 origin-(--gentleduck-dropdown-menu-content-transform-origin) flex-col rounded-md border border-(--dropdown-menu-border-color) bg-popover text-popover-foreground shadow-md [--dropdown-menu-border-color:var(--border)]'

// Overflow on the content itself would clip the arrow, so the items scroll in a wrapper that shrinks to whatever
// height the content is held to.
export const dropdownMenuScrollStyle = 'min-h-0 overflow-y-auto overflow-x-hidden p-1'

export const dropdownMenuSubContentStyle =
  'z-50 max-h-(--gentleduck-dropdown-menu-content-available-height) min-w-32 origin-(--gentleduck-dropdown-menu-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg'
