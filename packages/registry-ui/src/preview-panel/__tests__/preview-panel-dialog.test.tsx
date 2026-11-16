import { afterEach, describe, expect, test } from 'bun:test'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { PreviewPanelDialog } from '../preview-panel-dialog'

afterEach(cleanup)

const frame = () => act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))

describe('registry-ui PreviewPanelDialog', () => {
  test('two zoom steps in one frame both reach the shared view', async () => {
    render(<PreviewPanelDialog>body</PreviewPanelDialog>)
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' })

    fireEvent.click(zoomIn)
    fireEvent.click(zoomIn)
    await frame()

    expect(screen.getByText('150%')).toBeTruthy()
  })

  test('the fullscreen panel opens unlocked on the shared view, and sends its moves back', async () => {
    render(
      <PreviewPanelDialog className="w-96" fullscreenText="Expand" panelClassName="bg-muted">
        body
      </PreviewPanelDialog>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await frame()
    fireEvent.click(screen.getByRole('button', { name: 'Expand' }))
    const dialog = screen.getByRole('dialog')

    expect(within(dialog).getByText('125%')).toBeTruthy()
    expect(within(dialog).getByRole('button', { name: 'Lock the view' })).toBeTruthy()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Zoom in' }))
    await frame()

    expect(screen.getAllByText('150%')).toHaveLength(2)

    const panels = Array.from(document.querySelectorAll('[data-slot="preview-panel"]'))

    expect(panels.map((panel) => panel.classList.contains('bg-muted'))).toEqual([true, true])
    expect(dialog.querySelector('[data-slot="preview-panel"]')?.classList.contains('min-h-[70vh]')).toBe(true)
    expect(panels[0]?.closest('.w-96')).not.toBeNull()
  })

  test('syncPanels={false} keeps the two views apart', async () => {
    render(<PreviewPanelDialog syncPanels={false}>body</PreviewPanelDialog>)

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    await frame()
    fireEvent.click(screen.getByRole('button', { name: 'Open fullscreen' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Zoom out' }))
    await frame()

    expect(within(dialog).getByText('75%')).toBeTruthy()
    expect(screen.getByText('125%')).toBeTruthy()
  })

  test('unsafeHtml renders in both panels', () => {
    render(<PreviewPanelDialog unsafeHtml="<i>raw markup</i>" />)

    fireEvent.click(screen.getByRole('button', { name: 'Open fullscreen' }))

    expect(screen.getAllByText('raw markup').map((node) => node.tagName)).toEqual(['I', 'I'])
  })
})
