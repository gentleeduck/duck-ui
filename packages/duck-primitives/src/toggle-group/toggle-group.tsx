import * as React from 'react'
import { useDirection } from '../direction'
import { useControllableState } from '../hooks/use-controllable-state'
import { createContextScope } from '../libs/create-context'
import { type Primitive, primitiveElement } from '../primitive-elements/primitive-elements'
import { createRovingFocusGroupScope, RovingFocusProvider, useRovingFocusGroup } from '../roving-focus'
import type { IToggleGroup } from './toggle-group.types'

const TOGGLE_GROUP_NAME = 'ToggleGroup'

const [createToggleGroupContext, createToggleGroupScope] = createContextScope(TOGGLE_GROUP_NAME, [
  createRovingFocusGroupScope,
])
const useRovingFocusGroupScope = createRovingFocusGroupScope()

const [ToggleGroupProvider, useToggleGroupContext] = createToggleGroupContext<IToggleGroup.IContext>(TOGGLE_GROUP_NAME)

const toList = (value: string | string[]) => (typeof value === 'string' ? (value ? [value] : []) : value)

type ToggleGroupElement = React.ComponentRef<typeof Primitive.div>

const ToggleGroup = React.forwardRef<ToggleGroupElement, IToggleGroup.IProps>(
  (props: IToggleGroup.IScoped<IToggleGroup.IProps>, forwardedRef) => {
    const {
      __scopeToggleGroup,
      type,
      value: valueProp,
      defaultValue,
      onValueChange,
      asChild,
      rovingFocus = true,
      disabled = false,
      deselectable = true,
      orientation,
      dir,
      loop = true,
      ...groupProps
    } = props
    // A group given no type, as JavaScript allows, is single. Either type holds its value as a list.
    const single = type !== 'multiple'
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeToggleGroup)
    const direction = useDirection(dir)
    const [value, setValue] = useControllableState<string[]>({
      prop: React.useMemo(() => (valueProp === undefined ? undefined : toList(valueProp)), [valueProp]),
      defaultProp: defaultValue === undefined ? [] : toList(defaultValue),
      onChange: (next) =>
        props.type === 'multiple' ? props.onValueChange?.(next) : props.onValueChange?.(next[0] ?? ''),
      caller: TOGGLE_GROUP_NAME,
    })
    // A group switched from multiple to single keeps the list it held, so it shows the first item of it as on.
    const shown = React.useMemo(() => (single && value.length > 1 ? value.slice(0, 1) : value), [single, value])
    const group = useRovingFocusGroup<ToggleGroupElement>(
      {
        orientation,
        dir: direction,
        loop,
        tabIndex: groupProps.tabIndex,
        style: groupProps.style,
        onMouseDown: groupProps.onMouseDown,
        onFocus: groupProps.onFocus,
        onBlur: groupProps.onBlur,
      },
      forwardedRef,
    )

    const Element = primitiveElement('div', asChild)
    const element = (
      <Element
        role={single ? 'radiogroup' : rovingFocus ? 'toolbar' : 'group'}
        // Orientation is the axis of the arrow keys, which only roving focus listens to.
        aria-orientation={rovingFocus ? orientation : undefined}
        data-slot="toggle-group"
        dir={direction}
        {...groupProps}
        {...(rovingFocus ? group.props : { ref: forwardedRef })}
      />
    )

    return (
      <ToggleGroupProvider
        scope={__scopeToggleGroup}
        type={single ? 'single' : 'multiple'}
        value={shown}
        onItemActivate={React.useCallback(
          (itemValue: string) => setValue((previous) => (single ? toList(itemValue) : [...previous, itemValue])),
          [single, setValue],
        )}
        onItemDeactivate={React.useCallback(
          (itemValue: string) => setValue((previous) => (single ? [] : previous.filter((v) => v !== itemValue))),
          [single, setValue],
        )}
        rovingFocus={rovingFocus}
        disabled={disabled}
        deselectable={deselectable}
        dir={direction}>
        {rovingFocus ? (
          <RovingFocusProvider scope={rovingFocusGroupScope.__scopeRovingFocusGroup} {...group.context}>
            {element}
          </RovingFocusProvider>
        ) : (
          element
        )}
      </ToggleGroupProvider>
    )
  },
)

ToggleGroup.displayName = TOGGLE_GROUP_NAME

export {
  createToggleGroupScope,
  TOGGLE_GROUP_NAME,
  ToggleGroup,
  ToggleGroupProvider,
  useRovingFocusGroupScope,
  useToggleGroupContext,
}
