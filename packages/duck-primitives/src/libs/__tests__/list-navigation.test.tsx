import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { render, renderHook, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { freshDom, wait } from '../../__tests__/dom'
import {
  findNextItem,
  getNavigationCandidates,
  useTypeaheadListNavigation,
  useTypeaheadSearch,
  useVimNavigation,
} from '../list-navigation'

freshDom()

describe('findNextItem', () => {
  const items = ['Apple', 'Banana', 'Avocado', 'Cherry'].map((textValue) => ({ textValue }))
  const [apple, banana, avocado] = items

  it('takes a letter to the next item after the current one that it starts, as Radix does', () => {
    expect(findNextItem(items, 'a', banana)).toBe(avocado)
  })

  it('takes a letter the current item starts on to the next item it starts, round to the top', () => {
    expect(findNextItem(items, 'a', apple)).toBe(avocado)
    expect(findNextItem(items, 'a', avocado)).toBe(apple)
  })

  it('takes a letter to the first item it starts when there is no current item', () => {
    expect(findNextItem(items, 'b')).toBe(banana)
  })

  it('cycles through the items a letter typed again starts', () => {
    expect(findNextItem(items, 'aa', apple)).toBe(avocado)
    expect(findNextItem(items, 'aaa', avocado)).toBe(apple)
  })

  it('stays on the current item while a longer search still matches it, whatever its case', () => {
    expect(findNextItem(items, 'AV', avocado)).toBeUndefined()
  })

  it('takes a longer search to the first item it matches from the current one on', () => {
    expect(findNextItem(items, 'ch', apple)).toBe(items[3])
  })

  it('finds nothing for a letter no item starts', () => {
    expect(findNextItem(items, 'z', apple)).toBeUndefined()
  })
})

describe('useTypeaheadSearch', () => {
  it('starts the search over once it is reset', () => {
    const searches: string[] = []
    const { result } = renderHook(() =>
      useTypeaheadSearch((search) => {
        searches.push(search)
        return undefined
      }),
    )
    const [searchRef, type, reset] = result.current

    type('d')
    reset()

    expect(searchRef.current).toBe('')

    type('u')

    expect(searches).toEqual(['d', 'u'])
  })

  it('keeps building while each key comes within a second of the last', async () => {
    const searches: string[] = []
    const { result } = renderHook(() =>
      useTypeaheadSearch((search) => {
        searches.push(search)
        return undefined
      }),
    )
    const [, type] = result.current

    type('d')
    await wait(600)
    type('u')
    await wait(600)
    type('c')

    expect(searches).toEqual(['d', 'du', 'duc'])
  })

  it('keeps its search in a ref it is handed, so two lists can share one', () => {
    const shared = { current: '' }
    const { result } = renderHook(() => useTypeaheadSearch(() => undefined, shared))
    const [, type] = result.current

    type('d')

    expect(shared.current).toBe('d')
  })

  it('builds on the search for a second, then starts over', async () => {
    const searches: string[] = []
    const { result } = renderHook(() =>
      useTypeaheadSearch((search) => {
        searches.push(search)
        return undefined
      }),
    )
    const [, type] = result.current

    type('d')
    type('u')
    await wait(1050)
    type('c')

    expect(searches).toEqual(['d', 'du', 'c'])
  })

  it('still starts over a second after a key typed before strict mode replays the mount effects', async () => {
    const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    const wasActEnvironment = environment.IS_REACT_ACT_ENVIRONMENT
    environment.IS_REACT_ACT_ENVIRONMENT = false
    const searches: string[] = []
    let type = (_key: string) => {}
    // A render past the scheduler's 5ms slice leaves the mount effects to a later task, as a busy page does.
    function Busy() {
      const end = performance.now() + 10
      let spins = 0
      while (performance.now() < end) spins++
      return spins < 0 ? spins : null
    }
    function Typeahead() {
      const [, handleTypeaheadSearch] = useTypeaheadSearch((search) => {
        searches.push(search)
        return undefined
      })
      type = handleTypeaheadSearch
      return <i />
    }
    const container = document.body.appendChild(document.createElement('div'))
    const root = createRoot(container)
    const committed = new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        observer.disconnect()
        resolve()
      })
      observer.observe(container, { childList: true })
    })

    try {
      root.render(
        <StrictMode>
          <Busy />
          <Typeahead />
        </StrictMode>,
      )
      await committed
      type('d')
      await new Promise((resolve) => setTimeout(resolve, 1050))
      type('c')

      expect(searches).toEqual(['d', 'c'])
    } finally {
      root.unmount()
      container.remove()
      environment.IS_REACT_ACT_ENVIRONMENT = wasActEnvironment
    }
  })
})

