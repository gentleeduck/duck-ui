import * as React from 'react'
import { useDirection } from '../direction'
import { useCallbackRef } from '../hooks/use-callback-ref'
import { createContextScope } from '../libs/create-context'
import * as PopperPrimitive from '../popper'
import { createPopperScope } from '../popper'
import { createRovingFocusGroupScope } from '../roving-focus'
import type { IMenu } from './menu.types'

const MENU_NAME = 'Menu'

const [createMenuContext, createMenuScope] = createContextScope(MENU_NAME, [
  createPopperScope,
  createRovingFocusGroupScope,
])
const usePopperScope = createPopperScope()
const useRovingFocusGroupScope = createRovingFocusGroupScope()

const [MenuProvider, useMenuContext] = createMenuContext<IMenu.IContext>(MENU_NAME)

const [MenuRootProvider, useMenuRootContext] = createMenuContext<IMenu.IRootContext>(MENU_NAME)

const isUsingKeyboardRef = { current: false }
let keyboardTrackers = 0

function handlePointer() {
  isUsingKeyboardRef.current = false
}

function handleKeyDown() {
  isUsingKeyboardRef.current = true
  document.addEventListener('pointerdown', handlePointer, { capture: true, once: true })
  document.addEventListener('pointermove', handlePointer, { capture: true, once: true })
}

// One listener for every mounted menu: a menubar or a table of row menus mounts a root per menu.
function trackKeyboard() {
  if (keyboardTrackers++ === 0) document.addEventListener('keydown', handleKeyDown, true)
  return () => {
    if (--keyboardTrackers > 0) return
    document.removeEventListener('keydown', handleKeyDown, true)
    isUsingKeyboardRef.current = false
  }
}

const Menu: React.FC<IMenu.IProps> = (props: IMenu.IScoped<IMenu.IProps>) => {
  const { __scopeMenu, open = false, children, dir, onOpenChange, modal = true } = props
  const popperScope = usePopperScope(__scopeMenu)
  const handleOpenChange = useCallbackRef(onOpenChange)
  const direction = useDirection(dir)

  React.useEffect(trackKeyboard, [])

  // Leaving the window closes the menu, or a submenu is still open when the page gets focus back.
  React.useEffect(() => {
    if (!open) return
    const handleBlur = () => handleOpenChange(false)
    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [open, handleOpenChange])

  const onClose = React.useCallback(() => handleOpenChange(false), [handleOpenChange])

  return (
    <PopperPrimitive.Root {...popperScope}>
      <MenuProvider scope={__scopeMenu} open={open} onOpenChange={handleOpenChange}>
        <MenuRootProvider
          scope={__scopeMenu}
          onClose={onClose}
          isUsingKeyboardRef={isUsingKeyboardRef}
          dir={direction}
          modal={modal}>
          {children}
        </MenuRootProvider>
      </MenuProvider>
    </PopperPrimitive.Root>
  )
}

Menu.displayName = MENU_NAME

export {
  createMenuContext,
  createMenuScope,
  MENU_NAME,
  Menu,
  MenuProvider,
  MenuRootProvider,
  useMenuContext,
  useMenuRootContext,
  usePopperScope,
  useRovingFocusGroupScope,
}
