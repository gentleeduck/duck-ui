import * as React from 'react'
import * as Command from '..'
import styles from './command.stories.module.css'

export default {
  title: 'Components/Command',
}

export const Basic = () => {
  const [picked, setPicked] = React.useState('')
  return (
    <>
      <Command.Root className={styles.command}>
        <Command.Input aria-label="Search" placeholder="Search..." />
        <Command.List>
          <Command.Empty>No results</Command.Empty>
          <Command.Group heading="Fruits">
            <Command.Item value="apple" onSelect={setPicked}>
              Apple
            </Command.Item>
            <Command.Item value="banana" keywords={['plantain']} onSelect={setPicked}>
              Banana
            </Command.Item>
            <Command.Item value="cherry" disabled onSelect={setPicked}>
              Cherry
            </Command.Item>
          </Command.Group>
          <Command.Separator />
          <Command.Group heading="Vegetables">
            <Command.Item value="carrot" onSelect={setPicked}>
              Carrot
            </Command.Item>
            <Command.Item value="leek" onSelect={setPicked}>
              Leek
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Root>
      <output aria-label="Picked">{picked || 'none'}</output>
    </>
  )
}

export const Loop = () => (
  <Command.Root className={styles.command} loop>
    <Command.Input aria-label="Search" />
    <Command.List>
      <Command.Item value="first">First</Command.Item>
      <Command.Item value="second">Second</Command.Item>
      <Command.Item value="last">Last</Command.Item>
    </Command.List>
  </Command.Root>
)

function score(text: string, search: string) {
  const word = text.toLowerCase()
  const query = search.toLowerCase()
  if (word.startsWith(query)) return 1
  return word.includes(query) ? 0.5 : 0
}

function Create() {
  const search = Command.useCommandSearch()
  if (search === '') return null
  return (
    <Command.Item forceMount value="create" textValue="New fruit">
      Create "{search}"
    </Command.Item>
  )
}

export const Ranked = () => {
  const [value, setValue] = React.useState('grape')
  return (
    <>
      <Command.Root className={styles.command} filter={score} value={value} onValueChange={setValue}>
        <Command.Input aria-label="Search" />
        <Command.List>
          <Command.Empty>No fruit matches</Command.Empty>
          <Command.Item value="pineapple">Pineapple</Command.Item>
          <Command.Item value="grape">Grape</Command.Item>
          <Command.Item value="apple">Apple</Command.Item>
          <Command.Item value="applesauce">Applesauce</Command.Item>
          <Create />
        </Command.List>
      </Command.Root>
      <output aria-label="Highlighted">{value || 'nothing'}</output>
    </>
  )
}

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Barbara Liskov', 'Grace Hopper']

function People() {
  const query = Command.useCommandSearch().trim().toLowerCase()
  const [found, setFound] = React.useState({ query: '', people: [] as string[] })
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFound({ query, people: query ? PEOPLE.filter((person) => person.toLowerCase().includes(query)) : [] })
    }, 100)
    return () => clearTimeout(timer)
  }, [query])
  return (
    <>
      {found.query !== query && <Command.Loading>Searching...</Command.Loading>}
      <Command.Status className={styles.status}>{(count) => `${count} found`}</Command.Status>
      <Command.List>
        <Command.Empty>No one found</Command.Empty>
        {found.people.map((person) => (
          <Command.Item key={person} value={person}>
            {person}
          </Command.Item>
        ))}
      </Command.List>
    </>
  )
}

export const OwnSearch = () => (
  <Command.Root className={styles.command} shouldFilter={false}>
    <Command.Input aria-label="Search" />
    <People />
  </Command.Root>
)

export const Fuzzy = () => (
  <Command.Root className={styles.command} filter={Command.fuzzyFilter}>
    <Command.Input aria-label="Search" />
    <Command.List>
      <Command.Empty>No match</Command.Empty>
      <Command.Item value="pineapple">Pineapple</Command.Item>
      <Command.Item value="green-apple">Green apple</Command.Item>
      <Command.Item value="apple">Apple</Command.Item>
      <Command.Item value="creme-brulee">Crème brûlée</Command.Item>
      <Command.Item value="cafe">Café au lait</Command.Item>
    </Command.List>
  </Command.Root>
)

const FRUITS = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blueberry', 'Grape', 'Green apple', 'Pineapple']

export const Limited = () => (
  <Command.Root className={styles.command} filter={Command.fuzzyFilter} limit={3}>
    <Command.Input aria-label="Search" />
    <Command.Status className={styles.status}>{(count) => `${count} shown`}</Command.Status>
    <Command.List>
      <Command.Empty>No fruit</Command.Empty>
      {FRUITS.map((fruit) => (
        <Command.Item key={fruit} value={fruit.toLowerCase()}>
          {fruit}
        </Command.Item>
      ))}
    </Command.List>
  </Command.Root>
)

const NUMBERED = Array.from({ length: 30 }, (_, index) => `Item ${index + 1}`)

