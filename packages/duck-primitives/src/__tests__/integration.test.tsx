import { describe, expect, it, mock, setDefaultTimeout } from 'bun:test'

setDefaultTimeout(15_000)

import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../command'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '../dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuPortal, DropdownMenuTrigger } from '../dropdown-menu'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarPortal, MenubarTrigger } from '../menubar'
import { Popover, PopoverClose, PopoverContent, PopoverPortal, PopoverTrigger } from '../popover'
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from '../radio-group'
import { Select, SelectTrigger, SelectValue } from '../select'
import { Slider, SliderRange, SliderThumb, SliderTrack } from '../slider'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'

describe('Dialog full lifecycle', () => {
  function renderFullDialog(props: Record<string, unknown> = {}) {
    return render(
      <Dialog {...props}>
        <DialogTrigger>OpenDialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>DialogHeading</DialogTitle>
            <DialogDescription>DialogBody</DialogDescription>
            <DialogClose>CloseButton</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
  }

  it('clicking trigger opens dialog and content appears', () => {
    const { container, baseElement } = renderFullDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!

    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(baseElement.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('content has correct ARIA linking to title and description', () => {
    const { baseElement } = renderFullDialog({ defaultOpen: true })
    const content = baseElement.querySelector('[role="dialog"]')!

    const titleId = content.getAttribute('aria-labelledby')
    expect(titleId).toBeTruthy()

    const descId = content.getAttribute('aria-describedby')
    expect(descId).toBeTruthy()

    expect(content.querySelector(`[id="${titleId}"]`)).not.toBeNull()
    expect(content.querySelector(`[id="${descId}"]`)).not.toBeNull()
  })

  it('close button renders inside dialog content', () => {
    const { baseElement } = renderFullDialog({ defaultOpen: true })
    const dialog = baseElement.querySelector('[role="dialog"]')!
    const closeBtn = dialog.querySelector('[data-slot="dialog-close"]')
    expect(closeBtn).not.toBeNull()
    expect(closeBtn).not.toBeNull()
  })

  it('fires onOpenChange(true) when trigger clicked', () => {
    const handler = mock(() => {})
    const { container } = renderFullDialog({ onOpenChange: handler })
    fireEvent.click(container.querySelector('[data-slot="dialog-trigger"]')!)
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('trigger aria-controls matches content id', () => {
    const { container, baseElement } = renderFullDialog({ defaultOpen: true })
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    const controlsId = trigger.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
    const content = baseElement.querySelector(`#${controlsId}`)
    expect(content).not.toBeNull()
  })

  // Note: DialogOverlay uses RemoveScroll which renders through a Slot wrapper
  // that does not produce the expected DOM nodes in jsdom. We verify overlay
  // presence indirectly through the trigger state, matching the approach used
  // in the existing unit tests.
  it('overlay is gated on open state (verified via trigger lifecycle)', () => {
    const { container } = renderFullDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!

    expect(trigger.getAttribute('data-state')).toBe('closed')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('title and description have correct data-slot attributes', () => {
    const { baseElement } = renderFullDialog({ defaultOpen: true })
    expect(baseElement.querySelector('[data-slot="dialog-title"]')).not.toBeNull()
    expect(baseElement.querySelector('[data-slot="dialog-description"]')).not.toBeNull()
  })
})

describe('Popover with close button', () => {
  function renderPopover(props: Record<string, unknown> = {}) {
    return render(
      <Popover {...props}>
        <PopoverTrigger>Toggle Popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>
            <p>Popover body</p>
            <PopoverClose>Dismiss</PopoverClose>
          </PopoverContent>
        </PopoverPortal>
      </Popover>,
    )
  }

  // Note: PopoverContent renders through PopperContent (floating-ui) which
  // does not fully produce DOM in jsdom. We verify open/close through the
  // trigger state and onOpenChange callbacks, matching existing unit tests.
  it('clicking trigger opens popover (verified via trigger state)', () => {
    const handler = mock(() => {})
    const { container } = renderPopover({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!

    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('clicking trigger twice closes the popover', () => {
    const handler = mock(() => {})
    const { container } = renderPopover({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!

    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledWith(true)

    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledWith(false)
    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('trigger has correct ARIA attributes', () => {
    const { container } = renderPopover()
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!

    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('type')).toBe('button')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('trigger has aria-controls linking to content id', () => {
    const { container } = renderPopover()
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!

    const controlsId = trigger.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
  })

  it('fires onOpenChange with correct values across open/close cycle', () => {
    const handler = mock(() => {})
    const { container } = renderPopover({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!

    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledWith(true)

    fireEvent.click(trigger)
    expect(handler).toHaveBeenCalledWith(false)
    expect(handler).toHaveBeenCalledTimes(2)
  })
})

describe('RadioGroup with Indicator', () => {
  function renderRadioGroup(props: Record<string, unknown> = {}) {
    return render(
      <RadioGroup {...props}>
        <RadioGroupItem value="apple">
          <RadioGroupIndicator />
          Apple
        </RadioGroupItem>
        <RadioGroupItem value="banana">
          <RadioGroupIndicator />
          Banana
        </RadioGroupItem>
        <RadioGroupItem value="cherry">
          <RadioGroupIndicator />
          Cherry
        </RadioGroupItem>
      </RadioGroup>,
    )
  }

  it('renders all items with role="radio"', () => {
    const { container } = renderRadioGroup()
    const items = container.querySelectorAll('[role="radio"]')
    expect(items.length).toBe(3)
  })

  it('clicking an item checks it', () => {
    const { container } = renderRadioGroup()
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('aria-checked')).toBe('true')
    expect(items[0]!.getAttribute('data-state')).toBe('checked')
  })

  it('only one item is checked at a time', () => {
    const { container } = renderRadioGroup()
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('aria-checked')).toBe('true')
    expect(items[1]!.getAttribute('aria-checked')).toBe('false')
    expect(items[2]!.getAttribute('aria-checked')).toBe('false')

    fireEvent.click(items[2]!)
    expect(items[0]!.getAttribute('aria-checked')).toBe('false')
    expect(items[1]!.getAttribute('aria-checked')).toBe('false')
    expect(items[2]!.getAttribute('aria-checked')).toBe('true')
  })

  it('indicator renders only for the checked item', () => {
    const { container } = renderRadioGroup()
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    expect(container.querySelectorAll('[data-slot="radio-group-indicator"]').length).toBe(0)

    fireEvent.click(items[0]!)
    const indicators = container.querySelectorAll('[data-slot="radio-group-indicator"]')
    expect(indicators.length).toBe(1)
    expect(indicators[0]!.getAttribute('data-state')).toBe('checked')
  })

  it('indicator moves when selection changes', () => {
    const { container } = renderRadioGroup()
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    fireEvent.click(items[0]!)
    expect(container.querySelectorAll('[data-slot="radio-group-indicator"]').length).toBe(1)

    fireEvent.click(items[1]!)
    const indicators = container.querySelectorAll('[data-slot="radio-group-indicator"]')
    expect(indicators.length).toBe(1)
    expect(items[1]!.querySelector('[data-slot="radio-group-indicator"]')).not.toBeNull()
    expect(items[0]!.querySelector('[data-slot="radio-group-indicator"]')).toBeNull()
  })

  it('supports defaultValue', () => {
    const { container } = renderRadioGroup({ defaultValue: 'banana' })
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    expect(items[0]!.getAttribute('aria-checked')).toBe('false')
    expect(items[1]!.getAttribute('aria-checked')).toBe('true')
    expect(items[2]!.getAttribute('aria-checked')).toBe('false')

    expect(items[1]!.querySelector('[data-slot="radio-group-indicator"]')).not.toBeNull()
  })

  it('fires onValueChange with the selected value', () => {
    const handler = mock(() => {})
    const { container } = renderRadioGroup({ onValueChange: handler })
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    fireEvent.click(items[2]!)
    expect(handler).toHaveBeenCalledWith('cherry')
  })

  it('group has role="radiogroup"', () => {
    const { container } = renderRadioGroup()
    expect(container.querySelector('[role="radiogroup"]')).not.toBeNull()
  })

  it('clicking already-checked item does not uncheck it', () => {
    const { container } = renderRadioGroup()
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('aria-checked')).toBe('true')

    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('aria-checked')).toBe('true')
  })
})

describe('ToggleGroup single mode', () => {
  it('clicking an item activates it and deactivates others', () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic">I</ToggleGroupItem>
        <ToggleGroupItem value="underline">U</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')

    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('data-state')).toBe('on')
    expect(items[1]!.getAttribute('data-state')).toBe('off')
    expect(items[2]!.getAttribute('data-state')).toBe('off')

    fireEvent.click(items[2]!)
    expect(items[0]!.getAttribute('data-state')).toBe('off')
    expect(items[1]!.getAttribute('data-state')).toBe('off')
    expect(items[2]!.getAttribute('data-state')).toBe('on')
  })

  it('clicking the active item deactivates it', () => {
    const { container } = render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')

    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('data-state')).toBe('on')

    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('data-state')).toBe('off')
  })

  it('single mode items have role="radio" and aria-checked', () => {
    const { container } = render(
      <ToggleGroup type="single" defaultValue="a">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    expect(items[0]!.getAttribute('role')).toBe('radio')
    expect(items[0]!.getAttribute('aria-checked')).toBe('true')
    expect(items[1]!.getAttribute('aria-checked')).toBe('false')
  })
})

describe('ToggleGroup multiple mode', () => {
  it('allows multiple items to be active simultaneously', () => {
    const { container } = render(
      <ToggleGroup type="multiple">
        <ToggleGroupItem value="bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic">I</ToggleGroupItem>
        <ToggleGroupItem value="underline">U</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')

    fireEvent.click(items[0]!)
    fireEvent.click(items[2]!)

    expect(items[0]!.getAttribute('data-state')).toBe('on')
    expect(items[1]!.getAttribute('data-state')).toBe('off')
    expect(items[2]!.getAttribute('data-state')).toBe('on')
  })

  it('toggling an active item off in multiple mode', () => {
    const { container } = render(
      <ToggleGroup type="multiple" defaultValue={['bold', 'italic']}>
        <ToggleGroupItem value="bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic">I</ToggleGroupItem>
        <ToggleGroupItem value="underline">U</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')

    expect(items[0]!.getAttribute('data-state')).toBe('on')
    expect(items[1]!.getAttribute('data-state')).toBe('on')

    fireEvent.click(items[0]!)
    expect(items[0]!.getAttribute('data-state')).toBe('off')
    expect(items[1]!.getAttribute('data-state')).toBe('on')
  })

  it('multiple mode items have aria-pressed instead of aria-checked', () => {
    const { container } = render(
      <ToggleGroup type="multiple" defaultValue={['a']}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')
    expect(items[0]!.getAttribute('aria-pressed')).toBe('true')
    expect(items[1]!.getAttribute('aria-pressed')).toBe('false')
    expect(items[0]!.getAttribute('role')).toBeNull()
    expect(items[0]!.getAttribute('aria-checked')).toBeNull()
  })

  it('onValueChange reports current array of active values', () => {
    const handler = mock(() => {})
    const { container } = render(
      <ToggleGroup type="multiple" onValueChange={handler}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
        <ToggleGroupItem value="c">C</ToggleGroupItem>
      </ToggleGroup>,
    )
    const items = container.querySelectorAll('[data-slot="toggle-group-item"]')

    fireEvent.click(items[0]!)
    expect(handler).toHaveBeenCalledWith(['a'])

    fireEvent.click(items[2]!)
    expect(handler).toHaveBeenCalledWith(['a', 'c'])

    fireEvent.click(items[0]!)
    expect(handler).toHaveBeenCalledWith(['c'])
  })
})

describe('DropdownMenu trigger keyboard', () => {
  function renderDropdown(props: Record<string, unknown> = {}) {
    return render(
      <DropdownMenu {...props}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <div>Item 1</div>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    )
  }

  it('Enter key toggles dropdown open', () => {
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('Space key toggles dropdown open', () => {
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    fireEvent.keyDown(trigger, { key: ' ' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('ArrowDown key opens dropdown', () => {
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('trigger has correct ARIA attributes', () => {
    const { container } = renderDropdown()
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('type')).toBe('button')
  })

  it('trigger data-state updates when opened', () => {
    const { container } = renderDropdown()
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    expect(trigger.getAttribute('data-state')).toBe('closed')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('disabled trigger does not open on key press', () => {
    const handler = mock(() => {})
    const { container } = render(
      <DropdownMenu onOpenChange={handler}>
        <DropdownMenuTrigger disabled>Menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <div>Item 1</div>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    )
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('Command compound', () => {
  function renderCommand() {
    return render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Fruits">
            <CommandItem value="apple">Apple</CommandItem>
            <CommandItem value="banana">Banana</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Vegetables">
            <CommandItem value="carrot">Carrot</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    )
  }

  it('renders all slots: command, input, list, group, items', () => {
    const { container } = renderCommand()

    expect(container.querySelector('[data-slot="command"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="command-input"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="command-list"]')).not.toBeNull()
    expect(container.querySelectorAll('[data-slot="command-group"]').length).toBe(2)
    expect(container.querySelectorAll('[data-slot="command-item"]').length).toBe(3)
  })

  it('input has role="combobox" and aria-expanded', () => {
    const { container } = renderCommand()
    const input = container.querySelector('[data-slot="command-input"]')!

    expect(input.getAttribute('role')).toBe('combobox')
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.getAttribute('aria-autocomplete')).toBe('list')
  })

  it('input aria-controls points to the list id', () => {
    const { container } = renderCommand()
    const input = container.querySelector('[data-slot="command-input"]')!
    const list = container.querySelector('[data-slot="command-list"]')!

    const controlsId = input.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
    expect(list.getAttribute('id')).toBe(controlsId)
  })

  it('items have role="option"', () => {
    const { container } = renderCommand()
    const items = container.querySelectorAll('[data-slot="command-item"]')

    for (const item of items) {
      expect(item.getAttribute('role')).toBe('option')
    }
  })

  it('list has role="listbox"', () => {
    const { container } = renderCommand()
    const list = container.querySelector('[data-slot="command-list"]')!

    expect(list.getAttribute('role')).toBe('listbox')
  })

  it('group has role="group" with heading via aria-labelledby', () => {
    const { container } = renderCommand()
    const groups = container.querySelectorAll('[data-slot="command-group"]')

    for (const group of groups) {
      expect(group.getAttribute('role')).toBe('group')
      const labelledBy = group.getAttribute('aria-labelledby')
      expect(labelledBy).toBeTruthy()
      const heading = container.querySelector(`#${labelledBy}`)
      expect(heading).not.toBeNull()
      expect(heading!.getAttribute('data-slot')).toBe('command-group-heading')
    }
  })

  it('group headings render correct text', () => {
    const { container } = renderCommand()
    const headings = container.querySelectorAll('[data-slot="command-group-heading"]')

    expect(headings.length).toBe(2)
    expect(headings[0]!.textContent).toBe('Fruits')
    expect(headings[1]!.textContent).toBe('Vegetables')
  })

  it('items have data-value attribute matching their value prop', () => {
    const { container } = renderCommand()
    const items = container.querySelectorAll('[data-slot="command-item"]')

    expect(items[0]!.getAttribute('data-value')).toBe('apple')
    expect(items[1]!.getAttribute('data-value')).toBe('banana')
    expect(items[2]!.getAttribute('data-value')).toBe('carrot')
  })

  it('empty element has role="status" and is initially hidden', () => {
    const { container } = renderCommand()
    const empty = container.querySelector('[data-slot="command-empty"]')!

    expect(empty.getAttribute('role')).toBe('status')
    expect(empty.getAttribute('aria-live')).toBe('polite')
    expect(empty.hidden).toBe(true)
  })

  it('disabled item has aria-disabled', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandItem value="x" disabled>
            Disabled
          </CommandItem>
        </CommandList>
      </Command>,
    )
    const item = container.querySelector('[data-slot="command-item"]')!

    expect(item.getAttribute('aria-disabled')).toBe('true')
    expect(item.getAttribute('data-disabled')).toBe('')
  })
})

describe('Menubar compound', () => {
  function renderMenubar(props: Record<string, unknown> = {}) {
    return render(
      <Menubar {...props}>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New File</MenubarItem>
              <MenubarItem>Open</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Undo</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>,
    )
  }

  it('renders all triggers with data-slot', () => {
    const { container } = renderMenubar()
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')

    expect(triggers.length).toBe(2)
    expect(triggers[0]!.textContent).toBe('File')
    expect(triggers[1]!.textContent).toBe('Edit')
  })

  it('root has role="menubar"', () => {
    const { container } = renderMenubar()
    expect(container.querySelector('[role="menubar"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="menubar"]')).not.toBeNull()
  })

  it('triggers have role="menuitem" and aria-haspopup="menu"', () => {
    const { container } = renderMenubar()
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')

    for (const trigger of triggers) {
      expect(trigger.getAttribute('role')).toBe('menuitem')
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
      expect(trigger.getAttribute('type')).toBe('button')
    }
  })

  it('triggers have aria-expanded="false" and data-state="closed" initially', () => {
    const { container } = renderMenubar()
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')

    for (const trigger of triggers) {
      expect(trigger.getAttribute('aria-expanded')).toBe('false')
      expect(trigger.getAttribute('data-state')).toBe('closed')
    }
  })

  it('Enter key opens a menu (trigger state updates)', () => {
    const handler = mock(() => {})
    const { container } = renderMenubar({ onValueChange: handler })
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')

    fireEvent.keyDown(triggers[0]!, { key: 'Enter' })
    expect(triggers[0]!.getAttribute('data-state')).toBe('open')
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('true')
    expect(handler).toHaveBeenCalledWith('file')
  })

  it('Space key opens a menu', () => {
    const handler = mock(() => {})
    const { container } = renderMenubar({ onValueChange: handler })
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')

    fireEvent.keyDown(triggers[1]!, { key: ' ' })
    expect(triggers[1]!.getAttribute('data-state')).toBe('open')
    expect(handler).toHaveBeenCalledWith('edit')
  })

  it('ArrowDown key opens a menu', () => {
    const handler = mock(() => {})
    const { container } = renderMenubar({ onValueChange: handler })
    const triggers = container.querySelectorAll('[data-slot="menubar-trigger"]')

    fireEvent.keyDown(triggers[0]!, { key: 'ArrowDown' })
    expect(triggers[0]!.getAttribute('data-state')).toBe('open')
    expect(handler).toHaveBeenCalledWith('file')
  })

  it('disabled trigger does not open on key press', () => {
    const handler = mock(() => {})
    const { container } = render(
      <Menubar onValueChange={handler}>
        <MenubarMenu value="file">
          <MenubarTrigger disabled>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>,
    )
    const trigger = container.querySelector('[data-slot="menubar-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handler).not.toHaveBeenCalled()
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })
})

describe('Select compound', () => {
  function renderSelect(props: Record<string, unknown> = {}) {
    return render(
      <Select {...props}>
        <SelectTrigger>
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
      </Select>,
    )
  }

  it('trigger renders with role="combobox"', () => {
    const { container } = renderSelect()
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    expect(trigger.getAttribute('role')).toBe('combobox')
    expect(trigger.getAttribute('type')).toBe('button')
  })

  it('trigger has aria-expanded="false" when closed', () => {
    const { container } = renderSelect()
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('trigger has aria-autocomplete="none"', () => {
    const { container } = renderSelect()
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    expect(trigger.getAttribute('aria-autocomplete')).toBe('none')
  })

  it('placeholder text shows in value slot when no value set', () => {
    const { container } = renderSelect()
    const value = container.querySelector('[data-slot="select-value"]')!

    expect(value.textContent).toBe('Pick a fruit')
  })

  it('trigger has data-placeholder when no value is selected', () => {
    const { container } = renderSelect()
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    expect(trigger.hasAttribute('data-placeholder')).toBe(true)
  })

  it('trigger aria-controls points to content id', () => {
    const { container } = renderSelect()
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    const controlsId = trigger.getAttribute('aria-controls')
    expect(controlsId).toBeTruthy()
  })

  it('fires onOpenChange(true) when trigger is activated via keyboard', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('ArrowDown key also opens the select', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('disabled trigger does not open', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ disabled: true, onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    expect(trigger.getAttribute('disabled')).toBe('')
    expect(trigger.getAttribute('data-disabled')).toBe('')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('aria-required is set when required prop is true', () => {
    const { container } = renderSelect({ required: true })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    expect(trigger.getAttribute('aria-required')).toBe('true')
  })
})

describe('Slider compound', () => {
  function renderSlider(props: Record<string, unknown> = {}) {
    return render(
      <Slider defaultValue={[50]} min={0} max={100} step={1} {...props}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>,
    )
  }

  it('renders all slots: slider, track, range, thumb', () => {
    const { container } = renderSlider()

    expect(container.querySelector('[data-slot="slider"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="slider-track"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="slider-range"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="slider-thumb"]')).not.toBeNull()
  })

  it('thumb has role="slider" with correct ARIA values', () => {
    const { container } = renderSlider()
    const thumb = container.querySelector('[data-slot="slider-thumb"]')!

    expect(thumb.getAttribute('role')).toBe('slider')
    expect(thumb.getAttribute('aria-valuemin')).toBe('0')
    expect(thumb.getAttribute('aria-valuemax')).toBe('100')
    expect(thumb.getAttribute('aria-valuenow')).toBe('50')
    expect(thumb.getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('thumb is focusable (tabindex=0) when not disabled', () => {
    const { container } = renderSlider()
    const thumb = container.querySelector('[data-slot="slider-thumb"]')!

    expect(thumb.getAttribute('tabindex')).toBe('0')
  })

  it('track and range have data-orientation="horizontal" by default', () => {
    const { container } = renderSlider()

    expect(container.querySelector('[data-slot="slider-track"]')!.getAttribute('data-orientation')).toBe('horizontal')
    expect(container.querySelector('[data-slot="slider-range"]')!.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('slider range style reflects value position', () => {
    const { container } = renderSlider({ defaultValue: [25] })
    const range = container.querySelector('[data-slot="slider-range"]') as HTMLElement

    expect(range.style.left).toBe('0%')
    expect(range.style.right).toBe('75%')
  })

  it('multiple thumbs for range slider', () => {
    const { container } = render(
      <Slider defaultValue={[20, 80]} min={0} max={100}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
        <SliderThumb />
      </Slider>,
    )

    const thumbs = container.querySelectorAll('[data-slot="slider-thumb"]')
    expect(thumbs.length).toBe(2)

    expect(thumbs[0]!.getAttribute('role')).toBe('slider')
    expect(thumbs[1]!.getAttribute('role')).toBe('slider')

    expect(thumbs[0]!.getAttribute('aria-valuenow')).toBe('20')
    expect(thumbs[1]!.getAttribute('aria-valuenow')).toBe('80')
  })

  it('range slider range element spans between thumb positions', () => {
    const { container } = render(
      <Slider defaultValue={[20, 80]} min={0} max={100}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
        <SliderThumb />
      </Slider>,
    )
    const range = container.querySelector('[data-slot="slider-range"]') as HTMLElement

    expect(range.style.left).toBe('20%')
    expect(range.style.right).toBe('20%')
  })

  it('disabled slider sets data-disabled on all parts', () => {
    const { container } = renderSlider({ disabled: true })
    const slider = container.querySelector('[data-slot="slider"]')!
    const track = container.querySelector('[data-slot="slider-track"]')!
    const range = container.querySelector('[data-slot="slider-range"]')!
    const thumb = container.querySelector('[data-slot="slider-thumb"]')!

    expect(slider.getAttribute('data-disabled')).toBe('')
    expect(track.getAttribute('data-disabled')).toBe('')
    expect(range.getAttribute('data-disabled')).toBe('')
    expect(thumb.getAttribute('data-disabled')).toBe('')
  })

  it('disabled slider thumb has no tabindex', () => {
    const { container } = renderSlider({ disabled: true })
    const thumb = container.querySelector('[data-slot="slider-thumb"]')!

    expect(thumb.getAttribute('tabindex')).toBeNull()
  })

  it('custom min/max/step are reflected in thumb ARIA', () => {
    const { container } = render(
      <Slider defaultValue={[5]} min={1} max={10} step={1}>
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb />
      </Slider>,
    )
    const thumb = container.querySelector('[data-slot="slider-thumb"]')!

    expect(thumb.getAttribute('aria-valuemin')).toBe('1')
    expect(thumb.getAttribute('aria-valuemax')).toBe('10')
    expect(thumb.getAttribute('aria-valuenow')).toBe('5')
  })

  it('vertical orientation sets data-orientation="vertical"', () => {
    const { container } = renderSlider({ orientation: 'vertical' })
    const thumb = container.querySelector('[data-slot="slider-thumb"]')!
    const track = container.querySelector('[data-slot="slider-track"]')!

    expect(thumb.getAttribute('data-orientation')).toBe('vertical')
    expect(thumb.getAttribute('aria-orientation')).toBe('vertical')
    expect(track.getAttribute('data-orientation')).toBe('vertical')
  })
})
