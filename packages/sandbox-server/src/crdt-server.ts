import * as Automerge from '@automerge/automerge'
import { WebSocketServer, WebSocket } from 'ws'
import { uuidv7 } from 'uuidv7'

const wss = new WebSocketServer({ port: 3030 })
const docs = new Map<string, Automerge.Doc<{ content: string }>>() // keyed by file path
const clients = new Map<WebSocket, { filePath: string; userName: string }>()

wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    const msg = JSON.parse(raw.toString())

    if (msg.type === 'hello') {
      const { filePath, userName } = msg
      clients.set(ws, { filePath, userName })

      let doc = docs.get(filePath)
      if (!doc) {
        doc = Automerge.init<{ content: string }>()
        doc = Automerge.change(doc, (d) => {
          d.content = ''
        })
        docs.set(filePath, doc)
      }

      const changes = Automerge.getAllChanges(doc)
      ws.send(JSON.stringify({ type: 'init', changes: changes.map((c) => Array.from(c)) }))
      console.log(`🟢 ${userName} joined to edit: ${filePath}`)
    }

    if (msg.type === 'changes') {
      const client = clients.get(ws)
      if (!client) return

      const { filePath, userName } = client
      const binaryChanges = msg.changes.map((c) => new Uint8Array(c))
      const doc = docs.get(filePath)
      if (!doc) return

      const [updatedDoc] = Automerge.applyChanges(doc, binaryChanges)
      docs.set(filePath, updatedDoc)

      for (const [clientWs, meta] of clients.entries()) {
        if (clientWs !== ws && meta.filePath === filePath && clientWs.readyState === 1) {
          clientWs.send(
            JSON.stringify({
              type: 'changes',
              from: userName,
              changes: msg.changes,
            }),
          )
        }
      }
    }
  })

  ws.on('close', () => {
    const user = clients.get(ws)
    clients.delete(ws)
    if (user) console.log(`🔴 ${user.userName} disconnected from ${user.filePath}`)
  })
})

console.log('✅ Server running on ws://localhost:3030')
