import * as React from 'react'
import { useDirection } from '../direction'
import { useControllableState } from '../hooks/use-controllable-state'
import { getAssociatedForm } from '../libs/associated-form'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { createContextScope } from '../libs/create-context'
import { useTypeaheadListNavigation, useVimNavigation } from '../libs/list-navigation'
import { type Primitive, primitiveElement } from '../primitive-elements/primitive-elements'
import { createRovingFocusGroupScope, RovingFocusProvider, useRovingFocusGroup } from '../roving-focus'
import { getNavigableRadios } from './radio-group.libs'
import type { IRadioGroup } from './radio-group.types'

const RADIO_GROUP_NAME = 'RadioGroup'
const RADIO_GROUP_NAVIGATION_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
] as const

const [createRadioGroupContext, createRadioGroupScope] = createContextScope(RADIO_GROUP_NAME, [
  createRovingFocusGroupScope,
])
const useRovingFocusGroupScope = createRovingFocusGroupScope()

const [RadioGroupProvider, useRadioGroupContext] = createRadioGroupContext<IRadioGroup.IContext>(RADIO_GROUP_NAME)

const [RadioGroupItemContextProvider, useRadioGroupItemContext] =
  createRadioGroupContext<IRadioGroup.IItemContext>('RadioGroupItem')

type RadioGroupElement = React.ComponentRef<typeof Primitive.div>

const RadioGroup = React.forwardRef<RadioGroupElement, IRadioGroup.IProps>(
  (props: IRadioGroup.IScoped<IRadioGroup.IProps>, forwardedRef) => {
    const {
      __scopeRadioGroup,
      value: valueProp,
      defaultValue,
      onValueChange,
      disabled = false,
      readOnly = false,
      required = false,
      name,
      form,
      dir,
      orientation,
      loop = true,
      asChild,
      ...groupProps
    } = props
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup)
    const direction = useDirection(dir)
    const groupRef = React.useRef<RadioGroupElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, groupRef)
    const isNavigationKeyPressedRef = React.useRef(false)
    const navigationResetTimerRef = React.useRef<number | undefined>(undefined)
    // The value a pick whose handler stopped propagation, or a form reset, asked for: its input follows without an event.
    const silentValueRef = React.useRef<string | null | undefined>(undefined)

    const [value, setValue] = useControllableState<string | null>({
      prop: valueProp,
      defaultProp: defaultValue ?? null,
      onChange: onValueChange,
      caller: RADIO_GROUP_NAME,
    })

    const [initialValue] = React.useState(value)
    React.useEffect(() => {
      const group = groupRef.current
      const root = group?.getRootNode()
      if (!group || !root) return
      // The form is looked up as it resets, since one named by `form` may render after the group. Heard as the reset
      // bubbles to the root, after the form's own onReset, so a reset it cancels changes nothing.
      const reset = (event: Event) => {
        if (event.defaultPrevented || event.target !== getAssociatedForm(group, form) || value === initialValue) return
        silentValueRef.current = initialValue
        setValue(initialValue)
      }
      root.addEventListener('reset', reset)
      return () => root.removeEventListener('reset', reset)
    }, [form, value, initialValue, setValue])

    // Runs after the items' effects, which read it for the change this commit made.
    // biome-ignore lint/correctness/useExhaustiveDependencies: cleared only once a value lands, so a pick the parent applies later stays silent
    React.useEffect(() => {
      silentValueRef.current = undefined
    }, [value])

    // One clear pending at a time: a busy page runs input before overdue timers, so a press's late clear would
    // otherwise end the navigation the next press began, and its radio would take focus unchecked.
    const armNavigation = React.useCallback((clearAfterMs = 0) => {
      window.clearTimeout(navigationResetTimerRef.current)
      isNavigationKeyPressedRef.current = true
      navigationResetTimerRef.current = window.setTimeout(() => {
        isNavigationKeyPressedRef.current = false
      }, clearAfterMs)
    }, [])

    const [, handleTypeaheadSearch, resetTypeaheadState] = useTypeaheadListNavigation<HTMLElement>({
      getItems: () => (groupRef.current ? getNavigableRadios(groupRef.current) : []),
      getItemElement: (radio) => radio,
      getItemTextValue: (radio) =>
        radio.getAttribute('data-text-value') ?? radio.getAttribute('aria-label') ?? radio.textContent,
      onMatch: (radio) => {
        armNavigation(16)
        setTimeout(() => radio.focus())
      },
    })

    const handleVimKey = useVimNavigation({
      onNavigate: () => {
        resetTypeaheadState()
        // useVimNavigation focuses on a timeout it sets after this call.
        armNavigation(16)
      },
    })

    const group = useRovingFocusGroup<RadioGroupElement>(
      {
        orientation,
        dir: direction,
        loop,
        tabIndex: groupProps.tabIndex,
        style: groupProps.style,
        onMouseDown: groupProps.onMouseDown,
        onFocus: groupProps.onFocus,
        onBlur: composeEventHandlers(groupProps.onBlur, (event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            isNavigationKeyPressedRef.current = false
            resetTypeaheadState()
          }
        }),
      },
      composedRefs,
    )
    const Element = primitiveElement('div', asChild)

    return (
      <RadioGroupProvider
        scope={__scopeRadioGroup}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        form={form}
        groupRef={groupRef}
        isNavigationKeyPressedRef={isNavigationKeyPressedRef}
        silentValueRef={silentValueRef}>
        <RovingFocusProvider scope={rovingFocusGroupScope.__scopeRovingFocusGroup} {...group.context}>
          <Element
            role="radiogroup"
            data-slot="radio-group"
            aria-required={required}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-orientation={orientation}
            data-disabled={disabled ? '' : undefined}
            data-readonly={readOnly ? '' : undefined}
            {...groupProps}
            {...group.props}
            onKeyDown={composeEventHandlers(
              groupProps.onKeyDown,
              (event) => {
                // A key pressed in a group nested inside this one is that group's.
                if ((event.target as Element).closest('[role="radiogroup"]') !== event.currentTarget) return
                if (handleVimKey(event, getNavigableRadios(event.currentTarget))) return

                const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
                const isCharacterKey = event.key.length === 1 && event.key !== ' '
                if (!isModifierKey && isCharacterKey) {
                  handleTypeaheadSearch(event.key)
                }

                if ((RADIO_GROUP_NAVIGATION_KEYS as readonly string[]).includes(event.key)) {
                  armNavigation()
                  resetTypeaheadState()
                }
              },
              { checkForDefaultPrevented: false },
            )}
          />
        </RovingFocusProvider>
      </RadioGroupProvider>
    )
  },
)

RadioGroup.displayName = RADIO_GROUP_NAME

export {
  createRadioGroupScope,
  RadioGroup,
  RadioGroupItemContextProvider,
  useRadioGroupContext,
  useRadioGroupItemContext,
  useRovingFocusGroupScope,
}
