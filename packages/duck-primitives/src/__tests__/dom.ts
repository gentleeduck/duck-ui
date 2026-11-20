import { act, cleanup, fireEvent } from '@testing-library/react'
import { afterEach } from 'vitest'

// testing-library unmounts after each test on its own only where the runner's globals are on, and these files import theirs.
export function freshDom() {
  afterEach(cleanup)
}

export const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))

/** A whole primary click, since a layer that defers its outside dismissal waits for the click. */
export async function clickOutside(target: HTMLElement, { focus = false } = {}) {
  fireEvent.pointerDown(target, { button: 0 })
  fireEvent.mouseDown(target)
  if (focus) act(() => target.focus())
  fireEvent.mouseUp(target)
  fireEvent.click(target)
  // The dismissal lands a microtask after the click, and the focus it returns a timer after that.
  await act(async () => {})
  await wait(0)
}

/** jsdom lays nothing out, so a node RemoveScroll should let scroll has to report overflow itself. */
export function scrollable(node: HTMLElement | null) {
  if (!node) return
  node.style.overflowY = 'auto'
  Object.defineProperty(node, 'scrollHeight', { configurable: true, value: 200 })
  Object.defineProperty(node, 'clientHeight', { configurable: true, value: 100 })
}

/** RemoveScroll loads its wheel listener from a sidecar, so a test waits until the page is locked. */
export async function untilScrollLocked() {
  for (let attempt = 0; fireEvent.wheel(document.body, { deltaY: 10 }); attempt++) {
    if (attempt === 50) throw new Error('RemoveScroll never locked the page')
    await wait(10)
  }
}

export const scrolls = (node: HTMLElement) => fireEvent.wheel(node, { deltaY: 10 })

/** What a close changes on the page, in order: the content leaving, and the body's own attributes. */
export function pageChangesOnClose(content: HTMLElement, close: () => void) {
  const observer = new MutationObserver(() => {})
  observer.observe(document.body, { attributes: true, childList: true, subtree: true })
  close()
  const changes = observer.takeRecords().flatMap((record) => {
    if (record.type === 'attributes') return record.target === document.body ? [`body ${record.attributeName}`] : []
    return Array.from(record.removedNodes).some((node) => node.contains(content)) ? ['content removed'] : []
  })
  observer.disconnect()
  return [...new Set(changes)]
}
