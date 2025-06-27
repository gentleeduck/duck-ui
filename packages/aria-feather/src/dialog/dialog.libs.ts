export function lockScrollbar(isLocked: boolean) {
  const { documentElement, body } = document

  // documentElement.style.scrollbarGutter = 'stable'
  body.style.overflow = isLocked ? 'hidden' : 'auto'
}

export function cleanLockScrollbar() {
  //NOTE: consider leaving this as it is. we might consider using it in the future.
  // document.documentElement.style.scrollbarGutter = "";
  document.body.style.overflow = ''
}
