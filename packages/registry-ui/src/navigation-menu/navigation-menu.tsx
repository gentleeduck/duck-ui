import { cn } from '@gentleduck/libs/cn'
import * as NavigationMenuPrimitive from '@gentleduck/primitives/navigation-menu'
import { cva } from '@gentleduck/variants'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'
import {
  navigationMenuStyle,
  navigationMenuViewportPositionStyle,
  navigationMenuViewportStyle,
} from './navigation-menu.constants'

export type NavigationMenuListProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
export type NavigationMenuItemProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>
export type NavigationMenuTriggerProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
export type NavigationMenuContentProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
export type NavigationMenuViewportProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
export type NavigationMenuLinkProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link>
export type NavigationMenuIndicatorProps = React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>

const NavigationMenu = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> & {
    viewport?: boolean
  }
>(({ className, children, viewport = true, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(navigationMenuStyle, className)}
    data-viewport={viewport}
    {...props}>
    {children}
    {viewport && <NavigationMenuViewport />}
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.List
      ref={ref}
      className={cn(
        'group flex flex-1 list-none items-center justify-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className,
      )}
      {...props}
    />
  ),
)
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Item ref={ref} className={cn('relative', className)} {...props} />
))
NavigationMenuItem.displayName = NavigationMenuPrimitive.Item.displayName

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm outline-hidden transition-[color,background-color,border-color,box-shadow] hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:hover:bg-accent group-data-[orientation=vertical]/navigation-menu:w-full group-data-[orientation=vertical]/navigation-menu:justify-between',
)

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Trigger ref={ref} className={cn(navigationMenuTriggerStyle(), className)} {...props}>
      {children}
      <ChevronDown
        aria-hidden="true"
        className="relative top-[1px] ms-1 size-4 transition-transform duration-200 ease-(--gentleduck-motion-ease) group-data-[orientation=horizontal]/navigation-menu:group-data-[state=open]:rotate-180 ltr:group-data-[orientation=vertical]/navigation-menu:-rotate-90 rtl:group-data-[orientation=vertical]/navigation-menu:rotate-90"
      />
    </NavigationMenuPrimitive.Trigger>
  ),
)
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        'data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[orientation=horizontal]:data-[motion=from-end]:slide-in-from-right-52 data-[orientation=horizontal]:data-[motion=from-start]:slide-in-from-left-52 data-[orientation=horizontal]:data-[motion=to-end]:slide-out-to-right-52 data-[orientation=horizontal]:data-[motion=to-start]:slide-out-to-left-52 data-[orientation=vertical]:data-[motion=from-end]:slide-in-from-bottom-52 data-[orientation=vertical]:data-[motion=from-start]:slide-in-from-top-52 data-[orientation=vertical]:data-[motion=to-end]:slide-out-to-bottom-52 data-[orientation=vertical]:data-[motion=to-start]:slide-out-to-top-52 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 start-0 top-0 w-full p-2 pe-2.5 data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out **:data-[slot=navigation-menu-link]:focus:outline-hidden **:data-[slot=navigation-menu-link]:focus:ring-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:data-[orientation=vertical]:start-full group-data-[viewport=false]/navigation-menu:data-[orientation=vertical]:top-0 group-data-[viewport=false]/navigation-menu:data-[orientation=vertical]:ms-1.5 group-data-[viewport=false]/navigation-menu:data-[orientation=vertical]:mt-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in md:absolute md:w-auto',
        'animation-duration-200 group-data-[viewport=false]/navigation-menu:data-[state=closed]:animation-duration-150 ease-(--gentleduck-motion-ease)',
        className,
      )}
      {...props}
    />
  ),
)
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  ({ className, ...props }, ref) => (
    <div className={navigationMenuViewportPositionStyle}>
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        className={cn(
          navigationMenuViewportStyle,
          'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=open]:animate-in',
          'animation-duration-200 data-[state=closed]:animation-duration-150',
          className,
        )}
        {...props}
      />
    </div>
  ),
)
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Link
      ref={ref}
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-hidden transition-[color,background-color,border-color,box-shadow] hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-active:bg-accent/50 data-active:text-accent-foreground data-active:focus:bg-accent data-active:hover:bg-accent [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
)
NavigationMenuLink.displayName = NavigationMenuPrimitive.Link.displayName

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  ({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
      className={cn(
        'group/indicator data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[orientation=vertical]:start-full data-[orientation=vertical]:w-1.5 data-[state=hidden]:animate-out data-[state=visible]:animate-in data-[orientation=vertical]:items-center data-[orientation=vertical]:justify-end',
        'animation-duration-200 data-[state=hidden]:animation-duration-150 ease-(--gentleduck-motion-ease)',
        className,
      )}
      {...props}>
      <div className="relative top-[60%] size-2 rotate-45 rounded-tl-sm bg-border shadow-md group-data-[orientation=vertical]/indicator:start-[60%] group-data-[orientation=vertical]/indicator:top-0 group-data-[orientation=vertical]/indicator:rounded-tl-none ltr:group-data-[orientation=vertical]/indicator:rounded-bl-sm rtl:group-data-[orientation=vertical]/indicator:rounded-tr-sm" />
    </NavigationMenuPrimitive.Indicator>
  ),
)
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
