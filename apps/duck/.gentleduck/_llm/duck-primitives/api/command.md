```tsx
import * as Command from '@gentleduck/primitives/command'
```

## Anatomy

```tsx
<Command.Root>
  <Command.Input />
  <Command.Loading />
  <Command.Status />
  <Command.List>
    <Command.Empty />
    <Command.Group>
      <Command.Item />
    </Command.Group>
    <Command.Separator />
  </Command.List>
</Command.Root>
```

***

## Usage

```tsx
import * as Command from '@gentleduck/primitives/command'

function CommandMenu() {
  return (
    <Command.Root className="rounded-lg border shadow-md">
      <Command.Input placeholder="Type a command or search..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Suggestions">
          <Command.Item onSelect={() => console.log('Calendar')}>Calendar</Command.Item>
          <Command.Item onSelect={() => console.log('Search')}>Search</Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Settings">
          <Command.Item onSelect={() => console.log('Profile')}>Profile</Command.Item>
          <Command.Item onSelect={() => console.log('Settings')}>Settings</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Root>
  )
}
```

***

## Filtering and ranking

By default a search keeps the items in their order and shows each one whose text or `keywords` contain it, ignoring case and accents, so "cafe" finds "Café". A `filter` replaces that test with a score: `0` hides an item, and a higher score puts it before a lower one.

```tsx
function score(text: string, search: string, keywords: string[]) {
  const word = text.toLowerCase()
  const query = search.toLowerCase()
  if (word.startsWith(query)) return 1
  if (word.includes(query) || keywords.some((keyword) => keyword.includes(query))) return 0.5
  return 0
}

<Command.Root filter={score}>...</Command.Root>
```

`fuzzyFilter` is a ready-made `filter` that finds an item by the letters of the search in order, so "apl" finds "Apple", ignoring case and accents. It ranks a match at the start of the text first, then one at the start of a word, then letters side by side, and a shorter text over a longer one, as cmdk's default scoring does. It is opt-in, so a command that does not import it does not ship it.

```tsx
<Command.Root filter={Command.fuzzyFilter}>...</Command.Root>
```

`limit` caps how many matches the list shows, the best ranked first, as in Base UI. A `forceMount` item shows beside them.

```tsx
<Command.Root filter={Command.fuzzyFilter} limit={5}>...</Command.Root>
```

Items and groups trade the places they hold among their parent's children, so a heading, a separator or `Command.Empty` stays where it is, and a group moves by its best item. Once the search is cleared every item is back in its own place, including one added while the search was on.

An item that mounts, unmounts or changes its text, `value`, `keywords` or `disabled` is filtered at once, without waiting for the next keystroke.

With `shouldFilter={false}` the command filters nothing and you render the matches yourself, reading the search with `useCommandSearch`. `Command.Empty` then shows once you render no item.

```tsx
function Results() {
  const search = Command.useCommandSearch()
  const { data = [] } = useSearch(search)
  return data.map((hit) => (
    <Command.Item key={hit.id} value={hit.id}>
      {hit.title}
    </Command.Item>
  ))
}

<Command.Root shouldFilter={false}>
  <Command.Input />
  <Command.List>
    <Command.Empty>No results</Command.Empty>
    <Results />
  </Command.List>
</Command.Root>
```

## Highlight

The first visible item is highlighted on mount and after every keystroke. `defaultValue` names the item highlighted first instead. `value` and `onValueChange` control the highlight by the items' `value`: the command asks for a change and moves only once you pass it back. An empty string highlights nothing.

```tsx
const [value, setValue] = React.useState('profile')

<Command.Root value={value} onValueChange={setValue}>...</Command.Root>
```

Moving the highlight renders nothing: the command writes `data-highlighted` and `aria-selected` on the item, and the input's `aria-activedescendant`, straight to the DOM.

`disablePointerSelection` leaves the highlight where it is as the mouse moves over the items, as in cmdk. A click still selects.

## Loading and the result count

`Command.Loading` marks the list as loading while its items are fetched, as in cmdk. It is a `progressbar` named "Loading", and `progress`, from 0 to 100, sets how far it has come.

