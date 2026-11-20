import { DirectionProvider } from '@gentleduck/primitives/direction'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import * as React from 'react'
import { toast } from 'sonner'
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { formatTime, SonnerUpload, Toaster } from '..'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (media: string) => ({
      addEventListener() {},
      addListener() {},
      matches: false,
      media,
      removeEventListener() {},
      removeListener() {},
    }),
  })
})
afterAll(() => {
  Reflect.deleteProperty(window, 'matchMedia')
})
afterEach(async () => {
  await act(async () => {
    toast.dismiss()
  })
  cleanup()
})

async function list(element: React.ReactElement, message = 'Saved') {
  render(element)
  await act(async () => {
    toast(message)
  })
  const item = await screen.findByText(message)
  const ol = item.closest('[data-sonner-toaster]')
  if (!(ol instanceof HTMLElement)) throw new Error('no toaster list')
  return ol
}

describe('registry-ui Toaster', () => {
  test('stacks bottom right in the popover colours, light where nothing sets a theme', async () => {
    const ol = await list(<Toaster className="z-50" />)

    expect(ol.dataset.yPosition).toBe('bottom')
    expect(ol.dataset.xPosition).toBe('right')
    expect(ol.dataset.sonnerTheme).toBe('light')
    expect(ol.getAttribute('dir')).toBe('ltr')
    expect(ol.className).toBe('toaster group [&_li>div]:w-full z-50')
    expect(ol.style.getPropertyValue('--normal-bg')).toBe('var(--popover)')
    expect(ol.style.getPropertyValue('--normal-border')).toBe('var(--border)')
    expect(ol.style.getPropertyValue('--normal-text')).toBe('var(--popover-foreground)')
  })

  test('a style of its own keeps the popover colours beside it', async () => {
    const ol = await list(<Toaster style={{ zIndex: 20 }} />)

    expect(ol.style.zIndex).toBe('20')
    expect(ol.style.getPropertyValue('--normal-bg')).toBe('var(--popover)')
  })

  test('takes its theme from next-themes, and a theme prop wins', async () => {
    const dark = await list(
      <ThemeProvider defaultTheme="dark" enableSystem={false} storageKey="sonner-test-theme">
        <Toaster />
      </ThemeProvider>,
    )

    expect(dark.dataset.sonnerTheme).toBe('dark')

    cleanup()
    const light = await list(
      <ThemeProvider defaultTheme="dark" enableSystem={false} storageKey="sonner-test-theme">
        <Toaster theme="light" />
      </ThemeProvider>,
      'Again',
    )

    expect(light.dataset.sonnerTheme).toBe('light')
  })

  test.each([
    [undefined, 'bottom', 'left'],
    ['top-left', 'top', 'right'],
    ['top-right', 'top', 'left'],
    ['bottom-center', 'bottom', 'center'],
  ] as const)('right to left, position %p mirrors to %s %s', async (position, y, x) => {
    const ol = await list(
      <DirectionProvider dir="rtl">
        <Toaster position={position} />
      </DirectionProvider>,
    )

    expect(ol.getAttribute('dir')).toBe('rtl')
    expect([ol.dataset.yPosition, ol.dataset.xPosition]).toEqual([y, x])
  })

  test('an explicit dir wins over the provider', async () => {
    const ol = await list(
      <DirectionProvider dir="rtl">
        <Toaster dir="ltr" />
      </DirectionProvider>,
    )

    expect(ol.getAttribute('dir')).toBe('ltr')
    expect(ol.dataset.xPosition).toBe('right')
  })

  test('forwards its ref to the notifications region', () => {
    const ref = React.createRef<HTMLElement>()

    render(<Toaster ref={ref} />)

    expect(ref.current?.tagName).toBe('SECTION')
    expect(ref.current?.getAttribute('aria-live')).toBe('polite')
  })
})

describe('registry-ui SonnerUpload', () => {
  test('while uploading, counts the files, shows the time left and the percent, and offers Cancel', () => {
    const onCancel = vi.fn()
    const dismiss = vi.spyOn(toast, 'dismiss')

    render(<SonnerUpload attachments={2} onCancel={onCancel} progress={40} remainingTime={90} />)

    expect(screen.getByText('Uploading 2 files...')).toBeTruthy()
    expect(screen.getByText('1m remaining -')).toBeTruthy()
    expect(screen.getByText('40%')).toBeTruthy()
    expect(screen.getByRole('progressbar', { name: 'Upload progress' }).getAttribute('aria-valuenow')).toBe('40')
    expect(screen.getByText('Please do not close the browser until completed')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Complete' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onCancel.mock.calls[0]?.[0]).toHaveProperty('type', 'click')
    onCancel.mock.calls[0]?.[1]('upload')
    expect(dismiss).toHaveBeenCalledWith('upload')
    dismiss.mockRestore()
  })

  test('names one file in the singular, and no count when there is none', () => {
    const { rerender } = render(<SonnerUpload attachments={1} progress={0} />)

    expect(screen.getByText('Uploading 1 file...')).toBeTruthy()

    rerender(<SonnerUpload attachments={0} progress={0} />)

    expect(screen.getByText('Uploading...')).toBeTruthy()
  })

  test.each([[undefined], [0], [-5], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'shows no time left for a remainingTime of %p',
    (remainingTime) => {
      render(<SonnerUpload attachments={1} progress={10} remainingTime={remainingTime} />)

      expect(screen.queryByText(/remaining/)).toBeNull()
    },
  )

  test.each([[100], [120]])('at %p percent it reads complete and offers Complete', (progress) => {
    const onComplete = vi.fn()
    const dismiss = vi.spyOn(toast, 'dismiss')

    render(<SonnerUpload attachments={3} onComplete={onComplete} progress={progress} remainingTime={30} />)

    expect(screen.getAllByText('Upload complete')).toHaveLength(1)
    expect(screen.getByText('It is safe to close the browser now')).toBeTruthy()
    expect(screen.getByText('100%')).toBeTruthy()
    expect(screen.getByRole('progressbar').getAttribute('data-state')).toBe('complete')
    expect(screen.queryByText(/remaining/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))
    onComplete.mock.calls[0]?.[1]('upload')

    expect(dismiss).toHaveBeenCalledWith('upload')
    dismiss.mockRestore()
  })

  test('a button with no handler does nothing', () => {
    const { rerender } = render(<SonnerUpload attachments={1} progress={50} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    rerender(<SonnerUpload attachments={1} progress={100} />)
    fireEvent.click(screen.getByRole('button', { name: 'Complete' }))

    expect(screen.getByRole('button', { name: 'Complete' })).toBeTruthy()
  })

  test('adds no live region of its own, since the toaster already announces it', () => {
    render(<SonnerUpload attachments={1} progress={50} />)

    expect(screen.queryByRole('status')).toBeNull()
  })

  test('draws its secondary text in the muted foreground the theme defines', () => {
    render(<SonnerUpload attachments={1} progress={50} remainingTime={5} />)

    for (const text of ['5s remaining -', '50%', 'Please do not close the browser until completed']) {
      expect(screen.getByText(text).className).toContain('text-muted-foreground')
    }
  })
})

describe('registry-ui formatTime', () => {
  test.each([
    [0, '0s'],
    [59.9, '59s'],
    [60, '1m'],
    [3599, '59m'],
    [3600, '1h'],
    [86_399, '23h'],
    [2 * 86_400 + 5, '2d'],
  ])('%p seconds reads %p, its largest unit alone', (seconds, text) => {
    expect(formatTime(seconds)).toBe(text)
  })
})
