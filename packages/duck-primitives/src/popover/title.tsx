import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { Primitive } from '../primitive-elements'
import { usePopoverContentContext } from './content'
import type { IPopover } from './popover.types'

const TITLE_NAME = 'PopoverTitle'

type PopoverTitleElement = React.ComponentRef<typeof Primitive.h2>

export const PopoverTitle = React.forwardRef<PopoverTitleElement, IPopover.ITitleProps>(
  (props: IPopover.IScoped<IPopover.ITitleProps>, forwardedRef) => {
    const { __scopePopover, id: idProp, ...titleProps } = props
    const { onTitleIdChange } = usePopoverContentContext(TITLE_NAME, __scopePopover)
    const generatedId = React.useId()
    const id = idProp ?? generatedId

    useLayoutEffect(() => {
      onTitleIdChange(id)
      return () => onTitleIdChange(undefined)
    }, [id, onTitleIdChange])

    return <Primitive.h2 data-slot="popover-title" id={id} {...titleProps} ref={forwardedRef} />
  },
)

PopoverTitle.displayName = TITLE_NAME
