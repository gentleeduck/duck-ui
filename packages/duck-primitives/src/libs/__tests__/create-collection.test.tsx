import { describe, expect, it } from 'bun:test'
import { act, fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { freshDom } from '../../__tests__/dom'
import { createCollection } from '../create-collection'

freshDom()

const [Collection, useCollection] = createCollection<HTMLElement, { label: string }>('Test')
const [OtherCollection, useOtherCollection] = createCollection<HTMLElement, { label: string }>('Other')

type Seen = { labels: string[] }
const labelsOf = (items: { label: string }[]) => items.map((item) => item.label)

function Items({ labels }: { labels: string[] }) {
  return labels.map((label) => (
    <Collection.ItemSlot key={label} label={label} scope={undefined}>
      <div />
    </Collection.ItemSlot>
  ))
}

function List({ children, labels }: { children?: React.ReactNode; labels: string[] }) {
  return (
    <Collection.Provider scope={undefined}>
      <Collection.Slot scope={undefined}>
        <div>
          <Items labels={labels} />
        </div>
      </Collection.Slot>
      {children}
    </Collection.Provider>
  )
}

function ReadOnClick({ seen }: { seen: Seen }) {
  const getItems = useCollection(undefined)
  return (
    <button onClick={() => (seen.labels = labelsOf(getItems()))} type="button">
      read
    </button>
  )
}

function ReadInLayoutEffect({ seen }: { seen: Seen }) {
  const getItems = useCollection(undefined)
  React.useLayoutEffect(() => {
    seen.labels = labelsOf(getItems())
  })
  return null
}

const read = (seen: Seen) => {
  fireEvent.click(screen.getByRole('button', { name: 'read' }))
  return seen.labels
}

describe('createCollection read from an event handler', () => {
  it('reads the items as they are now, in document order', () => {
    const seen = { labels: [] }
    const { rerender } = render(
      <List labels={['a', 'b']}>
        <ReadOnClick seen={seen} />
      </List>,
    )

    expect(read(seen)).toEqual(['a', 'b'])

    rerender(
      <List labels={['c', 'a', 'b']}>
        <ReadOnClick seen={seen} />
      </List>,
    )

    expect(read(seen)).toEqual(['c', 'a', 'b'])
  })

  it('reads items in document order after React moves them', async () => {
    const seen = { labels: [] }
    const { rerender } = render(
      <List labels={['a', 'b', 'c']}>
        <ReadOnClick seen={seen} />
      </List>,
    )

    await act(async () => {
      rerender(
        <List labels={['c', 'a', 'b']}>
          <ReadOnClick seen={seen} />
        </List>,
      )
    })

    expect(read(seen)).toEqual(['c', 'a', 'b'])
  })

  it('orders items nested at different depths by where they are in the document', () => {
    const seen = { labels: [] }
    render(
      <Collection.Provider scope={undefined}>
        <Collection.Slot scope={undefined}>
          <div>
            <section>
              <Items labels={['b']} />
            </section>
            <Items labels={['a']} />
          </div>
        </Collection.Slot>
        <ReadOnClick seen={seen} />
      </Collection.Provider>,
    )

    expect(read(seen)).toEqual(['b', 'a'])
  })

  it('reads no items before its collection element renders', () => {
    const seen = { labels: [] }
    render(
      <Collection.Provider scope={undefined}>
        <Items labels={['a']} />
        <ReadOnClick seen={seen} />
      </Collection.Provider>,
    )

    expect(read(seen)).toEqual([])
  })

  it('reads from the nearest provider, apart from the items of the one around it', () => {
    const seen = { labels: [] }
    render(
      <List labels={['outer']}>
        <List labels={['inner']}>
          <ReadOnClick seen={seen} />
        </List>
      </List>,
    )

    expect(read(seen)).toEqual(['inner'])
  })

  it('keeps the items of two collections apart', () => {
    const seen = { labels: [] }
    let other: string[] = []
    function ReadOther() {
      const getItems = useOtherCollection(undefined)
      return (
        <button onClick={() => (other = labelsOf(getItems()))} type="button">
          read other
        </button>
      )
    }
    render(
      <OtherCollection.Provider scope={undefined}>
        <OtherCollection.Slot scope={undefined}>
          <div>
            <OtherCollection.ItemSlot label="other" scope={undefined}>
              <div />
            </OtherCollection.ItemSlot>
            <List labels={['test']}>
              <ReadOnClick seen={seen} />
            </List>
          </div>
        </OtherCollection.Slot>
        <ReadOther />
      </OtherCollection.Provider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'read other' }))

    expect(read(seen)).toEqual(['test'])
    expect(other).toEqual(['other'])
  })
})