`Command.Status` announces how many items match, as Base UI's `Combobox.Status` does. It is a polite, atomic `status` region, and its children can be a function of the count. Hide it with a class such as `sr-only` to keep it for a screen reader alone.

```tsx
<Command.Root shouldFilter={false}>
  <Command.Input />
  {loading && <Command.Loading>Searching...</Command.Loading>}
  <Command.Status>{(count) => `${count} results`}</Command.Status>
  <Command.List>...</Command.List>
</Command.Root>
```

## Animating the list's height

`Command.List` writes the height of the rows it shows to `--gentleduck-command-list-height` whenever a search, an added item or a resize changes it, as cmdk does with `--cmdk-list-height`. It measures the rows, not the list, so the list's own height can follow it:

```css
[data-slot='command-list'] {
  height: var(--gentleduck-command-list-height);
  transition: height 150ms ease;
}
```

A DOM with no `ResizeObserver`, such as a test's, leaves it unset.

## Virtual lists

`virtual` on `Command.List` takes `{ count, scrollToIndex }` for a list that draws only some of its items, as a virtualizer such as TanStack Virtual does. Each `Command.Item` then takes its `index`, written as `aria-posinset` with `count` as `aria-setsize`. Filter the items yourself, with `shouldFilter={false}`.

```tsx
function Rows({ rows }: { rows: string[] }) {
  const viewRef = React.useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => viewRef.current, estimateSize: () => 32 })
  return (
    <div ref={viewRef} style={{ height: 300, overflow: 'auto' }}>
      <Command.List
        virtual={{ count: rows.length, scrollToIndex: virtualizer.scrollToIndex }}
        style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((row) => (
          <Command.Item
            key={row.key}
            index={row.index}
            value={rows[row.index]}
            style={{ position: 'absolute', top: row.start, height: row.size }}>
            {rows[row.index]}
          </Command.Item>
        ))}
      </Command.List>
    </div>
  )
}
```

The keys move by index. A row they reach that is not drawn is brought in with `scrollToIndex` and highlighted once it mounts, and a disabled row is passed over. A page is as many rows as the scrolling box shows, and `Alt` with an arrow moves one row, since no group is known past the rows drawn. A highlighted row scrolled out of the DOM stays highlighted, and is drawn so again when it comes back. `useCommandState` and `Command.Status` count `count`.

***

## Keyboard

| Key | Action |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Highlights the next or previous enabled item, stopping at the ends unless `loop` is set |
| `Ctrl+N` / `Ctrl+J` | Highlights the next enabled item, as in cmdk. Off with `vimBindings={false}` |
| `Ctrl+P` / `Ctrl+K` | Highlights the previous enabled item, as in cmdk. Off with `vimBindings={false}` |
| `Alt+ArrowDown` | Highlights the first item of the next group, as in cmdk. Items outside a group count as one group |
| `Alt+ArrowUp` | Highlights the first item of the highlighted one's group, or of the group before from there |
| `Meta+ArrowDown` / `Meta+ArrowUp` | Highlights the last or first enabled item, as in cmdk |
| `Home` / `End` | Highlights the first or last enabled item |
| `PageDown` / `PageUp` | Moves a page, the height of the nearest box that scrolls the items, or to the last or first item when nothing scrolls, as in React Aria |
| `Enter` | Selects the highlighted item by clicking it, so an item rendered as a link follows it. A button, link or field inside the command keeps its own `Enter` |
| `Space` | Selects the focused item |
| `Tab` / `Shift+Tab` | Leaves the command, as from any field, so a keyboard user can get past an inline palette. A dialog around it still keeps focus inside the dialog |

While an input method is composing text, the command leaves every key to it, so the `Enter` that confirms a word selects nothing. That includes the `Enter` Safari sends after `compositionend`, with `keyCode` 229.

## Examples

### Palette

