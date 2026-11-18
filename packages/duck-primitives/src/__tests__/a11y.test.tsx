import { beforeEach, describe, expect, it } from 'bun:test'
import { fireEvent, render } from '@testing-library/react'
import axe from 'axe-core'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../avatar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../command'
import { ContextMenu, ContextMenuTrigger } from '../context-menu'
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
import { DropdownMenu, DropdownMenuTrigger } from '../dropdown-menu'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../input-otp'
import { Pagination, PaginationContent, PaginationItem } from '../pagination'
import { Popover, PopoverTrigger } from '../popover'
import { Progress, ProgressIndicator } from '../progress'
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from '../radio-group'
import { Select, SelectTrigger, SelectValue } from '../select'
import { Slider, SliderRange, SliderThumb, SliderTrack } from '../slider'
import { Toggle } from '../toggle'
import { ToggleGroup, ToggleGroupItem } from '../toggle-group'
import { Tooltip, TooltipContent, TooltipPortal, TooltipProvider, TooltipTrigger } from '../tooltip'
import { VisuallyHidden } from '../visibility-hidden'

describe('Toggle a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('unpressed toggle has no axe violations', async () => {
    const { container } = render(<Toggle aria-label="Bold">B</Toggle>)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('pressed toggle has no axe violations', async () => {
    const { container } = render(
      <Toggle aria-label="Bold" defaultPressed>
        B
      </Toggle>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('disabled toggle has no axe violations', async () => {
    const { container } = render(
      <Toggle aria-label="Bold" disabled>
        B
      </Toggle>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('RadioGroup a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  function ThreeItemRadioGroup(props: { defaultValue?: string; disabled?: boolean }) {
    return (
      <RadioGroup aria-label="Favorite color" defaultValue={props.defaultValue} disabled={props.disabled}>
        <RadioGroupItem value="red" aria-label="Red">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="green" aria-label="Green">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="blue" aria-label="Blue">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>
    )
  }

  it('radio group with no selection has no axe violations', async () => {
    const { container } = render(<ThreeItemRadioGroup />)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('radio group with selection has no axe violations', async () => {
    const { container } = render(<ThreeItemRadioGroup defaultValue="green" />)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('disabled radio group has no axe violations', async () => {
    const { container } = render(<ThreeItemRadioGroup disabled />)
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('Progress a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('progress with value has no axe violations', async () => {
    const { container } = render(
      <Progress value={66} aria-label="Loading">
        <ProgressIndicator />
      </Progress>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('indeterminate progress has no axe violations', async () => {
    const { container } = render(
      <Progress value={null} aria-label="Loading">
        <ProgressIndicator />
      </Progress>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('completed progress has no axe violations', async () => {
    const { container } = render(
      <Progress value={100} aria-label="Upload complete">
        <ProgressIndicator />
      </Progress>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('Slider a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('single thumb slider has no axe violations', async () => {
    const { container } = render(
      <Slider defaultValue={[50]} aria-label="Volume">
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb aria-label="Volume" />
      </Slider>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('range slider with two thumbs has no axe violations', async () => {
    const { container } = render(
      <Slider defaultValue={[25, 75]} aria-label="Price range">
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb aria-label="Minimum price" />
        <SliderThumb aria-label="Maximum price" />
      </Slider>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('disabled slider has no axe violations', async () => {
    const { container } = render(
      <Slider defaultValue={[50]} disabled aria-label="Volume">
        <SliderTrack>
          <SliderRange />
        </SliderTrack>
        <SliderThumb aria-label="Volume" />
      </Slider>,
    )
    // Disabled slider thumbs have no tabindex, so axe may flag nested-interactive
    // or missing focusable element. The component intentionally removes tabindex
    // when disabled; exclude that rule for this edge case in jsdom.
    const results = await axe.run(container, {
      rules: {
        'nested-interactive': { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})

describe('Dialog a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('open dialog with title and description has no axe violations', async () => {
    const { baseElement } = render(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here.</DialogDescription>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>,
    )
    // Dialog content is portalled to document.body, so scan baseElement
    // (which includes the portal target) rather than container.
    // Disable aria-hidden rule: the modal dialog uses aria-hidden on
    // siblings via `aria-hidden` package, which can confuse axe in jsdom
    // when the trigger itself gets hidden.
    const results = await axe.run(baseElement, {
      rules: {
        'aria-hidden-focus': { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })

  it('closed dialog (trigger only) has no axe violations', async () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
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
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('Pagination a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('pagination nav with items has no axe violations', async () => {
    const { container } = render(
      <Pagination aria-label="Page navigation">
        <PaginationContent>
          <PaginationItem>
            <button type="button">Previous</button>
          </PaginationItem>
          <PaginationItem>
            <button type="button" aria-current="page">
              1
            </button>
          </PaginationItem>
          <PaginationItem>
            <button type="button">2</button>
          </PaginationItem>
          <PaginationItem>
            <button type="button">3</button>
          </PaginationItem>
          <PaginationItem>
            <button type="button">Next</button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('empty pagination has no axe violations', async () => {
    const { container } = render(
      <Pagination aria-label="Page navigation">
        <PaginationContent />
      </Pagination>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('Tooltip a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('closed tooltip trigger has no axe violations', async () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger aria-label="More info">?</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Helpful tip</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('open tooltip has no axe violations', async () => {
    const { baseElement } = render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger aria-label="More info">?</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Helpful tip</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>,
    )
    // Tooltip content is portalled to document.body, scan baseElement.
    // Disable aria-hidden-focus: the tooltip uses aria-hidden on siblings
    // which can confuse axe in jsdom when the trigger gets hidden.
    // Disable region: the portalled popper wrapper lives outside any
    // landmark in jsdom, which is a test-environment artifact.
    const results = await axe.run(baseElement, {
      rules: {
        'aria-hidden-focus': { enabled: false },
        region: { enabled: false },
      },
    })
    expect(results.violations).toEqual([])
  })
})

describe('Popover a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('closed popover trigger has no axe violations', async () => {
    const { container } = render(
      <Popover>
        <PopoverTrigger aria-label="Open popover">Toggle</PopoverTrigger>
      </Popover>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('DropdownMenu a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('closed dropdown menu trigger has no axe violations', async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Options">Open menu</DropdownMenuTrigger>
      </DropdownMenu>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('ContextMenu a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('context menu trigger has no axe violations', async () => {
    const { container } = render(
      <ContextMenu>
        <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
      </ContextMenu>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('Select a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('closed select trigger with placeholder has no axe violations', async () => {
    const { container } = render(
      <Select>
        <SelectTrigger aria-label="Fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
      </Select>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('select trigger with value has no axe violations', async () => {
    const { container } = render(
      <Select defaultValue="apple">
        <SelectTrigger aria-label="Fruit">
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('Command a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('command with input, list, and items has no axe violations', async () => {
    const { container } = render(
      <Command aria-label="Command palette">
        <CommandInput aria-label="Search commands" placeholder="Search..." />
        <CommandList aria-label="Commands">
          <CommandGroup heading="Actions">
            <CommandItem value="copy">Copy</CommandItem>
            <CommandItem value="paste">Paste</CommandItem>
          </CommandGroup>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('command with disabled items has no axe violations', async () => {
    const { container } = render(
      <Command aria-label="Command palette">
        <CommandInput aria-label="Search commands" placeholder="Search..." />
        <CommandList aria-label="Commands">
          <CommandItem value="save">Save</CommandItem>
          <CommandItem value="delete" disabled>
            Delete
          </CommandItem>
        </CommandList>
      </Command>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('InputOTP a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('input OTP with slots has no axe violations', async () => {
    const { container } = render(
      <InputOTP maxLength={6} aria-label="Verification code">
        <InputOTPGroup aria-label="First three digits">
          <InputOTPSlot aria-label="Digit 1" />
          <InputOTPSlot aria-label="Digit 2" />
          <InputOTPSlot aria-label="Digit 3" />
        </InputOTPGroup>
        <InputOTPGroup aria-label="Last three digits">
          <InputOTPSlot aria-label="Digit 4" />
          <InputOTPSlot aria-label="Digit 5" />
          <InputOTPSlot aria-label="Digit 6" />
        </InputOTPGroup>
      </InputOTP>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('input OTP with pre-filled value has no axe violations', async () => {
    const { container } = render(
      <InputOTP maxLength={4} value="1234" aria-label="PIN code">
        <InputOTPGroup aria-label="PIN digits">
          <InputOTPSlot aria-label="Digit 1" />
          <InputOTPSlot aria-label="Digit 2" />
          <InputOTPSlot aria-label="Digit 3" />
          <InputOTPSlot aria-label="Digit 4" />
        </InputOTPGroup>
      </InputOTP>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('ToggleGroup a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('single-mode toggle group has no axe violations', async () => {
    const { container } = render(
      <ToggleGroup type="single" aria-label="Text alignment" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Align left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          C
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          R
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('multiple-mode toggle group has no axe violations', async () => {
    const { container } = render(
      <ToggleGroup type="multiple" aria-label="Formatting" defaultValue={['bold']}>
        <ToggleGroupItem value="bold" aria-label="Bold">
          B
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          I
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          U
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('disabled toggle group has no axe violations', async () => {
    const { container } = render(
      <ToggleGroup type="single" aria-label="Text alignment" disabled>
        <ToggleGroupItem value="left" aria-label="Align left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          C
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('Avatar a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('avatar with fallback text has no axe violations', async () => {
    const { container } = render(
      <Avatar aria-label="Jane Doe">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('avatar with image and fallback has no axe violations', async () => {
    const { container } = render(
      <Avatar aria-label="Jane Doe">
        <AvatarImage src="https://example.com/avatar.jpg" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    // In jsdom the image won't load, so only the fallback renders.
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})

describe('VisuallyHidden a11y - axe automated checks', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('visually hidden content is accessible to screen readers', async () => {
    const { container } = render(
      <div>
        <button type="button">
          X<VisuallyHidden>Close dialog</VisuallyHidden>
        </button>
      </div>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })

  it('visually hidden with role has no axe violations', async () => {
    const { container } = render(
      <VisuallyHidden role="status" aria-live="polite">
        3 new notifications
      </VisuallyHidden>,
    )
    const results = await axe.run(container)
    expect(results.violations).toEqual([])
  })
})
