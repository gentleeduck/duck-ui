import * as React from 'react'
import { Primitive } from '../primitive-elements'
import { useAccordionContext } from './accordion'
import type { IAccordion } from './accordion.types'
import { useAccordionItemContext } from './item'

const HEADER_NAME = 'AccordionHeader'

const AccordionHeader = React.forwardRef<HTMLHeadingElement, IAccordion.IHeaderProps>(
  (props: IAccordion.IScoped<IAccordion.IHeaderProps>, forwardedRef) => {
    const { __scopeAccordion, ...headerProps } = props
    const context = useAccordionContext(HEADER_NAME, __scopeAccordion)
    const itemContext = useAccordionItemContext(HEADER_NAME, __scopeAccordion)

    return (
      <Primitive.h3
        data-slot="accordion-header"
        data-state={itemContext.open ? 'open' : 'closed'}
        data-disabled={itemContext.disabled ? '' : undefined}
        data-orientation={context.orientation}
        {...headerProps}
        ref={forwardedRef}
      />
    )
  },
)

AccordionHeader.displayName = HEADER_NAME

export { AccordionHeader }
