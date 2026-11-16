'use client'

import { cn } from '@gentleduck/libs/cn'
import type { IDirection } from '@gentleduck/primitives/direction'
import { useDirection } from '@gentleduck/primitives/direction'
import { useControllableState } from '@gentleduck/primitives/hooks/use-controllable-state'
import { useLayoutEffect } from '@gentleduck/primitives/hooks/use-layout-effect'
import * as React from 'react'
import { toDirection } from '../direction/direction.libs'

export type TabsOrientation = 'horizontal' | 'vertical'

export interface ITabsContextProps {
  activeItem: string
  dir: IDirection.Kind
  orientation: TabsOrientation
  setActiveItem: React.Dispatch<React.SetStateAction<string>>
  tabsId: string
}

const TabsContext = React.createContext<ITabsContextProps | null>(null)

export function useTabs() {
  const context = React.useContext(TabsContext)
  if (context === null) {
    throw new Error('useTabs must be used within Tabs')
  }
  return context
}

export interface ITabsProps extends Omit<React.HTMLProps<HTMLDivElement>, 'defaultValue' | 'ref'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: TabsOrientation
}

export function useTabsRoot({
  caller,
  defaultValue,
  dir,
  onValueChange,
  orientation = 'horizontal',
  value,
}: Pick<ITabsProps, 'defaultValue' | 'dir' | 'onValueChange' | 'orientation' | 'value'> & { caller: string }) {
  const direction = useDirection(toDirection(dir))
  const [activeItem, setActiveItem] = useControllableState({
    caller,
    defaultProp: defaultValue ?? '',
    onChange: onValueChange,
    prop: value,
  })
  const tabsId = React.useId()
  return React.useMemo<ITabsContextProps>(
    () => ({ activeItem, dir: direction, orientation, setActiveItem, tabsId }),
    [activeItem, direction, orientation, setActiveItem, tabsId],
  )
}

const Tabs = React.forwardRef<HTMLDivElement, ITabsProps>(
  ({ value, defaultValue, onValueChange, orientation, dir, ...props }, ref) => {
    const context = useTabsRoot({ caller: 'Tabs', defaultValue, dir, onValueChange, orientation, value })

    return (
      <TabsContext.Provider value={context}>
        <div {...props} data-orientation={context.orientation} data-slot="tabs" dir={context.dir} ref={ref} />
      </TabsContext.Provider>
    )
  },
)
Tabs.displayName = 'Tabs'

/** Index of the tab a key moves to. Horizontal arrows follow the visual order, so they swap in RTL. */
export function getTabsKeyTarget(
  key: string,
  index: number,
  count: number,
  dir: IDirection.Kind,
  orientation: TabsOrientation = 'horizontal',
): number | null {
  const vertical = orientation === 'vertical'
  const forward = vertical ? 'ArrowDown' : dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const backward = vertical ? 'ArrowUp' : dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
  if (key === forward) return (index + 1) % count
  if (key === backward) return (index - 1 + count) % count
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}

/** Roving focus for a tablist: moves focus to the next enabled tab and selects it. */
export function useTabsListKeyDown(onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>) {
  const { dir, orientation, setActiveItem } = useTabs()
  return (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled):not([aria-disabled="true"])'),
    )
    const index = tabs.indexOf(event.target as HTMLElement)
    if (index === -1) return
    const target = getTabsKeyTarget(event.key, index, tabs.length, dir, orientation)
    const tab = target === null ? undefined : tabs[target]
    if (!tab?.dataset.value) return
    event.preventDefault()
    tab.focus()
    setActiveItem(tab.dataset.value)
  }
}

const TAB = '[role="tab"]'

