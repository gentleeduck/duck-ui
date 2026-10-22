/** The radios a key can reach: enabled, shown, and the group's own rather than a nested group's. */
export function getNavigableRadios(group: HTMLElement) {
  return Array.from(group.querySelectorAll<HTMLElement>('[role="radio"]')).filter(
    (radio) =>
      !radio.hasAttribute('data-disabled') &&
      radio.closest('[role="radiogroup"]') === group &&
      radio.checkVisibility?.({ visibilityProperty: true }) !== false,
  )
}
