// When the element's last transition ends. The browser repeats a shorter list of durations or delays across the
// properties it transitions.
function getTransitionMs(element: HTMLElement) {
  const { transitionDelay, transitionDuration, transitionProperty } = getComputedStyle(element)
  const durations = transitionDuration.split(',')
  const delays = transitionDelay.split(',')
  const seconds = (list: string[], index: number) => Number.parseFloat(list[index % list.length])
  return Math.max(
    ...transitionProperty
      .split(',')
      .map((property, index) =>
        property === 'none' ? 0 : (seconds(durations, index) + seconds(delays, index)) * 1000,
      ),
  )
}

// A transition that cannot run, such as a height going to `auto` without `interpolate-size`, never starts. jsdom
// has no `getAnimations`, so a test there waits out the computed duration.
function isTransitioning(element: HTMLElement) {
  return element.getAnimations?.().some((animation) => 'transitionProperty' in animation) ?? true
}

export { getTransitionMs, isTransitioning }
