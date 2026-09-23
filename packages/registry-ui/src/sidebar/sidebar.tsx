'use client'

import { useIsMobile } from '@gentleduck/hooks/use-is-mobile'
import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import { Slot } from '@gentleduck/primitives/slot'
import type { Variants } from '@gentleduck/variants'
import { useKeyBind } from '@gentleduck/vim/react'
import { PanelLeftIcon } from 'lucide-react'
import * as React from 'react'
import { Button } from '../button'
import { toDirection } from '../direction/direction.libs'
import { Input } from '../input'
import { Separator } from '../separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../sheet'
import { Skeleton } from '../skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import {
  persistSidebarOpen,
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_WIDTH_MOBILE,
  sidebarMenuButtonVariants,
} from './sidebar.constants'
import { SidebarContext, useSidebar } from './sidebar.hooks'
import type { ISidebarContextProps, ISidebarProps, ISidebarProviderProps } from './sidebar.types'

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  dir,
  children,
  ...props
}: ISidebarProviderProps) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const direction = useDirection(toDirection(dir))

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = openProp ?? internalOpen

  // Latest-value refs keep `setOpen`/`toggleSidebar` stable so context only invalidates on real shape changes.
  const openRef = React.useRef(open)
  openRef.current = open
  const setOpenPropRef = React.useRef(setOpenProp)
  setOpenPropRef.current = setOpenProp
  const isMobileRef = React.useRef(isMobile)
  isMobileRef.current = isMobile

  const setOpen = React.useCallback((value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === 'function' ? value(openRef.current) : value
    const setProp = setOpenPropRef.current
    if (setProp) {
      setProp(openState)
    } else {
      setInternalOpen(openState)
    }
    // Persist so SSR can read initial state on next visit.
    persistSidebarOpen(openState)
  }, [])

  const toggleSidebar = React.useCallback(() => {
    return isMobileRef.current ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [setOpen])

  useKeyBind(`mod+${SIDEBAR_KEYBOARD_SHORTCUT}`, toggleSidebar, { preventDefault: true })

  const state = open ? 'expanded' : 'collapsed'

  const contextValue = React.useMemo<ISidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      dir: direction,
    }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar, direction],
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        dir={direction}
        className={cn('group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar', className)}
        {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}
SidebarProvider.displayName = 'SidebarProvider'

const Sidebar = React.forwardRef<HTMLDivElement, ISidebarProps>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      children,
      dir,
      mobileTitle = 'Sidebar',
      mobileDescription = 'Displays the mobile sidebar.',
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
    const direction = useDirection(toDirection(dir))

    if (collapsible === 'none') {
      return (
        <div
          ref={ref}
          dir={direction}
          data-slot="sidebar"
          className={cn('flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground', className)}
          {...props}>
          {children}
        </div>
      )
    }

    if (isMobile) {
      return (
        <Sheet dir={direction} open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            dir={direction}
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}>
            <SheetHeader className="sr-only">
              <SheetTitle>{mobileTitle}</SheetTitle>
              <SheetDescription>{mobileDescription}</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        dir={direction}
        className="group peer hidden text-sidebar-foreground md:block"
        data-state={state}
        data-collapsible={state === 'collapsed' ? collapsible : ''}
        data-variant={variant}
        data-side={side}
        data-slot="sidebar">
        {/* Spacer that holds the layout width while the actual sidebar is fixed-positioned */}
        <div
          data-slot="sidebar-gap"
          className={cn(
            'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
            'group-data-[collapsible=offcanvas]:w-0',
            variant === 'floating' || variant === 'inset'
              ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
              : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
          )}
        />
        <div
          data-slot="sidebar-container"
          data-side={side}
          className={cn(
            'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=right]:right-0 data-[side=left]:left-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] md:flex',
            variant === 'floating' || variant === 'inset'
              ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
              : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
            className,
          )}
          {...props}>
          <div
            data-sidebar="sidebar"
            data-slot="sidebar-inner"
            className="flex size-full flex-col overflow-hidden bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border">
            {children}
          </div>
        </div>
      </div>
    )
  },
)
Sidebar.displayName = 'Sidebar'

