import { hideOthers } from 'aria-hidden'
import * as React from 'react'
import { RemoveScroll } from 'react-remove-scroll'
import { DismissableLayer } from '../dismissable-layer'
import { FocusScope } from '../focus-scope'
import { useFocusGuards } from '../hooks/use-focus-guard'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { useTypeaheadListNavigation, useVimNavigation } from '../libs/list-navigation'
import * as PopperPrimitive from '../popper'
import { Presence } from '../presence'
import { useHeldOpen } from '../presence/presence.libs'
import { getFocusableItems, RovingFocusProvider, useRovingFocusGroup } from '../roving-focus'
import { createSlot } from '../slot'
import { createMenuContext, useMenuContext, useMenuRootContext, usePopperScope, useRovingFocusGroupScope } from './menu'
import {
  FIRST_LAST_KEYS,
  focusFirst,
  type GraceIntent,
  getOpenState,
  isPointerInGraceArea,
  isTextEntry,
  LAST_KEYS,
  type Side,
  whenMouse,
} from './menu.libs'
import type { IMenu } from './menu.types'
import { usePortalContext } from './portal'

const CONTENT_NAME = 'MenuContent'

interface IMenuContentContext {
  onItemEnter(event: React.PointerEvent): void
  onItemLeave(event: React.PointerEvent): void
  onTriggerLeave(event: React.PointerEvent): void
  searchRef: React.RefObject<string>
  pointerGraceTimerRef: React.RefObject<number>
  onPointerGraceIntentChange(intent: GraceIntent | null): void
}

const [MenuContentProvider, useMenuContentContext] = createMenuContext<IMenuContentContext>(CONTENT_NAME)

type MenuContentImplElement = React.ComponentRef<typeof PopperPrimitive.Content>
type MenuRootContentTypeElement = MenuContentImplElement

const MenuContent = React.forwardRef<IMenu.ContentElement, IMenu.IContentProps>(
  (props: IMenu.IScoped<IMenu.IContentProps>, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeMenu)
    const { forceMount = portalContext.forceMount, ...contentProps } = props
    const context = useMenuContext(CONTENT_NAME, props.__scopeMenu)
    const rootContext = useMenuRootContext(CONTENT_NAME, props.__scopeMenu)

    return (
      <Presence present={forceMount || context.open}>
        {rootContext.modal ? (
          <MenuRootContentModal {...contentProps} ref={forwardedRef} />
        ) : (
          <MenuRootContentNonModal {...contentProps} ref={forwardedRef} />
        )}
      </Presence>
    )
  },
)

MenuContent.displayName = CONTENT_NAME

const MenuRootContentModal = React.forwardRef<MenuRootContentTypeElement, IMenu.IRootContentTypeProps>(
  (props: IMenu.IScoped<IMenu.IRootContentTypeProps>, forwardedRef) => {
    const {
      trapFocus: trapFocusProp,
      disableOutsidePointerEvents: disableOutsidePointerEventsProp,
      disableOutsideScroll: disableOutsideScrollProp,
      ...restProps
    } = props
    const context = useMenuContext(CONTENT_NAME, props.__scopeMenu)
    const held = useHeldOpen(context.open)
    // A ref rather than state for an effect, which would render the whole content again once it attached. Undone when
    // the ref is given null, since React 18 ignores a cleanup a ref returns.
    const nodeRef = React.useRef<MenuRootContentTypeElement | null>(null)
    const heldRef = React.useRef(held)
    const shownRef = React.useRef<() => void>(undefined)
    // Kept mounted, the content attaches while closed, and the page stays to screen readers until it opens.
    const syncHidden = React.useCallback(() => {
      shownRef.current?.()
      shownRef.current = nodeRef.current && heldRef.current ? hideOthers(nodeRef.current) : undefined
    }, [])
    const hideOthersRef = React.useCallback(
      (node: MenuRootContentTypeElement | null) => {
        nodeRef.current = node
        syncHidden()
      },
      [syncHidden],
    )
    const composedRefs = useComposedRefs(forwardedRef, hideOthersRef)

    useLayoutEffect(() => {
      if (heldRef.current === held) return
      heldRef.current = held
      syncHidden()
    }, [held, syncHidden])

    return (
      <MenuContentImpl
        {...restProps}
        ref={composedRefs}
        trapFocus={trapFocusProp ?? context.open}
        disableOutsidePointerEvents={disableOutsidePointerEventsProp ?? held}
        disableOutsideScroll={disableOutsideScrollProp ?? true}
        onFocusOutside={composeEventHandlers(props.onFocusOutside, (event) => event.preventDefault(), {
          checkForDefaultPrevented: false,
        })}
        onDismiss={() => context.onOpenChange(false)}
      />
    )
  },
)

