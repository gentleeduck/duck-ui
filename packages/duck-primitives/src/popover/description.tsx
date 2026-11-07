import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { Primitive } from '../primitive-elements'
import { usePopoverContentContext } from './content'
import type { IPopover } from './popover.types'

const DESCRIPTION_NAME = 'PopoverDescription'

type PopoverDescriptionElement = React.ComponentRef<typeof Primitive.p>

export const PopoverDescription = React.forwardRef<PopoverDescriptionElement, IPopover.IDescriptionProps>(
  (props: IPopover.IScoped<IPopover.IDescriptionProps>, forwardedRef) => {
    const { __scopePopover, id: idProp, ...descriptionProps } = props
    const { onDescriptionIdChange } = usePopoverContentContext(DESCRIPTION_NAME, __scopePopover)
    const generatedId = React.useId()
    const id = idProp ?? generatedId

    useLayoutEffect(() => {
      onDescriptionIdChange(id)
      return () => onDescriptionIdChange(undefined)
    }, [id, onDescriptionIdChange])

    return <Primitive.p data-slot="popover-description" id={id} {...descriptionProps} ref={forwardedRef} />
  },
)

PopoverDescription.displayName = DESCRIPTION_NAME