describe('createCollection ordering', () => {
  it('orders an item that rendered again on its own by where it is in the document', () => {
    const seen = { labels: [] }
    let rename = (_label: string) => {}
    function First() {
      const [label, setLabel] = React.useState('a')
      rename = setLabel
      return (
        <Collection.ItemSlot label={label} scope={undefined}>
          <div />
        </Collection.ItemSlot>
      )
    }
    render(
      <Collection.Provider scope={undefined}>
        <Collection.Slot scope={undefined}>
          <div>
            <First />
            <Items labels={['b']} />
          </div>
        </Collection.Slot>
        <ReadOnClick seen={seen} />
      </Collection.Provider>,
    )

    act(() => rename('A'))

    expect(read(seen)).toEqual(['A', 'b'])
  })
})

describe('createCollection consumers', () => {
  it('hands its consumers one function that keeps its identity as items change', () => {
    const getters = new Set<unknown>()
    function Getter() {
      getters.add(useCollection(undefined))
      return null
    }
    const { rerender } = render(
      <List labels={['a']}>
        <Getter />
      </List>,
    )

    rerender(
      <List labels={['a', 'b']}>
        <Getter />
      </List>,
    )
    rerender(
      <List labels={['b']}>
        <Getter />
      </List>,
    )

    expect(getters.size).toBe(1)
  })

  it('renders no consumer again when its items change', () => {
    let renders = 0
    const Getter = React.memo(function Getter() {
      useCollection(undefined)
      renders++
      return null
    })
    const { rerender } = render(
      <List labels={['a']}>
        <Getter />
      </List>,
    )

    rerender(
      <List labels={['a', 'b', 'c']}>
        <Getter />
      </List>,
    )

    expect(renders).toBe(1)
  })
})

describe('createCollection read from a layout effect', () => {
  it('reads an item mounted in the same commit', () => {
    const seen = { labels: [] }
    const { rerender } = render(
      <List labels={['a', 'c']}>
        <ReadInLayoutEffect seen={seen} />
      </List>,
    )

    rerender(
      <List labels={['a', 'b', 'c']}>
        <ReadInLayoutEffect seen={seen} />
      </List>,
    )

    expect(seen.labels).toEqual(['a', 'b', 'c'])
  })

  it('leaves out an item unmounted in the same commit', () => {
    const seen = { labels: [] }
    const { rerender } = render(
      <List labels={['a', 'b', 'c']}>
        <ReadInLayoutEffect seen={seen} />
      </List>,
    )

    rerender(
      <List labels={['a', 'c']}>
        <ReadInLayoutEffect seen={seen} />
      </List>,
    )

    expect(seen.labels).toEqual(['a', 'c'])
  })

  it('reads items moved in the same commit in document order', () => {
    const seen = { labels: [] }
    const { rerender } = render(
      <List labels={['a', 'b', 'c']}>
        <ReadInLayoutEffect seen={seen} />
      </List>,
    )

    rerender(
      <List labels={['c', 'a', 'b']}>
        <ReadInLayoutEffect seen={seen} />
      </List>,
    )

    expect(seen.labels).toEqual(['c', 'a', 'b'])
  })

  it('reads the data an item was given in the same commit', () => {
    const seen = { labels: [] }
    function Labelled({ middle }: { middle: string }) {
      return (
        <Collection.Provider scope={undefined}>
          <Collection.Slot scope={undefined}>
            <div>
              <Collection.ItemSlot label="a" scope={undefined}>
                <div />
              </Collection.ItemSlot>
              <Collection.ItemSlot label={middle} scope={undefined}>
                <div />
              </Collection.ItemSlot>
            </div>
          </Collection.Slot>
          <ReadInLayoutEffect seen={seen} />
        </Collection.Provider>
      )
    }
    const { rerender } = render(<Labelled middle="b" />)

    rerender(<Labelled middle="updated" />)

    expect(seen.labels).toEqual(['a', 'updated'])
  })
})

