import * as React from 'react'
import { useLayoutEffect } from '../hooks/use-layout-effect'
import { getComponentRef } from '../libs/get-component-ref'

function usePresence(present: boolean) {
  const [state, setState] = React.useState<'mounted' | 'exiting' | 'unmounted'>(present ? 'mounted' : 'unmounted')
  // Set while rendering, so opening renders the child in this pass rather than in two more commits.
  if (present && state !== 'mounted') setState('mounted')
  const nodeRef = React.useRef<HTMLElement | null>(null)
  // Learnt as an animation starts, since reading it as the content mounts recalculates the page's styles in the commit.
  const openAnimationRef = React.useRef('none')
  const exitAnimationsRef = React.useRef<Animation[]>([])
  const [handleAnimationStart] = React.useState(() => (event: AnimationEvent) => {
    const node = event.currentTarget as HTMLElement
    if (event.target === node) openAnimationRef.current = getAnimationName(node)
  })

  useLayoutEffect(() => {
    if (present) {
      openAnimationRef.current = 'none'
      return
    }
    if (state !== 'mounted') return
    const node = nodeRef.current
    // No `animationrun` event exists, and `animationstart` waits for animation-delay; an exit animation is told
    // from the one that ran while open by its computed name, and from one still in its delay by `exitAnimations`.
    const exits = node && getAnimationName(node) !== openAnimationRef.current
    exitAnimationsRef.current = exits ? exitAnimations(node) : []
    setState(exitAnimationsRef.current.length ? 'exiting' : 'unmounted')
  }, [present, state])

  useLayoutEffect(() => {
    const node = nodeRef.current
    if (state !== 'exiting' || !node) return
    let exiting = true
    const ownerWindow = node.ownerDocument.defaultView ?? window
    // `finished` settles on an end or a cancel, and a cancel before the animation started sends no `animationcancel`.
    Promise.allSettled(exitAnimationsRef.current.map((animation) => animation.finished)).then(() => {
      if (!exiting) return
      setState('unmounted')
      // A forwards fill holds the last frame when React commits the unmount a frame late.
      const fillMode = node.style.animationFillMode
      node.style.animationFillMode = 'forwards'
      ownerWindow.setTimeout(() => {
        if (node.style.animationFillMode === 'forwards') node.style.animationFillMode = fillMode
      })
    })
    return () => {
      exiting = false
    }
  }, [state])

  return {
    isPresent: present || state !== 'unmounted',
    closing: !present && state === 'mounted',
    ref: React.useCallback(
      (node: HTMLElement | null) => {
        nodeRef.current?.removeEventListener('animationstart', handleAnimationStart)
        nodeRef.current = node
        node?.addEventListener('animationstart', handleAnimationStart)
      },
      [handleAnimationStart],
    ),
  }
}

function getAnimationName(node: HTMLElement) {
  return getComputedStyle(node).animationName || 'none'
}

// The CSS animations the close started, pending until the next frame; one the content opened with is past that, even
// while it waits out a delay. jsdom has no `getAnimations`, so there content leaves at once.
function exitAnimations(node: HTMLElement) {
  return (node.getAnimations?.() ?? []).filter(
    (animation) => 'animationName' in animation && animation.pending && animation.playState !== 'finished',
  )
}

// True for the one commit between `present` turning false and Presence unmounting the child or starting its exit.
const PresenceClosingContext = React.createContext(false)

/**
 * `open`, held until the content has left the page or started its exit. Releasing a scroll lock or the body's
 * pointer events just before the content is removed makes the removal recalculate the style of every element on
 * the page: 3.1ms against 1.2ms per close with 2,000 of them.
 */
function useHeldOpen(open: boolean) {
  return React.useContext(PresenceClosingContext) || open
}

export { getComponentRef, PresenceClosingContext, useHeldOpen, usePresence }
