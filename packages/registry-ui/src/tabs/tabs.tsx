'use client'

import { cn } from '@gentleduck/libs/cn'
import { useDirection } from '@gentleduck/primitives/direction'
import { MountMinimal } from '@gentleduck/primitives/mount'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

export interface ITabsContextProps {
  activeItem: string
  setActiveItem: React.Dispatch<React.SetStateAction<string>>
  tabsId: string
}

const TabsContext = React.createContext<ITabsContextProps | null>(null)

export function useTabs() {
  const context = React.useContext(TabsContext)
  if (context === null) {
    throw new Error('useTabs must be used within a TabsList')
  }
  return context
}

export interface ITabsProps extends Omit<React.HTMLProps<HTMLDivElement>, 'defaultValue' | 'ref'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, ITabsProps>(
  ({ value, defaultValue, onValueChange, dir, ...props }, ref) => {
    const direction = useDirection(toDirection(dir))
    const [activeItem, setActiveItem] = React.useState<string>(defaultValue ?? value ?? '')
    const tabsId = React.useId()

    React.useEffect(() => {
      if (onValueChange) onValueChange(activeItem)
    }, [activeItem, onValueChange])

    return (
      <TabsContext.Provider value={{ activeItem, setActiveItem, tabsId }}>
        <div {...props} data-slot="tabs" dir={direction} ref={ref} />
      </TabsContext.Provider>
    )
  },
)
Tabs.displayName = 'Tabs'

export interface ITabsListProps extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'role'> {}

const TabsList = React.forwardRef<HTMLDivElement, ITabsListProps>(({ className, ...props }, ref) => (
  <div
    className={cn(
      'inline-flex w-fit items-center justify-center gap-2 rounded-md bg-muted p-1 text-muted-foreground',
      className,
    )}
    ref={ref}
    role="tablist"
    {...props}
    data-slot="tabs-list"
  />
))
TabsList.displayName = 'TabsList'

export interface ITabsTriggerProps extends Omit<React.HTMLProps<HTMLButtonElement>, 'ref' | 'value'> {
  value: string
  defaultChecked?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, ITabsTriggerProps>(
  ({ className, children, defaultChecked, onClick, value, disabled, ...props }, ref) => {
    const { setActiveItem, activeItem, tabsId } = useTabs()
    const isActive = value === activeItem

    React.useEffect(() => {
      if (defaultChecked) setActiveItem(value)
    }, [defaultChecked, setActiveItem, value])

    return (
      <button
        aria-controls={`${tabsId}-content-${value}`}
        aria-selected={isActive}
        className={cn(
          'relative inline-flex h-[29.04px] select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive && 'bg-background text-foreground shadow-sm',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        data-value={value}
        disabled={disabled}
        id={`${tabsId}-trigger-${value}`}
        onClick={(e) => {
          setActiveItem(value)
          onClick?.(e as React.MouseEvent<HTMLButtonElement>)
        }}
        ref={ref}
        role="tab"
        tabIndex={isActive ? 0 : -1}
        {...props}
        type="button"
        data-slot="tabs-trigger">
        {children}
      </button>
    )
  },
)
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLProps<HTMLDivElement>, 'ref'> & {
    value: string
    forceMount?: boolean
  }
>(({ children, forceMount = false, className, value, ...props }, ref) => {
  const { activeItem, tabsId } = useTabs()
  const localRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      aria-labelledby={`${tabsId}-trigger-${value}`}
      className={cn(
        'mt-2 shrink-0 list-none ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        activeItem === value ? 'opacity-100' : 'hidden opacity-0',
        className,
      )}
      data-value={value}
      aria-hidden={activeItem !== value}
      id={`${tabsId}-content-${value}`}
      ref={(node) => {
        ;(localRef as React.RefObject<HTMLDivElement | null>).current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      }}
      role="tabpanel"
      tabIndex={-1}
      {...props}
      data-slot="tabs-content">
      <MountMinimal forceMount={forceMount} open={activeItem === value} ref={null}>
        {children}
      </MountMinimal>
    </div>
  )
})
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsContent, TabsContext, TabsList, TabsTrigger }
