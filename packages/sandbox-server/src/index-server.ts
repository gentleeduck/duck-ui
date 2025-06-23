import { WebSocket, WebSocketServer } from 'ws'
import path from 'node:path'
import fs from 'node:fs'
import { uuidv7 } from 'uuidv7'
import { ChatHistory, Message } from './index.types'

const PORT = 8080
const server = new WebSocketServer({ port: PORT })
const chat_history_json = path.join(process.cwd(), 'chat-history.json')
let chat_history: ChatHistory[] = []

// Load chat history
if (fs.existsSync(chat_history_json)) {
  chat_history = JSON.parse(fs.readFileSync(chat_history_json, 'utf-8'))
}

// Keep track of connected clients
const clients = new Map<string, { user_id: string; name: string } | undefined>()

server.on('connection', (ws) => {
  const connection_id = uuidv7()

  clients.set(connection_id, undefined)
  console.log(`Client connected: ${connection_id}`)

  ws.on('message', (raw) => {
    try {
      const _raw: Message = JSON.parse(raw.toString())

      if (_raw.type === 'init') {
        clients.set(connection_id, { user_id: _raw.data.user_id, name: _raw.data.name })
        ws.send(
          JSON.stringify({
            type: 'init',
            data: {
              connection_id,
              user_id: _raw.data.user_id,
              name: _raw.data.name,
            },
          }),
        )

        // Send history
        ws.send(
          JSON.stringify({
            type: 'history',
            data: chat_history,
          }),
        )

        return
      }

      const _raw_msg = _raw as never as Message<'message'>
      if (_raw_msg.type === 'message') {
        chat_history.push(_raw_msg.data)
        fs.writeFileSync(chat_history_json, JSON.stringify(chat_history, null, 2))

        broadcast(
          JSON.stringify({
            type: 'message',
            data: _raw_msg.data,
          }),
        )
      }
    } catch (err) {
      console.error(err)
      console.log('Failed to parse message:', raw.toString())
    }
  })

  ws.on('close', () => {
    clients.delete(connection_id)
    console.log(`Client disconnected: ${connection_id}`)
  })
})

server.on('listening', () => {
  console.log(`Server listening on ws://localhost:${PORT}`)
})

function broadcast(message: string) {
  for (const ws of server.clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  }
}
