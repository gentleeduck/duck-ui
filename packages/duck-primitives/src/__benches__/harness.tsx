import * as React from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import type { IBench } from './bench.types'

export interface IBenchApi {
  cases: {
    name: string
    module: string
    overlay: boolean
    update: string
    libs: IBench.Library[]
    closedOnly: IBench.Library[]
  }[]
  many(name: string, lib: IBench.Library, copies: number): Promise<void>
  toggle(name: string, lib: IBench.Library, reps: number): Promise<void>
  sweep(): number
}

declare global {
  interface Window {
    __bench: IBenchApi
    gc(): void
  }
}

// Each library marks open content its own way, so every overlay view marks its content with this. Base UI's Select
// keeps a closed popup mounted and hidden, so only a visible one counts.
const CONTENT = '[data-bench-content]'
const openCount = () => Array.from(document.querySelectorAll(CONTENT)).filter((el) => el.checkVisibility()).length

const nextTask = () =>
  new Promise<void>((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => resolve()
    channel.port2.postMessage(null)
  })

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

async function frames(count: number) {
  for (let frame = 0; frame < count; frame++) {
    await nextFrame()
    await nextTask()
  }
}

// Base UI and Ark unmount a closed popup a frame later, once they know it has no exit animation.
async function until(done: () => boolean, failure: string) {
  for (let frame = 0; frame < 120; frame++) {
    if (done()) return frame
    await frames(1)
  }
  throw new Error(failure)
}

// The runner reads a phase's time from a trace: the main thread's work between its marks, less the harness's own
// for each frame the end mark names. A library that mounts in an effect, positions in a later task or unmounts a
// frame later is timed to the frame that paints the result, and two after it.
async function phase(name: string, work: () => void, done: () => boolean, failure: string) {
  window.gc()
  performance.mark(`${name}:start`)
  work()
  const waited = await until(done, failure)
  await frames(2)
  performance.mark(`${name}:end:${waited + 2}`)
}

// Frames with nothing of the library's to do, before anything is timed, so what they hold is the harness's own work.
async function idle() {
  performance.mark('idle:start')
  await frames(4)
  performance.mark('idle:end:4')
}

const always = () => true

// An input's typed value is a property, which innerHTML leaves out.
const snapshot = (host: HTMLElement) =>
  host.innerHTML + Array.from(host.querySelectorAll('input'), (input) => input.value).join('|')

// Ark UI and Base UI finish a mount or an update in effects and tasks after the commit, so every library settles
// before the next step is timed, rather than that step paying for what the last one left.
async function settle(host: HTMLElement) {
  let last = snapshot(host)
  for (let frame = 0, still = 0; frame < 60 && still < 2; frame++) {
    await frames(1)
    const next = snapshot(host)
    still = next === last ? still + 1 : 0
    last = next
  }
}

function mountHost() {
  const host = document.createElement('div')
  document.body.append(host)
  return { host, root: createRoot(host) }
}

export function install(cases: IBench.IModuleCase[]) {
  const resting = new Set(document.body.children)
  const find = (name: string) => {
    const found = cases.find((c) => c.name === name)?.runtime
    if (!found) throw new Error(`no runtime case ${name}`)
    return found
  }
  const viewOf = (name: string, lib: IBench.Library) => {
    const view = find(name).view[lib]
    if (!view) throw new Error(`${name} has no ${lib} view`)
    return view
  }

  window.__bench = {
    cases: cases.flatMap(({ name, module, runtime }) =>
      runtime
        ? [
            {
              name,
              module,
              overlay: runtime.overlay,
              update: runtime.input?.name ?? 'update',
              libs: Object.keys(runtime.view) as IBench.Library[],
              closedOnly: runtime.closedOnly ?? [],
            },
          ]
        : [],
    ),

    async many(name, lib, copies) {
      const runtime = find(name)
      const view = viewOf(name, lib)
      const keys = Array.from({ length: copies }, (_, i) => `copy-${i}`)
      const list = (on: boolean) => keys.map((key) => <React.Fragment key={key}>{view(on)}</React.Fragment>)
      const { host, root } = mountHost()
      await idle()
      await phase(
        'mount',
        () => flushSync(() => root.render(list(false))),
        () => host.childElementCount >= copies,
        `${name} (${lib}) mounted ${host.childElementCount} of ${copies}`,
      )
      await settle(host)
      if (!runtime.overlay) {
        const before = snapshot(host)
        const input = runtime.input
        await phase(
          'update',
          input ? () => flushSync(() => input.run(host)) : () => flushSync(() => root.render(list(true))),
          input ? () => input.done(host) : always,
          `${name} (${lib}) never finished the ${input?.name ?? 'update'}`,
        )
        if (snapshot(host) === before) throw new Error(`${name} (${lib}) update changed nothing`)
        await settle(host)
      }
      await phase('unmount', () => flushSync(() => root.unmount()), always, '')
      host.remove()
      if (!runtime.overlay || runtime.closedOnly?.some((closed) => closed === lib)) return

      const opened = mountHost()
      flushSync(() => opened.root.render(list(true)))
      await until(() => openCount() === copies, `${name} (${lib}) did not open all ${copies}`)
      await settle(opened.host)
      await phase(
        'unmount open',
        () => flushSync(() => opened.root.unmount()),
        () => openCount() === 0,
        `${name} (${lib}) left content behind`,
      )
      opened.host.remove()
    },

    async toggle(name, lib, reps) {
      const view = viewOf(name, lib)
      const { host, root } = mountHost()
      flushSync(() => root.render(view(false)))
      await until(() => openCount() === 0, `${name} (${lib}) started open`)
      await settle(host)
      await idle()
      for (let i = 0; i < reps; i++) {
        await phase(
          'open',
          () => flushSync(() => root.render(view(true))),
          () => openCount() > 0,
          `${name} (${lib}) did not open`,
        )
        await phase(
          'close',
          () => flushSync(() => root.render(view(false))),
          () => openCount() === 0,
          `${name} (${lib}) did not close`,
        )
      }
      flushSync(() => root.unmount())
      host.remove()
    },

    sweep() {
      const left = Array.from(document.body.children).filter((child) => !resting.has(child))
      for (const child of left) child.remove()
      return left.reduce((count, child) => count + 1 + child.querySelectorAll('*').length, 0)
    },
  }
}
