import { createClient } from 'redis'

const subscriber = createClient()

async function fn() {
  await subscriber.connect()

  await subscriber.subscribe('news', (message) => {
    console.log('🔔 Received:', message)
  })
}

fn()
