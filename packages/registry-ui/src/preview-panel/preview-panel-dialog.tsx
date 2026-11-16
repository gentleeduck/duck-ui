'use client'

import { cn } from '@gentleduck/libs/cn'
import { Maximize2 } from 'lucide-react'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Button } from '../button'
import { Dialog, DialogContent, DialogTrigger } from '../dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip'
import { PreviewPanel } from './preview-panel'
import type { IPreviewPanelDialogProps, IPreviewPanelState } from './preview-panel.types'

const PreviewPanelDialog = React.forwardRef<HTMLDivElement, IPreviewPanelDialogProps & { fullscreenText?: string }>(
  (
    {
      children,
      unsafeHtml,
      className,
      panelClassName,
      maxHeight,
      minZoom = 0.25,
      maxZoom = 4,
      initialZoom = 1,
      showControls = true,
      defaultLocked = true,
      lockText,
      unlockText,
      syncPanels = true,
      fullscreenText = 'Open fullscreen',
      zoomInText,
      zoomOutText,
      resetText,
    },
    ref,
  ) => {
    const [sharedState, setSharedState] = useState<IPreviewPanelState | undefined>(undefined)

    // One update a frame, carrying the last state emitted in it.
    const pendingRef = useRef<IPreviewPanelState | null>(null)

    const handleStateChange = useCallback(
      (state: IPreviewPanelState) => {
        if (!syncPanels) return
        const scheduled = pendingRef.current !== null
        pendingRef.current = state
        if (scheduled) return
        requestAnimationFrame(() => {
          setSharedState(pendingRef.current ?? undefined)
          pendingRef.current = null
        })
      },
      [syncPanels],
    )

    const contentProps = useMemo(
      () => (unsafeHtml !== undefined ? { unsafeHtml } : { children }),
      [unsafeHtml, children],
    )

    const dialogPanelClassName = useMemo(() => cn('min-h-[70vh]', panelClassName), [panelClassName])

    return (
      <div ref={ref} className={cn('group relative', className)}>
        <TooltipProvider>
          <Dialog>
            <div className="relative overflow-hidden rounded-lg border bg-card">
              <PreviewPanel
                {...contentProps}
                maxHeight={maxHeight}
                minZoom={minZoom}
                maxZoom={maxZoom}
                initialZoom={initialZoom}
                showControls={showControls}
                defaultLocked={defaultLocked}
                lockText={lockText}
                unlockText={unlockText}
                className={panelClassName}
                onStateChange={handleStateChange}
                resetText={resetText}
                syncState={syncPanels ? sharedState : undefined}
                zoomInText={zoomInText}
                zoomOutText={zoomOutText}
                actions={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          icon={<Maximize2 aria-hidden="true" />}
                          aria-label={fullscreenText}
                          className="rounded-md border bg-background/80 backdrop-blur-sm"
                        />
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{fullscreenText}</TooltipContent>
                  </Tooltip>
                }
              />
            </div>
            <DialogContent className="max-h-[85vh] max-w-[90vw] overflow-auto p-0">
              <PreviewPanel
                {...contentProps}
                minZoom={minZoom}
                maxZoom={maxZoom}
                initialZoom={initialZoom}
                showControls={showControls}
                defaultLocked={false}
                lockText={lockText}
                unlockText={unlockText}
                className={dialogPanelClassName}
                onStateChange={handleStateChange}
                resetText={resetText}
                syncState={syncPanels ? sharedState : undefined}
                zoomInText={zoomInText}
                zoomOutText={zoomOutText}
              />
            </DialogContent>
          </Dialog>
        </TooltipProvider>
      </div>
    )
  },
)
PreviewPanelDialog.displayName = 'PreviewPanelDialog'

export { PreviewPanelDialog }
