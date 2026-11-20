import { resolve } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { GET as MCP_HEALTH_GET, OPTIONS as MCP_HEALTH_OPTIONS } from '../health/route'
import { DELETE as MCP_DELETE, GET as MCP_GET, OPTIONS as MCP_OPTIONS, POST as MCP_POST } from '../route'

const CONTENT_DIR_ENV_VAR = 'DUCK_UI_DOCS_CONTENT_DIR'
const DOCS_CONTENT_DIR = resolve(import.meta.dirname, '../../../../content/docs')
const MCP_URL = new URL('http://localhost/api/mcp')
const MCP_HEALTH_URL = new URL('http://localhost/api/mcp/health')

const openResponses = new Set<Response>()

function trackResponse(response: Response): Response {
  openResponses.add(response)
  return response
}

async function closeTrackedResponses(): Promise<void> {
  await Promise.allSettled(
    [...openResponses].map(async (response) => {
      openResponses.delete(response)
      await response.body?.cancel()
    }),
  )
}

async function routeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request =
    input instanceof Request ? input : new Request(input instanceof URL ? input.toString() : String(input), init)

  const url = new URL(request.url)

  if (url.pathname === '/api/mcp') {
    if (request.method === 'POST') return trackResponse(await MCP_POST(request))
    if (request.method === 'GET') return trackResponse(await MCP_GET(request))
    if (request.method === 'DELETE') return trackResponse(await MCP_DELETE(request))
    if (request.method === 'OPTIONS') return trackResponse(await MCP_OPTIONS())
  }

  if (url.pathname === '/api/mcp/health') {
    if (request.method === 'GET') return trackResponse(await MCP_HEALTH_GET())
    if (request.method === 'OPTIONS') return trackResponse(await MCP_HEALTH_OPTIONS())
  }

  return trackResponse(new Response('Not found', { status: 404 }))
}

