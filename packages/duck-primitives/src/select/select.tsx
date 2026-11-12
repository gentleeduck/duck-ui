'use client'

import * as React from 'react'
import { useDirection } from '../direction'
import { useControllableState } from '../hooks/use-controllable-state'
import { useId } from '../hooks/use-id'
import { getAssociatedForm } from '../libs/associated-form'
import { useComposedRefs } from '../libs/compose-ref'
import { createCollection } from '../libs/create-collection'
import { createContextScope } from '../libs/create-context'
import * as PopperPrimitive from '../popper'
import { createPopperScope } from '../popper'
import { VisuallyHidden } from '../visibility-hidden'
import { shouldShowPlaceholder } from './select.libs'
import type { ISelect } from './select.types'

export const OPEN_KEYS = [' ', 'Enter', 'ArrowUp', 'ArrowDown']
export const SELECTION_KEYS = [' ', 'Enter']
export const CONTENT_MARGIN = 10

const SELECT_NAME = 'Select'

export const [Collection, useCollection, createCollectionScope] = createCollection<HTMLDivElement, ISelect.IItemData>(
  SELECT_NAME,
)

const [createSelectContext, createSelectScope] = createContextScope(SELECT_NAME, [
  createCollectionScope,
  createPopperScope,
])
export const usePopperScope = createPopperScope()

export { createSelectScope }

export const [SelectContextProvider, useSelectContext] = createSelectContext<ISelect.IContext>(SELECT_NAME)

// Apart from the root context, which every item reads, so opening or closing renders no item over again.
export const [SelectOpenProvider, useSelectOpenContext] = createSelectContext<ISelect.IOpenContext>(SELECT_NAME)

export const [SelectNativeOptionsProvider, useSelectNativeOptionsContext] =
  createSelectContext<ISelect.INativeOptionsContext>(SELECT_NAME)

const BUBBLE_INPUT_NAME = 'SelectBubbleInput'
// Kept out of the root context: every item registers an option on mount, and only the native select reads them.
export const [SelectBubbleInputContextProvider, useSelectBubbleInputContext] =
  createSelectContext<ISelect.IBubbleInputContext>(BUBBLE_INPUT_NAME)

const CONTENT_NAME = 'SelectContent'
export const [SelectContentProvider, useSelectContentContext] =
  createSelectContext<ISelect.IContentContext>(CONTENT_NAME)

// Kept apart from the content context, which every item reads: these change as the content mounts and positions.
export const [SelectContentLayoutProvider, useSelectContentLayoutContext] =
  createSelectContext<ISelect.IContentLayoutContext>(CONTENT_NAME, {})

export const [SelectViewportProvider, useSelectViewportContext] = createSelectContext<ISelect.IViewportContext>(
  CONTENT_NAME,
  {},
)

const ITEM_NAME = 'SelectItem'
export const [SelectItemContextProvider, useSelectItemContext] = createSelectContext<ISelect.IItemContext>(ITEM_NAME)

const GROUP_NAME = 'SelectGroup'
export const [SelectGroupContextProvider, useSelectGroupContext] =
  createSelectContext<ISelect.IGroupContext>(GROUP_NAME)

export const SelectProvider: React.FC<ISelect.IProps> = (props: ISelect.IScoped<ISelect.IProps>) => {
  const {
    __scopeSelect,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    value: valueProp,
    defaultValue,
    onValueChange,
    dir,
    name,
    autoComplete,
    disabled,
    required,
    form,
    items,
    multiple = false,
  } = props
  const popperScope = usePopperScope(__scopeSelect)
  const [trigger, setTrigger] = React.useState<HTMLButtonElement | null>(null)
  const [valueNode, setValueNode] = React.useState<HTMLSpanElement | null>(null)
  const [valueNodeHasChildren, setValueNodeHasChildren] = React.useState(false)
  const direction = useDirection(dir)
  const contentId = useId()
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: SELECT_NAME,
  })
  const [value, setValue] = useControllableState<ISelect.IValue | undefined>({
    prop: valueProp,
    defaultProp: defaultValue ?? (multiple ? [] : undefined),
    onChange: onValueChange as ((value: ISelect.IValue | undefined) => void) | undefined,
    caller: SELECT_NAME,
  })
  const triggerPointerDownPosRef = React.useRef<{ x: number; y: number } | null>(null)
  const [userSelection, setUserSelection] = React.useState<ISelect.IUserSelection | null>(null)
  const onUserSelect = React.useCallback<ISelect.IContext['onUserSelect']>(
    (picked, stoppedPropagation) => {
      let nextValue: ISelect.IValue = picked
      if (multiple) {
        const values = [value ?? []].flat()
        nextValue = values.includes(picked) ? values.filter((v) => v !== picked) : [...values, picked]
      }
      setUserSelection({ value: nextValue, stoppedPropagation })
      setValue(nextValue)
    },
    [multiple, value, setValue],
  )

  const initialValueRef = React.useRef(value)
  React.useEffect(() => {
    const associatedForm = getAssociatedForm(trigger, form)
    if (associatedForm) {
      const reset = () => setValue(initialValueRef.current)
      associatedForm.addEventListener('reset', reset)
      return () => associatedForm.removeEventListener('reset', reset)
    }
  }, [form, trigger, setValue])

  const [nativeOptions, setNativeOptions] = React.useState(new Set<ISelect.INativeOption>())

  const onNativeOptionAdd = React.useCallback<ISelect.INativeOptionsContext['onNativeOptionAdd']>((option) => {
    setNativeOptions((prev) => new Set(prev).add(option))
  }, [])
  const onNativeOptionRemove = React.useCallback<ISelect.INativeOptionsContext['onNativeOptionRemove']>((option) => {
    setNativeOptions((prev) => {
      const optionsSet = new Set(prev)
      optionsSet.delete(option)
      return optionsSet
    })
  }, [])

  return (
    <PopperPrimitive.Root {...popperScope}>
      <SelectContextProvider
        scope={__scopeSelect}
        name={name}
        autoComplete={autoComplete}
        disabled={disabled}
        required={required}
        form={form}
        trigger={trigger}
        onTriggerChange={setTrigger}
        valueNode={valueNode}
        onValueNodeChange={setValueNode}
        valueNodeHasChildren={valueNodeHasChildren}
        onValueNodeHasChildrenChange={setValueNodeHasChildren}
        contentId={contentId}
        value={value}
        onValueChange={setValue}
        onUserSelect={onUserSelect}
        multiple={multiple}
        onOpenChange={setOpen}
        dir={direction}
        triggerPointerDownPosRef={triggerPointerDownPosRef}
        items={items}
        // default true so SSR forms still bubble events without JS
        isFormControl={trigger ? !!form || !!trigger.closest('form') : true}>
        <SelectOpenProvider scope={__scopeSelect} open={open}>
          <Collection.Provider scope={__scopeSelect}>
            <SelectNativeOptionsProvider
              scope={__scopeSelect}
              onNativeOptionAdd={onNativeOptionAdd}
              onNativeOptionRemove={onNativeOptionRemove}>
              <SelectBubbleInputContextProvider
                scope={__scopeSelect}
                nativeOptions={nativeOptions}
                userSelection={userSelection}>
                {children}
              </SelectBubbleInputContextProvider>
            </SelectNativeOptionsProvider>
          </Collection.Provider>
        </SelectOpenProvider>
      </SelectContextProvider>
    </PopperPrimitive.Root>
  )
}

