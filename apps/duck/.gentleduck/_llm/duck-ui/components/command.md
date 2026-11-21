```tsx title="components/command-1.tsx"
// import from your project: import Demo from '@/components/command-1'
'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@gentleduck/registry-ui/command'
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react'

export default function Demo() {
  return (
    <Command className="h-fit w-80 border pt-0">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem disabled>
            <Calculator />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
```

## Philosophy

Command palettes are the power user's best friend  -  they surface every action in the app behind a single keyboard shortcut. The command primitive provides built-in search filtering, group visibility management and keyboard navigation with minimal API surface. The composable sub-components let you build anything from a simple search to a full IDE-style command center.

## About

This component is built on top of the [@gentleduck/primitives](https://github.com/gentleeduck/gentleduck/tree/master/packages/duck-primitives) command primitive, following the same Radix-style context/collection pattern used by Select and other primitives. The registry-layer components are thin styling wrappers around the primitives.

Direction (`dir`) is resolved once at the root `Command` primitive via `useDirection` and stored in context. Every child primitive  -  `CommandInput`, `CommandList`, `CommandItem`, `CommandGroup`, `CommandEmpty`, and `CommandSeparator`  -  reads `dir` from context and applies it to its DOM element automatically. Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the command follows.

**Features:**

* **Searchable Command Dialog:** Command palette with search and real-time filtering.
* **Groupable Command List:** Organize commands into logical groups with optional headings.
* **Selectable Items:** Items support click actions, focus-based highlighting, and selection via Enter/Space.
* **Keyboard Navigation:** Arrow keys, Home and End move the highlight, Enter selects it, and an input method composing text keeps its keys.
* **Custom Shortcuts:** Optional shortcut labels shown beside each command item.
* **Empty State Handling:** Automatically displays a fallback when no items match the query.
* **RTL Support:** Follows the direction set once with `DirectionProvider` or `<html dir="rtl">`.
* **Accessible & Composable:** ARIA roles (`listbox`, `option`, `combobox`, `status`) and headless architecture for complete flexibility.
* **Responsive Design:** Adapts gracefully to different screen sizes and containers.
* **Dialog or Inline Support:** Can be used as a floating dialog or embedded inline.

## How It's Built

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add command
```

Install the following dependencies:

```bash
npm install @gentleduck/primitives @gentleduck/libs @gentleduck/vim lucide-react
```

Add the `Dialog` and `ScrollArea` components to your project.

The `Command` component uses the [`Dialog`](/duck-ui/components/dialog) and [`ScrollArea`](/duck-ui/components/scroll-area) components. Make sure you have them installed in your project.

Copy and paste the following code into your project.

Update the import paths to match your project setup.

## Usage

```tsx
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui'
```

```tsx
<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Search GitHub</CommandItem>
      <CommandItem>Search Twitter</CommandItem>
      <CommandItem>Search Discord</CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>General</CommandItem>
      <CommandItem>Profile</CommandItem>
      <CommandItem>Notifications</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

An item's `keywords` let a search find it by words it does not show, and `loop` on `Command` or `CommandDialog` wraps the arrow keys from the last item to the first:

```tsx
<Command loop>
  <CommandInput />
  <CommandList>
    <CommandItem keywords={['preferences', 'options']}>Settings</CommandItem>
  </CommandList>
</Command>
```

## Examples

### Dialog

```tsx title="components/command-2.tsx"
// import from your project: import Demo from '@/components/command-2'
'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@gentleduck/registry-ui/command'
import { useKeyCommands } from '@gentleduck/vim/react'

import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)

  useKeyCommands(
    {
      'mod+j': {
        description: 'Open command menu',
        execute: () => {
          setOpen(true)
        },
        name: '⌘j',
      },
    },
    { preventDefault: true },
  )

  return (
    <>
      <p className="text-muted-foreground text-sm">
        Press{' '}
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>J
        </kbd>
      </p>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

To show the command menu in a dialog, use the `<CommandDialog />` component, or use the `<Button/>` component with the `command` variant.

```tsx
import { useKeyCommands } from '@gentleduck/vim/react'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)

  useKeyCommands(
    {
      'mod+j': {
        description: 'Open command menu',
        execute: () => {
          setOpen(true)
        },
        name: 'mod+j',
      },
    },
    { preventDefault: true },
  )


  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Settings</CommandItem>
          <CommandItem>Messages</CommandItem>
          <CommandItem>Search</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

