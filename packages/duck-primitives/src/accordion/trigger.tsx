import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { Primitive } from '../primitive-elements'
import { isTrigger, ROOT_SELECTOR, useAccordionContext } from './accordion'
import type { IAccordion } from './accordion.types'
import { useAccordionItemContext } from './item'

const TRIGGER_NAME = 'AccordionTrigger'

const AccordionTrigger = React.forwardRef<HTMLButtonElement, IAccordion.ITriggerProps>(
  (props: IAccordion.IScoped<IAccordion.ITriggerProps>, forwardedRef) => {
    const { __scopeAccordion, disabled: disabledProp, ...triggerProps } = props
    const context = useAccordionContext(TRIGGER_NAME, __scopeAccordion)
    const itemContext = useAccordionItemContext(TRIGGER_NAME, __scopeAccordion)
    const disabled = itemContext.disabled || disabledProp || false
    const { onTriggerIdChange } = itemContext
    const { id } = triggerProps

    useLayoutEffect(() => {
      onTriggerIdChange(id)
      return () => onTriggerIdChange(undefined)
    }, [onTriggerIdChange, id])

    return (
      <Primitive.button
        type="button"
        data-slot="accordion-trigger"
        aria-controls={itemContext.contentId}
        aria-disabled={disabled || undefined}
        aria-expanded={itemContext.open}
        data-state={itemContext.open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        data-orientation={context.orientation}
        {...triggerProps}
        // After the props, so an id={undefined} passed on leaves the trigger the id its content is named by.
        id={itemContext.triggerId}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, () => {
          if (!disabled) itemContext.onOpenToggle()
        })}
        onFocus={composeEventHandlers(props.onFocus, () => context.onFocusChange?.(itemContext.value))}
        onBlur={composeEventHandlers(props.onBlur, (event) => {
          const root = context.onFocusChange && event.currentTarget.closest(ROOT_SELECTOR)
          if (root && !isTrigger(root, event.relatedTarget)) context.onFocusChange?.(null)
        })}
      />
    )
  },
)

AccordionTrigger.displayName = TRIGGER_NAME

export { AccordionTrigger }
