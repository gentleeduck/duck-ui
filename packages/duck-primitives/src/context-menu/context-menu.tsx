import * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import { createContextScope } from '../libs/create-context'
import { createScopedPart } from '../libs/scoped-part'
import * as MenuPrimitive from '../menu'
import { createMenuScope } from '../menu'
import type { IContextMenu } from './context-menu.types'

const CONTEXT_MENU_NAME = 'ContextMenu'

const [createContextMenuContext, createContextMenuScope] = createContextScope(CONTEXT_MENU_NAME, [createMenuScope])
const useMenuScope = createMenuScope()
const menuPart = createScopedPart('__scopeContextMenu', useMenuScope)

const [ContextMenuProvider, useContextMenuContext] = createContextMenuContext<IContextMenu.IContext>(CONTEXT_MENU_NAME)

const ContextMenu: React.FC<IContextMenu.IProps> = (props: IContextMenu.IScoped<IContextMenu.IProps>) => {
  const { __scopeContextMenu, children, open: openProp, onOpenChange, dir, modal = true } = props
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: false,
    onChange: onOpenChange,
    caller: CONTEXT_MENU_NAME,
  })
  const menuScope = useMenuScope(__scopeContextMenu)
  const hasInteractedRef = React.useRef(false)
  const hasWarnedRef = React.useRef(false)
  const rightClickClosesRef = React.useRef(false)

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && openProp && !hasInteractedRef.current && !hasWarnedRef.current) {
      hasWarnedRef.current = true
      console.warn(
        'ContextMenu: The `open` prop has been set to `true` before the trigger was right-clicked, so the menu has no position and opens at the top-left corner of the viewport. Open it from `onOpenChange` instead.',
      )
    }
  }, [openProp])

  return (
    <ContextMenuProvider
      scope={__scopeContextMenu}
      open={open}
      onOpenChange={setOpen}
      modal={modal}
      hasInteractedRef={hasInteractedRef}
      rightClickClosesRef={rightClickClosesRef}>
      <MenuPrimitive.Root {...menuScope} dir={dir} open={open} onOpenChange={setOpen} modal={modal}>
        {children}
      </MenuPrimitive.Root>
    </ContextMenuProvider>
  )
}

ContextMenu.displayName = CONTEXT_MENU_NAME

export {
  CONTEXT_MENU_NAME,
  ContextMenu,
  ContextMenuProvider,
  createContextMenuScope,
  menuPart,
  useContextMenuContext,
  useMenuScope,
}