A screen reader announces the dialog by its `title` and `description`, which are hidden on screen. The defaults describe a command palette, so a dialog that does something narrower names itself, in the user's language:

```tsx
<CommandDialog
  title="Search events"
  description="Find an event or jump to a date."
  open={open}
  onOpenChange={setOpen}>
```

### Ranked, with a Create item

A `filter` scores each item against the search: `0` hides it, and a higher score sorts it first. Groups move by their best item, while headings, separators and the empty state stay where they are. A `forceMount` item shows whatever the search, and is no match, so `CommandEmpty` shows beside it. `value` and `onValueChange` control which item is highlighted.

```tsx title="components/command-5.tsx"
// import from your project: import Demo from '@/components/command-5'
'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  useCommandSearch,
} from '@gentleduck/registry-ui/command'
import { FileText, Plus } from 'lucide-react'
import * as React from 'react'

const PAGES = ['Billing', 'Branding', 'Integrations', 'Notifications', 'Profile', 'Security', 'Team members']

function score(text: string, search: string) {
  const word = text.toLowerCase()
  const query = search.toLowerCase()
  if (word.startsWith(query)) return 1
  return word.includes(query) ? 0.5 : 0
}

function CreatePage({ onCreate }: { onCreate: (title: string) => void }) {
  const search = useCommandSearch()
  if (search === '') return null
  return (
    <>
      <CommandSeparator />
      <CommandGroup heading="Create">
        <CommandItem forceMount value="create" textValue="New page" onSelect={() => onCreate(search)}>
          <Plus />
          <span>Create "{search}"</span>
        </CommandItem>
      </CommandGroup>
    </>
  )
}

export default function Demo() {
  const [pages, setPages] = React.useState(PAGES)
  const [value, setValue] = React.useState('Profile')

  return (
    <div className="flex flex-col gap-2">
      <Command className="h-fit w-80 border pt-0" filter={score} value={value} onValueChange={setValue}>
        <CommandInput placeholder="Find or create a page..." />
        <CommandList>
          <CommandEmpty>No page matches.</CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem key={page} value={page}>
                <FileText />
                <span>{page}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CreatePage
            onCreate={(title) => setPages((current) => (current.includes(title) ? current : [...current, title]))}
          />
        </CommandList>
      </Command>
      <p className="text-muted-foreground text-sm">Highlighted: {value || 'nothing'}</p>
    </div>
  )
}
```

```tsx
function score(text: string, search: string) {
  const word = text.toLowerCase()
  const query = search.toLowerCase()
  if (word.startsWith(query)) return 1
  return word.includes(query) ? 0.5 : 0
}

<Command filter={score} value={value} onValueChange={setValue}>
  <CommandInput />
  <CommandList>
    <CommandEmpty>No page matches.</CommandEmpty>
    <CommandGroup heading="Pages">...</CommandGroup>
    <CommandItem forceMount value="create" textValue="New page">
      Create "{search}"
    </CommandItem>
  </CommandList>
</Command>
```

### Fuzzy, with a limit

`fuzzyFilter` finds an item by the letters of the search in order, so "apl" finds "Apple pie", and ranks a match at the start of the text, then at the start of a word, first. It ignores case and accents, as the default filter does, so "creme" finds "Crème brûlée". `limit` shows the best few matches, and `CommandStatus` counts them; it is for a screen reader unless a class such as `not-sr-only` shows it.

```tsx title="components/command-7.tsx"
// import from your project: import Demo from '@/components/command-7'
'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStatus,
  fuzzyFilter,
} from '@gentleduck/registry-ui/command'

const DISHES = [
  'Apple pie',
  'Applesauce',
  'Banana bread',
  'Café au lait',
  'Carrot cake',
  'Crème brûlée',
  'Green apple sorbet',
  'Pineapple upside-down cake',
  'Tarte Tatin',
]

export default function Demo() {
  return (
    <Command className="h-fit w-80 border pt-0" filter={fuzzyFilter} limit={4}>
      <CommandInput placeholder="Try apl, creme or cafe..." />
      <CommandList>
        <CommandEmpty>No dish found.</CommandEmpty>
        {DISHES.map((dish) => (
          <CommandItem key={dish} value={dish}>
            {dish}
          </CommandItem>
        ))}
      </CommandList>
      <CommandStatus className="not-sr-only border-t px-3 py-2 text-muted-foreground text-xs">
        {(count) => `${count} shown, the best four at most`}
      </CommandStatus>
    </Command>
  )
}
```

