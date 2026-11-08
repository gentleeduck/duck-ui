// The arrow outlines its curve in --dropdown-menu-border-color, so every content defines it.
export const dropdownMenuContentStyle =
  'relative z-50 min-w-32 origin-(--gentleduck-dropdown-menu-content-transform-origin) rounded-md border border-(--dropdown-menu-border-color) bg-popover text-popover-foreground shadow-md [--dropdown-menu-border-color:var(--border)]'

// Overflow on the content itself would clip the arrow, so the items scroll in a wrapper inside it.
export const dropdownMenuScrollStyle =
  'max-h-(--gentleduck-dropdown-menu-content-available-height) overflow-y-auto overflow-x-hidden p-1'

export const dropdownMenuSubContentStyle =
  'z-50 max-h-(--gentleduck-dropdown-menu-content-available-height) min-w-32 origin-(--gentleduck-dropdown-menu-content-transform-origin) overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg'
