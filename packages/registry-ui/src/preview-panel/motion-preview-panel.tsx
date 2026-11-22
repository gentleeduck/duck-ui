'use client'

import { cn } from '@gentleduck/libs/cn'
import { loadDomAnimation } from '@gentleduck/motion/motion-features'
import { useMotionPreset } from '@gentleduck/motion/motion-presets'
import { scaleIn } from '@gentleduck/motion/presets/scale-in'
import { springBouncy } from '@gentleduck/motion/transitions/springs'
import { useDirection } from '@gentleduck/primitives/direction'
import { Lock, LockOpen, Minus, Plus, RotateCcw } from 'lucide-react'
import { LazyMotion, m } from 'motion/react'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MotionBadge } from '../badge'
import { MotionButton } from '../button'
import { MotionButtonGroup } from '../button-group'
import { toDirection } from '../direction/direction.libs'
import { MotionSeparator } from '../separator'
import { MotionTooltip, MotionTooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip'
import { warnOnSuspiciousUnsafeHtml } from './preview-panel.libs'
import type { IPreviewPanelProps } from './preview-panel.types'

const ZOOM_STEP_BUTTON = 0.25
const ZOOM_STEP_WHEEL = 0.1
const MOTION_PREVIEW_PANEL_OPTIONS = { transition: springBouncy } as const
const CONTENT_STYLE = { transformOrigin: 'center center' } as const

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

const MotionZoomControls = memo(function MotionZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  zoom,
  onToggleLock,
  locked = false,
  zoomInText = 'Zoom in',
  zoomOutText = 'Zoom out',
  resetText = 'Reset view',
  lockText = 'Lock the view',
  unlockText = 'Unlock the view',
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  zoom: number
  onToggleLock?: () => void
  locked?: boolean
  zoomInText?: string
  zoomOutText?: string
  resetText?: string
  lockText?: string
  unlockText?: string
}) {
  return (
    <TooltipProvider>
      <MotionButtonGroup
        data-slot="preview-panel-controls"
        className="rounded-md border bg-background/80 backdrop-blur-sm">
        <MotionTooltip>
          <TooltipTrigger asChild>
            <MotionButton
              variant="ghost"
              size="icon-sm"
              onClick={onZoomIn}
              icon={<Plus aria-hidden="true" />}
              aria-label={zoomInText}
            />
          </TooltipTrigger>
          <MotionTooltipContent>{zoomInText}</MotionTooltipContent>
        </MotionTooltip>
        <MotionSeparator orientation="vertical" />
        <MotionBadge variant="secondary" size="sm" className="rounded-none tabular-nums">
          {Math.round(zoom * 100)}%
        </MotionBadge>
        <MotionSeparator orientation="vertical" />
        <MotionTooltip>
          <TooltipTrigger asChild>
            <MotionButton
              variant="ghost"
              size="icon-sm"
              onClick={onZoomOut}
              icon={<Minus aria-hidden="true" />}
              aria-label={zoomOutText}
            />
          </TooltipTrigger>
          <MotionTooltipContent>{zoomOutText}</MotionTooltipContent>
        </MotionTooltip>
        <MotionSeparator orientation="vertical" />
        <MotionTooltip>
          <TooltipTrigger asChild>
            <MotionButton
              variant="ghost"
              size="icon-sm"
              onClick={onReset}
              icon={<RotateCcw aria-hidden="true" />}
              aria-label={resetText}
            />
          </TooltipTrigger>
          <MotionTooltipContent>{resetText}</MotionTooltipContent>
        </MotionTooltip>
        {onToggleLock && (
          <>
            <MotionSeparator orientation="vertical" />
            <MotionTooltip>
              <TooltipTrigger asChild>
                <MotionButton
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggleLock}
                  icon={locked ? <Lock aria-hidden="true" /> : <LockOpen aria-hidden="true" />}
                  aria-label={locked ? unlockText : lockText}
                />
              </TooltipTrigger>
              <MotionTooltipContent>{locked ? unlockText : lockText}</MotionTooltipContent>
            </MotionTooltip>
          </>
        )}
      </MotionButtonGroup>
    </TooltipProvider>
  )
})

const MotionPreviewPanel = React.forwardRef<
  HTMLDivElement,
  Omit<IPreviewPanelProps, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>
