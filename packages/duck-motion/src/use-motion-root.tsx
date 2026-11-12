import type { Transition } from 'motion/react'
import * as React from 'react'
import { useMotionConfig } from './motion-provider'
import { duckMotionDurationMs } from './transitions/tweens'

/**
 * Refcount for body `pointer-events:none` (DismissableLayer + RemoveScroll write it
 * while modal open). Overlapping mounts would race — last close could clear `none`
 * while another modal still wants it.
 */
let bodyPointerEventsOwners = 0

function claimBodyPointerEventsOwnership() {
  bodyPointerEventsOwners += 1
}

function releaseBodyPointerEventsOwnership() {
  if (bodyPointerEventsOwners > 0) bodyPointerEventsOwners -= 1
  if (bodyPointerEventsOwners === 0 && typeof document !== 'undefined') {
    if (document.body.style.pointerEvents === 'none') document.body.style.pointerEvents = ''
  }
}

/** Clear body pointer-events only when no owners active — used by `handleOpenChange`. */
function tryClearBodyPointerEvents() {
  if (bodyPointerEventsOwners > 0) return
  if (typeof document === 'undefined') return
  if (document.body.style.pointerEvents === 'none') document.body.style.pointerEvents = ''
}

/**
 * Bridges MotionRoot and MotionContent so the primitive stays "open" while
 * the content's exit animation is still playing. Root passes
 * `open={isOpen || showContent}` to the primitive.
 */
export interface IMotionRootContextValue {
  isOpen: boolean
  /** Content still visually mounted (including during exit). */
  showContent: boolean
  /** Called by `AnimatePresence.onExitComplete` to finally unmount. */
  setShowContent: (v: boolean) => void
}

export const MotionRootContext = React.createContext<IMotionRootContextValue>({
  isOpen: false,
  showContent: false,
  setShowContent: () => {},
})

/**
 * Two-state pattern for motion exit animations. Returns `rootProps` to spread
 * on the primitive Root and a `contextValue` to provide via
 * `MotionRootContext.Provider`. The primitive stays open during exit because
 * Root receives `open={isOpen || showContent}`; `AnimatePresence.onExitComplete`
 * flips `showContent` false to finally close.
 */
export function useMotionRoot(props: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { open: controlledOpen, defaultOpen = false, onOpenChange } = props

  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  const [showContent, setShowContent] = React.useState(!!isOpen)
  const prevOpenRef = React.useRef(!!isOpen)
  const { exitTransition } = useMotionConfig()
  const exitMs = getTransitionDurationMs(exitTransition)
  const closedAtRef = React.useRef(Number.NEGATIVE_INFINITY)
  // Re-opening while the exit plays: the leaving content's DismissableLayer reads the trigger's pointerdown as an
  // outside click and sends a close in the same frame. Only that close is swallowed; from closed nothing sends one.
  const ignoreNextCloseRef = React.useRef(false)

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        setShowContent(true)
        if (performance.now() - closedAtRef.current < exitMs) {
          ignoreNextCloseRef.current = true
          requestAnimationFrame(() => {
            ignoreNextCloseRef.current = false
          })
        }
      } else {
        if (ignoreNextCloseRef.current) {
          ignoreNextCloseRef.current = false
          return
        }
        // DismissableLayer sets body pointer-events:none while mounted; with
        // forceMount it stays mounted through exit, so restore immediately
        // or the trigger is unclickable until the animation completes. Gated
        // by the same refcount as `useMotionMount` so overlapping roots don't
        // clear `none` while another modal still wants it set.
        tryClearBodyPointerEvents()
      }
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange, exitMs],
  )

  React.useEffect(() => {
    if (isOpen && !prevOpenRef.current) setShowContent(true)
    if (!isOpen && prevOpenRef.current) closedAtRef.current = performance.now()
    prevOpenRef.current = !!isOpen
  }, [isOpen])

  const contextValue = React.useMemo<IMotionRootContextValue>(
    () => ({ isOpen: !!isOpen, showContent, setShowContent }),
    [isOpen, showContent],
  )

  const rootProps = React.useMemo(
    () => ({ open: !!isOpen, onOpenChange: handleOpenChange }),
    [isOpen, handleOpenChange],
  )

  return { rootProps, contextValue }
}

/** Read MotionRoot context from a content component. */
export function useMotionContent() {
  return React.useContext(MotionRootContext)
}

/** Exit duration (ms) from a `Transition`. Reads `duration` or spring `visualDuration`. */
export function getTransitionDurationMs(t?: Transition): number {
  if (!t) return duckMotionDurationMs.exit
  if ('duration' in t && typeof t.duration === 'number') return t.duration * 1000
  if ('visualDuration' in t && typeof t.visualDuration === 'number') return t.visualDuration * 1000
  return duckMotionDurationMs.exit
}

/**
 * Manual mount/unmount driver for `<Portal forceMount><Content asChild>` where AnimatePresence
 * can't track exits through the non-motion wrapper. `shouldRender` stays true for
 * `exitDurationMs` after close so exit animation plays in place, then unmounts.
 * Body `pointer-events` restored via refcount so overlapping modals don't fight.
 */
export function useMotionMount(isOpen: boolean, exitDurationMs?: number): boolean {
  const { exitTransition } = useMotionConfig()
  const resolvedDuration = exitDurationMs ?? getTransitionDurationMs(exitTransition)
  const [shouldRender, setShouldRender] = React.useState(isOpen)
  const ownsBodyPointerEventsRef = React.useRef(false)

  React.useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      if (!ownsBodyPointerEventsRef.current) {
        ownsBodyPointerEventsRef.current = true
        claimBodyPointerEventsOwnership()
      }
      return
    }

    const t = setTimeout(() => {
      setShouldRender(false)
      if (ownsBodyPointerEventsRef.current) {
        ownsBodyPointerEventsRef.current = false
        releaseBodyPointerEventsOwnership()
      }
    }, resolvedDuration)

    return () => clearTimeout(t)
  }, [isOpen, resolvedDuration])

  // Final unmount safety net: release if still owned (e.g. parent unmounts mid-exit).
  React.useEffect(() => {
    return () => {
      if (ownsBodyPointerEventsRef.current) {
        ownsBodyPointerEventsRef.current = false
        releaseBodyPointerEventsOwnership()
      }
    }
  }, [])

  return shouldRender
}