```tsx
<Command filter={fuzzyFilter} limit={4}>
  <CommandInput />
  <CommandList>
    <CommandEmpty>No dish found.</CommandEmpty>
    {dishes.map((dish) => (
      <CommandItem key={dish} value={dish}>
        {dish}
      </CommandItem>
    ))}
  </CommandList>
  <CommandStatus className="not-sr-only">{(count) => `${count} shown`}</CommandStatus>
</Command>
```

### Your own search

With `shouldFilter={false}` the command filters nothing, and you render the matches yourself, reading what was typed with `useCommandSearch()`. An item that mounts is highlighted as soon as it arrives, and `CommandEmpty` shows once you render none. `CommandLoading` shows while the search runs, and `CommandStatus` tells a screen reader how many were found.

```tsx title="components/command-6.tsx"
// import from your project: import Demo from '@/components/command-6'
'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandStatus,
  useCommandSearch,
} from '@gentleduck/registry-ui/command'
import { User } from 'lucide-react'
import * as React from 'react'

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Barbara Liskov', 'Edsger Dijkstra', 'Grace Hopper', 'Linus Torvalds']

function usePeople(search: string) {
  const query = search.trim().toLowerCase()
  const [found, setFound] = React.useState({ query: '', people: [] as string[] })
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFound({ query, people: query ? PEOPLE.filter((person) => person.toLowerCase().includes(query)) : [] })
    }, 300)
    return () => clearTimeout(timer)
  }, [query])
  return { people: found.people, loading: found.query !== query }
}

function Results() {
  const search = useCommandSearch()
  const { people, loading } = usePeople(search)
  return (
    <>
      {loading && <CommandLoading>Searching...</CommandLoading>}
      <CommandStatus>{(count) => `${count} found`}</CommandStatus>
      <CommandList>
        {!loading && <CommandEmpty>{search.trim() ? 'No one found.' : 'Type a name to search.'}</CommandEmpty>}
        <CommandGroup heading="People">
          {people.map((person) => (
            <CommandItem key={person} value={person}>
              <User />
              <span>{person}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </>
  )
}

export default function Demo() {
  return (
    <Command className="h-fit w-80 border pt-0" shouldFilter={false}>
      <CommandInput placeholder="Search people..." />
      <Results />
    </Command>
  )
}
```

```tsx
function Results() {
  const { people, loading } = usePeople(useCommandSearch())
  return (
    <>
      {loading && <CommandLoading>Searching...</CommandLoading>}
      <CommandStatus>{(count) => `${count} found`}</CommandStatus>
      <CommandList>
        {!loading && <CommandEmpty>No one found.</CommandEmpty>}
        {people.map((person) => (
          <CommandItem key={person.id} value={person.id}>
            {person.name}
          </CommandItem>
        ))}
      </CommandList>
    </>
  )
}

<Command shouldFilter={false}>
  <CommandInput />
  <Results />
</Command>
```

### A virtual list

`CommandList` passes `virtual` to the primitive for a list that draws only some of its rows, and `scrollRef` hands a virtualizer the viewport it scrolls. Each `CommandItem` takes its `index`. The arrow keys, `PageUp` and `PageDown` move by index, and a row they reach that is not drawn is scrolled in and highlighted. Filter the rows yourself, with `shouldFilter={false}`. `MotionCommandItem` uses `index` for its entrance, so a virtual list uses `CommandItem`.