describe('createCollection with React hiding its items', () => {
  it('leaves out the items a Suspense boundary hides when it suspends again', async () => {
    const resolved = Object.assign(Promise.resolve(), { status: 'fulfilled' as const, value: undefined })
    const pending = new Promise<void>(() => {})
    function Deferred({ children, promise }: { children: React.ReactNode; promise: Promise<void> }) {
      React.use(promise)
      return children
    }
    const seen = { labels: [] }
    function Suspending({ promise }: { promise: Promise<void> }) {
      return (
        <Collection.Provider scope={undefined}>
          <Collection.Slot scope={undefined}>
            <div>
              <Items labels={['a']} />
              <React.Suspense fallback={<span>loading</span>}>
                <Deferred promise={promise}>
                  <Items labels={['b']} />
                </Deferred>
              </React.Suspense>
              <Items labels={['c']} />
            </div>
          </Collection.Slot>
          <ReadOnClick seen={seen} />
        </Collection.Provider>
      )
    }
    const { rerender } = render(<Suspending promise={resolved} />)

    expect(read(seen)).toEqual(['a', 'b', 'c'])

    await act(async () => {
      rerender(<Suspending promise={pending} />)
    })

    expect(screen.getByText('loading')).toBeTruthy()
    expect(read(seen)).toEqual(['a', 'c'])
  })

  it('leaves out the items of a hidden Activity, and reads them again once it shows', () => {
    const seen = { labels: [] }
    function Hiding({ mode }: { mode: 'hidden' | 'visible' }) {
      return (
        <Collection.Provider scope={undefined}>
          <Collection.Slot scope={undefined}>
            <div>
              <Items labels={['a']} />
              <React.Activity mode={mode}>
                <Items labels={['b']} />
              </React.Activity>
              <Items labels={['c']} />
            </div>
          </Collection.Slot>
          <ReadOnClick seen={seen} />
        </Collection.Provider>
      )
    }
    const { rerender } = render(<Hiding mode="hidden" />)

    expect(read(seen)).toEqual(['a', 'c'])

    rerender(<Hiding mode="visible" />)

    expect(read(seen)).toEqual(['a', 'b', 'c'])

    rerender(<Hiding mode="hidden" />)

    expect(read(seen)).toEqual(['a', 'c'])
  })
})

describe('createCollection slots', () => {
  it('renders the collection element and each item as its child, with no element of its own, and hands it the ref', () => {
    const collectionRef = React.createRef<HTMLElement>()
    const itemRef = React.createRef<HTMLElement>()
    const { container } = render(
      <Collection.Provider scope={undefined}>
        <Collection.Slot ref={collectionRef} scope={undefined}>
          <ul>
            <Collection.ItemSlot label="a" ref={itemRef} scope={undefined}>
              <li>a</li>
            </Collection.ItemSlot>
          </ul>
        </Collection.Slot>
      </Collection.Provider>,
    )

    expect(container.innerHTML).toBe('<ul><li data-collection-item="">a</li></ul>')
    expect(collectionRef.current).toBe(container.querySelector('ul'))
    expect(itemRef.current).toBe(container.querySelector('li'))
  })

  it('registers each item once under strict mode, and drops it on unmount', () => {
    const seen = { labels: [] }
    const { rerender } = render(
      <React.StrictMode>
        <List labels={['a', 'b']}>
          <ReadOnClick seen={seen} />
        </List>
      </React.StrictMode>,
    )

    expect(read(seen)).toEqual(['a', 'b'])

    rerender(
      <React.StrictMode>
        <List labels={['b']}>
          <ReadOnClick seen={seen} />
        </List>
      </React.StrictMode>,
    )

    expect(read(seen)).toEqual(['b'])
  })
})
