import * as React from 'react'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { useId } from '../hooks/use-id'
import * as PopperPrimitive from '../popper'
import { createMenuContext, MenuProvider, useMenuContext, usePopperScope } from './menu'
import type { IMenu } from './menu.types'
import { PortalProvider } from './portal'

const SUB_NAME = 'MenuSub'

const [MenuSubProvider, useMenuSubContext] = createMenuContext<IMenu.ISubContext>(SUB_NAME)

const MenuSub: React.FC<IMenu.ISubProps> = (props: IMenu.IScoped<IMenu.ISubProps>) => {
  const { __scopeMenu, children, open = false, onOpenChange, closeParentOnEsc = true } = props
  const parentMenuContext = useMenuContext(SUB_NAME, __scopeMenu)
  const popperScope = usePopperScope(__scopeMenu)
  const [trigger, setTrigger] = React.useState<IMenu.SubTriggerElement | null>(null)
  const [content, setContent] = React.useState<IMenu.ContentElement | null>(null)
  const handleOpenChange = useCallbackRef(onOpenChange)

  React.useEffect(() => {
    if (parentMenuContext.open === false) handleOpenChange(false)
    return () => handleOpenChange(false)
  }, [parentMenuContext.open, handleOpenChange])

  return (
    <PopperPrimitive.Popper {...popperScope}>
      <MenuProvider scope={__scopeMenu} open={open} onOpenChange={handleOpenChange}>
        <MenuSubProvider
          scope={__scopeMenu}
          contentId={useId()}
          triggerId={useId()}
          trigger={trigger}
          onTriggerChange={setTrigger}
          content={content}
          onContentChange={setContent}
          closeParentOnEsc={closeParentOnEsc}>
          {/* A portal forcing its menu's content to mount would mount every closed submenu inside it too. */}
          <PortalProvider scope={__scopeMenu} forceMount={undefined}>
            {children}
          </PortalProvider>
        </MenuSubProvider>
      </MenuProvider>
    </PopperPrimitive.Popper>
  )
}

MenuSub.displayName = SUB_NAME

export { MenuSub, MenuSubProvider, useMenuSubContext }
