import WebSocket from 'ws'
import readline from 'node:readline'
import chalk from 'chalk'
import { uuidv7 } from 'uuidv7'
import { Message } from './index.types'

let currentUserId: string | null = uuidv7()
let currentUserName: string = 'Anonymous'

const ws = new WebSocket('ws://localhost:8080')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function clearLine() {
  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)
}

rl.question('Enter your name: ', (name) => {
  currentUserName = name || 'Anonymous'

  // When connected, send init message
  ws.send(JSON.stringify({ type: 'init', data: { name: currentUserName } }))

  rl.setPrompt(`${chalk.green(currentUserName)} > `)
  rl.prompt()
})

// Handle messages
ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data as never as string) as Message

    if (msg.type === 'init') {
      currentUserId = msg.data.user_id
      process.stdout.write(chalk.green(`Connected as ${msg.data.name}\n`))

      rl.prompt()
      return
    }

    if (msg.type === 'history') {
      // biome-ignore lint/complexity/noForEach: <explanation>
      ;(msg as never as Message<'history'>).data.forEach((m) => {
        printMessage(m)
      })
    } else if (msg.type === 'message') {
      printMessage(msg.data as Message<'message'>['data'])
    }
  } catch (err) {
    console.error(chalk.red('Invalid message from server:'), data.toString())
  }
})

// On input, send message
rl.on('line', (line) => {
  if (line.trim()) {
    ws.send(
      JSON.stringify({
        type: 'message',
        data: {
          name: currentUserName,
          message: line.trim(),
          timestamp: new Date().toISOString(),
        },
      }),
    )
  }
  process.stdout.moveCursor(0, -1)
  process.stdout.clearLine(0)
  process.stdout.cursorTo(0)
  rl.prompt()
})

function printMessage({ name, message, timestamp }) {
  const time = new Date(timestamp).toLocaleTimeString()
  clearLine()
  console.log(`${chalk.gray(`[${time}]`)} ${chalk.yellow(name)}: ${message}`)
  rl.prompt()
}

ws.on('close', () => {
  console.log(chalk.red('\nDisconnected from server.'))
  process.exit(0)
})

ws.on('error', (err) => {
  console.error(chalk.red('Connection error:'), err.message)
})
