import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { composeRefs, useComposedRefs } from '../libs/compose-ref'
import { Presence } from '../presence'
import { Primitive } from '../primitive-elements'
import { createSlottable } from '../slot'
import { NavigationMenuContentImpl } from './content'
import { useNavigationMenuContext, useViewportContentContext } from './navigation-menu'
import { getOpenState, useResizeObserver, whenMouse } from './navigation-menu.libs'
import type { INavigationMenu } from './navigation-menu.types'

const VIEWPORT_NAME = 'NavigationMenuViewport'
const CONTENT_NAME = 'NavigationMenuContent'
const Slottable = createSlottable(VIEWPORT_NAME)

const NavigationMenuViewport = React.forwardRef<INavigationMenu.ViewportElement, INavigationMenu.IViewportProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.IViewportProps>, forwardedRef) => {
    const { forceMount, ...viewportProps } = props
    const context = useNavigationMenuContext(VIEWPORT_NAME, props.__scopeNavigationMenu)
    const open = Boolean(context.value)

    return (
      <Presence present={forceMount || open}>
        <NavigationMenuViewportImpl {...viewportProps} ref={forwardedRef} />
      </Presence>
    )
  },
)

NavigationMenuViewport.displayName = VIEWPORT_NAME

const NavigationMenuViewportImpl = React.forwardRef<
  INavigationMenu.ViewportElement,
  React.ComponentPropsWithoutRef<typeof Primitive.div>
>((props: INavigationMenu.IScoped<React.ComponentPropsWithoutRef<typeof Primitive.div>>, forwardedRef) => {
  const { __scopeNavigationMenu, children, ...viewportImplProps } = props
  const context = useNavigationMenuContext(VIEWPORT_NAME, __scopeNavigationMenu)
  const viewportRef = React.useRef<INavigationMenu.ViewportElement>(null)
  const composedRefs = useComposedRefs(forwardedRef, context.onViewportChange, viewportRef)
  const viewportContentContext = useViewportContentContext(CONTENT_NAME, props.__scopeNavigationMenu)
  const [content, setContent] = React.useState<INavigationMenu.ContentImplElement | null>(null)
  const nodes = React.useRef(new Map<string, INavigationMenu.ContentImplElement>()).current
  const open = Boolean(context.value)
  // keep the previously active value mounted while the viewport animates out
  const activeContentValue = open ? context.value : context.previousValue

  // The size is written onto the node rather than kept in state, so a resize re-renders none of the contents.
  // offset* rather than getBoundingClientRect, which an animating-in scale(0.5) would shrink.
  const handleSizeChange = (node: HTMLElement) => {
    viewportRef.current?.style.setProperty('--gentleduck-navigation-menu-viewport-width', `${node.offsetWidth}px`)
    viewportRef.current?.style.setProperty('--gentleduck-navigation-menu-viewport-height', `${node.offsetHeight}px`)
  }
  useResizeObserver(content, handleSizeChange)
  // After every commit, so it runs once the contents' refs are attached.
  useLayoutEffect(() => {
    const active = nodes.get(activeContentValue)
    if (active && active !== content) setContent(active)
  })

  const contents = React.useMemo(
    () =>
      Array.from(viewportContentContext.items, ([value, { ref, forceMount, ...props }]) => (
        <Presence key={value} present={forceMount || activeContentValue === value}>
          <NavigationMenuContentImpl
            {...props}
            ref={composeRefs(ref, (node) => {
              if (node) nodes.set(value, node)
              else nodes.delete(value)
            })}
          />
        </Presence>
      )),
    [viewportContentContext.items, activeContentValue, nodes],
  )

  return (
    <Primitive.div
      data-slot="navigation-menu-viewport"
      data-state={getOpenState(open)}
      data-orientation={context.orientation}
      {...viewportImplProps}
      ref={composedRefs}
      style={{
        // block pointer events while animating out
        pointerEvents: !open && context.isRootMenu ? 'none' : undefined,
        ...viewportImplProps.style,
      }}
      onPointerEnter={composeEventHandlers(props.onPointerEnter, context.onContentEnter)}
      onPointerLeave={composeEventHandlers(props.onPointerLeave, whenMouse(context.onContentLeave))}>
      {/* With `asChild`, the consumer's element is what the props land on, and the contents render inside it. */}
      <Slottable>{children}</Slottable>
      {contents}
    </Primitive.div>
  )
})

NavigationMenuViewportImpl.displayName = 'NavigationMenuViewportImpl'

export { NavigationMenuViewport }
