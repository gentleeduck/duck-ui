import * as React from 'react'
import { useDirection } from '../direction'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useControllableState } from '../hooks/use-controllable-state'
import { useId } from '../hooks/use-id'
import { usePrevious } from '../hooks/use-previous'
import { useComposedRefs } from '../libs/compose-ref'
import { createContextScope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import type { INavigationMenu } from './navigation-menu.types'

const NAVIGATION_MENU_NAME = 'NavigationMenu'

const [createNavigationMenuContext, createNavigationMenuScope] = createContextScope(NAVIGATION_MENU_NAME)

const [NavigationMenuProviderImpl, useNavigationMenuContext] =
  createNavigationMenuContext<INavigationMenu.IContext>(NAVIGATION_MENU_NAME)

const [ViewportContentProvider, useViewportContentContext] = createNavigationMenuContext<{
  items: Map<string, INavigationMenu.IContentData>
}>(NAVIGATION_MENU_NAME)

const [NavigationMenuItemContextProvider, useNavigationMenuItemContext] =
  createNavigationMenuContext<INavigationMenu.IItemContext>('NavigationMenuItem')

const NavigationMenu = React.forwardRef<INavigationMenu.RootElement, INavigationMenu.IProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.IProps>, forwardedRef) => {
    const {
      __scopeNavigationMenu,
      value: valueProp,
      onValueChange,
      defaultValue,
      delayDuration = 200,
      skipDelayDuration = 300,
      closeDelay = 150,
      orientation = 'horizontal',
      dir,
      activationMode = 'automatic',
      ...NavigationMenuProps
    } = props
    const [navigationMenu, setNavigationMenu] = React.useState<INavigationMenu.RootElement | null>(null)
    const composedRef = useComposedRefs(forwardedRef, setNavigationMenu)
    const direction = useDirection(dir)
    const openTimerRef = React.useRef(0)
    const closeTimerRef = React.useRef(0)
    const skipDelayTimerRef = React.useRef(0)
    // Read only when a trigger is entered, so it is a ref: as state, the delay running out rerendered the menu.
    const isOpenDelayedRef = React.useRef(true)
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: (value) => {
        window.clearTimeout(skipDelayTimerRef.current)
        if (value === '') {
          skipDelayTimerRef.current = window.setTimeout(() => {
            isOpenDelayedRef.current = true
          }, skipDelayDuration)
        } else if (skipDelayDuration > 0) {
          isOpenDelayedRef.current = false
        }

        onValueChange?.(value)
      },
      defaultProp: defaultValue ?? '',
      caller: NAVIGATION_MENU_NAME,
    })

    const startCloseTimer = React.useCallback(() => {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = window.setTimeout(() => setValue(''), closeDelay)
    }, [setValue, closeDelay])

    const handleOpen = React.useCallback(
      (itemValue: string) => {
        window.clearTimeout(closeTimerRef.current)
        setValue(itemValue)
      },
      [setValue],
    )

    const handleDelayedOpen = React.useCallback(
      (itemValue: string) => {
        const isOpenItem = value === itemValue
        if (isOpenItem) {
          window.clearTimeout(closeTimerRef.current)
        } else {
          openTimerRef.current = window.setTimeout(() => {
            window.clearTimeout(closeTimerRef.current)
            setValue(itemValue)
          }, delayDuration)
        }
      },
      [value, setValue, delayDuration],
    )

    React.useEffect(() => {
      return () => {
        window.clearTimeout(openTimerRef.current)
        window.clearTimeout(closeTimerRef.current)
      }
    }, [])

    // A hover's open or close scheduled before the menu turned manual would still fire after it.
    React.useEffect(() => {
      if (activationMode === 'automatic') return
      window.clearTimeout(openTimerRef.current)
      window.clearTimeout(closeTimerRef.current)
    }, [activationMode])

    const isAutomatic = activationMode === 'automatic'

    return (
      <NavigationMenuProvider
        scope={__scopeNavigationMenu}
        isRootMenu={true}
        value={value}
        dir={direction}
        orientation={orientation}
        activationMode={activationMode}
        rootNavigationMenu={navigationMenu}
        onTriggerEnter={(itemValue) => {
          if (!isAutomatic) return
          window.clearTimeout(openTimerRef.current)
          if (isOpenDelayedRef.current) handleDelayedOpen(itemValue)
          else handleOpen(itemValue)
        }}
        onTriggerLeave={
          isAutomatic
            ? () => {
                window.clearTimeout(openTimerRef.current)
                startCloseTimer()
              }
            : undefined
        }
        onContentEnter={() => window.clearTimeout(closeTimerRef.current)}
        onContentLeave={isAutomatic ? startCloseTimer : undefined}
        onItemSelect={(itemValue) => {
          window.clearTimeout(openTimerRef.current)
          setValue((prevValue) => (prevValue === itemValue ? '' : itemValue))
        }}
        onItemDismiss={() => setValue('')}>
        <Primitive.nav
          data-slot="navigation-menu"
          aria-label="Main"
          data-orientation={orientation}
          dir={direction}
          {...NavigationMenuProps}
          ref={composedRef}
        />
      </NavigationMenuProvider>
    )
  },
)

