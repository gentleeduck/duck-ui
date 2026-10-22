import * as React from 'react'
import { useDirection } from '../direction'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useControllableState } from '../hooks/use-controllable-state'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { createContextScope } from '../libs/create-context'
import { Primitive } from '../primitive-elements'
import { focusFirst, getFocusableItems } from './roving-focus.libs'
import type { IRovingFocus } from './roving-focus.types'

const ENTRY_FOCUS = 'rovingFocusGroup.onEntryFocus'
const EVENT_OPTIONS = { bubbles: false, cancelable: true }

const GROUP_NAME = 'RovingFocusGroup'

const [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(GROUP_NAME)

const noop = () => {}

// What an item reads outside any group, so one whose roving focus is switched off still calls the same hooks.
export const NO_GROUP: IRovingFocus.IContext = {
  currentTabStopId: null,
  queuedMovesRef: { current: 0 },
  items: new Set(),
  onItemFocus: noop,
  onItemShiftTab: noop,
  register: () => noop,
}

export const [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext<IRovingFocus.IContext>(
  GROUP_NAME,
  NO_GROUP,
)

// Written onto the element rather than rendered, so items arriving and leaving cost the group no render.
interface ITabStop {
  node: HTMLElement | null
  lastNode: HTMLElement | null
  // What the group last wrote to `lastNode`, so a tabindex it finds there that differs is the caller's.
  written: string | null
  focusable: number
  tabbingBackOut: boolean
  owned: boolean
  childOwned: boolean
}

function syncTabStop(tabStop: ITabStop) {
  const { node } = tabStop
  if (!node || tabStop.owned || tabStop.childOwned) return
  const tabIndex = tabStop.tabbingBackOut || tabStop.focusable === 0 ? '-1' : '0'
  if (node.getAttribute('tabindex') !== tabIndex) node.setAttribute('tabindex', tabIndex)
  tabStop.written = tabIndex
}

/** A tabindex on a child slotted in by `asChild` that the group did not write is the caller's. */
function readChildTabIndex(tabStop: ITabStop) {
  const tabIndex = tabStop.node?.getAttribute('tabindex') ?? null
  tabStop.childOwned = !tabStop.owned && tabIndex !== null && tabIndex !== tabStop.written
}

/**
 * A group's context and the props for its element, for a part that renders that element itself rather than a
 * `RovingFocusGroup` around it.
 */
function useRovingFocusGroup<E extends HTMLElement>(
  options: IRovingFocus.IGroupOptions<E>,
  forwardedRef: React.Ref<E> | undefined,
): IRovingFocus.IGroup<E> {
  const {
    orientation,
    dir,
    loop = false,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    tabIndex,
    style,
    onMouseDown,
    onFocus,
    onBlur,
  } = options
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME,
  })
  const handleEntryFocus = useCallbackRef(onEntryFocus)
  const [group] = React.useState(() => {
    const tabStop: ITabStop = {
      node: null,
      lastNode: null,
      written: null,
      focusable: 0,
      tabbingBackOut: false,
      owned: tabIndex !== undefined,
      childOwned: false,
    }
    const items = new Set<IRovingFocus.IItem>()
    return {
      tabStop,
      items,
      isClickFocus: false,
      queuedMovesRef: { current: 0 },
      ref: (node: HTMLElement | null) => {
        if (node && node !== tabStop.lastNode) {
          tabStop.lastNode = node
          tabStop.written = null
        }
        tabStop.node = node
        readChildTabIndex(tabStop)
        syncTabStop(tabStop)
      },
      register: (item: IRovingFocus.IItem) => {
        items.add(item)
        if (item.focusable && ++tabStop.focusable === 1) syncTabStop(tabStop)
        return () => {
          items.delete(item)
          if (item.focusable && --tabStop.focusable === 0) syncTabStop(tabStop)
        }
      },
      // Out of the tab order before the browser moves focus, which Firefox automation does before the keydown's
      // microtasks run.
      onItemShiftTab: () => {
        tabStop.tabbingBackOut = true
        syncTabStop(tabStop)
      },
    }
  })
  const { tabStop, items } = group
  const ref = useComposedRefs(forwardedRef, group.ref)

  // After every render, since the caller can add or drop a slotted child's tabIndex in any of them.
  useLayoutEffect(() => {
    tabStop.owned = tabIndex !== undefined
    readChildTabIndex(tabStop)
    syncTabStop(tabStop)
  })

  return {
    context: {
      orientation,
      dir,
      loop,
      currentTabStopId,
      queuedMovesRef: group.queuedMovesRef,
      items,
      onItemFocus: setCurrentTabStopId,
      onItemShiftTab: group.onItemShiftTab,
      register: group.register,
    },
    props: {
      'data-orientation': orientation,
      dir,
      ref,
      style: { outline: 'none', ...style },
      onMouseDown: composeEventHandlers(onMouseDown, () => {
        group.isClickFocus = true
        // A mouse down that focuses nothing, on the item that has focus or on a button in Safari, sends no focus to clear it.
        setTimeout(() => {
          group.isClickFocus = false
        })
      }),
      onFocus: composeEventHandlers(onFocus, (event) => {
        const isKeyboardFocus = !group.isClickFocus
        if (event.target === event.currentTarget && isKeyboardFocus && !tabStop.tabbingBackOut) {
          const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS)
          event.currentTarget.addEventListener(ENTRY_FOCUS, handleEntryFocus, { once: true })
          event.currentTarget.dispatchEvent(entryFocusEvent)
          if (!entryFocusEvent.defaultPrevented) {
            const focusable = getFocusableItems(items)
            const candidates = [
              focusable.find(({ item }) => item.active),
              focusable.find(({ item }) => item.id === currentTabStopId),
              ...focusable,
            ]
            focusFirst(
              candidates.flatMap((candidate) => (candidate ? [candidate.node] : [])),
              preventScrollOnEntryFocus,
            )
          }
        }
        group.isClickFocus = false
      }),
      onBlur: composeEventHandlers(onBlur, () => {
        tabStop.tabbingBackOut = false
        syncTabStop(tabStop)
      }),
    },
  }
}

type RovingFocusGroupElement = React.ComponentRef<typeof Primitive.div>

const RovingFocusGroup = React.forwardRef<RovingFocusGroupElement, IRovingFocus.IGroupProps>(
  (props: IRovingFocus.IScoped<IRovingFocus.IGroupProps>, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      orientation,
      loop,
      dir,
      currentTabStopId,
      defaultCurrentTabStopId,
      onCurrentTabStopIdChange,
      onEntryFocus,
      preventScrollOnEntryFocus,
      ...groupProps
    } = props
    const group = useRovingFocusGroup({ ...props, dir: useDirection(dir) }, forwardedRef)

    return (
      <RovingFocusProvider scope={__scopeRovingFocusGroup} {...group.context}>
        <Primitive.div data-slot="roving-focus-group" {...groupProps} {...group.props} />
      </RovingFocusProvider>
    )
  },
)

RovingFocusGroup.displayName = GROUP_NAME

export { createRovingFocusGroupScope, RovingFocusGroup, useRovingFocusGroup }
