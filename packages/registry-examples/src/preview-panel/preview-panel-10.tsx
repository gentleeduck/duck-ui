import { PreviewPanelDialog } from '@gentleduck/registry-ui/preview-panel'

const DIAGRAM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 120" width="320" height="120" fill="none" stroke="currentColor" stroke-width="1.5">
  <rect x="8" y="40" width="80" height="40" rx="6"/>
  <rect x="120" y="40" width="80" height="40" rx="6"/>
  <rect x="232" y="40" width="80" height="40" rx="6"/>
  <path d="M88 60h32M200 60h32"/>
  <g fill="currentColor" stroke="none" font-size="12" text-anchor="middle">
    <text x="48" y="64">Request</text>
    <text x="160" y="64">Queue</text>
    <text x="272" y="64">Worker</text>
  </g>
</svg>`

export default function Demo() {
  return (
    <PreviewPanelDialog
      fullscreenText="Open the diagram"
      maxHeight="300px"
      panelClassName="bg-muted/40"
      syncPanels={false}
      unsafeHtml={DIAGRAM}
    />
  )
}
