import React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { createSlot, type Slot } from '../slot'
import { useComposedRefs } from './compose-ref'
import type { Scope } from './create-context'
import { createContextScope } from './create-context'

type SlotProps = React.ComponentPropsWithoutRef<typeof Slot>
type CollectionElement = HTMLElement
interface ICollectionProps extends SlotProps {
  scope: Scope
}

function createCollection<ItemElement extends HTMLElement, ItemData = {}>(name: string) {
  const PROVIDER_NAME = `${name}CollectionProvider`
  const [createCollectionContext, createCollectionScope] = createContextScope(PROVIDER_NAME)

  type ContextValue = {
    collectionRef: React.RefObject<CollectionElement | null>
    itemMap: Map<React.RefObject<ItemElement | null>, { ref: React.RefObject<ItemElement | null> } & ItemData>
  }

  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext<ContextValue>(PROVIDER_NAME, {
    collectionRef: { current: null },
    itemMap: new Map(),
  })

  const CollectionProvider: React.FC<{ children?: React.ReactNode; scope: Scope }> = (props) => {
    const { scope, children } = props
    const ref = React.useRef<CollectionElement>(null)
    const itemMap = React.useRef<ContextValue['itemMap']>(new Map()).current
    return (
      <CollectionProviderImpl scope={scope} itemMap={itemMap} collectionRef={ref}>
        {children}
      </CollectionProviderImpl>
    )
  }

  CollectionProvider.displayName = PROVIDER_NAME

  const COLLECTION_SLOT_NAME = `${name}CollectionSlot`

  const CollectionSlotImpl = createSlot(COLLECTION_SLOT_NAME)
  const CollectionSlot = React.forwardRef<CollectionElement, ICollectionProps>((props, forwardedRef) => {
    const { scope, children } = props
    const context = useCollectionContext(COLLECTION_SLOT_NAME, scope)
    const composedRefs = useComposedRefs(forwardedRef, context.collectionRef)
    return <CollectionSlotImpl ref={composedRefs}>{children}</CollectionSlotImpl>
  })

  CollectionSlot.displayName = COLLECTION_SLOT_NAME

  const ITEM_SLOT_NAME = `${name}CollectionItemSlot`
  const ITEM_DATA_ATTR = 'data-collection-item'

  type CollectionItemSlotProps = ItemData & {
    children: React.ReactNode
    scope: Scope
  }

  const CollectionItemSlotImpl = createSlot(ITEM_SLOT_NAME)
  const CollectionItemSlot = React.forwardRef<ItemElement, CollectionItemSlotProps>((props, forwardedRef) => {
    const { scope, children, ...itemData } = props
    const ref = React.useRef<ItemElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)
    const context = useCollectionContext(ITEM_SLOT_NAME, scope)

    // Before any parent's layout effect, so a list can read its items in the commit that changed them.
    useLayoutEffect(() => {
      context.itemMap.set(ref, { ref, ...(itemData as unknown as ItemData) })
      return () => void context.itemMap.delete(ref)
    })

    return (
      <CollectionItemSlotImpl {...{ [ITEM_DATA_ATTR]: '' }} ref={composedRefs}>
        {children}
      </CollectionItemSlotImpl>
    )
  })

  CollectionItemSlot.displayName = ITEM_SLOT_NAME

  type Item = { ref: React.RefObject<ItemElement> } & ItemData

  function useCollection(scope: Scope) {
    const context = useCollectionContext(`${name}CollectionConsumer`, scope)

    const getItems = React.useCallback(() => {
      const collectionNode = context.collectionRef.current
      if (!collectionNode) return []
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`))
      // An item is in the map only between the layout effects that mount and unmount it, so its node is there.
      const items = Array.from(context.itemMap.values()) as Item[]
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current),
      )
      return orderedItems
    }, [context.collectionRef, context.itemMap])

    return getItems
  }

  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection,
    createCollectionScope,
  ] as const
}

export type { ICollectionProps }
export { createCollection }
