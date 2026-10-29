import * as React from 'react'
import { useControllableState } from '../hooks/use-controllable-state'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { createContextScope } from '../libs/create-context'
import { focusFirst, wrapArray } from '../libs/shared-utils'
import { Primitive } from '../primitive-elements'
import type { IAccordion } from './accordion.types'

const ACCORDION_NAME = 'Accordion'

const ACCORDION_KEYS = ['Home', 'End', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']
const ROOT_SELECTOR = '[data-slot="accordion"]'
const TRIGGER_SELECTOR = '[data-slot="accordion-trigger"]'

const [createAccordionContext, createAccordionScope] = createContextScope(ACCORDION_NAME)

const [AccordionProvider, useAccordionContext] = createAccordionContext<IAccordion.IContext>(ACCORDION_NAME)

const Accordion = React.forwardRef<HTMLDivElement, IAccordion.IProps>(
  (props: IAccordion.IScoped<IAccordion.IProps>, forwardedRef) => {
    return props.type === 'multiple' ? (
      <AccordionMultiple {...props} ref={forwardedRef} />
    ) : (
      <AccordionSingle {...props} ref={forwardedRef} />
    )
  },
)

Accordion.displayName = ACCORDION_NAME

const AccordionSingle = React.forwardRef<HTMLDivElement, IAccordion.ISingle>(
  (props: IAccordion.IScoped<IAccordion.ISingle>, forwardedRef) => {
    const { type: _, value: valueProp, defaultValue, onValueChange, collapsible = false, ...accordionProps } = props

    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? '',
      onChange: onValueChange,
      caller: ACCORDION_NAME,
    })

    const handleItemOpenChange = React.useCallback(
      (itemValue: string) => {
        setValue((currentValue) => {
          if (currentValue === itemValue) {
            return collapsible ? '' : currentValue
          }

          return itemValue
        })
      },
      [collapsible, setValue],
    )

    return (
      <AccordionImpl
        {...accordionProps}
        ref={forwardedRef}
        openItems={value ? [value] : []}
        onItemOpenChange={handleItemOpenChange}
        collapsible={collapsible}
      />
    )
  },
)

AccordionSingle.displayName = `${ACCORDION_NAME}Single`

const AccordionMultiple = React.forwardRef<HTMLDivElement, IAccordion.IMultiple>(
  (props: IAccordion.IScoped<IAccordion.IMultiple>, forwardedRef) => {
    const { type: _, value: valueProp, defaultValue, onValueChange, ...accordionProps } = props

    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? [],
      onChange: onValueChange,
      caller: ACCORDION_NAME,
    })

    const handleItemOpenChange = React.useCallback(
      (itemValue: string) => {
        setValue((currentValue) => {
          if (currentValue.includes(itemValue)) {
            return currentValue.filter((value) => value !== itemValue)
          }

          return [...currentValue, itemValue]
        })
      },
      [setValue],
    )

    return (
      <AccordionImpl
        {...accordionProps}
        ref={forwardedRef}
        openItems={value}
        onItemOpenChange={handleItemOpenChange}
        collapsible
      />
    )
  },
)

AccordionMultiple.displayName = `${ACCORDION_NAME}Multiple`

const AccordionImpl = React.forwardRef<HTMLDivElement, IAccordion.IImplPrivate>(
  (props: IAccordion.IScoped<IAccordion.IImplPrivate>, forwardedRef) => {
    const {
      __scopeAccordion,
      openItems,
      onItemOpenChange,
      collapsible,
      disabled = false,
      loop = true,
      onFocusChange,
      dir,
      orientation = 'vertical',
      ...accordionProps
    } = props

    const handleKeyDown = composeEventHandlers(props.onKeyDown, (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!ACCORDION_KEYS.includes(event.key)) return
      const triggers = getTriggers(event.currentTarget).filter((trigger) => !trigger.disabled)
      const index = triggers.indexOf(event.target as HTMLButtonElement)
      if (index === -1) return
      event.preventDefault()

      // The page decides, so a `dir` on any element around the root counts, which no context can see.
      const rtl = event.currentTarget.closest('[dir="ltr"], [dir="rtl"]')?.getAttribute('dir') === 'rtl'
      const next = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
      const previous = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
      let candidates: HTMLButtonElement[] = []
      if (event.key === 'Home') candidates = triggers
      else if (event.key === 'End') candidates = [...triggers].reverse()
      else if (event.key === next) candidates = loop ? wrapArray(triggers, index + 1) : triggers.slice(index + 1)
      else if (event.key === previous)
        candidates = (loop ? wrapArray(triggers, index) : triggers.slice(0, index)).reverse()
      // A trigger hidden by a stylesheet or a `hidden` ancestor refuses focus, so the next one takes it.
      focusFirst(candidates)
    })

    return (
      <AccordionProvider
        scope={__scopeAccordion}
        openItems={openItems}
        onItemOpenChange={onItemOpenChange}
        collapsible={collapsible}
        disabled={disabled}
        orientation={orientation}
        onFocusChange={onFocusChange}>
        <Primitive.div
          data-slot="accordion"
          data-orientation={orientation}
          data-disabled={disabled ? '' : undefined}
          dir={dir}
          {...accordionProps}
          ref={forwardedRef}
          onKeyDown={handleKeyDown}
        />
      </AccordionProvider>
    )
  },
)

AccordionImpl.displayName = `${ACCORDION_NAME}Impl`

// A trigger belongs to the nearest accordion around it. One React has hidden, in a suspended Suspense boundary or a
// hidden Activity, carries an inline display: none on itself or an ancestor and cannot take focus.
function isTrigger(root: Element, node: EventTarget | null): node is HTMLButtonElement {
  if (!(node as Element | null)?.matches?.(TRIGGER_SELECTOR)) return false
  for (let element = node as HTMLElement | null; element !== root; element = element.parentElement) {
    if (!element || element.style.display === 'none' || element.matches(ROOT_SELECTOR)) {
      return false
    }
  }
  return true
}

function getTriggers(root: Element) {
  return Array.from(root.querySelectorAll(TRIGGER_SELECTOR)).filter((node) => isTrigger(root, node))
}

export { Accordion, createAccordionContext, createAccordionScope, isTrigger, ROOT_SELECTOR, useAccordionContext }