// Hoisted constant prevents re-allocating the default trigger icon on every
// render — saves an element allocation per `SidebarTrigger`.
const DEFAULT_TRIGGER_ICON = <PanelLeftIcon aria-hidden="true" className="rtl:-scale-x-100" />

const SidebarTrigger = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & { text?: string }
>(({ className, icon, onClick, text = 'Toggle Sidebar', ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  const direction = useDirection()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      dir={direction}
      icon={icon === undefined ? DEFAULT_TRIGGER_ICON : icon}
      className={cn(className)}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}>
      <span className="sr-only">{text}</span>
    </Button>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'> & { text?: string }>(
  ({ className, text = 'Toggle Sidebar', ...props }, ref) => {
    const { toggleSidebar } = useSidebar()
    const direction = useDirection()

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        data-slot="sidebar-rail"
        aria-label={text}
        tabIndex={-1}
        onClick={toggleSidebar}
        dir={direction}
        className={cn(
          'absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear after:absolute after:inset-y-0 after:start-1/2 after:w-0.5 hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2',
          'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
          '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
          'group-data-[collapsible=offcanvas]:translate-x-0 hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:after:left-full',
          '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
          '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarRail.displayName = 'SidebarRail'

const SidebarInset = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'main'>>(
  ({ className, ...props }, ref) => {
    const direction = useDirection()

    return (
      <main
        ref={ref}
        data-slot="sidebar-inset"
        dir={direction}
        className={cn(
          'relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ms-2 md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ms-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarInset.displayName = 'SidebarInset'

const SidebarInput = React.forwardRef<React.ComponentRef<typeof Input>, React.ComponentPropsWithoutRef<typeof Input>>(
  ({ className, ...props }, ref) => {
    const direction = useDirection()

    return (
      <Input
        ref={ref}
        data-slot="sidebar-input"
        data-sidebar="input"
        dir={direction}
        className={cn('h-8 w-full bg-background shadow-none', className)}
        {...props}
      />
    )
  },
)
SidebarInput.displayName = 'SidebarInput'

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const direction = useDirection()

    return (
      <div
        ref={ref}
        data-slot="sidebar-header"
        data-sidebar="header"
        dir={direction}
        className={cn('flex flex-col gap-2 p-2', className)}
        {...props}
      />
    )
  },
)
SidebarHeader.displayName = 'SidebarHeader'

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const direction = useDirection()

    return (
      <div
        ref={ref}
        data-slot="sidebar-footer"
        data-sidebar="footer"
        dir={direction}
        className={cn('flex flex-col gap-2 p-2', className)}
        {...props}
      />
    )
  },
)
SidebarFooter.displayName = 'SidebarFooter'

const SidebarSeparator = React.forwardRef<
  React.ComponentRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => {
  const direction = useDirection()

  return (
    <Separator
      ref={ref}
      data-slot="sidebar-separator"
      data-sidebar="separator"
      dir={direction}
      className={cn('mx-2 w-auto bg-sidebar-border', className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = 'SidebarSeparator'

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'> & { noScroll?: boolean }>(
  ({ className, noScroll = true, ...props }, ref) => {
    const direction = useDirection()

    return (
      <div
        ref={ref}
        data-slot="sidebar-content"
        data-sidebar="content"
        dir={direction}
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
          noScroll && 'no-scrollbar',
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarContent.displayName = 'SidebarContent'

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const direction = useDirection()

    return (
      <div
        ref={ref}
        data-slot="sidebar-group"
        data-sidebar="group"
        dir={direction}
        className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
        {...props}
      />
    )
  },
)
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  const direction = useDirection()

  return (
    <Comp
      ref={ref}
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      dir={direction}
      className={cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground/70 text-xs outline-hidden ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg:not([class*=size-])]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  const direction = useDirection()

  return (
    <Comp
      ref={ref}
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      dir={direction}
      className={cn(
        'absolute end-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-data-[collapsible=icon]:hidden md:after:hidden [&>svg:not([class*=size-])]:size-4 [&>svg]:shrink-0',
        className,
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = 'SidebarGroupAction'

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const direction = useDirection()

    return (
      <div
        ref={ref}
        data-slot="sidebar-group-content"
        data-sidebar="group-content"
        dir={direction}
        className={cn('w-full text-sm', className)}
        {...props}
      />
    )
  },
)
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<'ul'>>(
  ({ className, ...props }, ref) => {
    const direction = useDirection()

    return (
      <ul
        ref={ref}
        data-slot="sidebar-menu"
        data-sidebar="menu"
        dir={direction}
        className={cn('flex w-full min-w-0 flex-col gap-0', className)}
        {...props}
      />
    )
  },
)
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      <li
        ref={ref}
        data-slot="sidebar-menu-item"
        dir={direction}
        data-sidebar="menu-item"
        className={cn('group/menu-item relative focus-within:z-10 has-aria-disabled:cursor-not-allowed', className)}
        {...props}
      />
    )
  },
)
SidebarMenuItem.displayName = 'SidebarMenuItem'

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & Variants.VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    { asChild = false, isActive = false, variant = 'default', size = 'default', tooltip, dir, className, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const { isMobile, state } = useSidebar()
    const direction = useDirection(toDirection(dir))
    const fallbackTooltipSide = direction === 'rtl' ? 'left' : 'right'

    const button = (
      <Comp
        ref={ref}
        data-slot="sidebar-menu-button"
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive || undefined}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    )

    if (!tooltip) {
      return button
    }

    const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip

    return (
      <Tooltip dir={direction}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side={fallbackTooltipSide}
          align="center"
          hidden={state !== 'collapsed' || isMobile}
          {...tooltipProps}
        />
      </Tooltip>
    )
  },
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  const direction = useDirection()

  return (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      dir={direction}
      className={cn(
        'absolute end-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 md:after:hidden [&>svg:not([class*=size-])]:size-4 [&>svg]:shrink-0',
        showOnHover &&
          'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 aria-expanded:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground md:opacity-0',
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = 'SidebarMenuAction'

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const direction = useDirection()

    return (
      <div
        ref={ref}
        data-slot="sidebar-menu-badge"
        data-sidebar="menu-badge"
        dir={direction}
        className={cn(
          'pointer-events-none absolute end-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 font-medium text-sidebar-foreground text-xs tabular-nums peer-hover/menu-button:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-sidebar-accent-foreground',
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

// SSR-safe widths cycled by `index` (or falling back to the configurable
// `width` prop). Math.random() previously produced hydration mismatches
// since server and client picked different numbers.
const SKELETON_WIDTHS = ['50%', '60%', '70%', '80%', '90%']

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { showIcon?: boolean; index?: number; width?: string }
>(({ className, showIcon = false, index = 0, width, ...props }, ref) => {
  const direction = useDirection()
  const resolvedWidth = width ?? SKELETON_WIDTHS[index % SKELETON_WIDTHS.length]

  return (
    <div
      ref={ref}
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      dir={direction}
      className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)}
      {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': resolvedWidth,
          } as React.CSSProperties
        }
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton'

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<'ul'>>(
  ({ className, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))

    return (
      <ul
        ref={ref}
        data-slot="sidebar-menu-sub"
        data-sidebar="menu-sub"
        dir={direction}
        className={cn(
          'mx-3.5 flex min-w-0 flex-col gap-1 border-sidebar-border border-s px-2.5 py-0.5 group-data-[collapsible=icon]:hidden ltr:translate-x-px rtl:-translate-x-px',
          className,
        )}
        {...props}
      />
    )
  },
)
SidebarMenuSub.displayName = 'SidebarMenuSub'

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    return (
      <li
        ref={ref}
        data-slot="sidebar-menu-sub-item"
        data-sidebar="menu-sub-item"
        dir={direction}
        className={cn('group/menu-sub-item relative focus-within:z-10 has-aria-disabled:cursor-not-allowed', className)}
        {...props}
      />
    )
  },
)
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean
    size?: 'sm' | 'md'
    isActive?: boolean
  }
>(({ asChild = false, size = 'md', isActive = false, className, dir, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'
  const direction = useDirection(toDirection(dir))

  return (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive || undefined}
      dir={direction}
      className={cn(
        'flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-hidden ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-sidebar-accent data-[size=md]:text-sm data-[size=sm]:text-xs data-active:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden ltr:-translate-x-px rtl:translate-x-px [&>span:last-child]:truncate [&>svg:not([class*=size-])]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
}
