import * as React from 'react'
import { useId } from '../hooks/use-id'
import { Primitive } from '../primitive-elements'
import { SelectGroupContextProvider, useSelectContext } from './select'
import type { ISelect } from './select.types'

const GROUP_NAME = 'SelectGroup'

export const SelectGroup = React.forwardRef<HTMLDivElement, ISelect.IGroupProps>(
  (props: ISelect.IScoped<ISelect.IGroupProps>, forwardedRef) => {
    const { __scopeSelect, ...groupProps } = props
    const context = useSelectContext(GROUP_NAME, __scopeSelect)
    const groupId = useId()
    return (
      <SelectGroupContextProvider scope={__scopeSelect} id={groupId}>
        <Primitive.div
          data-slot="select-group"
          role="group"
          aria-labelledby={groupId}
          dir={context.dir}
          {...groupProps}
          ref={forwardedRef}
        />
      </SelectGroupContextProvider>
    )
  },
)

SelectGroup.displayName = GROUP_NAME
