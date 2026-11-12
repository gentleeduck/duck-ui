import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import * as PopperPrimitive from '../popper'
import { Primitive } from '../primitive-elements'
import { OPEN_KEYS, useCollection, usePopperScope, useSelectContext, useSelectOpenContext } from './select'
import { getItemText, shouldShowPlaceholder, useTypeaheadListNavigation } from './select.libs'
import type { ISelect } from './select.types'

const TRIGGER_NAME = 'SelectTrigger'

export const SelectTrigger = React.forwardRef<HTMLButtonElement, ISelect.ITriggerProps>(
  (props: ISelect.IScoped<ISelect.ITriggerProps>, forwardedRef) => {
    const { __scopeSelect, disabled = false, ...triggerProps } = props
    const popperScope = usePopperScope(__scopeSelect)
    const context = useSelectContext(TRIGGER_NAME, __scopeSelect)
    const { open } = useSelectOpenContext(TRIGGER_NAME, __scopeSelect)
    const isDisabled = context.disabled || disabled
    const composedRefs = useComposedRefs(forwardedRef, context.onTriggerChange)
    const getItems = useCollection(__scopeSelect)
    const pointerTypeRef = React.useRef<React.PointerEvent['pointerType']>('touch')
    const stoppedPropagationRef = React.useRef(false)

    const [searchRef, handleTypeaheadSearch, resetTypeaheadState] = useTypeaheadListNavigation({
      getItems: () => (context.items ?? getItems()).filter((item) => !item.disabled),
      getItemElement: (item) => ('ref' in item ? (item.ref.current as HTMLElement | null) : null),
      getItemTextValue: (item) => ('label' in item ? item.label : getItemText(item)),
      getCurrentItem: (items) => items.find((item) => item.value === context.value),
      onMatch: (item) => {
        context.onUserSelect(item.value, stoppedPropagationRef.current)
      },
    })

    const handleOpen = (trigger: HTMLButtonElement, pointerEvent?: React.MouseEvent | React.PointerEvent) => {
      // A disabled fieldset disables the button without telling the select.
      if (!isDisabled && !trigger.matches(':disabled')) {
        context.onOpenChange(true)
        // reset typeahead when we open
        resetTypeaheadState()
      }

      if (pointerEvent) {
        context.triggerPointerDownPosRef.current = {
          x: Math.round(pointerEvent.pageX),
          y: Math.round(pointerEvent.pageY),
        }
      }
    }

    return (
      <PopperPrimitive.Anchor asChild {...popperScope}>
        <Primitive.button
          data-slot="select-trigger"
          type="button"
          role="combobox"
          aria-controls={open ? context.contentId : undefined}
          aria-expanded={open}
          aria-required={context.required}
          aria-autocomplete="none"
          dir={context.dir}
          data-state={open ? 'open' : 'closed'}
          disabled={isDisabled}
          data-disabled={isDisabled ? '' : undefined}
          data-placeholder={shouldShowPlaceholder(context.value) ? '' : undefined}
          {...triggerProps}
          ref={composedRefs}
          onClick={composeEventHandlers(triggerProps.onClick, (event) => {
            event.currentTarget.focus()
            if (pointerTypeRef.current !== 'mouse') {
              handleOpen(event.currentTarget, event)
            }
          })}
          onPointerDown={composeEventHandlers(triggerProps.onPointerDown, (event) => {
            pointerTypeRef.current = event.pointerType
            const target = event.target as HTMLElement
            if (target.hasPointerCapture(event.pointerId)) {
              target.releasePointerCapture(event.pointerId)
            }
            if (event.button === 0 && event.ctrlKey === false && event.pointerType === 'mouse') {
              handleOpen(event.currentTarget, event)
              event.preventDefault()
            }
          })}
          onKeyDown={composeEventHandlers(triggerProps.onKeyDown, (event) => {
            const isTypingAhead = searchRef.current !== ''
            const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
            // Typing on a closed multiple select would add to its picks unseen, so only a single select does it.
            if (!context.multiple && !isModifierKey && event.key.length === 1) {
              stoppedPropagationRef.current = event.isPropagationStopped()
              handleTypeaheadSearch(event.key)
            }
            if (isTypingAhead && event.key === ' ') return
            if (OPEN_KEYS.includes(event.key)) {
              handleOpen(event.currentTarget)
              event.preventDefault()
            }
          })}
        />
      </PopperPrimitive.Anchor>
    )
  },
)

SelectTrigger.displayName = TRIGGER_NAME
