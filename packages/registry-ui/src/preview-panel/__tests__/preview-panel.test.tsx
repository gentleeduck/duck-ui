import { describe, expect, test } from 'bun:test'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DirectionProvider } from '../../direction'
import { MotionPreviewPanel } from '../motion-preview-panel'
import { PreviewPanel } from '../preview-panel'
import type { IPreviewPanelProps } from '../preview-panel.types'
import { PreviewPanelDialog } from '../preview-panel-dialog'

describe('registry-ui preview-panel', () => {
  test('exposes the explicit `unsafeHtml` prop, not `html` (SEC-002)', () => {
    // The trusted-input-only raw-HTML sink is named `unsafeHtml` so callers
    // see the contract at every call site. A plain `html` prop must not exist.
    const props: IPreviewPanelProps = { unsafeHtml: '<p>trusted</p>' }
    expect(props.unsafeHtml).toBe('<p>trusted</p>')

    // @ts-expect-error - the legacy `html` prop has been removed.
    const legacy: IPreviewPanelProps = { html: '<p>x</p>' }
    expect(legacy).toBeDefined()
  })

  test('renders `unsafeHtml` verbatim into the panel content', () => {
    const html = renderToStaticMarkup(<PreviewPanel unsafeHtml="<span>preview body</span>" showControls={false} />)
    expect(html).toContain('<span>preview body</span>')
  })

  test('`unsafeHtml` takes priority over children even when empty', () => {
    const child = <span>child body</span>
    for (const html of [
      renderToStaticMarkup(
        <PreviewPanel unsafeHtml="" showControls={false}>
          {child}
        </PreviewPanel>,
      ),
      renderToStaticMarkup(
        <MotionPreviewPanel unsafeHtml="" showControls={false}>
          {child}
        </MotionPreviewPanel>,
      ),
      renderToStaticMarkup(
        <PreviewPanelDialog unsafeHtml="" showControls={false}>
          {child}
        </PreviewPanelDialog>,
      ),
    ]) {
      expect(html).toContain('data-slot="preview-panel"')
      expect(html).not.toContain('child body')
    }
  })

  test('children render when `unsafeHtml` is absent', () => {
    const html = renderToStaticMarkup(
      <PreviewPanelDialog showControls={false}>
        <span>child body</span>
      </PreviewPanelDialog>,
    )
    expect(html).toContain('<span>child body</span>')
  })

  test('follows DirectionProvider and forwards control labels', () => {
    for (const html of [
      renderToStaticMarkup(
        <DirectionProvider dir="rtl">
          <PreviewPanel resetText="إعادة الضبط" zoomInText="تكبير" zoomOutText="تصغير" />
        </DirectionProvider>,
      ),
      renderToStaticMarkup(
        <DirectionProvider dir="rtl">
          <MotionPreviewPanel resetText="إعادة الضبط" zoomInText="تكبير" zoomOutText="تصغير" />
        </DirectionProvider>,
      ),
      renderToStaticMarkup(
        <DirectionProvider dir="rtl">
          <PreviewPanelDialog resetText="إعادة الضبط" zoomInText="تكبير" zoomOutText="تصغير" />
        </DirectionProvider>,
      ),
    ]) {
      expect(html).toMatch(/data-slot="preview-panel"[^>]*dir="rtl"|dir="rtl"[^>]*data-slot="preview-panel"/)
      expect(html).toContain('aria-label="تكبير"')
      expect(html).toContain('aria-label="تصغير"')
      expect(html).toContain('aria-label="إعادة الضبط"')
    }
  })

  test('starts locked, so the wheel over it scrolls the page', () => {
    for (const html of [renderToStaticMarkup(<PreviewPanel />), renderToStaticMarkup(<MotionPreviewPanel />)]) {
      expect(html).toContain('aria-label="Unlock the view"')
      expect(html).toContain('aria-pressed="true"')
      expect(html).toContain('cursor:default;touch-action:auto')
    }
  })

  test('`defaultLocked={false}` starts unlocked for drag, wheel and pinch', () => {
    for (const html of [
      renderToStaticMarkup(<PreviewPanel defaultLocked={false} />),
      renderToStaticMarkup(<MotionPreviewPanel defaultLocked={false} />),
    ]) {
      expect(html).toContain('aria-label="Lock the view"')
      expect(html).toContain('aria-pressed="false"')
      expect(html).toContain('cursor:grab;touch-action:none')
    }
  })

  test('`actions` render in the toolbar before the zoom controls, and alone when they are hidden', () => {
    const actions = <button type="button">Copy</button>
    for (const html of [
      renderToStaticMarkup(<PreviewPanel actions={actions} />),
      renderToStaticMarkup(<MotionPreviewPanel actions={actions} />),
    ]) {
      expect(html).toMatch(/data-slot="preview-panel-toolbar"[\s\S]*Copy[\s\S]*data-slot="preview-panel-controls"/)
    }
    expect(renderToStaticMarkup(<PreviewPanel actions={actions} showControls={false} />)).toMatch(
      /data-slot="preview-panel-toolbar"[^>]*><button type="button">Copy<\/button><\/div>/,
    )
    expect(renderToStaticMarkup(<PreviewPanel showControls={false} />)).not.toContain('preview-panel-toolbar')
  })

  test('the dialog keeps its fullscreen button in the toolbar, off the content', () => {
    const html = renderToStaticMarkup(<PreviewPanelDialog showControls={false} />)
    expect(html).toMatch(/data-slot="preview-panel-toolbar"[\s\S]*aria-label="Open fullscreen"/)
    expect(renderToStaticMarkup(<PreviewPanelDialog />)).toContain('aria-label="Unlock the view"')
  })
})
