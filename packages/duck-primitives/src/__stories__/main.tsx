import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { stories } from './stories'

const id = new URLSearchParams(window.location.search).get('id') ?? ''
const Story = stories.get(id)
const container = document.getElementById('root')
if (!container) throw new Error('iframe.html has no #root')

// React commits a task after load, so a test that presses a key before this mark presses it on the body.
function Mounted({ children }: { children: React.ReactNode }) {
  React.useLayoutEffect(() => {
    document.body.dataset.storyMounted = 'true'
  }, [])
  return children
}

// Radix's Storybook renders every story in strict mode.
createRoot(container).render(
  <React.StrictMode>
    <Mounted>{Story ? <Story /> : <p>No story named {id}</p>}</Mounted>
  </React.StrictMode>,
)