```tsx title="components/command-9.tsx"
// import from your project: import Demo from '@/components/command-9'
'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandStatus,
  useCommandSearch,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

const ROW = 32
const DRAWN = 14
const STATIONS = Array.from({ length: 5000 }, (_, index) => `Station ${String(index + 1).padStart(4, '0')}`)

function Stations() {
  const search = useCommandSearch().trim().toLowerCase()
  const rows = React.useMemo(() => STATIONS.filter((station) => station.toLowerCase().includes(search)), [search])
  const [view, setView] = React.useState<HTMLDivElement | null>(null)
  const [top, setTop] = React.useState(0)

  React.useEffect(() => {
    if (!view) return
    const follow = () => setTop(view.scrollTop)
    view.addEventListener('scroll', follow, { passive: true })
    return () => view.removeEventListener('scroll', follow)
  }, [view])

  const virtual = React.useMemo(
    () => ({
      count: rows.length,
      scrollToIndex: (index: number) => {
        if (!view) return
        const start = index * ROW
        if (start < view.scrollTop) view.scrollTop = start
        else if (start + ROW > view.scrollTop + view.clientHeight) view.scrollTop = start + ROW - view.clientHeight
        setTop(view.scrollTop)
      },
    }),
    [rows.length, view],
  )

  const first = Math.max(0, Math.floor(top / ROW) - 2)
  const drawn = rows.slice(first, first + DRAWN)

  return (
    <>
      <CommandList scrollRef={setView} style={{ height: rows.length * ROW, position: 'relative' }} virtual={virtual}>
        <CommandEmpty>No station found.</CommandEmpty>
        {drawn.map((station, offset) => (
          <CommandItem
            className="absolute inset-x-0"
            index={first + offset}
            key={station}
            style={{ height: ROW, top: (first + offset) * ROW }}
            value={station}>
            {station}
          </CommandItem>
        ))}
      </CommandList>
      <CommandStatus className="not-sr-only border-t px-3 py-2 text-muted-foreground text-xs">
        {(count) => `${count.toLocaleString()} stations, ${drawn.length} drawn`}
      </CommandStatus>
    </>
  )
}

export default function Demo() {
  return (
    <Command className="h-fit w-80 border pt-0" shouldFilter={false}>
      <CommandInput placeholder="Search 5,000 stations..." />
      <Stations />
    </Command>
  )
}
```

The preview windows its rows by hand. With a virtualizer such as `@tanstack/react-virtual` it reads:

```tsx
function Rows({ rows }: { rows: string[] }) {
  const [view, setView] = React.useState<HTMLDivElement | null>(null)
  const virtualizer = useVirtualizer({ count: rows.length, getScrollElement: () => view, estimateSize: () => 32 })
  return (
    <CommandList
      scrollRef={setView}
      virtual={{ count: rows.length, scrollToIndex: virtualizer.scrollToIndex }}
      style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualizer.getVirtualItems().map((row) => (
        <CommandItem
          key={row.key}
          index={row.index}
          value={rows[row.index]}
          className="absolute inset-x-0"
          style={{ top: row.start, height: row.size }}>
          {rows[row.index]}
        </CommandItem>
      ))}
    </CommandList>
  )
}
```

### Keyboard

Beside the arrow keys, `Home`, `End` and `Enter`, `Ctrl+N` and `Ctrl+J` move the highlight down and `Ctrl+P` and `Ctrl+K` up, unless `vimBindings={false}`. `Alt` with an arrow jumps between groups, `Cmd` with an arrow goes to the first or last item, and `PageUp` and `PageDown` move a page of the scroll area. `disablePointerSelection` leaves the highlight where it is as the mouse moves over the items.

The palette below starts on `defaultValue`, wraps with `loop`, takes no Ctrl keys and leaves the highlight to the keyboard. Its "Pinned" group has `forceMount`, so its heading stays through any search, and `keywords` find Undo by "history". The shortcut beside Undo binds Cmd+Shift+U, or Ctrl+Shift+U, while it is mounted.

```tsx title="components/command-8.tsx"
// import from your project: import Demo from '@/components/command-8'
'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

export default function Demo() {
  const [ran, setRan] = React.useState('nothing yet')

  return (
    <div className="flex w-80 flex-col gap-2">
      <Command className="h-fit border pt-0" defaultValue="paste" disablePointerSelection loop vimBindings={false}>
        <CommandInput placeholder="Try history or clipboard..." />
        <CommandList>
          <CommandEmpty>No action found.</CommandEmpty>
          <CommandGroup forceMount heading="Pinned">
            <CommandItem keywords={['history', 'back']} onSelect={setRan} value="undo">
              Undo
              <CommandShortcut keys="mod+shift+u" onKeysPressed={() => setRan('undo, from its shortcut')}>
                ⇧⌘U
              </CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Edit">
            <CommandItem keywords={['clipboard']} onSelect={setRan} value="copy">
              Copy
            </CommandItem>
            <CommandItem keywords={['clipboard']} onSelect={setRan} value="paste">
              Paste
            </CommandItem>
            <CommandItem keywords={['clipboard']} onSelect={setRan} value="cut">
              Cut
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <p className="text-muted-foreground text-sm">Ran: {ran}</p>
    </div>
  )
}
```

