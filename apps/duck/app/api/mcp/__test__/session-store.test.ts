import { afterEach, describe, expect, test } from 'vitest'
import {
  closeSessionById,
  createSessionConnection,
  disposeSessionConnection,
  getSessionConnection,
  getSessionStoreStats,
} from '../session-store'

function createInitializeRequest(): Request {
  return new Request('http://localhost/api/mcp', {
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
          name: 'duck-ui-session-store-test',
          version: '1.0.0',
        },
      },
    }),
  })
}

const openedSessionIds = new Set<string>()

afterEach(async () => {
  await Promise.allSettled([...openedSessionIds].map((sessionId) => closeSessionById(sessionId)))
  openedSessionIds.clear()
})

describe('MCP session store', () => {
  test('creates, tracks, and closes initialized sessions', async () => {
    const before = getSessionStoreStats()
    const connection = await createSessionConnection()

    try {
      expect(getSessionConnection(connection.sessionId)).toBeNull()

      const response = await connection.transport.handleRequest(createInitializeRequest())
      openedSessionIds.add(connection.sessionId)

      expect(response.status).toBe(200)
      expect(response.headers.get('mcp-session-id')).toBe(connection.sessionId)
      await response.body?.cancel()

      const tracked = getSessionConnection(connection.sessionId)
      expect(tracked?.sessionId).toBe(connection.sessionId)
      expect(getSessionStoreStats().activeSessions).toBe(before.activeSessions + 1)

      const closed = await closeSessionById(connection.sessionId)
      openedSessionIds.delete(connection.sessionId)

      expect(closed).toBe(true)
      expect(getSessionConnection(connection.sessionId)).toBeNull()
      expect(getSessionStoreStats().activeSessions).toBe(before.activeSessions)
    } finally {
      await disposeSessionConnection(connection)
      openedSessionIds.delete(connection.sessionId)
    }
  })

  test('returns false when closing an unknown session id', async () => {
    expect(await closeSessionById('missing-session-id')).toBe(false)
  })
})