SelectProvider.displayName = 'SelectProvider'

export const Select: React.FC<ISelect.IProps> = (props: ISelect.IScoped<ISelect.IProps>) => (
  <SelectProvider {...props}>
    {props.children}
    <SelectBubbleInput __scopeSelect={props.__scopeSelect} />
  </SelectProvider>
)

Select.displayName = SELECT_NAME

export const SelectBubbleInput = React.forwardRef<HTMLSelectElement, ISelect.IScoped<ISelect.IBubbleInputProps>>(
  (props, forwardedRef) => {
    const { __scopeSelect, ...selectProps } = props
    const context = useSelectContext(BUBBLE_INPUT_NAME, __scopeSelect)
    const { userSelection, nativeOptions } = useSelectBubbleInputContext(BUBBLE_INPUT_NAME, __scopeSelect)
    const { onValueChange } = context
    const ref = React.useRef<HTMLSelectElement>(null)
    const composedRefs = useComposedRefs(forwardedRef, ref)
    const value = context.value ?? ''
    const prevValueRef = React.useRef(value)
    const handledSelectionRef = React.useRef(userSelection)
    const isDispatchingRef = React.useRef(false)
    const options = context.items
      ? context.items.map((item) => (
          <option key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </option>
        ))
      : Array.from(nativeOptions)

    // A programmatic change syncs the form without bubbling; a user's pick bubbles unless its handler stopped it.
    React.useEffect(() => {
      const select = ref.current
      const setNativeValue = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set
      const selection = userSelection !== handledSelectionRef.current ? userSelection : null
      // A parent may build an equal array afresh on every render, which changes nothing.
      const same = (a: ISelect.IValue, b: ISelect.IValue) => JSON.stringify(a) === JSON.stringify(b)
      const valueChanged = !same(prevValueRef.current, value)
      handledSelectionRef.current = userSelection
      prevValueRef.current = value
      if (!select || !setNativeValue) return
      const setNative = (nextValue: ISelect.IValue) => {
        if (typeof nextValue === 'string') setNativeValue.call(select, nextValue)
        else for (const option of select.options) option.selected = nextValue.includes(option.value)
      }
      const dispatch = (nextValue: ISelect.IValue, bubbles: boolean) => {
        setNative(nextValue)
        isDispatchingRef.current = true
        select.dispatchEvent(new Event('change', { bubbles }))
        isDispatchingRef.current = false
      }

      if (selection && !valueChanged) {
        // A controlled parent has not applied the pick, and applying it later looks programmatic, so tell the form now.
        if (!same(selection.value, value) && !selection.stoppedPropagation) {
          dispatch(selection.value, true)
          setNative(value)
        }
      } else if (valueChanged) {
        dispatch(value, !!selection && !selection.stoppedPropagation)
      }
    }, [value, userSelection])

    return context.isFormControl ? (
      <VisuallyHidden asChild>
        <select
          key={options.map((option) => option.props.value).join(';')}
          aria-hidden
          tabIndex={-1}
          required={context.required}
          name={context.name}
          autoComplete={context.autoComplete}
          disabled={context.disabled}
          form={context.form}
          multiple={context.multiple}
          // enable form autofill
          onChange={({ target }) => {
            if (!isDispatchingRef.current)
              onValueChange(
                context.multiple ? Array.from(target.selectedOptions, (option) => option.value) : target.value,
              )
          }}
          {...selectProps}
          ref={composedRefs}
          // A `value` would make React swallow the change event dispatched above.
          defaultValue={value}>
          {shouldShowPlaceholder(context.value) && !options.some((option) => !option.props.value) ? (
            <option value="" />
          ) : null}
          {options}
        </select>
      </VisuallyHidden>
    ) : null
  },
)

SelectBubbleInput.displayName = BUBBLE_INPUT_NAME