describe('MCP route integration', () => {
  const previousContentDir = process.env[CONTENT_DIR_ENV_VAR]

  beforeAll(() => {
    process.env[CONTENT_DIR_ENV_VAR] = DOCS_CONTENT_DIR
  })

  afterAll(() => {
    if (previousContentDir === undefined) {
      delete process.env[CONTENT_DIR_ENV_VAR]
    } else {
      process.env[CONTENT_DIR_ENV_VAR] = previousContentDir
    }
  })

  afterEach(async () => {
    await closeTrackedResponses()
  })

  test('health route reports docs, tools, and session stats', async () => {
    const response = await MCP_HEALTH_GET()
    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBe('*')
    expect(response.headers.get('access-control-allow-headers')).toContain('Mcp-Session-Id')

    const payload = (await response.json()) as {
      status: string
      toolCount: number
      docs: {
        docCount: number
        categories: string[]
        indexedTermCount: number
        cacheAgeMs: number
        cacheTtlMs: number
        cache: {
          source: 'memory' | 'persistent' | 'incremental' | 'rebuild'
          cacheFilePath: string | null
          persistedEntries: number
        }
      }
      sessions: { activeSessions: number; ttlMs: number }
    }

    expect(payload.status).toBe('ok')
    expect(payload.toolCount).toBe(9)
    expect(payload.docs.docCount).toBeGreaterThan(0)
    expect(payload.docs.categories).toContain('components')
    expect(payload.docs.indexedTermCount).toBeGreaterThan(0)
    expect(payload.docs.cacheAgeMs).toBeGreaterThanOrEqual(0)
    expect(payload.docs.cacheTtlMs).toBeGreaterThan(0)
    expect(payload.docs.cache.source).toBeTruthy()
    expect(payload.docs.cache.persistedEntries).toBeGreaterThan(0)
    expect(payload.sessions.ttlMs).toBeGreaterThan(0)
  })

  test('OPTIONS responses advertise MCP browser transport headers', async () => {
    const mcpOptions = await MCP_OPTIONS()
    expect(mcpOptions.status).toBe(204)
    expect(mcpOptions.headers.get('access-control-allow-headers')).toContain('Mcp-Session-Id')
    expect(mcpOptions.headers.get('access-control-expose-headers')).toContain('Mcp-Session-Id')
    expect(mcpOptions.headers.get('access-control-max-age')).toBe('86400')

    const healthOptions = await MCP_HEALTH_OPTIONS()
    expect(healthOptions.status).toBe(204)
    expect(healthOptions.headers.get('access-control-allow-headers')).toContain('Mcp-Session-Id')
    expect(healthOptions.headers.get('access-control-max-age')).toBe('86400')
  })

  test('manual initialize request can open a standalone GET stream', async () => {
    const initResponse = await MCP_POST(
      new Request(MCP_URL, {
        method: 'POST',
        headers: {
          accept: 'application/json, text/event-stream',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: {
              name: 'duck-ui-manual-route-test',
              version: '1.0.0',
            },
          },
        }),
      }),
    )

    expect(initResponse.status).toBe(200)
    expect(initResponse.headers.get('access-control-expose-headers')).toContain('Mcp-Session-Id')

    const sessionId = initResponse.headers.get('mcp-session-id')
    expect(sessionId).toBeTruthy()
    await initResponse.body?.cancel()

    const sseResponse = await MCP_GET(
      new Request(MCP_URL, {
        method: 'GET',
        headers: {
          accept: 'text/event-stream',
          'mcp-session-id': sessionId!,
        },
      }),
    )

    expect(sseResponse.status).toBe(200)
    expect(sseResponse.headers.get('content-type')).toContain('text/event-stream')
    expect(sseResponse.headers.get('mcp-session-id')).toBe(sessionId)
    await sseResponse.body?.cancel()

    const deleteResponse = await MCP_DELETE(
      new Request(MCP_URL, {
        method: 'DELETE',
        headers: {
          'mcp-session-id': sessionId!,
        },
      }),
    )

    expect(deleteResponse.status).toBe(200)
  })

  test('missing session header returns a JSON-RPC error with CORS', async () => {
    const response = await MCP_GET(
      new Request(MCP_URL, {
        method: 'GET',
        headers: {
          accept: 'text/event-stream',
        },
      }),
    )

    expect(response.status).toBe(400)
    expect(response.headers.get('access-control-allow-origin')).toBe('*')

    const payload = (await response.json()) as {
      error?: { code: number; message: string }
    }

    expect(payload.error?.code).toBe(-32000)
    expect(payload.error?.message).toContain('Mcp-Session-Id')
  })

  test('route supports streamable HTTP sessions across POST, GET, and DELETE', async () => {
    const transport = new StreamableHTTPClientTransport(MCP_URL, { fetch: routeFetch })
    const client = new Client({
      name: 'duck-ui-route-test-client',
      version: '1.0.0',
    })

    try {
      await client.connect(transport)

      const tools = await client.listTools()
      expect(tools.tools).toHaveLength(9)
      expect(transport.sessionId).toBeTruthy()

      const result = await client.callTool({
        name: 'search_docs',
        arguments: { query: 'button', category: 'components', limit: 2 },
      })

      const text =
        result.content
          ?.filter((item) => item.type === 'text')
          .map((item) => item.text ?? '')
          .join('\n') ?? ''

      expect(text).toContain('`components/button`')

      const sessionId = transport.sessionId!
      const sseResponse = await MCP_GET(
        new Request(MCP_URL, {
          method: 'GET',
          headers: {
            accept: 'text/event-stream',
            'mcp-session-id': sessionId,
          },
        }),
      )

      // The SDK transport already opened the session's standalone SSE stream,
      // so a second GET for the same session must be rejected as a conflict.
      expect(sseResponse.status).toBe(409)

      await transport.terminateSession()
      expect(transport.sessionId).toBeUndefined()

      const afterDeleteResponse = await MCP_GET(
        new Request(MCP_URL, {
          method: 'GET',
          headers: {
            accept: 'text/event-stream',
            'mcp-session-id': sessionId,
          },
        }),
      )

      expect(afterDeleteResponse.status).toBe(404)
    } finally {
      await Promise.allSettled([client.close(), transport.close()])
    }
  })
})