describe('useTypeaheadListNavigation', () => {
  const menu = (labels: string[]) => {
    const { container } = render(
      <>
        {labels.map((label) => (
          <button key={label} type="button">
            {label}
          </button>
        ))}
      </>,
    )
    const items = Array.from(container.querySelectorAll('button'))
    const { result } = renderHook(() =>
      useTypeaheadListNavigation({
        getItems: () => items,
        getItemElement: (item) => item,
        getItemTextValue: (item) => item.textContent ?? '',
        onMatch: (item) => item.focus(),
      }),
    )
    const [, type] = result.current
    return (keys: string) => {
      for (const key of keys) type(key)
      return document.activeElement?.textContent
    }
  }

  it('takes a letter typed afresh to the next item it starts after the focused one', () => {
    const type = menu(['Apple', 'Banana', 'Avocado'])
    screen.getByText('Banana').focus()

    expect(type('a')).toBe('Avocado')
  })

  it('counts from the item focused inside a shadow root, of which the page names only the host', () => {
    const host = document.body.appendChild(document.createElement('div'))
    const root = host.attachShadow({ mode: 'open' })
    const items = ['Apple', 'Banana', 'Avocado'].map((label) =>
      root.appendChild(Object.assign(document.createElement('button'), { textContent: label })),
    )
    const { result } = renderHook(() =>
      useTypeaheadListNavigation({
        getItems: () => items,
        getItemElement: (item) => item,
        getItemTextValue: (item) => item.textContent ?? '',
        onMatch: (item) => item.focus(),
      }),
    )
    const [, type] = result.current
    items[1]?.focus()

    type('a')

    expect(root.activeElement?.textContent).toBe('Avocado')
    host.remove()
  })

  it('forgets the item it last matched once it is reset, so the next letter counts from focus', () => {
    const { container } = render(
      <>
        {['Apple', 'Banana', 'Avocado'].map((label) => (
          <button key={label} type="button">
            {label}
          </button>
        ))}
      </>,
    )
    const items = Array.from(container.querySelectorAll('button'))
    const matched: string[] = []
    const { result } = renderHook(() =>
      useTypeaheadListNavigation({
        getItems: () => items,
        getItemElement: (item) => item,
        getItemTextValue: (item) => item.textContent ?? '',
        onMatch: (item) => matched.push(item.textContent ?? ''),
      }),
    )
    const [, type, reset] = result.current

    type('a')
    type('b')
    reset()
    type('a')

    expect(matched).toEqual(['Apple', 'Banana', 'Apple'])
  })

  it('counts from the item it last matched while focus has not followed it', () => {
    const items = ['Apple', 'Banana', 'Avocado'].map((label) =>
      Object.assign(document.createElement('i'), { textContent: label }),
    )
    const matched: string[] = []
    const { result } = renderHook(() =>
      useTypeaheadListNavigation({
        getItems: () => items,
        getItemElement: (item) => item,
        getItemTextValue: (item) => item.textContent ?? '',
        onMatch: (item) => matched.push(item.textContent ?? ''),
      }),
    )
    const [, type] = result.current

    type('a')
    type('a')

    expect(matched).toEqual(['Apple', 'Avocado'])
  })

  it('matches an item by its text without the spaces around it, and passes over one that is only spaces', () => {
    const items = ['  ', ' Apple '].map((label) => Object.assign(document.createElement('i'), { textContent: label }))
    const matched: string[] = []
    const { result } = renderHook(() =>
      useTypeaheadListNavigation({
        getItems: () => items,
        getItemElement: (item) => item,
        getItemTextValue: (item) => item.textContent ?? '',
        onMatch: (item) => matched.push(item.textContent ?? ''),
      }),
    )
    const [, type] = result.current

    type('a')
    type(' ')

    expect(matched).toEqual([' Apple '])
  })

  it('counts from the item it is told is current, where focus is not', () => {
    const items = ['Apple', 'Banana', 'Avocado'].map((label) =>
      Object.assign(document.createElement('i'), { textContent: label }),
    )
    const matched: string[] = []
    const { result } = renderHook(() =>
      useTypeaheadListNavigation({
        getItems: () => items,
        getItemElement: (item) => item,
        getItemTextValue: (item) => item.textContent ?? '',
        getCurrentItem: (candidates) => candidates[1],
        onMatch: (item) => matched.push(item.textContent ?? ''),
      }),
    )
    const [, type] = result.current

    type('a')

    expect(matched).toEqual(['Avocado'])
  })

  it('stays on the focused item while it still matches what was typed', () => {
    const type = menu(['Notion', 'Inbox', 'Cast'])

    expect(type('Inbox')).toBe('Inbox')
  })

  it('keeps no search when no item has text, so a space typed next is not taken as part of one', () => {
    const items = [document.createElement('button')]
    const { result } = renderHook(() =>
      useTypeaheadListNavigation({
        getItems: () => items,
        getItemElement: (item) => item,
        getItemTextValue: (item) => item.textContent ?? '',
        onMatch: () => {},
      }),
    )
    const [searchRef, type] = result.current

    type('a')

    expect(searchRef.current).toBe('')
  })

  it('falls back to the last key when nothing matches what was typed', () => {
    const type = menu(['Notion', 'Inbox', 'Cast'])

    expect(type('cn')).toBe('Notion')
  })
})

