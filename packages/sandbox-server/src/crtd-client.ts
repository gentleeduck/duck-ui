import * as Automerge from '@automerge/automerge'
import WebSocket from 'ws'
import fs from 'node:fs'
import readline from 'node:readline'
import path from 'node:path'
import chokidar from 'chokidar'

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: node client.js <your_name> <path_to_file>')
  process.exit(1)
}

const userName = args[0]
const filePath = path.resolve(args[1])
let doc = Automerge.init<{ content: string }>()

const socket = new WebSocket('ws://localhost:3030')

socket.on('open', () => {
  socket.send(JSON.stringify({ type: 'hello', userName, filePath }))
})

socket.on('message', (data) => {
  const msg = JSON.parse(data.toString())

  if (msg.type === 'init') {
    const changes = msg.changes.map((c) => new Uint8Array(c))
    doc = Automerge.applyChanges(doc, changes)[0]
    fs.writeFileSync(filePath, doc.content)
    console.log('📥 Synced initial file:\n' + doc.content)

    rl.prompt()
  }

  if (msg.type === 'changes') {
    const changes = msg.changes.map((c) => new Uint8Array(c))
    doc = Automerge.applyChanges(doc, changes)[0]
    fs.writeFileSync(filePath, doc.content)
    console.log(`\n📡 ${msg.from} made changes:\n${doc.content}`)
    rl.prompt()
  }
})

chokidar.watch(filePath, { ignoreInitial: true }).on('change', (path) => {
  const newContent = fs.readFileSync(filePath, 'utf-8')
  if (newContent === doc.content) return

  const newDoc = Automerge.change(doc, `${userName} edited`, (d) => {
    d.content = newContent
  })

  const changes = Automerge.getChanges(doc, newDoc)
  doc = newDoc

  socket.send(JSON.stringify({ type: 'changes', changes: changes.map((c) => Array.from(c)) }))
})

// 🧑 CLI prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `(${userName}) > `,
})

rl.on('line', (line) => {
  const newDoc = Automerge.change(doc, `${userName} CLI edit`, (d) => {
    d.content += '\n' + line
  })

  const changes = Automerge.getChanges(doc, newDoc)
  doc = newDoc

  fs.writeFileSync(filePath, doc.content)
  socket.send(JSON.stringify({ type: 'changes', changes: changes.map((c) => Array.from(c)) }))

  rl.prompt()
})
