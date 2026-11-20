import * as React from 'react'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { Primitive } from '../primitive-elements'
import { usePaginationContext } from './pagination'
import type { IPagination } from './pagination.types'

/** A page or trigger moving to `toPage`: a button, or under `getPageHref` a link that loses its address when disabled. */
export const PaginationControl = React.forwardRef<HTMLElement, IPagination.IScoped<IPagination.IControlImplProps>>(
  (props, forwardedRef) => {
    const { __scopePagination, name, toPage, disabled, onClick, ...controlProps } = props
    const context = usePaginationContext(name, __scopePagination)
    const shared = {
      'data-disabled': disabled ? '' : undefined,
      ...controlProps,
      // React only writes the element into a ref, so one typed for any element takes the link or the button.
      ref: forwardedRef as React.Ref<HTMLAnchorElement & HTMLButtonElement>,
      // Stopped before any click handler runs, a slotted child's included, as a disabled button runs none.
      onClickCapture: disabled ? stopClick : controlProps.onClickCapture,
      onClick: disabled
        ? undefined
        : // A client router prevents the browser following a link so it can navigate itself; the page still moves.
          composeEventHandlers(
            onClick,
            (event: React.MouseEvent<HTMLElement>) => {
              // A modified click opens the link somewhere else, so this page stays where it is.
              if (context.getPageHref && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
              context.setPage(toPage)
            },
            { checkForDefaultPrevented: !context.getPageHref },
          ),
    }

    return context.getPageHref ? (
      <Primitive.a
        role={disabled ? 'link' : undefined}
        aria-disabled={disabled || undefined}
        href={disabled ? undefined : context.getPageHref(toPage)}
        {...shared}
      />
    ) : (
      <Primitive.button type="button" disabled={disabled} {...shared} />
    )
  },
)

function stopClick(event: React.MouseEvent<HTMLElement>) {
  event.preventDefault()
  event.stopPropagation()
}
