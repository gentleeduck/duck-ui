import * as React from 'react'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useId } from '../hooks/use-id'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import * as MenuPrimitive from '../menu'
import { createMenubarContext, useMenubarContext, useMenuScope } from './menubar'
import type { IMenubar } from './menubar.types'

const MENU_NAME = 'MenubarMenu'

const [MenubarMenuProvider, useMenubarMenuContext] = createMenubarContext<IMenubar.IMenuContext>(MENU_NAME)

const MenubarMenu = (props: IMenubar.IScoped<IMenubar.IMenuProps>) => {
  const { __scopeMenubar, value: valueProp, onOpenChange: onOpenChangeProp, ...menuProps } = props
  const id = useId()
  const value = valueProp || id
  const context = useMenubarContext(MENU_NAME, __scopeMenubar)
  const menuScope = useMenuScope(__scopeMenubar)
  const triggerRef = React.useRef<IMenubar.TriggerElement>(null)
  const wasKeyboardTriggerOpenRef = React.useRef(false)
  const open = context.value === value
  const onOpenChange = useCallbackRef(onOpenChangeProp)
  const wasOpenRef = React.useRef(open)

  useLayoutEffect(() => {
    if (wasOpenRef.current === open) return
    wasOpenRef.current = open
    if (!open) wasKeyboardTriggerOpenRef.current = false
    onOpenChange(open)
  }, [open, onOpenChange])

  return (
    <MenubarMenuProvider
      scope={__scopeMenubar}
      value={value}
      triggerId={`${id}-trigger`}
      triggerRef={triggerRef}
      contentId={`${id}-content`}
      wasKeyboardTriggerOpenRef={wasKeyboardTriggerOpenRef}>
      <MenuPrimitive.Root
        {...menuScope}
        open={open}
        onOpenChange={context.onMenuClose}
        modal={context.modal}
        dir={context.dir}
        {...menuProps}
      />
    </MenubarMenuProvider>
  )
}

MenubarMenu.displayName = MENU_NAME

export { MenubarMenu, MenubarMenuProvider, useMenubarMenuContext }
