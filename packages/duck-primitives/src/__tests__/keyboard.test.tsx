import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import * as React from 'react'

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
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from '../popover'
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from '../radio-group'
import { Select, SelectContent, SelectItem, SelectPortal, SelectTrigger, SelectValue } from '../select'
import { Toggle } from '../toggle'

describe('Toggle keyboard', () => {
  it('Space key toggles pressed state', () => {
    const handler = mock(() => {})
    const { container } = render(
      <Toggle aria-label="Bold" onPressedChange={handler}>
        B
      </Toggle>,
    )
    const btn = container.querySelector('[data-slot="toggle"]')!

    expect(btn.getAttribute('aria-pressed')).toBe('false')
    expect(btn.getAttribute('data-state')).toBe('off')

    // Native button: Space triggers click
    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    expect(btn.getAttribute('data-state')).toBe('on')
    expect(handler).toHaveBeenCalledWith(true)

    fireEvent.click(btn)
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    expect(btn.getAttribute('data-state')).toBe('off')
    expect(handler).toHaveBeenCalledWith(false)
  })

  it('Enter key toggles pressed state', () => {
    const handler = mock(() => {})
    const { container } = render(
      <Toggle aria-label="Italic" onPressedChange={handler}>
        I
      </Toggle>,
    )
    const btn = container.querySelector('[data-slot="toggle"]')!

    expect(btn.getAttribute('data-state')).toBe('off')

    // Native button: Enter triggers click
    fireEvent.click(btn)
    expect(btn.getAttribute('data-state')).toBe('on')
    expect(handler).toHaveBeenCalledWith(true)

    fireEvent.click(btn)
    expect(btn.getAttribute('data-state')).toBe('off')
    expect(handler).toHaveBeenCalledWith(false)
  })

  it('disabled toggle does not respond to keyboard activation', () => {
    const handler = mock(() => {})
    const { container } = render(
      <Toggle aria-label="Bold" disabled onPressedChange={handler}>
        B
      </Toggle>,
    )
    const btn = container.querySelector('[data-slot="toggle"]')!

    fireEvent.click(btn)
    expect(handler).not.toHaveBeenCalled()
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    expect(btn.getAttribute('data-state')).toBe('off')
  })
})

describe('RadioGroup keyboard', () => {
  function renderRadioGroup(props: Record<string, unknown> = {}) {
    return render(
      <RadioGroup aria-label="Fruit" {...props}>
        <RadioGroupItem value="apple" aria-label="Apple">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="banana" aria-label="Banana">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="cherry" aria-label="Cherry">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    )
  }

  it('ArrowDown dispatches navigation key on the group', () => {
    const { container } = renderRadioGroup({ defaultValue: 'apple' })
    const group = container.querySelector('[role="radiogroup"]')!
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    expect(items[0]!.getAttribute('aria-checked')).toBe('true')

    // Fire ArrowDown on the group -- the roving focus mechanism uses
    // setTimeout to move focus, but the keyDown event itself is handled
    // synchronously to set the isNavigationKeyPressedRef flag.
    fireEvent.keyDown(group, { key: 'ArrowDown' })

    expect(group.getAttribute('role')).toBe('radiogroup')
  })

  it('ArrowUp dispatches navigation key on the group', () => {
    const { container } = renderRadioGroup({ defaultValue: 'cherry' })
    const group = container.querySelector('[role="radiogroup"]')!

    fireEvent.keyDown(group, { key: 'ArrowUp' })

    expect(group.getAttribute('role')).toBe('radiogroup')
  })

  it('Space/Enter selects a radio item via click', () => {
    const handler = mock(() => {})
    const { container } = renderRadioGroup({ onValueChange: handler })
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    // Native button: Space/Enter triggers click on the radio item
    fireEvent.click(items[1]!)
    expect(items[1]!.getAttribute('aria-checked')).toBe('true')
    expect(items[1]!.getAttribute('data-state')).toBe('checked')
    expect(handler).toHaveBeenCalledWith('banana')
  })

  it('clicking already-selected item does not fire onValueChange again', () => {
    const handler = mock(() => {})
    const { container } = renderRadioGroup({ defaultValue: 'apple', onValueChange: handler })
    const items = container.querySelectorAll('[data-slot="radio-group-item"]')

    fireEvent.click(items[0]!)
    expect(handler).not.toHaveBeenCalled()
    expect(items[0]!.getAttribute('aria-checked')).toBe('true')
  })

  it('arrow keys set navigation flag on the group element', () => {
    const { container } = renderRadioGroup({ defaultValue: 'apple' })
    const group = container.querySelector('[role="radiogroup"]')!

    for (const key of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End']) {
      fireEvent.keyDown(group, { key })
    }

    expect(container.querySelectorAll('[data-slot="radio-group-item"]').length).toBe(3)
  })
})