>(
  (
    {
      maxHeight,
      minZoom = 0.25,
      maxZoom = 4,
      initialZoom = 1,
      showControls = true,
      defaultLocked = true,
      lockText,
      unlockText,
      actions,
      unsafeHtml,
      children,
      className,
      style,
      onStateChange,
      syncState,
      dir,
      zoomInText,
      zoomOutText,
      resetText,
      ...rest
    },
    ref,
  ) => {
    // The panel always renders its container and its content, so each ref holds its element from the first effect on.
    // biome-ignore lint/style/noNonNullAssertion: typed as always set, for the reason above
    const containerRef = useRef<HTMLDivElement>(null!)
    // biome-ignore lint/style/noNonNullAssertion: typed as always set, for the reason above
    const contentRef = useRef<HTMLDivElement>(null!)
    const content = useMotionPreset(scaleIn, MOTION_PREVIEW_PANEL_OPTIONS)

    const s = useRef({
      zoom: initialZoom,
      x: 0,
      y: 0,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      posStartX: 0,
      posStartY: 0,
      rafId: 0,
      pointerId: 0,
      emitPending: false,
      pinchDist: 0,
      pinchZoom: initialZoom,
      willChangeTimer: 0,
    })

    const [displayZoom, setDisplayZoom] = useState(initialZoom)
    const [locked, setLocked] = useState(defaultLocked)
    const toggleLock = useCallback(() => setLocked((was) => !was), [])

    // Ref-shadow so a toggle never re-subscribes the gesture listeners
    const lockedRef = useRef(locked)
    lockedRef.current = locked
    const onStateChangeRef = useRef(onStateChange)
    onStateChangeRef.current = onStateChange

    const flushEmit = useCallback(() => {
      if (!s.current.emitPending) return
      s.current.emitPending = false
      onStateChangeRef.current?.({ zoom: s.current.zoom, x: s.current.x, y: s.current.y })
    }, [])

    const markDirty = useCallback(() => {
      s.current.emitPending = true
    }, [])

    const applyTransform = useCallback((animate: boolean) => {
      const el = contentRef.current
      const { x, y, zoom } = s.current
      el.style.transform = `translate3d(${x}px,${y}px,0) scale(${zoom})`
      el.style.transition = animate ? 'transform 0.15s ease-out' : 'none'
      el.style.willChange = 'transform'
      clearTimeout(s.current.willChangeTimer)
      s.current.willChangeTimer = window.setTimeout(() => {
        if (!s.current.dragging) {
          contentRef.current.style.willChange = 'auto'
        }
      }, 200)
    }, [])

    const scheduleApply = useCallback(() => {
      if (s.current.rafId) return
      s.current.rafId = requestAnimationFrame(() => {
        s.current.rafId = 0
        applyTransform(false)
        flushEmit()
      })
    }, [applyTransform, flushEmit])

    const syncDisplay = useCallback(() => setDisplayZoom(s.current.zoom), [])

    useEffect(() => {
      if (!syncState) return
      const { zoom, x, y } = syncState
      if (Math.abs(s.current.zoom - zoom) < 0.001 && Math.abs(s.current.x - x) < 0.5 && Math.abs(s.current.y - y) < 0.5)
        return
      s.current.zoom = zoom
      s.current.x = x
      s.current.y = y
      applyTransform(true)
      syncDisplay()
    }, [syncState, applyTransform, syncDisplay])

    const handleZoomIn = useCallback(() => {
      s.current.zoom = clamp(s.current.zoom + ZOOM_STEP_BUTTON, minZoom, maxZoom)
      applyTransform(true)
      syncDisplay()
      markDirty()
      flushEmit()
    }, [applyTransform, syncDisplay, markDirty, flushEmit, minZoom, maxZoom])

    const handleZoomOut = useCallback(() => {
      s.current.zoom = clamp(s.current.zoom - ZOOM_STEP_BUTTON, minZoom, maxZoom)
      applyTransform(true)
      syncDisplay()
      markDirty()
      flushEmit()
    }, [applyTransform, syncDisplay, markDirty, flushEmit, minZoom, maxZoom])

    const handleReset = useCallback(() => {
      s.current.zoom = initialZoom
      s.current.x = 0
      s.current.y = 0
      applyTransform(true)
      syncDisplay()
      markDirty()
      flushEmit()
    }, [applyTransform, syncDisplay, markDirty, flushEmit, initialZoom])

    useEffect(() => {
      const el = containerRef.current
      const onDown = (e: PointerEvent) => {
        if (lockedRef.current || e.button !== 0 || s.current.dragging) return
        e.preventDefault()
        el.setPointerCapture(e.pointerId)
        s.current.dragging = true
        s.current.pointerId = e.pointerId
        s.current.dragStartX = e.clientX
        s.current.dragStartY = e.clientY
        s.current.posStartX = s.current.x
        s.current.posStartY = s.current.y
        el.style.cursor = 'grabbing'
      }
      const onMove = (e: PointerEvent) => {
        if (!s.current.dragging || e.pointerId !== s.current.pointerId) return
        s.current.x = s.current.posStartX + (e.clientX - s.current.dragStartX)
        s.current.y = s.current.posStartY + (e.clientY - s.current.dragStartY)
        markDirty()
        scheduleApply()
      }
      const onUp = (e: PointerEvent) => {
        if (!s.current.dragging || e.pointerId !== s.current.pointerId) return
        s.current.dragging = false
        el.releasePointerCapture(e.pointerId)
        el.style.cursor = 'grab'
      }
      const onLeave = (e: PointerEvent) => {
        if (!s.current.dragging || e.pointerId !== s.current.pointerId) return
        s.current.dragging = false
        el.style.cursor = 'grab'
      }
      el.addEventListener('pointerdown', onDown)
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerup', onUp)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointerdown', onDown)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerup', onUp)
        el.removeEventListener('pointerleave', onLeave)
      }
    }, [markDirty, scheduleApply])

    useEffect(() => {
      const el = containerRef.current
      const onWheel = (e: WheelEvent) => {
        if (lockedRef.current) return
        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY > 0 ? -ZOOM_STEP_WHEEL : ZOOM_STEP_WHEEL
        s.current.zoom = clamp(s.current.zoom + delta, minZoom, maxZoom)
        markDirty()
        scheduleApply()
        syncDisplay()
      }
      el.addEventListener('wheel', onWheel, { passive: false })
      return () => el.removeEventListener('wheel', onWheel)
    }, [markDirty, scheduleApply, syncDisplay, minZoom, maxZoom])

    useEffect(() => {
      const el = containerRef.current
      const dist = (e: TouchEvent) => {
        const [a, b] = [e.touches[0], e.touches[1]]
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      }
      const onTouchStart = (e: TouchEvent) => {
        if (!lockedRef.current && e.touches.length === 2) {
          e.preventDefault()
          s.current.pinchDist = dist(e)
          s.current.pinchZoom = s.current.zoom
        }
      }
      const onTouchMove = (e: TouchEvent) => {
        if (!lockedRef.current && e.touches.length === 2) {
          e.preventDefault()
          const scale = dist(e) / s.current.pinchDist
          s.current.zoom = clamp(s.current.pinchZoom * scale, minZoom, maxZoom)
          markDirty()
          scheduleApply()
          syncDisplay()
        }
      }
      el.addEventListener('touchstart', onTouchStart, { passive: false })
      el.addEventListener('touchmove', onTouchMove, { passive: false })
      return () => {
        el.removeEventListener('touchstart', onTouchStart)
        el.removeEventListener('touchmove', onTouchMove)
      }
    }, [markDirty, scheduleApply, syncDisplay, minZoom, maxZoom])

    useEffect(() => {
      return () => {
        if (s.current.rafId) cancelAnimationFrame(s.current.rafId)
        clearTimeout(s.current.willChangeTimer)
      }
    }, [])

    warnOnSuspiciousUnsafeHtml('MotionPreviewPanel', unsafeHtml)

    const containerStyle = useMemo(
      () => ({ maxHeight, cursor: locked ? 'default' : 'grab', touchAction: locked ? 'auto' : 'none' }) as const,
      [maxHeight, locked],
    )
    const direction = useDirection(toDirection(dir))

    return (
      <LazyMotion features={loadDomAnimation}>
        <m.div
          ref={ref}
          data-slot="preview-panel"
          className={cn('relative flex flex-col', className)}
          dir={direction}
          style={style}
          initial={content.initial}
          animate={content.animate}
          transition={content.transition}
          {...rest}>
          {(showControls || actions) && (
            <div className="absolute end-3 top-3 z-10 flex items-center gap-2" data-slot="preview-panel-toolbar">
              {actions}
              {showControls && (
                <MotionZoomControls
                  lockText={lockText}
                  locked={locked}
                  onReset={handleReset}
                  onToggleLock={toggleLock}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  resetText={resetText}
                  unlockText={unlockText}
                  zoom={displayZoom}
                  zoomInText={zoomInText}
                  zoomOutText={zoomOutText}
                />
              )}
            </div>
          )}
          <div
            ref={containerRef}
            className="flex flex-1 items-center justify-center overflow-hidden"
            style={containerStyle}>
            {/* SEC-002: `unsafeHtml` is rendered verbatim and is the caller's responsibility to sanitise. */}
            {unsafeHtml !== undefined ? (
              <div
                ref={contentRef}
                className="flex w-full items-center justify-center p-6"
                style={CONTENT_STYLE}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: caller-owns-sanitisation contract documented on `unsafeHtml` prop
                dangerouslySetInnerHTML={{ __html: unsafeHtml }}
              />
            ) : (
              <div ref={contentRef} className="flex w-full items-center justify-center p-6" style={CONTENT_STYLE}>
                {children}
              </div>
            )}
          </div>
        </m.div>
      </LazyMotion>
    )
  },
)
MotionPreviewPanel.displayName = 'MotionPreviewPanel'

export { MotionPreviewPanel, MotionZoomControls }
