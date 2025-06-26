'use client'

import { cn } from '@gentleduck/libs/cn'
import * as React from 'react'

export function useTabs() {
  const context = React.useContext(TabsContext)
  if (context === null) {
    throw new Error('useTabs must be used within a TabsList')
  }
  return context
}

export interface TabsContextProps {
  activeItem: string
  setActiveItem: React.Dispatch<React.SetStateAction<string>>
}

const TabsContext = React.createContext<TabsContextProps | null>(null)

export interface TabsProps extends React.HTMLProps<HTMLDivElement> {
  listValues: string[]
}

// TODO: add the orientation for horizontal
function Tabs({ listValues, ...props }: TabsProps) {
  if (!listValues) throw Error('listValues is required')
  const [activeItem, setActiveItem] = React.useState<string>(listValues[0] ?? '')
  return (
    <TabsContext.Provider value={{ activeItem, setActiveItem }}>
      <div {...props} duck-tabs="" role="tablist" aria-orientation="vertical" />
    </TabsContext.Provider>
  )
}

export interface TabsListProps extends React.HTMLProps<HTMLUListElement> {}
const TabsList = ({ className, ref, ...props }: TabsListProps) => (
  <ul
    ref={ref}
    role="tablist"
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-md bg-muted p-1 text-muted-foreground',
      className,
    )}
    {...props}
    duck-tabs-list=""
  />
)

export interface TabsTriggerProps extends React.HTMLProps<HTMLLIElement> {
  value: string
  defaultChecked?: boolean
}

const TabsTrigger = ({ className, children, defaultChecked, onClick, value, ref, ...props }: TabsTriggerProps) => {
  const { setActiveItem, activeItem } = useTabs()
  const isActive = value === activeItem

  return (
    <li
      ref={ref}
      data-value={value}
      aria-selected={isActive}
      role="tab"
      id={`tab-${value}`}
      aria-controls={`panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 has-checked:bg-background has-checked:text-foreground has-checked:shadow',
        className,
      )}
      {...props}
      duck-tabs-trigger="">
      <input
        id={value}
        type="radio"
        name="tab"
        value={value}
        className="absolute inset-0 appearance-none"
        onChange={() => setActiveItem(value)}
        checked={isActive}
        defaultChecked={defaultChecked}
        aria-hidden
      />
      <label htmlFor={value}>{children}</label>
    </li>
  )
}

export interface TabsContentProps extends React.HTMLProps<HTMLDivElement> {
  value: string
}

const TabsContent = ({ className, value, ref, ...props }: TabsContentProps) => {
  const { activeItem } = useTabs()
  const [shouldRender, setShouldRender] = React.useState(false)

  // TODO: use the RenderOnce Component.
  React.useEffect(() => {
    if (activeItem === value) setShouldRender(true)
  }, [activeItem])

  return shouldRender ? (
    <div
      ref={ref}
      data-value={value}
      id={`panel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      hidden={activeItem !== value}
      className={cn(
        'mt-2 list-none ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        activeItem === value ? 'block' : 'hidden',
        className,
      )}
      {...props}
      duck-tabs-content=""
    />
  ) : null
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
