import { cn } from '@gentleduck/libs/cn'
import * as NavigationMenuPrimitive from '@gentleduck/primitives/navigation-menu'
import { cva } from '@gentleduck/variants'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

export type NavigationMenuListProps = React.HTMLAttributes<HTMLUListElement>
export interface NavigationMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  value?: string
}
export type NavigationMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>
export interface NavigationMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: true
}
export interface NavigationMenuViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: true
}
export interface NavigationMenuLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onSelect'> {
  active?: boolean
  asChild?: boolean
  onSelect?: (event: Event) => void
}
export interface NavigationMenuIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: true
}

const NavigationMenu = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> & {
    viewport?: boolean
  }
>(({ className, children, viewport = true, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn('group/navigation-menu relative flex max-w-max flex-1 items-center justify-center', className)}
    data-slot="navigation-menu"
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
      className={cn('group flex flex-1 list-none items-center justify-center gap-1', className)}
      data-slot="navigation-menu-list"
      {...props}
    />
  ),
)
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Item
    ref={ref}
    className={cn('relative', className)}
    data-slot="navigation-menu-item"
    {...props}
  />
))
NavigationMenuItem.displayName = NavigationMenuPrimitive.Item.displayName

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 font-medium text-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:hover:bg-accent',
)

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      className={cn(navigationMenuTriggerStyle(), 'group', className)}
      data-slot="navigation-menu-trigger"
      {...props}>
      {children}
      <ChevronDown
        aria-hidden="true"
        className="relative top-[1px] ms-1 size-4 transition duration-300 group-data-[state=open]:rotate-180"
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
        'data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 start-0 top-0 w-full p-2 pe-2.5 data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out **:data-[slot=navigation-menu-link]:focus:outline-none **:data-[slot=navigation-menu-link]:focus:ring-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in md:absolute md:w-auto',
        'transition-all transition-discrete duration-[200ms,150ms] ease-(--gentleduck-motion-ease)',
        className,
      )}
      data-slot="navigation-menu-content"
      {...props}
    />
  ),
)
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  ({ className, ...props }, ref) => (
    <div className={cn('absolute start-0 top-full isolate flex justify-center')}>
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        className={cn(
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full origin-top-center overflow-hidden rounded-md border bg-popover text-popover-foreground shadow data-[state=closed]:animate-out data-[state=open]:animate-in md:w-(--radix-navigation-menu-viewport-width)',
          'transition-all transition-discrete duration-[200ms,150ms] ease-(--gentleduck-motion-ease)',
          className,
        )}
        data-slot="navigation-menu-viewport"
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
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      data-slot="navigation-menu-link"
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
        'data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=visible]:animate-in',
        className,
      )}
      data-slot="navigation-menu-indicator"
      {...props}>
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
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
