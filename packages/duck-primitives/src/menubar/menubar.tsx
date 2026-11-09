import * as React from 'react'
import { useDirection } from '../direction'
import { useControllableState } from '../hooks/use-controllable-state'
import { createContextScope } from '../libs/create-context'
import { createScopedPart } from '../libs/scoped-part'
import { createMenuScope } from '../menu'
import { primitiveElement } from '../primitive-elements/primitive-elements'
import { createRovingFocusGroupScope, RovingFocusProvider, useRovingFocusGroup } from '../roving-focus'
import type { IMenubar } from './menubar.types'

const MENUBAR_NAME = 'Menubar'

const [createMenubarContext, createMenubarScope] = createContextScope(MENUBAR_NAME, [createRovingFocusGroupScope])

const useMenuScope = createMenuScope()
const menuPart = createScopedPart('__scopeMenubar', useMenuScope)
const useRovingFocusGroupScope = createRovingFocusGroupScope()

const [MenubarContextProvider, useMenubarContext] = createMenubarContext<IMenubar.IContext>(MENUBAR_NAME)

const CONTENT_STYLE = {
  '--gentleduck-menubar-content-transform-origin': 'var(--gentleduck-popper-transform-origin)',
  '--gentleduck-menubar-content-available-width': 'var(--gentleduck-popper-available-width)',
  '--gentleduck-menubar-content-available-height': 'var(--gentleduck-popper-available-height)',
  '--gentleduck-menubar-trigger-width': 'var(--gentleduck-popper-anchor-width)',
  '--gentleduck-menubar-trigger-height': 'var(--gentleduck-popper-anchor-height)',
}

const Menubar = React.forwardRef<HTMLDivElement, IMenubar.IProps>(
  (props: IMenubar.IScoped<IMenubar.IProps>, forwardedRef) => {
    const {
      __scopeMenubar,
      value: valueProp,
      onValueChange,
      defaultValue,
      loop = true,
      dir,
      modal = false,
      disabled = false,
      orientation = 'horizontal',
      asChild,
      ...menubarProps
    } = props
    const direction = useDirection(dir)
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeMenubar)
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? '',
      caller: MENUBAR_NAME,
    })

    const [currentTabStopId, setCurrentTabStopId] = React.useState<string | null>(null)
    const group = useRovingFocusGroup<HTMLDivElement>(
      {
        orientation,
        dir: direction,
        loop,
        currentTabStopId,
        onCurrentTabStopIdChange: setCurrentTabStopId,
        tabIndex: menubarProps.tabIndex,
        // A modal menu takes the page's pointer events, and the bar keeps its own to move between menus.
        style: modal && value ? { pointerEvents: 'auto', ...menubarProps.style } : menubarProps.style,
        onMouseDown: menubarProps.onMouseDown,
        onFocus: menubarProps.onFocus,
        onBlur: menubarProps.onBlur,
      },
      forwardedRef,
    )
    const Element = primitiveElement('div', asChild)

    return (
      <MenubarContextProvider
        scope={__scopeMenubar}
        value={value}
        onMenuOpen={React.useCallback(
          (value) => {
            setValue(value)
            setCurrentTabStopId(value)
          },
          [setValue],
        )}
        onMenuClose={React.useCallback(() => setValue(''), [setValue])}
        onMenuToggle={React.useCallback((value) => setValue((prevValue) => (prevValue ? '' : value)), [setValue])}
        dir={direction}
        loop={loop}
        modal={modal}
        disabled={disabled}
        orientation={orientation}
        items={group.context.items}>
        <RovingFocusProvider scope={rovingFocusGroupScope.__scopeRovingFocusGroup} {...group.context}>
          <Element
            data-slot="menubar"
            role="menubar"
            aria-orientation={orientation}
            {...menubarProps}
            {...group.props}
          />
        </RovingFocusProvider>
      </MenubarContextProvider>
    )
  },
)

Menubar.displayName = MENUBAR_NAME

export {
  CONTENT_STYLE,
  createMenubarContext,
  createMenubarScope,
  MENUBAR_NAME,
  Menubar,
  MenubarContextProvider,
  menuPart,
  useMenubarContext,
  useMenuScope,
  useRovingFocusGroupScope,
}