describe('getNavigationCandidates', () => {
  const [a, b, c] = ['a', 'b', 'c'].map((id) => Object.assign(document.createElement('button'), { id }))
  const ids = (key: string, active: Element | null) =>
    getNavigationCandidates([a, b, c] as HTMLElement[], key, active).map((item) => item.id)

  it('lists the items after the active one for ArrowDown and those before it, nearest first, for ArrowUp', () => {
    expect(ids('ArrowDown', b ?? null)).toEqual(['c'])
    expect(ids('ArrowUp', b ?? null)).toEqual(['a'])
  })

  it('lists every item from the top for Home and from the bottom for End, wherever focus is', () => {
    expect(ids('Home', b ?? null)).toEqual(['a', 'b', 'c'])
    expect(ids('End', b ?? null)).toEqual(['c', 'b', 'a'])
  })

  it('lists every item for an arrow when no item is active', () => {
    expect(ids('ArrowDown', null)).toEqual(['a', 'b', 'c'])
    expect(ids('ArrowUp', document.body)).toEqual(['c', 'b', 'a'])
  })
})

describe('useVimNavigation', () => {
  const scrollIntoView = mock()
  const originalScrollIntoView = Element.prototype.scrollIntoView
  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoView
  })
  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
    scrollIntoView.mockClear()
  })

  function list() {
    const { container } = render(
      <>
        {['Apple', 'Banana', 'Cherry'].map((label) => (
          <button key={label} type="button">
            {label}
          </button>
        ))}
      </>,
    )
    const items = Array.from(container.querySelectorAll('button'))
    const onNavigate = mock(() => {})
    const { result } = renderHook(() => useVimNavigation({ onNavigate, ggTimeoutMs: 50 }))
    const press = (key: string, init: Partial<KeyboardEvent> = {}) => {
      const event = new KeyboardEvent('keydown', { cancelable: true, key, ...init })
      return [result.current(event, items), event.defaultPrevented]
    }
    return { items, onNavigate, press }
  }

  it('takes G to the last item and gg to the first, after the keydown, and claims both keys', async () => {
    const { items, onNavigate, press } = list()
    items[1]?.focus()
    const focusLast = spyOn(items[2] as HTMLButtonElement, 'focus')

    expect(press('G', { shiftKey: true })).toEqual([true, true])
    expect(document.activeElement).toBe(items[1] ?? null)
    await wait(0)

    expect(document.activeElement).toBe(items[2] ?? null)
    expect([scrollIntoView.mock.contexts, scrollIntoView.mock.calls]).toEqual([[items[2]], [[{ block: 'nearest' }]]])
    expect(focusLast.mock.calls).toEqual([[{ preventScroll: true }]])

    expect(press('g')).toEqual([false, false])
    expect(press('g')).toEqual([true, true])
    expect(document.activeElement).toBe(items[2] ?? null)
    await wait(0)

    expect(document.activeElement).toBe(items[0] ?? null)
    expect(onNavigate).toHaveBeenCalledTimes(2)
  })

  it('takes no gg whose second g comes too late, after another key, or with a modifier between', async () => {
    const { onNavigate, press } = list()

    press('g')
    await wait(60)
    press('g')
    press('x')
    press('g')
    press('g', { ctrlKey: true })
    press('g')
    press('g', { shiftKey: true })
    press('g', { altKey: true })
    press('g', { metaKey: true })

    expect(press('g')).toEqual([false, false])
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('leaves a G typed without Shift, and any key with no items, to the list', () => {
    const { onNavigate, press } = list()
    const { result } = renderHook(() => useVimNavigation({ onNavigate }))

    expect(press('G')).toEqual([false, false])
    expect(result.current(new KeyboardEvent('keydown', { key: 'G', shiftKey: true }), [])).toBe(false)
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
