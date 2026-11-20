import { resolve } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createMcpServer } from '../server'

const CONTENT_DIR_ENV_VAR = 'DUCK_UI_DOCS_CONTENT_DIR'
const DOCS_CONTENT_DIR = resolve(import.meta.dirname, '../../../../content/docs')

function getTextContent(result: { content?: Array<{ type: string; text?: string }> }): string {
  return (
    result.content
      ?.filter((item) => item.type === 'text')
      .map((item) => item.text ?? '')
      .join('\n') ?? ''
  )
}

describe('MCP server integration', () => {
  let client: Client
  let server: ReturnType<typeof createMcpServer>
  let previousContentDir: string | undefined

  beforeAll(async () => {
    previousContentDir = process.env[CONTENT_DIR_ENV_VAR]
    process.env[CONTENT_DIR_ENV_VAR] = DOCS_CONTENT_DIR

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

    server = createMcpServer()
    client = new Client({
      name: 'duck-ui-mcp-test-client',
      version: '1.0.0',
    })

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  })

  afterAll(async () => {
    await Promise.allSettled([client.close(), server.close()])

    if (previousContentDir === undefined) {
      delete process.env[CONTENT_DIR_ENV_VAR]
    } else {
      process.env[CONTENT_DIR_ENV_VAR] = previousContentDir
    }
  })

  test('exposes all 9 MCP tools', async () => {
    const result = await client.listTools()
    const names = result.tools.map((tool) => tool.name).sort()

    expect(names).toEqual([
      'get_changelog',
      'get_component_api',
      'get_examples',
      'get_installation',
      'list_docs',
      'read_doc',
      'search_docs',
      'semantic_search',
      'suggest_components',
    ])
  })

  test('list_docs returns filtered component docs', async () => {
    const result = await client.callTool({
      name: 'list_docs',
      arguments: { category: 'components', page: 1 },
    })

    const text = getTextContent(result)

    expect(text).toContain('docs in "components"')
    expect(text).toContain('`components/button`')
  })

  test('read_doc returns stripped section content', async () => {
    const result = await client.callTool({
      name: 'read_doc',
      arguments: { slug: 'components/button', section: 'API Reference' },
    })

    const text = getTextContent(result)

    expect(text).toContain('# button')
    expect(text).toContain('### Button Props')
    expect(text).not.toContain('ComponentPreview')
  })

  test('search_docs handles typo-tolerant keyword lookups', async () => {
    const result = await client.callTool({
      name: 'search_docs',
      arguments: { query: 'buton', category: 'components', limit: 3 },
    })

    const text = getTextContent(result)

    expect(text).toContain('`components/button`')
  })

  test('get_component_api returns the props table for a component', async () => {
    const result = await client.callTool({
      name: 'get_component_api',
      arguments: { component: 'button' },
    })

    const text = getTextContent(result)

    expect(text).toContain('# button  -  API Reference')
    expect(text).toContain('| Prop | Type | Default | Description |')
  })

  test('get_examples returns fenced code blocks only', async () => {
    const result = await client.callTool({
      name: 'get_examples',
      arguments: { slug: 'components/button' },
    })

    const text = getTextContent(result)

    expect(text).toContain('# button  -  Code Examples')
    expect(text).toContain('```tsx')
    expect(text).toContain('<Button>Button</Button>')
  })

  test('get_changelog returns newest entries first and supports filtering', async () => {
    const latestResult = await client.callTool({
      name: 'get_changelog',
      arguments: { limit: 2 },
    })
    const latestText = getTextContent(latestResult)

    expect(latestText).toContain('## March 2026')
    expect(latestText).toContain('## February 2026')
    expect(latestText.indexOf('## March 2026')).toBeLessThan(latestText.indexOf('## February 2026'))

    const filteredResult = await client.callTool({
      name: 'get_changelog',
      arguments: { component: 'select', limit: 2 },
    })
    const filteredText = getTextContent(filteredResult)

    expect(filteredText.toLowerCase()).toContain('select')
  })

  test('get_installation resolves framework aliases', async () => {
    const result = await client.callTool({
      name: 'get_installation',
      arguments: { framework: 'nextjs' },
    })

    const text = getTextContent(result)

    expect(text).toContain('# next.js')
    expect(text).toContain('npx @gentleduck/cli init')
  })

  test('suggest_components uses descriptive needs to rank matches', async () => {
    const result = await client.callTool({
      name: 'suggest_components',
      arguments: { need: 'popup dialog', limit: 3 },
    })

    const text = getTextContent(result)

    expect(text).toContain('`components/dialog`')
  })

  test('semantic_search finds conceptual matches', async () => {
    const result = await client.callTool({
      name: 'semantic_search',
      arguments: { query: 'popup overlay component', category: 'components', limit: 3, threshold: 0.01 },
    })

    const text = getTextContent(result)

    expect(text).toMatch(/`components\/(dialog|popover|sheet)`/)
  })
})