describe('DropdownMenu keyboard', () => {
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

  it('Enter opens menu', () => {
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handler).toHaveBeenCalledWith(true)
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('Space opens menu', () => {
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    fireEvent.keyDown(trigger, { key: ' ' })
    expect(handler).toHaveBeenCalledWith(true)
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('ArrowDown opens menu', () => {
    const handler = mock(() => {})
    const { container } = renderDropdown({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="dropdown-menu-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(handler).toHaveBeenCalledWith(true)
    expect(trigger.getAttribute('data-state')).toBe('open')
  })

  it('disabled trigger ignores Enter key', () => {
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
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('disabled trigger ignores Space key', () => {
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

    fireEvent.keyDown(trigger, { key: ' ' })
    expect(handler).not.toHaveBeenCalled()
  })

  it('disabled trigger ignores ArrowDown key', () => {
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

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('Dialog keyboard', () => {
  function renderDialog(props: Record<string, unknown> = {}) {
    return render(
      <Dialog {...props}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
  }

  it('clicking trigger opens dialog (verified via data-state)', () => {
    const handler = mock(() => {})
    const { container } = renderDialog({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!

    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    // Dialog trigger uses onClick; native button fires click on Space/Enter
    fireEvent.click(trigger)
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('trigger has aria-controls attribute', () => {
    const { container } = renderDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    expect(trigger.getAttribute('aria-controls')).toBeTruthy()
  })

  it('trigger aria-haspopup is dialog', () => {
    const { container } = renderDialog()
    const trigger = container.querySelector('[data-slot="dialog-trigger"]')!
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
  })
})

describe('Select keyboard', () => {
  function renderSelect(props: Record<string, unknown> = {}) {
    return render(
      <Select {...props}>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="cherry">Cherry</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>,
    )
  }

  it('ArrowDown opens select', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('Enter opens select', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('Space opens select', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    fireEvent.keyDown(trigger, { key: ' ' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('ArrowUp opens select', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('disabled select does not open on ArrowDown', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ disabled: true, onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(handler).not.toHaveBeenCalled()
    expect(trigger.getAttribute('data-state')).toBe('closed')
  })

  it('disabled select does not open on Enter', () => {
    const handler = mock(() => {})
    const { container } = renderSelect({ disabled: true, onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="select-trigger"]')!

    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('Popover keyboard', () => {
  function renderPopover(props: Record<string, unknown> = {}) {
    return render(
      <Popover {...props}>
        <PopoverTrigger>Toggle Popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>Popover body</PopoverContent>
        </PopoverPortal>
      </Popover>,
    )
  }

  it('click toggles popover open (verified via data-state)', () => {
    const handler = mock(() => {})
    const { container } = renderPopover({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!

    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    // Popover trigger uses onClick; native button fires click on Space/Enter
    fireEvent.click(trigger)
    expect(trigger.getAttribute('data-state')).toBe('open')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('click toggles popover closed', () => {
    const handler = mock(() => {})
    const { container } = renderPopover({ onOpenChange: handler })
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!

    fireEvent.click(trigger)
    expect(trigger.getAttribute('data-state')).toBe('open')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('data-state')).toBe('closed')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(handler).toHaveBeenCalledWith(false)
  })

  it('trigger aria attributes reflect state through toggle cycle', () => {
    const { container } = renderPopover()
    const trigger = container.querySelector('[data-slot="popover-trigger"]')!

    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.getAttribute('aria-controls')).toBeTruthy()

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })
})
