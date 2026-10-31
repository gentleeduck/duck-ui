import { hideOthers } from 'aria-hidden'
import * as React from 'react'
import { DismissableLayer } from '../dismissable-layer'
import { FocusScope, FocusScopeBranchProvider } from '../focus-scope'
import { useFocusGuards } from '../hooks/use-focus-guard'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { composeEventHandlers } from '../libs/compose-event-handler'
import { useComposedRefs } from '../libs/compose-ref'
import { focusOn } from '../libs/focus-on'
import { getState } from '../libs/get-state'
import { joinIds } from '../libs/join-ids'
import { Presence } from '../presence'
import { useHeldOpen } from '../presence/presence.libs'
import { DialogContentProvider, DialogNestingContext, useDialogContext } from './dialog'
import { useIdRegistry } from './dialog.libs'
import type { IDialog } from './dialog.types'
import { usePortalContext } from './portal'
import { DescriptionWarning, TitleWarning } from './warnings'

const CONTENT_NAME = 'DialogContent'

export const DialogContent = React.forwardRef<HTMLDivElement, IDialog.IContentProps>(
  (props: IDialog.IScoped<IDialog.IContentProps>, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog)
    const { forceMount = portalContext.forceMount, ...contentProps } = props
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog)
    return (
      <Presence present={forceMount || context.open}>
        <DialogContentImpl {...contentProps} ref={forwardedRef} />
      </Presence>
    )
  },
)

DialogContent.displayName = CONTENT_NAME

const DialogContentImpl = React.forwardRef<HTMLDivElement, IDialog.IContentProps>(
  (props: IDialog.IScoped<IDialog.IContentProps>, forwardedRef) => {
    const {
      __scopeDialog,
      trapFocus,
      disableOutsidePointerEvents,
      initialFocus,
      finalFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      id: idProp,
      'aria-describedby': ariaDescribedBy,
      ...contentProps
    } = props
    const context = useDialogContext(CONTENT_NAME, __scopeDialog)
    const { modal, open, triggerRef, onContentIdChange } = context
    const held = useHeldOpen(open)
    const [titleIds, onTitleIdChange, titles] = useIdRegistry()
    const [descriptionIds, onDescriptionIdChange, descriptions] = useIdRegistry()
    // State, not a ref, so hiding the page waits for an element that Presence mounts after the first commit.
    const [content, setContent] = React.useState<HTMLDivElement | null>(null)
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, setContent)
    const interactedOutsideRef = React.useRef(false)
    const pointerDownOutsideRef = React.useRef(false)

    useLayoutEffect(() => onContentIdChange(idProp), [idProp, onContentIdChange])

    React.useEffect(() => {
      if (modal && content) return hideOthers(content)
    }, [modal, content])

    // Kept mounted, a non-modal content outlives its close and hears the page while closed, so each opening starts clean.
    React.useEffect(() => {
      if (!open) return
      interactedOutsideRef.current = false
      pointerDownOutsideRef.current = false
    }, [open])

    useFocusGuards()

    const nestingStyle = { '--gentleduck-dialog-nested-dialogs': context.nestedCount }

    return (
      <DialogNestingContext.Provider value={context.onNestedCountChange}>
        <DialogContentProvider
          scope={__scopeDialog}
          onTitleIdChange={onTitleIdChange}
          onDescriptionIdChange={onDescriptionIdChange}>
          <FocusScopeBranchProvider registry={context.branchRegistry}>
            <FocusScope
              asChild
              loop
              trapped={modal && (trapFocus ?? open)}
              branches={context.branches}
              onMountAutoFocus={focusOn(onOpenAutoFocus, initialFocus)}
              onUnmountAutoFocus={composeEventHandlers(focusOn(onCloseAutoFocus, finalFocus), (event) => {
                if (modal || !interactedOutsideRef.current) triggerRef.current?.focus()
                event.preventDefault()
              })}>
              <DismissableLayer
                data-slot="dialog-content"
                role="dialog"
                id={idProp || context.contentId}
                aria-labelledby={titleIds}
                aria-describedby={joinIds(ariaDescribedBy, descriptionIds)}
                data-state={getState(open)}
                data-nested={context.nested ? '' : undefined}
                data-nested-dialog-open={context.nestedCount > 0 ? '' : undefined}
                dir={context.dir}
                {...contentProps}
                style={{ ...nestingStyle, ...contentProps.style }}
                ref={composedRefs}
                disableOutsidePointerEvents={modal && (disableOutsidePointerEvents ?? held)}
                deferPointerDownOutside
                onPointerDownOutside={composeEventHandlers(onPointerDownOutside, (event) => {
                  const { button, ctrlKey } = event.detail.originalEvent
                  // A right click, or a control click on a Mac, opens a context menu rather than leaving a modal.
                  if (modal && (button === 2 || (button === 0 && ctrlKey))) event.preventDefault()
                })}
                onFocusOutside={composeEventHandlers(onFocusOutside, (event) => {
                  if (modal) event.preventDefault()
                })}
                onInteractOutside={(event) => {
                  onInteractOutside?.(event)
                  if (modal) return
                  const { type } = event.detail.originalEvent
                  if (!event.defaultPrevented) {
                    interactedOutsideRef.current = true
                    if (type === 'pointerdown') pointerDownOutsideRef.current = true
                  }
                  if (triggerRef.current?.contains(event.target as Node)) event.preventDefault()
                  if (type === 'focusin' && pointerDownOutsideRef.current) event.preventDefault()
                }}
                onDismiss={() => context.onOpenChange(false)}
              />
            </FocusScope>
          </FocusScopeBranchProvider>
          {process.env.NODE_ENV !== 'production' && (
            <>
              <TitleWarning titles={titles} named={'aria-label' in props || 'aria-labelledby' in props} />
              <DescriptionWarning descriptions={descriptions} described={'aria-describedby' in props} />
            </>
          )}
        </DialogContentProvider>
      </DialogNestingContext.Provider>
    )
  },
)

DialogContentImpl.displayName = 'DialogContentImpl'
