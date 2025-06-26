export function lockScrollbar(isLocked: boolean) {
  const { documentElement, body } = document

  documentElement.style.scrollbarGutter = 'stable'
  body.style.overflow = isLocked ? 'hidden' : 'auto'
}

export function cleanLockScrollbar() {
  // document.documentElement.style.scrollbarGutter = "";
  document.body.style.overflow = ''
}
