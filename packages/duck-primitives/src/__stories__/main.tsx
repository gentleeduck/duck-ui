import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { stories } from './stories'
import { StoryIndex } from './story-index'

const id = new URLSearchParams(window.location.search).get('id')
const entry = id === null ? undefined : stories.get(id)
if (entry) document.title = `${entry.title} / ${entry.name}`
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
    {id === null ? (
      <StoryIndex />
    ) : entry ? (
      <Mounted>
        <entry.Story />
      </Mounted>
    ) : (
      <p>No story named {id}</p>
    )}
  </React.StrictMode>,
)
