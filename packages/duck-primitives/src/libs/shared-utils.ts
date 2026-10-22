export interface IPoint {
  x: number
  y: number
}
export type Polygon = IPoint[]

/** `wrapArray(['a','b','c','d'], 2) === ['c','d','a','b']` */
export function wrapArray<T>(array: T[], startIndex: number) {
  // biome-ignore lint/style/noNonNullAssertion: modulo guarantees the index is always within bounds
  return array.map<T>((_, index) => array[(startIndex + index) % array.length]!)
}

/** A sort comparator putting nodes in document order. */
export function byDocumentPosition(a: Node, b: Node) {
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1
}

/** The focused element of the document or shadow root `node` is in, of which the top document names only the host. */
export function getRootActiveElement(node: Node) {
  return (node.getRootNode() as Document | ShadowRoot).activeElement
}

/** Focus first candidate that actually accepts focus. */
export function focusFirst(candidates: HTMLElement[], preventScroll = false) {
  // The top document names only the iframe or shadow host while focus moves inside it.
  const root = candidates[0]?.getRootNode() as Document | ShadowRoot | undefined
  const previouslyFocusedElement = root?.activeElement
  for (const candidate of candidates) {
    if (candidate === previouslyFocusedElement) return
    candidate.focus({ preventScroll })
    if (root?.activeElement !== previouslyFocusedElement) return
  }
}

/** Point-in-polygon (ray casting). https://github.com/substack/point-in-polygon */
export function isPointInPolygon(point: IPoint, polygon: Polygon) {
  const { x, y } = point
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    // biome-ignore lint/style/noNonNullAssertion: loop indices i and j are always within polygon bounds
    const ii = polygon[i]!
    // biome-ignore lint/style/noNonNullAssertion: loop indices i and j are always within polygon bounds
    const jj = polygon[j]!
    const xi = ii.x
    const yi = ii.y
    const xj = jj.x
    const yj = jj.y

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}
