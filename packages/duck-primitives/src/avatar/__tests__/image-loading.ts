// jsdom never loads an image. This loads each <img> in the document the way a browser does: after a delay it is
// complete with a natural size and fires `load`, or it is complete and broken and fires `error`.
export function mockImageLoading({
  cache = new Set<string>(),
  delay = 300,
  succeeds = (_image: HTMLImageElement) => true,
} = {}) {
  const prototype = window.HTMLImageElement.prototype
  const descriptors = {
    complete: Object.getOwnPropertyDescriptor(prototype, 'complete'),
    naturalWidth: Object.getOwnPropertyDescriptor(prototype, 'naturalWidth'),
  }
  const broken = new WeakSet<HTMLImageElement>()
  const sourceOf = (image: HTMLImageElement) => image.getAttribute('src') ?? ''

  Object.defineProperties(prototype, {
    complete: {
      configurable: true,
      get(this: HTMLImageElement) {
        return !sourceOf(this) || cache.has(sourceOf(this)) || broken.has(this)
      },
    },
    naturalWidth: {
      configurable: true,
      get(this: HTMLImageElement) {
        return cache.has(sourceOf(this)) ? 300 : 0
      },
    },
  })

  const request = (image: HTMLImageElement) => {
    const src = sourceOf(image)
    broken.delete(image)
    if (!src) return
    setTimeout(() => {
      if (sourceOf(image) !== src) return
      if (succeeds(image)) {
        cache.add(src)
        image.dispatchEvent(new Event('load'))
      } else {
        broken.add(image)
        image.dispatchEvent(new Event('error'))
      }
    }, delay)
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target instanceof window.HTMLImageElement) request(record.target)
      for (const node of record.addedNodes) {
        if (node instanceof window.HTMLImageElement) request(node)
        if (node instanceof window.Element) for (const image of node.querySelectorAll('img')) request(image)
      }
    }
  })
  observer.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] })

  return () => {
    observer.disconnect()
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (descriptor) Object.defineProperty(prototype, key, descriptor)
    }
  }
}
