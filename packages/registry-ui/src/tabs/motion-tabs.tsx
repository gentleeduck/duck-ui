'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomMax } from '@gentleduck/motion/motion-features'
import { blurLight } from '@gentleduck/motion/transitions/blur'
import { springSmooth } from '@gentleduck/motion/transitions/springs'
import { shakeKeyframes, tweenExpand, tweenShake } from '@gentleduck/motion/transitions/tweens'
import { AnimatePresence, LayoutGroup, LazyMotion, m } from 'motion/react'
import * as React from 'react'
import {
  type ITabsListProps,
  type ITabsProps,
  type ITabsTriggerProps,
  TabsContext,
  useDefaultChecked,
  useTabStop,
  useTabs,
  useTabsListKeyDown,
  useTabsRoot,
} from './tabs'

const BLUR = `blur(${blurLight}px)`
interface ISlide {
  vertical: boolean
  step: number
}

const offset = ({ vertical, step }: ISlide) => (vertical ? { y: `${step * 8}%` } : { x: `${step * 8}%` })
const MOTION_TABS_VARIANTS = {
  enter: (slide: ISlide) => ({ opacity: 0, ...offset(slide), scale: 0.98, filter: BLUR }),
  center: { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: (slide: ISlide) => ({ opacity: 0, ...offset({ ...slide, step: -slide.step }), scale: 0.98, filter: BLUR }),
} as const

interface IMotionTabsContext {
  slide: ISlide
  registerTrigger: (value: string) => void
}

const MotionTabsContext = React.createContext<IMotionTabsContext | null>(null)

function useMotionTabs() {
  const context = React.useContext(MotionTabsContext)
  if (context === null) {
    throw new Error('MotionTabs parts must be used within MotionTabs')
  }
  return context
}

const MotionTabs = React.forwardRef<HTMLDivElement, ITabsProps>(
  ({ value, defaultValue, onValueChange, orientation, dir, children, ...props }, ref) => {
    const tabs = useTabsRoot({ caller: 'MotionTabs', defaultValue, dir, onValueChange, orientation, value })
    const orderRef = React.useRef<string[]>([])
    const registerTrigger = React.useCallback((trigger: string) => {
      if (!orderRef.current.includes(trigger)) orderRef.current.push(trigger)
    }, [])

    // Worked out while rendering, so a value set from outside slides the right way too.
    const [slide, setSlide] = React.useState({ from: tabs.activeItem, step: 1 })
    if (slide.from !== tabs.activeItem) {
      const before = orderRef.current.indexOf(slide.from)
      const after = orderRef.current.indexOf(tabs.activeItem)
      setSlide({ from: tabs.activeItem, step: before === -1 || after === -1 ? slide.step : after > before ? 1 : -1 })
    }
    const vertical = tabs.orientation === 'vertical'
    // Later tabs sit on the left in RTL, so content slides in from the opposite side. A column reads down either way.
    const step = tabs.dir === 'rtl' && !vertical ? -slide.step : slide.step
    const motion = React.useMemo(
      () => ({ slide: { vertical, step }, registerTrigger }),
      [vertical, step, registerTrigger],
    )

    return (
      <TabsContext.Provider value={tabs}>
        <MotionTabsContext.Provider value={motion}>
          <LazyMotion features={loadDomMax}>
            <div {...props} data-orientation={tabs.orientation} data-slot="tabs" dir={tabs.dir} ref={ref}>
              {children}
            </div>
          </LazyMotion>
        </MotionTabsContext.Provider>
      </TabsContext.Provider>
    )
  },
)
MotionTabs.displayName = 'MotionTabs'

const MotionTabsList = React.forwardRef<HTMLDivElement, ITabsListProps>(({ className, onKeyDown, ...props }, ref) => {
  const { orientation, tabsId } = useTabs()
  const handleKeyDown = useTabsListKeyDown(onKeyDown)
  return (
    <LayoutGroup id={`tabs-${tabsId}`}>
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
    </LayoutGroup>
  )
})
MotionTabsList.displayName = 'MotionTabsList'

const MotionTabsTrigger = React.forwardRef<
  HTMLButtonElement,
  Omit<ITabsTriggerProps, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
>(({ className, children, defaultChecked, onClick, value, disabled, ...props }, ref) => {
  const { setActiveItem, activeItem, tabsId } = useTabs()
  const { registerTrigger } = useMotionTabs()
  const isActive = value === activeItem
  const tabStop = useTabStop(isActive, ref)
  const [shake, setShake] = React.useState(false)

  registerTrigger(value)
  useDefaultChecked(defaultChecked, value)

  return (
    <m.button
      aria-controls={`${tabsId}-content-${value}`}
      aria-selected={isActive}
      aria-disabled={disabled || undefined}
      animate={shake ? { x: shakeKeyframes } : { x: 0 }}
      transition={shake ? tweenShake : undefined}
      onAnimationComplete={() => shake && setShake(false)}
      className={cn(
        'relative inline-flex h-[29.04px] items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 font-medium text-sm ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      data-value={value}
      id={`${tabsId}-trigger-${value}`}
      onClick={(event) => {
        if (disabled) {
          setShake(true)
          return
        }
        setActiveItem(value)
        onClick?.(event)
      }}
      ref={tabStop.ref}
      role="tab"
      tabIndex={tabStop.tabIndex}
      {...props}
      type="button"
      data-slot="tabs-trigger">
      {isActive && (
        <m.span
          layoutId={`tab-indicator-${tabsId}`}
          className="absolute inset-0 rounded-[inherit] bg-background shadow-sm"
          transition={springSmooth}
        />
      )}
      <span className={cn('relative z-10', isActive ? 'text-foreground' : 'text-muted-foreground')}>{children}</span>
    </m.button>
  )
})
MotionTabsTrigger.displayName = 'MotionTabsTrigger'

const MotionTabsContents = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
>(({ children, className, ...props }, ref) => {
  const { slide } = useMotionTabs()
  const { activeItem, orientation } = useTabs()
  const [height, setHeight] = React.useState<number>()
  const [panel, setPanel] = React.useState<HTMLDivElement | null>(null)
  // A panel sliding out reports null as it leaves, after the next one has already reported itself.
  const track = React.useCallback((node: HTMLDivElement | null) => {
    if (node) setPanel(node)
  }, [])

  React.useEffect(() => {
    if (!panel || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setHeight(panel.offsetHeight))
    observer.observe(panel)
    return () => observer.disconnect()
  }, [panel])

  const activeChild = React.Children.toArray(children).find(
    (child) => React.isValidElement<{ value?: string }>(child) && child.props.value === activeItem,
  )

  return (
    <m.div
      ref={ref}
      animate={{ height: height ?? 'auto' }}
      transition={tweenExpand}
      className={cn('relative overflow-hidden', orientation === 'horizontal' && 'mt-2', className)}
      {...props}
      data-slot="tabs-contents">
      <AnimatePresence mode="popLayout" initial={false} custom={slide}>
        {activeChild ? (
          <m.div
            key={activeItem}
            ref={track}
            custom={slide}
            variants={MOTION_TABS_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={springSmooth}>
            {activeChild}
          </m.div>
        ) : null}
      </AnimatePresence>
    </m.div>
  )
})
MotionTabsContents.displayName = 'MotionTabsContents'

const MotionTabsContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLProps<HTMLDivElement>, 'ref'> & { value: string }
>(({ children, className, value, ...props }, ref) => {
  const { tabsId } = useTabs()

  return (
    <div
      ref={ref}
      aria-labelledby={`${tabsId}-trigger-${value}`}
      className={cn(
        'shrink-0 list-none ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      data-value={value}
      id={`${tabsId}-content-${value}`}
      role="tabpanel"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a panel holding nothing focusable is still reached with Tab, as the ARIA tabs pattern asks
      tabIndex={0}
      {...props}>
      {children}
    </div>
  )
})
MotionTabsContent.displayName = 'MotionTabsContent'

export { MotionTabs, MotionTabsContent, MotionTabsContents, MotionTabsList, MotionTabsTrigger }