### A sized dialog with shortcut styles

```tsx title="components/command-10.tsx"
// import from your project: import Demo from '@/components/command-10'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Open the small palette
      </Button>
      <CommandDialog
        contentClassName="h-80 lg:w-110"
        description="Jump to a page"
        onOpenChange={setOpen}
        open={open}
        title="Quick jump">
        <CommandInput placeholder="Where to?" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => setOpen(false)}>
              Inbox <CommandShortcut keys="g+i" />
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              Drafts <CommandShortcut keys="g+d" variant="secondary" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

### Loading progress and input options

```tsx title="components/command-11.tsx"
// import from your project: import Demo from '@/components/command-11'
'use client'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  useCommandSearch,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

const CITIES = ['Amsterdam', 'Athens', 'Berlin', 'Bogota', 'Cairo', 'Dublin']

function Results({ onProgress }: { onProgress: (progress: number | null) => void }) {
  const search = useCommandSearch()
  const [hits, setHits] = React.useState<string[]>(CITIES)

  React.useEffect(() => {
    let progress = 0
    onProgress(0)
    const timer = setInterval(() => {
      progress += 25
      onProgress(progress)
      if (progress >= 100) {
        clearInterval(timer)
        setHits(CITIES.filter((city) => city.toLowerCase().includes(search.toLowerCase())))
        onProgress(null)
      }
    }, 150)
    return () => clearInterval(timer)
  }, [search, onProgress])

  return hits.map((city) => <CommandItem key={city}>{city}</CommandItem>)
}

export default function Demo() {
  const [progress, setProgress] = React.useState<number | null>(null)
  const [typed, setTyped] = React.useState(0)

  return (
    <Command className="w-[320px] rounded-lg border" shouldFilter={false}>
      <CommandInput
        autoFocus
        onChange={() => setTyped((count) => count + 1)}
        placeholder="Search cities..."
        wrapperClassName="px-3"
      />
      <CommandList>
        {progress === null ? null : <CommandLoading progress={progress}>Searching... {progress}%</CommandLoading>}
        <CommandEmpty>No city found.</CommandEmpty>
        <Results onProgress={setProgress} />
      </CommandList>
      <p className="px-3 pb-2 text-muted-foreground text-xs">{typed} keystrokes heard by onChange.</p>
    </Command>
  )
}
```

### Motion dialog

```tsx title="components/command-12.tsx"
// import from your project: import Demo from '@/components/command-12'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import {
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  MotionCommandDialog,
} from '@gentleduck/registry-ui/command'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Open the animated palette
      </Button>
      <MotionCommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          {['New file', 'New folder', 'Open recent'].map((action) => (
            <CommandItem key={action} onSelect={() => setOpen(false)}>
              {action}
            </CommandItem>
          ))}
        </CommandList>
      </MotionCommandDialog>
    </>
  )
}
```

## Component Composition

## Types

**useCommandSearch**

Returns the text typed into `CommandInput`, from anywhere inside a `Command` or `CommandDialog`.

```tsx
const search = useCommandSearch()
```

**useCommandState**

Reads the search, the highlighted item's `value` and how many items match, and renders again only when what the selector picks changes.

```tsx
const count = useCommandState((state) => state.count)
```

**fuzzyFilter**

A `filter` that finds an item by the letters of the search in order and ranks the closest match first, ignoring case and accents.

```tsx
<Command filter={fuzzyFilter}>...</Command>
```

The rest of what the parts share lives in the primitive, `@gentleduck/primitives/command`, for building a part of your own.

***

**CommandItemContextValue**

Per-item context. Available via `useCommandItemContext()`.

| Property | Type | Description |
| --- | --- | --- |
| `value` | `string` | The item's value. |
| `disabled` | `boolean` | Whether the item is disabled. |
| `textId` | `string` | Auto-generated id for the item's text label. |
| `onItemTextChange` | `(node: HTMLElement \| null) => void` | Callback to update the item's text value from the DOM. |

***

**CommandBadgeProps (CommandShortcut)**

| Property | Type | Description |
| --- | --- | --- |
| `keys` | `string` (optional) | Keyboard shortcut string (e.g. `'mod+k'`), shown for the platform when there are no `children`. |
| `onKeysPressed` | `() => void` (optional) | Called when the shortcut is triggered. |
| `variant` | `'default' \| 'secondary'` (optional) | Visual style. |
| `...props` | `React.HTMLProps<HTMLElement>` | Native `kbd` element props. |

## RTL Support

Set the direction once with `DirectionProvider` (or `<html dir="rtl">`) and the command follows. Child primitives, including the ones inside `CommandDialog`, get the resolved `dir` automatically.

```tsx
<DirectionProvider dir="rtl">
  <Command>
    <CommandInput placeholder="..." />
    <CommandList>
      <CommandGroup heading="...">
        <CommandItem>...</CommandItem>
      </CommandGroup>
    </CommandList>
  </Command>
