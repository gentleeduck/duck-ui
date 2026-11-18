import { Autocomplete as Base } from '@base-ui-components/react/autocomplete'
import * as Duck from '@gentleduck/primitives/command'
import { CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandRoot } from 'cmdk'
import { Autocomplete, Header, Input, Menu, MenuItem, MenuSection, SearchField, useFilter } from 'react-aria-components'
import type { IBench } from '../../__benches__/bench.types'
import { MENU_ITEMS } from '../../__benches__/fixtures'

const CMDK = {
  Root: CommandRoot,
  Input: CommandInput,
  List: CommandList,
  Empty: CommandEmpty,
  Group: CommandGroup,
  Item: CommandItem,
}

// Base UI renders a hidden form input beside its search field, which nobody types into.
const SEARCH = 'input:not([aria-hidden="true"])'
const GROUPS = [{ label: 'Items', items: MENU_ITEMS }]

const tree =
  (C: IBench.Parts<'Empty' | 'Group' | 'Input' | 'Item' | 'List' | 'Root'>): IBench.View =>
  () => (
    <C.Root>
      <C.Input placeholder="Search" />
      <C.List>
        <C.Empty>No results</C.Empty>
        <C.Group heading="Items">
          {MENU_ITEMS.map((v) => (
            <C.Item key={v} value={v} data-bench-item="">
              {v}
            </C.Item>
          ))}
        </C.Group>
      </C.List>
    </C.Root>
  )

function AriaCommand() {
  const { contains } = useFilter({ sensitivity: 'base' })
  return (
    <Autocomplete filter={contains}>
      <SearchField aria-label="Search">
        <Input placeholder="Search" />
      </SearchField>
      <Menu aria-label="Items" renderEmptyState={() => 'No results'}>
        <MenuSection>
          <Header>Items</Header>
          {MENU_ITEMS.map((v) => (
            <MenuItem key={v} id={v} data-bench-item="">
              {v}
            </MenuItem>
          ))}
        </MenuSection>
      </Menu>
    </Autocomplete>
  )
}

export default {
  name: 'Command',
  note: "Timed by typing, not by a prop: cmdk copies a controlled search into its store in an effect, so a redraw would time half its work. Each copy's input gets `item-1` and its input event, and the time runs until every copy shows only the match. React Aria's is its Autocomplete over a Menu, and Base UI's its Autocomplete drawn inline.",
  size: {
    baseui: '@base-ui-components/react/autocomplete',
    'react-aria': {
      names: ['Autocomplete', 'SearchField', 'Input', 'Menu', 'MenuSection', 'MenuItem', 'Header', 'useFilter'],
      from: 'react-aria-components',
    },
    cmdk: 'cmdk',
  },
  runtime: {
    overlay: false,
    view: {
      duck: tree(Duck),
      baseui: () => (
        <Base.Root items={GROUPS} inline>
          <Base.Input placeholder="Search" />
          <Base.Empty>No results</Base.Empty>
          <Base.List>
            {(group: (typeof GROUPS)[number]) => (
              <Base.Group key={group.label} items={group.items}>
                <Base.GroupLabel>{group.label}</Base.GroupLabel>
                <Base.Collection>
                  {(v: string) => (
                    <Base.Item key={v} value={v} data-bench-item="">
                      {v}
                    </Base.Item>
                  )}
                </Base.Collection>
              </Base.Group>
            )}
          </Base.List>
        </Base.Root>
      ),
      'react-aria': () => <AriaCommand />,
      cmdk: tree(CMDK),
    },
    input: {
      name: 'type',
      run(host) {
        // React tracks an input's value through the prototype setter, so assigning `input.value` would be ignored.
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
        for (const input of host.querySelectorAll<HTMLInputElement>(SEARCH)) {
          setValue?.call(input, 'item-1')
          input.dispatchEvent(new Event('input', { bubbles: true }))
        }
      },
      done: (host) =>
        Array.from(host.querySelectorAll('[data-bench-item]')).filter((item) => item.checkVisibility()).length ===
        host.querySelectorAll(SEARCH).length,
    },
  },
} satisfies IBench.ICase
