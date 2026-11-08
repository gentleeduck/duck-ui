import * as React from 'react'
import { DirectionContext } from '../direction'
import { useFocusScopeBranchRegistry } from '../focus-scope'
import { useControllableState } from '../hooks/use-controllable-state'
import { useId } from '../hooks/use-id'
import { createContextScope } from '../libs/create-context'
import type { IDialog } from './dialog.types'

const DIALOG_NAME = 'Dialog'

export const [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME)

export const [DialogProvider, useDialogContext] = createDialogContext<IDialog.IContext>(DIALOG_NAME)

export const [DialogContentProvider, useDialogContentContext] =
  createDialogContext<IDialog.IContentContext>('DialogContent')

// Unscoped, so an alert dialog or a sheet opened from a dialog's content counts as nested in it.
export const DialogNestingContext = React.createContext<IDialog.IContext['onNestedCountChange'] | undefined>(undefined)

export const DialogLayerContext = React.createContext<IDialog.IContext['layerRegistry'] | undefined>(undefined)

const Dialog: React.FC<IDialog.IProps> = (props: IDialog.IScoped<IDialog.IProps>) => {
  const { __scopeDialog, children, open: openProp, defaultOpen, onOpenChange, dir, modal = true } = props
  // Only portalled parts write it, and a portal into the page inherits the page's own.
  const providerDir = React.useContext(DirectionContext)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const contentRef = React.useRef<IDialog.ContentElement>(null)
  const generatedContentId = useId()
  const [contentId, setContentId] = React.useState<string>()
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DIALOG_NAME,
  })
  const onOpenToggle = React.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen])
  const { nodes: branches, registry: branchRegistry } = useFocusScopeBranchRegistry()
  const { nodes: layers, registry: ownLayerRegistry } = useFocusScopeBranchRegistry()
  const parentLayerRegistry = React.useContext(DialogLayerContext)
  // A dialog two levels down sits outside its grandparent's content too, so each layer is handed up the chain.
  const layerRegistry = React.useMemo<IDialog.IContext['layerRegistry']>(
    () => ({
      add: (node) => {
        ownLayerRegistry.add(node)
        parentLayerRegistry?.add(node)
      },
      remove: (node) => {
        ownLayerRegistry.remove(node)
        parentLayerRegistry?.remove(node)
      },
    }),
    [ownLayerRegistry, parentLayerRegistry],
  )
  const onParentNestedCountChange = React.useContext(DialogNestingContext)
  const [nestedCount, setNestedCount] = React.useState(0)

  React.useEffect(() => {
    if (!onParentNestedCountChange) return
    onParentNestedCountChange(open ? nestedCount + 1 : 0)
    return () => onParentNestedCountChange(0)
  }, [onParentNestedCountChange, open, nestedCount])

  return (
    <DialogProvider
      scope={__scopeDialog}
      triggerRef={triggerRef}
      contentRef={contentRef}
      contentId={contentId || generatedContentId}
      onContentIdChange={setContentId}
      open={open}
      onOpenChange={setOpen}
      onOpenToggle={onOpenToggle}
      modal={modal}
      dir={dir ?? providerDir}
      branches={branches}
      branchRegistry={branchRegistry}
      layers={layers}
      layerRegistry={layerRegistry}
      nested={onParentNestedCountChange !== undefined}
      nestedCount={nestedCount}
      onNestedCountChange={setNestedCount}>
      {children}
    </DialogProvider>
  )
}

Dialog.displayName = DIALOG_NAME

export { Dialog }