NavigationMenu.displayName = NAVIGATION_MENU_NAME

const SUB_NAME = 'NavigationMenuSub'

const NavigationMenuSub = React.forwardRef<HTMLDivElement, INavigationMenu.ISubProps>(
  (props: INavigationMenu.IScoped<INavigationMenu.ISubProps>, forwardedRef) => {
    const context = useNavigationMenuContext(SUB_NAME, props.__scopeNavigationMenu)
    const {
      __scopeNavigationMenu,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = 'horizontal',
      activationMode = context.activationMode,
      disableToggle = true,
      ...subProps
    } = props
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? '',
      caller: SUB_NAME,
    })

    return (
      <NavigationMenuProvider
        scope={__scopeNavigationMenu}
        isRootMenu={false}
        value={value}
        dir={context.dir}
        orientation={orientation}
        activationMode={activationMode}
        rootNavigationMenu={context.rootNavigationMenu}
        onTriggerEnter={(itemValue) => {
          if (activationMode === 'automatic') setValue(itemValue)
        }}
        onItemSelect={(itemValue) => {
          setValue((prevValue) => (disableToggle || prevValue !== itemValue ? itemValue : ''))
        }}>
        <Primitive.div
          data-slot="navigation-menu-sub"
          data-orientation={orientation}
          {...subProps}
          ref={forwardedRef}
        />
      </NavigationMenuProvider>
    )
  },
)

NavigationMenuSub.displayName = SUB_NAME

const NavigationMenuProvider: React.FC<INavigationMenu.IProviderProps> = (
  props: INavigationMenu.IScoped<INavigationMenu.IProviderProps>,
) => {
  const {
    scope,
    isRootMenu,
    rootNavigationMenu,
    dir,
    orientation,
    activationMode,
    children,
    value,
    onItemSelect,
    onItemDismiss,
    onTriggerEnter,
    onTriggerLeave,
    onContentEnter,
    onContentLeave,
  } = props
  const [viewport, setViewport] = React.useState<INavigationMenu.ViewportElement | null>(null)
  const [viewportContent, setViewportContent] = React.useState<Map<string, INavigationMenu.IContentData>>(new Map())
  const [indicatorTrack, setIndicatorTrack] = React.useState<HTMLDivElement | null>(null)
  const [triggers] = React.useState(() => new Set<INavigationMenu.ITrigger>())

  return (
    <NavigationMenuProviderImpl
      scope={scope}
      isRootMenu={isRootMenu}
      rootNavigationMenu={rootNavigationMenu}
      value={value}
      previousValue={usePrevious(value)}
      baseId={useId()}
      dir={dir}
      orientation={orientation}
      activationMode={activationMode}
      viewport={viewport}
      onViewportChange={setViewport}
      indicatorTrack={indicatorTrack}
      triggers={triggers}
      onIndicatorTrackChange={setIndicatorTrack}
      onTriggerEnter={useCallbackRef(onTriggerEnter)}
      onTriggerLeave={useCallbackRef(onTriggerLeave)}
      onContentEnter={useCallbackRef(onContentEnter)}
      onContentLeave={useCallbackRef(onContentLeave)}
      onItemSelect={useCallbackRef(onItemSelect)}
      onItemDismiss={useCallbackRef(onItemDismiss)}
      onViewportContentChange={React.useCallback((contentValue, contentData) => {
        setViewportContent((prevContent) => new Map(prevContent).set(contentValue, contentData))
      }, [])}
      onViewportContentRemove={React.useCallback((contentValue) => {
        setViewportContent((prevContent) => {
          const nextContent = new Map(prevContent)
          nextContent.delete(contentValue)
          return nextContent
        })
      }, [])}>
      <ViewportContentProvider scope={scope} items={viewportContent}>
        {children}
      </ViewportContentProvider>
    </NavigationMenuProviderImpl>
  )
}

export {
  createNavigationMenuContext,
  createNavigationMenuScope,
  NAVIGATION_MENU_NAME,
  NavigationMenu,
  NavigationMenuItemContextProvider,
  NavigationMenuSub,
  useNavigationMenuContext,
  useNavigationMenuItemContext,
  useViewportContentContext,
}