```tsx title="components/command-palette.tsx"
// import from your project: import Demo from '@/components/command-palette'
'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function CommandPaletteExample() {
  const [last, setLast] = React.useState('nothing yet')

  return (
    <div className={styles.stack}>
      <Command.Root className={styles.command} aria-label="Command palette">
        <Command.Input className={styles.commandInput} placeholder="Type a command or search..." />
        <Command.List className={styles.commandList}>
          <Command.Empty className={styles.commandEmpty}>No results.</Command.Empty>
          <Command.Group heading="Suggestions">
            <Command.Item className={styles.item} keywords={['agenda', 'schedule']} onSelect={setLast} value="calendar">
              Calendar
            </Command.Item>
            <Command.Item className={styles.item} keywords={['emoji']} onSelect={setLast} value="smileys">
              Search emoji
            </Command.Item>
          </Command.Group>
          <Command.Separator className={styles.separator} />
          <Command.Group heading="Settings">
            <Command.Item className={styles.item} onSelect={setLast} value="profile">
              Profile <span className={styles.shortcut}>Ctrl P</span>
            </Command.Item>
            <Command.Item className={styles.item} onSelect={setLast} value="billing">
              Billing <span className={styles.shortcut}>Ctrl B</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Root>
      <p className={styles.note}>Selected: {last}. "agenda" finds Calendar through its keywords.</p>
    </div>
  )
}
```

### Your own filter and a limit

```tsx title="components/command-filter.tsx"
// import from your project: import Demo from '@/components/command-filter'
'use client'

import * as Command from '@gentleduck/primitives/command'
import styles from '../primitives.module.css'

const COUNTRIES = [
  'Austria',
  'Australia',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'China',
  'Denmark',
  'Egypt',
  'Estonia',
]

// A start of the name ranks first, a match elsewhere in it second.
function prefixFirst(text: string, search: string) {
  const name = text.toLowerCase()
  const query = search.toLowerCase()
  if (name.startsWith(query)) return 1
  return name.includes(query) ? 0.5 : 0
}

export default function CommandFilterExample() {
  return (
    <Command.Root className={styles.command} filter={prefixFirst} aria-label="Countries" limit={4}>
      <Command.Input className={styles.commandInput} placeholder="Search countries..." />
      <Command.List className={styles.commandList}>
        <Command.Empty className={styles.commandEmpty}>No country matches.</Command.Empty>
        {COUNTRIES.map((country) => (
          <Command.Item className={styles.item} key={country} value={country}>
            {country}
          </Command.Item>
        ))}
      </Command.List>
    </Command.Root>
  )
}
```

### Results from a server

```tsx title="components/command-async.tsx"
// import from your project: import Demo from '@/components/command-async'
'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

const PACKAGES = ['react', 'react-dom', 'react-router', 'redux', 'remix', 'rollup', 'rxjs', 'vite', 'vitest', 'vue']

function Results({ onLoading }: { onLoading: (loading: boolean) => void }) {
  const search = Command.useCommandSearch()
  const [hits, setHits] = React.useState<string[]>([])

  React.useEffect(() => {
    onLoading(true)
    const timer = setTimeout(() => {
      setHits(search ? PACKAGES.filter((name) => name.includes(search.toLowerCase())) : [])
      onLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [search, onLoading])

  return hits.map((name) => (
    <Command.Item className={styles.item} key={name} value={name}>
      {name}
    </Command.Item>
  ))
}

export default function CommandAsyncExample() {
  const [loading, setLoading] = React.useState(false)

  return (
    <Command.Root className={styles.command} aria-label="Packages" shouldFilter={false}>
      <Command.Input className={styles.commandInput} placeholder="Search packages..." />
      <Command.Status className={styles.note} style={{ padding: '0.3rem 0.75rem' }}>
        {(count) => (loading ? 'Searching...' : `${count} results`)}
      </Command.Status>
      <Command.List className={styles.commandList}>
        {loading ? <Command.Loading className={styles.commandEmpty}>Fetching packages...</Command.Loading> : null}
        {loading ? null : <Command.Empty className={styles.commandEmpty}>Type to search.</Command.Empty>}
        <Results onLoading={setLoading} />
      </Command.List>
    </Command.Root>
  )
}
```

