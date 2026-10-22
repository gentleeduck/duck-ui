export function getEnabledRadios(group: HTMLElement) {
  return Array.from(group.querySelectorAll<HTMLElement>('[role="radio"]')).filter(
    (radio) => !radio.hasAttribute('data-disabled') && radio.closest('[role="radiogroup"]') === group,
  )
}
