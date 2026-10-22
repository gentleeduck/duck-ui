import * as React from 'react'

type PossibleRef<T> = React.Ref<T> | undefined

/** Assigns to callback ref OR RefObject; returns React 19 cleanup if the callback ref produced one. */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    return ref(value)
  } else if (ref !== null && ref !== undefined) {
    ref.current = value
  }
}

/**
 * Assigns the node to every ref. If any callback ref returns a React 19 cleanup, returns one cleanup that runs each
 * (and nulls the others).
 */
function assignRefs<T>(refs: PossibleRef<T>[], node: T) {
  let hasCleanup = false
  const cleanups = refs.map((ref) => {
    const cleanup = setRef(ref, node)
    if (!hasCleanup && typeof cleanup === 'function') {
      hasCleanup = true
    }
    return cleanup
  })

  if (hasCleanup) {
    return () => {
      for (let i = 0; i < cleanups.length; i++) {
        const cleanup = cleanups[i]
        if (typeof cleanup === 'function') {
          cleanup()
        } else {
          setRef(refs[i], null)
        }
      }
    }
  }
}

/** Compose refs into a single callback ref. */
function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => assignRefs(refs, node)
}

/** Memoized composeRefs; rebuilds only when any input ref changes. */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // biome-ignore lint/correctness/useExhaustiveDependencies: spread refs as deps so the callback updates when any ref changes
  return React.useCallback<React.RefCallback<T>>((node) => assignRefs(refs, node), refs)
}

export { composeRefs, useComposedRefs }