### Controlled highlight

```tsx title="components/command-controlled.tsx"
// import from your project: import Demo from '@/components/command-controlled'
'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

const FRUITS = ['apple', 'banana', 'cherry', 'grape', 'mango']

export default function CommandControlledExample() {
  const [value, setValue] = React.useState('cherry')

  return (
    <div className={styles.stack}>
      <Command.Root
        className={styles.command}
        disablePointerSelection
        aria-label="Fruit"
        loop
        onValueChange={setValue}
        value={value}>
        <Command.Input className={styles.commandInput} placeholder="Search fruit..." />
        <Command.List className={styles.commandList}>
          {FRUITS.map((fruit) => (
            <Command.Item className={styles.item} key={fruit} value={fruit}>
              {fruit}
            </Command.Item>
          ))}
        </Command.List>
      </Command.Root>
      <p className={styles.note}>
        Highlighted: {value || 'nothing'}. The mouse leaves the highlight alone, and the arrow keys wrap with loop.
      </p>
    </div>
  )
}
```

### A create item

```tsx title="components/command-create-item.tsx"
// import from your project: import Demo from '@/components/command-create-item'
'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

function CreateItem({ onCreate }: { onCreate: (label: string) => void }) {
  const search = Command.useCommandSearch()
  if (!search) return null
  return (
    <Command.Item className={styles.item} forceMount onSelect={() => onCreate(search)} value={`create ${search}`}>
      Create label "{search}"
    </Command.Item>
  )
}

export default function CommandCreateItemExample() {
  const [labels, setLabels] = React.useState(['bug', 'feature', 'docs'])

  return (
    <Command.Root className={styles.command} aria-label="Labels">
      <Command.Input className={styles.commandInput} placeholder="Find or create a label..." />
      <Command.List className={styles.commandList}>
        <Command.Empty className={styles.commandEmpty}>No label matches.</Command.Empty>
        {labels.map((label) => (
          <Command.Item className={styles.item} key={label} value={label}>
            {label}
          </Command.Item>
        ))}
        <CreateItem onCreate={(label) => setLabels((current) => [...current, label])} />
      </Command.List>
    </Command.Root>
  )
}
```

### Disabled items

```tsx title="components/command-disabled-items.tsx"
// import from your project: import Demo from '@/components/command-disabled-items'
'use client'

import * as Command from '@gentleduck/primitives/command'
import styles from '../primitives.module.css'

export default function CommandDisabledItemsExample() {
  return (
    <Command.Root className={styles.command} aria-label="Exports">
      <Command.Input className={styles.commandInput} placeholder="Export as..." />
      <Command.List className={styles.commandList}>
        <Command.Item className={styles.item} value="pdf">
          PDF
        </Command.Item>
        <Command.Item className={styles.item} disabled value="docx">
          Word (needs a paid plan)
        </Command.Item>
        <Command.Item className={styles.item} value="csv">
          CSV
        </Command.Item>
      </Command.List>
    </Command.Root>
  )
}
```

### Virtual list

```tsx title="components/command-virtual.tsx"
// import from your project: import Demo from '@/components/command-virtual'
'use client'

import * as Command from '@gentleduck/primitives/command'
import * as React from 'react'
import styles from '../primitives.module.css'

const ROWS = Array.from({ length: 5000 }, (_, index) => `Row ${index + 1}`)
const ROW = 32
const VIEW = 256

export default function CommandVirtualExample() {
  const view = React.useRef<HTMLDivElement>(null)
  const [top, setTop] = React.useState(0)
  const first = Math.max(0, Math.floor(top / ROW) - 3)
  const last = Math.min(ROWS.length, Math.ceil((top + VIEW) / ROW) + 3)
  const scrollToIndex = React.useCallback((index: number) => {
    const box = view.current
    if (!box) return
    if (index * ROW < box.scrollTop) box.scrollTop = index * ROW
    else if ((index + 1) * ROW > box.scrollTop + VIEW) box.scrollTop = (index + 1) * ROW - VIEW
  }, [])

  return (
    <Command.Root className={styles.command} aria-label="Rows" shouldFilter={false}>
      <Command.Input className={styles.commandInput} placeholder="Arrow through 5,000 rows..." />
      <div
        onScroll={(event) => setTop(event.currentTarget.scrollTop)}
        ref={view}
        style={{ height: VIEW, overflow: 'auto' }}>
        <Command.List
          style={{ height: ROWS.length * ROW, position: 'relative' }}
          virtual={{ count: ROWS.length, scrollToIndex }}>
          {ROWS.slice(first, last).map((row, offset) => (
            <Command.Item
              className={styles.item}
              index={first + offset}
              key={row}
              style={{ height: ROW, insetInline: 0, position: 'absolute', top: (first + offset) * ROW }}
              value={row}>
              {row}
            </Command.Item>
          ))}
        </Command.List>
      </div>
    </Command.Root>
  )
}
```

