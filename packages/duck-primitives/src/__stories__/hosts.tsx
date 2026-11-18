import * as React from 'react'
import { createPortal } from 'react-dom'

const Container = React.createContext<HTMLElement | null>(null)

export const usePortalContainer = () => React.useContext(Container)

function Host({ children, container }: { children: React.ReactNode; container: HTMLElement | null }) {
  return container
    ? createPortal(<Container.Provider value={container}>{children}</Container.Provider>, container)
    : null
}

export function Frame({ children, className }: { children: React.ReactNode; className?: string }) {
  const [body, setBody] = React.useState<HTMLElement | null>(null)

  return (
    <>
      <iframe
        className={className}
        onLoad={(event) => setBody(event.currentTarget.contentDocument?.body ?? null)}
        srcDoc="<!doctype html><title>Frame</title><body></body>"
        title="Frame"
      />
      <Host container={body}>{children}</Host>
    </>
  )
}

export function ShadowRoot({ children }: { children: React.ReactNode }) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null)

  return (
    <div
      ref={(host) => {
        if (!host || host.shadowRoot) return
        const root = host.attachShadow({ mode: 'open' })
        // A copied `<link>` fetches its sheet again, and until it lands the story is unstyled, so a test can press
        // a button that moves once the styles arrive. The rules themselves apply at once.
        const style = document.createElement('style')
        style.textContent = [...document.styleSheets]
          .flatMap((sheet) => [...sheet.cssRules])
          .map((rule) => rule.cssText)
          .join('\n')
        root.appendChild(style)
        const div = document.createElement('div')
        root.appendChild(div)
        setContainer(div)
      }}>
      <Host container={container}>{children}</Host>
    </div>
  )
}