/** Tab reaches the selected tab or, while none is selected, the first enabled one. */
export function useTabStop(isActive: boolean, forwardedRef: React.ForwardedRef<HTMLButtonElement>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  const [isFirstOfNone, setIsFirstOfNone] = React.useState(false)
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLButtonElement, [])
  // Every trigger renders again when the selection moves, so each one reads its list again after that commit.
  useLayoutEffect(() => {
    const list = ref.current?.closest('[role="tablist"]')
    const first = list?.querySelector(`${TAB}:not(:disabled):not([aria-disabled="true"])`)
    setIsFirstOfNone(first === ref.current && !list?.querySelector(`${TAB}[aria-selected="true"]`))
  })
  return { ref, tabIndex: isActive || isFirstOfNone ? 0 : -1 }
}

export interface ITabsListProps extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'role'> {}

const TabsList = React.forwardRef<HTMLDivElement, ITabsListProps>(({ className, onKeyDown, ...props }, ref) => {
  const { orientation } = useTabs()
  const handleKeyDown = useTabsListKeyDown(onKeyDown)
  return (
    <div
      aria-orientation={orientation}
      className={cn(
        'inline-flex w-fit items-center justify-center gap-2 rounded-md bg-muted p-1 text-muted-foreground',
        orientation === 'vertical' && 'h-fit flex-col items-stretch',
        className,
      )}
      data-orientation={orientation}
      onKeyDown={handleKeyDown}
      ref={ref}
      role="tablist"
      {...props}
      data-slot="tabs-list"
    />
  )
})
TabsList.displayName = 'TabsList'

export interface ITabsTriggerProps extends Omit<React.HTMLProps<HTMLButtonElement>, 'ref' | 'value'> {
  value: string
  defaultChecked?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, ITabsTriggerProps>(
  ({ className, children, defaultChecked, onClick, value, disabled, ...props }, ref) => {
    const { setActiveItem, activeItem, tabsId } = useTabs()
    const isActive = value === activeItem
    const tabStop = useTabStop(isActive, ref)

    React.useEffect(() => {
      if (defaultChecked) setActiveItem(value)
    }, [defaultChecked, setActiveItem, value])

    return (
      <button
        aria-controls={`${tabsId}-content-${value}`}
        aria-selected={isActive}
        className={cn(
          'relative inline-flex h-[29.04px] select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 font-medium text-sm ring-offset-background transition-[color,background-color,border-color,box-shadow] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isActive && 'bg-background text-foreground shadow-sm',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        data-value={value}
        disabled={disabled}
        id={`${tabsId}-trigger-${value}`}
        onClick={(event) => {
          setActiveItem(value)
          onClick?.(event)
        }}
        ref={tabStop.ref}
        role="tab"
        tabIndex={tabStop.tabIndex}
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
    /** Keep the panel mounted from the start, even before its tab is opened. */
    forceMount?: boolean
    /** Mount the panel the first time its tab opens, then keep it mounted so its state survives tab switches. */
    renderOnce?: boolean
  }
>(({ children, forceMount = false, renderOnce = false, className, value, ...props }, ref) => {
  const { activeItem, orientation, tabsId } = useTabs()
  const isActive = activeItem === value
  const [hasOpened, setHasOpened] = React.useState(isActive)
  if (isActive && !hasOpened) setHasOpened(true)
  const shouldRender = forceMount || isActive || (renderOnce && hasOpened)

  return (
    <div
      aria-labelledby={`${tabsId}-trigger-${value}`}
      className={cn(
        'shrink-0 list-none ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        orientation === 'horizontal' && 'mt-2',
        isActive ? 'opacity-100' : 'hidden opacity-0',
        className,
      )}
      data-orientation={orientation}
      data-value={value}
      aria-hidden={!isActive}
      id={`${tabsId}-content-${value}`}
      ref={ref}
      role="tabpanel"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a panel holding nothing focusable is still reached with Tab, as the ARIA tabs pattern asks
      tabIndex={0}
      {...props}
      data-slot="tabs-content">
      {shouldRender && children}
    </div>
  )
})
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsContent, TabsContext, TabsList, TabsTrigger }
