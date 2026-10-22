import { afterEach, describe, expect, it } from 'bun:test'
import { getAssociatedForm } from '../associated-form'

const hosts: Element[] = []
afterEach(() => {
  for (const host of hosts.splice(0)) host.remove()
})

function inPage(html: string) {
  const host = document.body.appendChild(document.createElement('div'))
  host.innerHTML = html
  hosts.push(host)
  return document
}

function inFrame(html: string) {
  const iframe = document.body.appendChild(document.createElement('iframe'))
  hosts.push(iframe)
  const frame = iframe.contentDocument!
  frame.body.innerHTML = html
  return frame
}

describe('getAssociatedForm', () => {
  it('finds the form around the control when no form is named', () => {
    const page = inPage('<form id="outer"><button>Pick</button></form>')

    expect(getAssociatedForm(page.querySelector('button'), undefined)?.id).toBe('outer')
  })

  it('finds the form a name points to over the one around the control', () => {
    const page = inPage('<form id="outer"><button>Pick</button></form><form id="named"></form>')

    expect(getAssociatedForm(page.querySelector('button'), 'named')?.id).toBe('named')
  })

  it('finds no form when the name points to an element that is not one', () => {
    const page = inPage('<form><button>Pick</button></form><div id="named"></div>')

    expect(getAssociatedForm(page.querySelector('button'), 'named')).toBeNull()
  })

  it('finds no form without a control', () => {
    expect(getAssociatedForm(null, undefined)).toBeNull()
  })

  it("looks the name up in the control's own document, such as an iframe's", () => {
    inPage('<form id="named" data-window="top"></form>')
    const frame = inFrame('<form id="named" data-window="frame"></form><button>Pick</button>')

    expect(getAssociatedForm(frame.querySelector('button'), 'named')?.dataset.window).toBe('frame')
  })

  it('finds a form from another window, such as the one around a control in an iframe', () => {
    const frame = inFrame('<form id="outer"><button>Pick</button></form>')

    expect(getAssociatedForm(frame.querySelector('button'), undefined)?.id).toBe('outer')
  })
})
