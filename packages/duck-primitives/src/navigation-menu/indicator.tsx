import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Presence } from '../presence'
import { Primitive } from '../primitive-elements'
import { useNavigationMenuContext } from './navigation-menu'
import { useResizeObserver } from './navigation-menu.libs'
import type { INavigationMenu } from './navigation-menu.types'

const INDICATOR_NAME = 'NavigationMenuIndicator'

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, INavigationMenu.IIndicatorProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.IIndicatorProps>, forwardedRef) => {
    const { forceMount, ...indicatorProps } = props
    const context = useNavigationMenuContext(INDICATOR_NAME, props.__scopeNavigationMenu)
    const isVisible = Boolean(context.value)

    return context.indicatorTrack
      ? ReactDOM.createPortal(
          <Presence present={forceMount || isVisible}>
            <NavigationMenuIndicatorImpl {...indicatorProps} ref={forwardedRef} />
          </Presence>,
          context.indicatorTrack,
        )
      : null
  },
)

NavigationMenuIndicator.displayName = INDICATOR_NAME

const NavigationMenuIndicatorImpl = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>((props: INavigationMenu.IScoped<React.ComponentPropsWithoutRef<typeof Primitive.div>>, forwardedRef) => {
  const { __scopeNavigationMenu, ...indicatorProps } = props
  const context = useNavigationMenuContext(INDICATOR_NAME, __scopeNavigationMenu)
  const [activeTrigger, setActiveTrigger] = React.useState<INavigationMenu.TriggerElement | null>(null)
  const [position, setPosition] = React.useState<{ size: number; offset: number } | null>(null)
  const isHorizontal = context.orientation === 'horizontal'
  const isVisible = Boolean(context.value)

  React.useEffect(() => {
    const triggerNode = [...context.triggers].find((trigger) => trigger.value === context.value)?.ref.current
    if (triggerNode) setActiveTrigger(triggerNode)
  }, [context.triggers, context.value])

  const handlePositionChange = () => {
    if (activeTrigger) {
      // A positioned item around the trigger is its offset parent, so the offsets are added up to the track.
      let offset = 0
      for (let node: Element | null = activeTrigger; node instanceof HTMLElement && node !== context.indicatorTrack; ) {
        offset += isHorizontal ? node.offsetLeft : node.offsetTop
        node = node.offsetParent
      }
      setPosition({ size: isHorizontal ? activeTrigger.offsetWidth : activeTrigger.offsetHeight, offset })
    }
  }
  useResizeObserver(activeTrigger, handlePositionChange)
  useResizeObserver(context.indicatorTrack, handlePositionChange)

  // wait for measured position before first paint so the indicator snaps in
  // rather than transitioning from a default (0,0) origin
  return position ? (
    <Primitive.div
      data-slot="navigation-menu-indicator"
      aria-hidden
      data-state={isVisible ? 'visible' : 'hidden'}
      data-orientation={context.orientation}
      {...indicatorProps}
      ref={forwardedRef}
      style={{
        position: 'absolute',
        ...(isHorizontal
          ? {
              left: 0,
              width: `${position.size}px`,
              transform: `translateX(${position.offset}px)`,
            }
          : {
              top: 0,
              height: `${position.size}px`,
              transform: `translateY(${position.offset}px)`,
            }),
        ...indicatorProps.style,
      }}
    />
  ) : null
})

NavigationMenuIndicatorImpl.displayName = 'NavigationMenuIndicatorImpl'

export { NavigationMenuIndicator }