</DirectionProvider>
```

```tsx title="components/command-3.tsx"
// import from your project: import Demo from '@/components/command-3'
'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@gentleduck/registry-ui/command'
import { DirectionProvider } from '@gentleduck/registry-ui/direction'
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react'

export default function Demo() {
  return (
    <DirectionProvider dir="rtl">
      <Command className="h-fit w-80 border pt-0">
        <CommandInput placeholder="اكتب أمرًا أو ابحث..." />
        <CommandList>
          <CommandEmpty>لا توجد نتائج.</CommandEmpty>
          <CommandGroup heading="اقتراحات">
            <CommandItem>
              <Calendar />
              <span>التقويم</span>
            </CommandItem>
            <CommandItem>
              <Smile />
              <span>البحث عن رموز تعبيرية</span>
            </CommandItem>
            <CommandItem disabled>
              <Calculator />
              <span>الآلة الحاسبة</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="الإعدادات">
            <CommandItem>
              <User />
              <span>الملف الشخصي</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard />
              <span>الفوترة</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings />
              <span>الإعدادات</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </DirectionProvider>
  )
}
```

## Motion

} title="Alpha: Motion Compositions" tone="warning">
  Motion components work standalone, but some compositions may behave unexpectedly: this is still under active development. If you find a broken composition, please [file an issue](https://github.com/gentleeduck/gentleduck/issues).

Use `MotionCommandDialog` for a palette that opens with the motion dialog, and `MotionCommandItem` for staggered entrance animations powered by [motion](https://motion.dev). Each item fades in with scale and blur, staggered by 30ms via the `index` prop.

```tsx title="components/command-4.tsx"
// import from your project: import Demo from '@/components/command-4'
'use client'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  MotionCommandItem,
} from '@gentleduck/registry-ui/command'
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react'