### In a dialog

```tsx title="components/command-dialog.tsx"
// import from your project: import Demo from '@/components/command-dialog'
'use client'

import * as Command from '@gentleduck/primitives/command'
import * as Dialog from '@gentleduck/primitives/dialog'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function CommandDialogExample() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <Dialog.Trigger className={styles.button}>Open with Ctrl K</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={`${styles.overlay} ${styles.fade}`} />
        <Dialog.Content aria-describedby={undefined} className={styles.dialog} style={{ padding: 0 }}>
          <Dialog.Title className={styles.title} style={{ padding: '0.75rem 0.75rem 0' }}>
            Jump to
          </Dialog.Title>
          <Command.Root className={styles.command} aria-label="Jump to" style={{ border: 0, width: '100%' }}>
            <Command.Input className={styles.commandInput} placeholder="Search pages..." />
            <Command.List className={styles.commandList}>
              <Command.Empty className={styles.commandEmpty}>No page found.</Command.Empty>
              {['Dashboard', 'Projects', 'Team', 'Settings'].map((page) => (
                <Command.Item className={styles.item} key={page} onSelect={() => setOpen(false)} value={page}>
                  {page}
                </Command.Item>
              ))}
            </Command.List>
          </Command.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Right to left

```tsx title="components/command-rtl.tsx"
// import from your project: import Demo from '@/components/command-rtl'
'use client'

import * as Command from '@gentleduck/primitives/command'
import styles from '../primitives.module.css'

export default function CommandRtlExample() {
  return (
    <Command.Root className={styles.command} dir="rtl" aria-label="بحث">
      <Command.Input className={styles.commandInput} placeholder="ابحث..." />
      <Command.List className={styles.commandList}>
        <Command.Empty className={styles.commandEmpty}>لا توجد نتائج.</Command.Empty>
        <Command.Group heading="الصفحات">
          <Command.Item className={styles.item} value="home">
            الرئيسية
          </Command.Item>
          <Command.Item className={styles.item} value="settings">
            الإعدادات
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Root>
  )
}
```

***

## API

### `Command.Root`

The root container that manages search state, filtering, and keyboard navigation. Renders a `<div>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction, written on the root alone; the parts inherit it |
| `shouldFilter` | `boolean` | `true` | Filters the items by the search. Off, you render the matches yourself |
| `filter` | `(text: string, search: string, keywords: string[]) => number` | - | Scores each item: `0` hides it and a higher score sorts it first |
| `loop` | `boolean` | `false` | Moves the highlight from the last item to the first and back on the arrow keys, as in cmdk |
| `vimBindings` | `boolean` | `true` | Moves the highlight down on `Ctrl+N` and `Ctrl+J` and up on `Ctrl+P` and `Ctrl+K`, as in cmdk |
| `disablePointerSelection` | `boolean` | `false` | Leaves the highlight where it is as the mouse moves over the items. A click still selects |
| `limit` | `number` | - | The most matches the list shows, the best ranked first. A `forceMount` item shows beside them |
| `value` | `string` | - | The `value` of the highlighted item, to control the highlight. `''` highlights nothing |
| `defaultValue` | `string` | - | The `value` of the item highlighted first |
| `onValueChange` | `(value: string) => void` | - | Called with the `value` of the item the highlight moves to, or `''` when it leaves every item |
| `asChild` | `boolean` | - | Render as child element |

