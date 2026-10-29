import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { Primitive } from '../primitive-elements'
import { usePaginationContext } from './pagination'
import type { IPagination } from './pagination.types'

/** A page or trigger moving to `target`: a button, or under `getPageHref` a link that loses its address when disabled. */
export const PaginationControl = React.forwardRef<HTMLElement, IPagination.IScoped<IPagination.IControlImplProps>>(
  (props, forwardedRef) => {
    const { __scopePagination, name, target, disabled = false, onClick, ...controlProps } = props
    const context = usePaginationContext(name, __scopePagination)
    const shared = {
      'data-disabled': disabled ? '' : undefined,
      ...controlProps,
      // React only writes the element into a ref, so one typed for any element takes the link or the button.
      ref: forwardedRef as React.Ref<HTMLAnchorElement & HTMLButtonElement>,
      onClick: disabled
        ? (event: React.MouseEvent<HTMLElement>) => event.preventDefault()
        : // A client router prevents the browser following a link so it can navigate itself; the page still moves.
          composeEventHandlers(onClick, () => context.setPage(target), {
            checkForDefaultPrevented: !context.getPageHref,
          }),
    }

    return context.getPageHref ? (
      <Primitive.a
        role={disabled ? 'link' : undefined}
        aria-disabled={disabled || undefined}
        href={disabled ? undefined : context.getPageHref(target)}
        {...shared}
      />
    ) : (
      <Primitive.button type="button" disabled={disabled} {...shared} />
    )
  },
)
