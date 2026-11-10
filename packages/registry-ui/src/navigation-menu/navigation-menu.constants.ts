export const navigationMenuStyle = 'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center'

export const navigationMenuViewportPositionStyle =
  'absolute start-0 top-full isolate flex justify-center group-data-[orientation=vertical]/navigation-menu:start-full group-data-[orientation=vertical]/navigation-menu:top-0'

export const navigationMenuViewportStyle =
  'relative mt-1.5 h-(--gentleduck-navigation-menu-viewport-height) w-full origin-top overflow-hidden rounded-md border bg-popover text-popover-foreground shadow transition-[width,height] duration-200 ease-(--gentleduck-motion-ease) data-[orientation=vertical]:ms-1.5 data-[orientation=vertical]:mt-0 md:w-(--gentleduck-navigation-menu-viewport-width) ltr:data-[orientation=vertical]:origin-left rtl:data-[orientation=vertical]:origin-right'
