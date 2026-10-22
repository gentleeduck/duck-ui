import * as React from 'react'
import { useComposedRefs } from '../libs/compose-ref'
import { usePresence } from '../presence/presence.libs'
import { type Primitive, primitiveElement } from '../primitive-elements/primitive-elements'
import { useRadioGroupItemContext } from './radio-group'
import type { IRadioGroup } from './radio-group.types'

const INDICATOR_NAME = 'RadioGroupIndicator'

type RadioGroupIndicatorElement = React.ComponentRef<typeof Primitive.span>

const RadioGroupIndicator = React.forwardRef<RadioGroupIndicatorElement, IRadioGroup.IIndicatorProps>(
  (props: IRadioGroup.IScoped<IRadioGroup.IIndicatorProps>, forwardedRef) => {
    const { __scopeRadioGroup, forceMount, asChild, ...indicatorProps } = props
    const itemContext = useRadioGroupItemContext(INDICATOR_NAME, __scopeRadioGroup)
    // Presence's hook rather than its component, which with its context cost two fibers per radio.
    const presence = usePresence(forceMount || itemContext.checked)
    const ref = useComposedRefs(forwardedRef, presence.ref)
    if (!presence.isPresent) return null
    const Element = primitiveElement('span', asChild)

    return (
      <Element
        data-slot="radio-group-indicator"
        data-state={itemContext.checked ? 'checked' : 'unchecked'}
        data-disabled={itemContext.disabled ? '' : undefined}
        {...indicatorProps}
        ref={ref}
      />
    )
  },
)

RadioGroupIndicator.displayName = INDICATOR_NAME

export { RadioGroupIndicator }