### `Command.Input`

The search input field. Renders an `<input>` that names the highlighted option in `aria-activedescendant`, so a screen reader announces it as the arrow keys move. A controlled `value` filters the list whenever it changes, including when the consumer clears it, and only by the value the owner commits, so an edit the owner refuses does not filter the list on text the input does not show.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as child element |

Accepts all standard HTML input attributes.

### `Command.List`

Container for items and groups. Renders a `<ul>`. Handles internal filtering and item visibility based on the search value, and writes the height of the rows it shows to `--gentleduck-command-list-height`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `virtual` | `{ count: number; scrollToIndex: (index: number) => void }` | - | Draws only some of the items, as a virtualizer does. `count` is how many the whole list holds, and `scrollToIndex` brings one into the DOM |
| `asChild` | `boolean` | - | Render as child element |

### `Command.Item`

A selectable item within the list. Renders a `<li>`. A mouse selects it on pointer up and a touch on the click. A click with no pointer behind it, such as a screen reader's, selects it too.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | - | Item value passed to `onSelect` |
| `disabled` | `boolean` | `false` | Disables the item |
| `textValue` | `string` | - | Text for search matching (auto-derived from text content if not provided) |
| `keywords` | `string[]` | - | More words a search matches the item by, such as aliases, as in cmdk |
| `forceMount` | `boolean` | `false` | Shows the item whatever the search, such as a "Create" item. It is no match, so `Command.Empty` can show beside it |
| `index` | `number` | - | The item's place in a `virtual` list, from 0, written as `aria-posinset` |
| `onSelect` | `(value: string) => void` | - | Called when the item is selected |
| `asChild` | `boolean` | - | Render as child element |

### `Command.Group`

Groups items with an optional heading. Renders a `<div>`. A group is hidden when none of its items match the search.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `heading` | `React.ReactNode` | - | Optional group heading |
| `forceMount` | `boolean` | `false` | Shows the group and its heading whatever the search |
| `asChild` | `boolean` | - | Render as child element |

### `Command.Empty`

Shows when no item matches the search, or when there is no item at all. A `forceMount` item is no match, so it does not hide it. Renders a `<div>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as child element |

### `Command.Loading`

Marks the list as loading. Renders a `<div>` with `role="progressbar"`, named "Loading".

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `progress` | `number` | - | How far the loading has come, from 0 to 100. Left out, the bar shows no amount |
| `asChild` | `boolean` | - | Render as child element |

### `Command.Status`

Announces how many items match. Renders a `<div>` with `role="status"`, `aria-live="polite"` and `aria-atomic`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode \| ((count: number) => React.ReactNode)` | - | What to announce, or a function of the count that returns it |
| `asChild` | `boolean` | - | Render as child element |

### `Command.Separator`

A visual separator between groups. Renders a `<div>`. Hidden when adjacent groups have no visible items.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | - | Render as child element |

***

## Hooks

### `useCommandSearch()`

Returns the text typed into `Command.Input`. Use it to render your own matches under `shouldFilter={false}`, or to show the search elsewhere in the command.

```tsx
const search = Command.useCommandSearch()
```

### `useCommandState(selector)`

Reads the command's state and renders again only when what `selector` picks from it changes, as in cmdk. The state is `search`, the text typed; `value`, the highlighted item's `value` or `''`; and `count`, how many items match and show, after `limit`. What the selector returns is kept until the state changes, so a selector that builds an object does not render again on every read.

```tsx
const count = Command.useCommandState((state) => state.count)
const highlighted = Command.useCommandState((state) => state.value)
```

### `useCommandContext(consumerName, scope)`

The internals the parts share: the input's ref, the highlighted item's ref, and `highlight(item)` to move the highlight. Building a part of your own is its one use; read the search with `useCommandSearch`.