export const LongList = () => (
  <Command.Root className={styles.command}>
    <Command.Input aria-label="Search" />
    <Command.List className={styles.scroll}>
      {NUMBERED.map((item) => (
        <Command.Item key={item} value={item}>
          {item}
        </Command.Item>
      ))}
    </Command.List>
  </Command.Root>
)

export const NoPointerHighlight = () => {
  const [picked, setPicked] = React.useState('')
  return (
    <>
      <Command.Root className={styles.command} disablePointerSelection>
        <Command.Input aria-label="Search" />
        <Command.List>
          <Command.Item value="apple" onSelect={setPicked}>
            Apple
          </Command.Item>
          <Command.Item value="banana" onSelect={setPicked}>
            Banana
          </Command.Item>
          <Command.Item value="cherry" onSelect={setPicked}>
            Cherry
          </Command.Item>
        </Command.List>
      </Command.Root>
      <output aria-label="Picked">{picked || 'none'}</output>
    </>
  )
}

const ROWS = Array.from({ length: 1000 }, (_, index) => `Row ${index + 1}`)
const ROW_HEIGHT = 28
const VIEW_HEIGHT = 196

// A virtualizer in a few lines: the rows in view and two either side, each placed by its index.
function VirtualRows() {
  const search = Command.useCommandSearch()
  const rows = React.useMemo(() => ROWS.filter((row) => row.includes(search)), [search])
  const viewRef = React.useRef<HTMLDivElement>(null)
  const [top, setTop] = React.useState(0)
  React.useEffect(() => {
    if (viewRef.current) viewRef.current.scrollTop = 0
    setTop(0)
  }, [search])
  const scrollToIndex = React.useCallback((index: number) => {
    const view = viewRef.current
    if (!view) return
    const y = index * ROW_HEIGHT
    view.scrollTop = Math.min(Math.max(view.scrollTop, y + ROW_HEIGHT - VIEW_HEIGHT), y)
    setTop(view.scrollTop)
  }, [])
  const first = Math.max(0, Math.floor(top / ROW_HEIGHT) - 2)
  const last = Math.min(rows.length, Math.ceil((top + VIEW_HEIGHT) / ROW_HEIGHT) + 2)
  return (
    <>
      <Command.Status className={styles.status}>{(count) => `${count} rows`}</Command.Status>
      <div ref={viewRef} className={styles.viewport} onScroll={(event) => setTop(event.currentTarget.scrollTop)}>
        <Command.List virtual={{ count: rows.length, scrollToIndex }} style={{ height: rows.length * ROW_HEIGHT }}>
          {rows.slice(first, last).map((row, offset) => (
            <Command.Item key={row} index={first + offset} value={row} style={{ top: (first + offset) * ROW_HEIGHT }}>
              {row}
            </Command.Item>
          ))}
        </Command.List>
      </div>
    </>
  )
}

export const Virtual = () => (
  <Command.Root className={styles.command} shouldFilter={false}>
    <Command.Input aria-label="Search" />
    <VirtualRows />
  </Command.Root>
)

export const Links = () => (
  <Command.Root className={styles.command}>
    <Command.Input aria-label="Search" />
    <Command.List>
      <Command.Item value="home" asChild>
        <a href="#home">Home</a>
      </Command.Item>
      <Command.Item value="settings" asChild>
        <a href="#settings">Settings</a>
      </Command.Item>
    </Command.List>
  </Command.Root>
)

export const RightToLeft = () => (
  <Command.Root className={styles.command} dir="rtl" data-testid="command">
    <Command.Input aria-label="بحث" />
    <Command.List>
      <Command.Empty>لا نتائج</Command.Empty>
      <Command.Group heading="فواكه">
        <Command.Item value="apple">تفاح</Command.Item>
        <Command.Item value="banana">موز</Command.Item>
      </Command.Group>
    </Command.List>
  </Command.Root>
)

export const DefaultHighlight = () => (
  <Command.Root className={styles.command} defaultValue="paste">
    <Command.Input aria-label="Search" />
    <Command.List>
      <Command.Item value="copy">Copy</Command.Item>
      <Command.Item value="cut">Cut</Command.Item>
      <Command.Item value="paste">Paste</Command.Item>
    </Command.List>
  </Command.Root>
)

export const NoVimKeys = () => (
  <Command.Root className={styles.command} vimBindings={false}>
    <Command.Input aria-label="Search" />
    <Command.List>
      <Command.Item value="copy">Copy</Command.Item>
      <Command.Item value="cut">Cut</Command.Item>
      <Command.Item value="paste">Paste</Command.Item>
    </Command.List>
  </Command.Root>
)

export const PinnedGroup = () => (
  <Command.Root className={styles.command}>
    <Command.Input aria-label="Search" />
    <Command.List>
      <Command.Empty>No results</Command.Empty>
      <Command.Group forceMount heading="Recent">
        <Command.Item value="undo">Undo</Command.Item>
      </Command.Group>
      <Command.Group heading="Edit">
        <Command.Item value="copy">Copy</Command.Item>
        <Command.Item value="paste">Paste</Command.Item>
      </Command.Group>
    </Command.List>
  </Command.Root>
)