MenuRootContentModal.displayName = 'MenuRootContentModal'

const MenuRootContentNonModal = React.forwardRef<MenuRootContentTypeElement, IMenu.IRootContentTypeProps>(
  (props: IMenu.IScoped<IMenu.IRootContentTypeProps>, forwardedRef) => {
    const context = useMenuContext(CONTENT_NAME, props.__scopeMenu)
    return (
      <MenuContentImpl
        {...props}
        ref={forwardedRef}
        trapFocus={false}
        disableOutsidePointerEvents={false}
        disableOutsideScroll={false}
        onDismiss={() => context.onOpenChange(false)}
      />
    )
  },
)

MenuRootContentNonModal.displayName = 'MenuRootContentNonModal'

const Slot = createSlot('MenuContent.ScrollLock')

const MenuContentImpl = React.forwardRef<MenuContentImplElement, IMenu.IContentImplProps>(
  (props: IMenu.IScoped<IMenu.IContentImplProps>, forwardedRef) => {
    const {
      __scopeMenu,
      loop = false,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEntryFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      disableOutsideScroll,
      ...contentProps
    } = props
    const context = useMenuContext(CONTENT_NAME, __scopeMenu)
    const held = useHeldOpen(context.open)
    const rootContext = useMenuRootContext(CONTENT_NAME, __scopeMenu)
    const popperScope = usePopperScope(__scopeMenu)
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenu)
    const [currentItemId, setCurrentItemId] = React.useState<string | null>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, contentRef)
    const group = useRovingFocusGroup<MenuContentImplElement>(
      {
        orientation: 'vertical',
        dir: rootContext.dir,
        loop,
        currentTabStopId: currentItemId,
        onCurrentTabStopIdChange: setCurrentItemId,
        onEntryFocus: composeEventHandlers(onEntryFocus, (event) => {
          if (!rootContext.isUsingKeyboardRef.current) event.preventDefault()
        }),
        preventScrollOnEntryFocus: true,
        // FocusScope gives the content its tab index.
        tabIndex: -1,
        style: contentProps.style,
        onMouseDown: contentProps.onMouseDown,
        onFocus: contentProps.onFocus,
        onBlur: contentProps.onBlur,
      },
      composedRefs,
    )
    const { items } = group.context
    const getEnabledNodes = () => getFocusableItems(items).map(({ node }) => node)
    const searchRef = React.useRef('')
    const pointerGraceTimerRef = React.useRef(0)
    const pointerGraceIntentRef = React.useRef<GraceIntent | null>(null)
    const pointerDirRef = React.useRef<Side>('right')
    // Null until the pointer moves inside the content, since a direction read against a made-up start is a guess.
    const lastPointerXRef = React.useRef<number | null>(null)

    const ScrollLockWrapper = disableOutsideScroll ? RemoveScroll : React.Fragment
    const scrollLockWrapperProps = disableOutsideScroll
      ? { as: Slot, allowPinchZoom: true, enabled: held, removeScrollBar: false }
      : undefined

    const [, handleTypeaheadSearch, resetTypeahead] = useTypeaheadListNavigation({
      getItems: () => getFocusableItems(items),
      getItemElement: ({ node }) => node,
      getItemTextValue: ({ item, node }) => item.textValue || (node.textContent ?? ''),
      // Focus moves a task later, by which time the match may have been disabled or removed.
      onMatch: ({ node }) => {
        setTimeout(() => {
          if (getEnabledNodes().includes(node)) node.focus()
        })
      },
      externalSearchRef: searchRef,
    })

    const handleVimKey = useVimNavigation({ onNavigate: resetTypeahead })

    useFocusGuards()

    const isPointerMovingToSubmenu = React.useCallback((event: React.PointerEvent, dir?: Side) => {
      const intent = pointerGraceIntentRef.current
      if (!intent) return false
      // With no move recorded there is no direction to read, so the grace area alone decides.
      const side = dir ?? (lastPointerXRef.current === null ? intent.side : pointerDirRef.current)
      return side === intent.side && isPointerInGraceArea(event, intent.area)
    }, [])

    return (
      <RovingFocusProvider scope={rovingFocusGroupScope.__scopeRovingFocusGroup} {...group.context}>
        <MenuContentProvider
          scope={__scopeMenu}
          searchRef={searchRef}
          // A closed menu stays mounted while it animates out, and its items must not take focus.
          onItemEnter={React.useCallback(
            (event) => {
              if (!context.open || isPointerMovingToSubmenu(event)) event.preventDefault()
            },
            [context.open, isPointerMovingToSubmenu],
          )}
          onItemLeave={React.useCallback(
            (event) => {
              // A single jump into a submenu leaves the item before any move inside the content records
              // which way it went, so a submenu flipped to the other side would read as moving away.
              const lastX = lastPointerXRef.current
              const dir =
                lastX === null || event.clientX === lastX ? undefined : event.clientX > lastX ? 'right' : 'left'
              if (!context.open || isPointerMovingToSubmenu(event, dir)) return
              contentRef.current?.focus()
              setCurrentItemId(null)
            },
            [context.open, isPointerMovingToSubmenu],
          )}
          onTriggerLeave={React.useCallback(
            (event) => {
              if (isPointerMovingToSubmenu(event)) event.preventDefault()
            },
            [isPointerMovingToSubmenu],
          )}
          pointerGraceTimerRef={pointerGraceTimerRef}
          onPointerGraceIntentChange={React.useCallback((intent) => {
            pointerGraceIntentRef.current = intent
          }, [])}>
          <ScrollLockWrapper {...scrollLockWrapperProps}>
            <FocusScope
              asChild
              trapped={trapFocus}
              onMountAutoFocus={composeEventHandlers(onOpenAutoFocus, (event) => {
                event.preventDefault()
                contentRef.current?.focus({ preventScroll: true })
              })}
              onUnmountAutoFocus={onCloseAutoFocus}>
              <DismissableLayer
                asChild
                disableOutsidePointerEvents={disableOutsidePointerEvents}
                onEscapeKeyDown={onEscapeKeyDown}
                onPointerDownOutside={onPointerDownOutside}
                onFocusOutside={onFocusOutside}
                onInteractOutside={onInteractOutside}
                onDismiss={onDismiss}>
                <PopperPrimitive.Content
                  data-slot="menu-content"
                  role="menu"
                  aria-orientation="vertical"
                  data-state={getOpenState(context.open)}
                  {...popperScope}
                  {...contentProps}
                  {...group.props}
                  onKeyDown={composeEventHandlers(contentProps.onKeyDown, (event) => {
                    const target = event.target as HTMLElement
                    const isKeyDownInside = target.closest('[role="menu"]') === event.currentTarget
                    const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
                    const isCharacterKey = event.key.length === 1
                    if (isKeyDownInside) {
                      if (event.key === 'Tab') event.preventDefault()
                      if (isTextEntry(target)) return
                      if (handleVimKey(event, getEnabledNodes())) return

                      if (!isModifierKey && isCharacterKey) handleTypeaheadSearch(event.key)
                    }
                    const content = contentRef.current
                    if (event.target !== content) return
                    if (!FIRST_LAST_KEYS.includes(event.key)) return
                    event.preventDefault()
                    const candidateNodes = getEnabledNodes()
                    if (LAST_KEYS.includes(event.key)) candidateNodes.reverse()
                    focusFirst(candidateNodes)
                  })}
                  onBlur={composeEventHandlers(group.props.onBlur, (event) => {
                    const nextTarget = event.relatedTarget as Node | null
                    if (!event.currentTarget.contains(nextTarget)) resetTypeahead()
                  })}
                  onPointerMove={composeEventHandlers(
                    props.onPointerMove,
                    whenMouse((event) => {
                      const target = event.target as HTMLElement
                      const lastX = lastPointerXRef.current

                      if (event.currentTarget.contains(target) && lastX !== event.clientX) {
                        if (lastX !== null) pointerDirRef.current = event.clientX > lastX ? 'right' : 'left'
                        lastPointerXRef.current = event.clientX
                      }
                    }),
                  )}
                />
              </DismissableLayer>
            </FocusScope>
          </ScrollLockWrapper>
        </MenuContentProvider>
      </RovingFocusProvider>
    )
  },
)

MenuContentImpl.displayName = 'MenuContentImpl'

export { MenuContent, MenuContentImpl, MenuContentProvider, useMenuContentContext }