export default function Demo() {
  return (
    <Command className="h-fit w-80 border pt-0">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <MotionCommandItem index={0}>
            <Calendar />
            <span>Calendar</span>
          </MotionCommandItem>
          <MotionCommandItem index={1}>
            <Smile />
            <span>Search Emoji</span>
          </MotionCommandItem>
          <MotionCommandItem index={2} disabled>
            <Calculator />
            <span>Calculator</span>
          </MotionCommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <MotionCommandItem index={3}>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </MotionCommandItem>
          <MotionCommandItem index={4}>
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </MotionCommandItem>
          <MotionCommandItem index={5}>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </MotionCommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
```

}>
  Requires the `motion` package. Use `MotionCommandItem` instead of `CommandItem`. Same props plus `index` for stagger delay. All other sub-components stay the same.

## API Reference

### Command

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `dir` | `'ltr' \| 'rtl'` | - | Text direction. Resolved by primitives `useDirection` (`dir` prop -> `DirectionProvider` -> `<html dir>`), written on the root and inherited by its children. |
| `className` | `string` | - | Additional CSS classes applied to the command container |
| `shouldFilter` | `boolean` | `true` | Whether the command filters its items by the search. Off, you render the matches yourself |
| `filter` | `(text: string, search: string, keywords: string[]) => number` | - | Scores each item: `0` hides it and a higher score sorts it first |
| `loop` | `boolean` | `false` | Moves the highlight from the last item to the first and back on the arrow keys |
| `vimBindings` | `boolean` | `true` | Moves the highlight down on `Ctrl+N` and `Ctrl+J` and up on `Ctrl+P` and `Ctrl+K` |
| `disablePointerSelection` | `boolean` | `false` | Leaves the highlight where it is as the mouse moves over the items. A click still selects |
| `limit` | `number` | - | The most matches the list shows, the best ranked first. A `forceMount` item shows beside them |
| `value` | `string` | - | The `value` of the highlighted item, to control the highlight. `''` highlights nothing |
| `defaultValue` | `string` | - | The `value` of the item highlighted first |
| `onValueChange` | `(value: string) => void` | - | Called with the `value` of the item the highlight moves to, or `''` when it leaves every item |
| `children` | `React.ReactNode` | - | Command content (`CommandInput`, `CommandList`, etc.) |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the root div |

### CommandInput

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placeholder` | `string` | `'Search...'` | Placeholder text in the input |
| `autoFocus` | `boolean` | `false` | Automatically focus input on mount |
| `wrapperClassName` | `string` | - | Additional CSS classes applied to the input wrapper div (`data-slot="command-input-wrapper"`) |
| `children` | `React.ReactNode` | - | Extra elements rendered inside the input wrapper (after the input), e.g. action buttons |
| `onChange` | `React.ChangeEventHandler` | - | Triggered when the input value changes. Also drives internal search filtering. |
| `value` | `string` | - | Controlled search text. The list filters whenever it changes, including when you clear it. |
| `...props` | `React.HTMLProps<HTMLInputElement>` | - | Additional props to spread to the input element |

### CommandList

Filters the items by the search, and with a `filter` on `Command` sorts them by score. A group with no visible item is hidden, and so is the separator after it. An item that mounts, unmounts or changes what it is found by is filtered at once.

The list sits in a `ScrollArea` whose viewport is capped at `max-h-75` (300px) and does the scrolling. Wheel and touch scrolling stop at the list, so it still scrolls inside a modal `Dialog` or `Sheet`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the scrolling viewport. Override the height here, e.g. `max-h-96` |
| `scrollRef` | `React.Ref<HTMLDivElement>` | - | Ref to the scrolling viewport, e.g. for a virtualizer |
| `virtual` | `{ count: number; scrollToIndex: (index: number) => void }` | - | Draws only some of the rows, as a virtualizer does. `count` is how many the whole list holds, and `scrollToIndex` brings one in |
| `children` | `React.ReactNode` | - | `CommandGroup`, `CommandItem`, `CommandEmpty`, and `CommandSeparator` elements |
| `...props` | `React.HTMLProps<HTMLUListElement>` | - | Additional props to spread to the ul element (`role="listbox"`) |

### CommandItem

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `''` | The internal value for selection |
| `disabled` | `boolean` | `false` | Whether the item is disabled |
| `textValue` | `string` | - | Optional text used for filtering. Defaults to the item's text content. |
| `keywords` | `string[]` | - | More words a search matches the item by, such as aliases |
| `forceMount` | `boolean` | `false` | Shows the item whatever the search. It is no match, so `CommandEmpty` can show beside it |
| `index` | `number` | - | The item's place in a `virtual` list, from 0, written as `aria-posinset` |
| `onSelect` | `(value: string) => void` | - | Called when the item is selected (via Enter, Space, or pointer) |
| `...props` | `React.HTMLProps<HTMLLIElement>` | - | Additional props to spread to the li element (`role="option"`) |

### CommandGroup

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `heading` | `React.ReactNode` | - | Optional heading for the group. Renders a div with `data-slot="command-group-heading"`. |
| `forceMount` | `boolean` | `false` | Shows the group and its heading whatever the search |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the group div (`role="group"`) |

### CommandEmpty

Renders a `div` with `role="status"` and `aria-live="polite"`. Shows when no item matches the search, or when there is no item at all, as under `shouldFilter={false}` before results arrive.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the empty state |
| `children` | `React.ReactNode` | - | Content shown when no items match the search query |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the div element |

### CommandLoading

A muted row marking the list as loading, a `progressbar` named "Loading".

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `progress` | `number` | - | How far the loading has come, from 0 to 100. Left out, the bar shows no amount |
| `className` | `string` | - | Additional CSS classes applied to the row |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the div element |

### CommandStatus

Announces how many items match, in a polite `status` region. It is `sr-only`, so a screen reader hears it and the page shows nothing, until a class such as `not-sr-only` shows it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode \| ((count: number) => React.ReactNode)` | - | What to announce, or a function of the count that returns it |
| `className` | `string` | - | Additional CSS classes applied to the region |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the div element |

### CommandShortcut

Draws a `kbd` label: its children, or else `keys` written out for the platform, Cmd on a Mac and Ctrl elsewhere. A server writes Linux's keys and the browser swaps in its own once hydrated. With `keys` and `onKeysPressed` it also binds the keys while it is mounted, through the ambient `KeyProvider` from `@gentleduck/vim/react` when there is one and on its own when there is not.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `keys` | `string` (optional) | - | Keyboard shortcut string (e.g. `"mod+k"`, Cmd on a Mac and Ctrl elsewhere). Shown for the platform when there are no `children`, and bound only beside `onKeysPressed` |
| `onKeysPressed` | `() => void` (optional) | - | Triggered when shortcut is pressed |
| `variant` | `'default' \| 'secondary'` | `'default'` | Visual style variant |
| `...props` | `React.HTMLProps<HTMLElement>` | - | Additional props to spread to the kbd element |

### CommandSeparator

Renders a `div` with `role="separator"` and `aria-hidden`. Visibility is automatically managed by the list's filtering logic.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | - | Additional CSS classes applied to the separator |
| `...props` | `React.HTMLProps<HTMLDivElement>` | - | Additional props to spread to the separator div |

### CommandDialog

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | - | Command content rendered inside the dialog (typically `CommandInput`, `CommandList`, etc.) |
| `shouldFilter` | `boolean` | `true` | Whether the command filters its items by the search |
| `filter` | `(text: string, search: string, keywords: string[]) => number` | - | Scores each item, as on `Command` |
| `loop` | `boolean` | `false` | Moves the highlight from the last item to the first and back on the arrow keys |
| `vimBindings` | `boolean` | `true` | Moves the highlight on `Ctrl+N`, `Ctrl+J`, `Ctrl+P` and `Ctrl+K`, as on `Command` |
| `disablePointerSelection` | `boolean` | `false` | Leaves the highlight where it is as the mouse moves, as on `Command` |
| `limit` | `number` | - | The most matches the list shows, as on `Command` |
| `value` | `string` | - | The `value` of the highlighted item, as on `Command` |
| `defaultValue` | `string` | - | The `value` of the item highlighted first |
| `onValueChange` | `(value: string) => void` | - | Called with the `value` of the item the highlight moves to |
| `contentClassName` | `string` | - | Additional CSS classes applied to the inner `DialogContent`, useful for controlling dialog size |
| `title` | `string` | `'Command palette'` | Dialog title, read by screen readers and hidden on screen |
| `description` | `string` | `'Search for commands and navigation items'` | Dialog description, read by screen readers and hidden on screen |
| `...props` | `React.ComponentPropsWithRef<typeof Dialog>` | - | Additional props inherited from `Dialog`. |

### MotionCommandDialog

`CommandDialog` on `MotionDialog`, so the palette opens and closes with its animation. Same props as `CommandDialog`. Requires the `motion` package.

### MotionCommandItem

Renders directly as `m.li` with a staggered `scaleIn` entrance (fade, scale, and blur) using `springBouncy`. Drop-in replacement for `CommandItem`. Requires the `motion` package.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `index` | `number` | `0` | Stagger delay index (30ms per index) for entrance animation. It is not a place in a `virtual` list, so a virtual list uses `CommandItem` |
| `value` | `string` | `''` | The internal value for selection |
| `disabled` | `boolean` | `false` | Whether the item is disabled |
| `textValue` | `string` | - | Optional text used for filtering. Defaults to the item's text content. |
| `keywords` | `string[]` | - | More words a search matches the item by, such as aliases |
| `onSelect` | `(value: string) => void` | - | Called when the item is selected (via Enter, Space, or pointer) |
| `...props` | `Omit<CommandItemProps, 'onDrag' \| 'onDragStart' \| 'onDragEnd' \| 'onAnimationStart'>` | - | All props from `CommandItem` except motion event handlers |