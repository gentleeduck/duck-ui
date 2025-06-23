import { createClient } from 'redis'

const publisher = createClient()

async function fn() {
  await publisher.connect()

  setInterval(async () => {
    await publisher.publish('news', `📰 Breaking news at ${new Date().toISOString()}`)
    console.log('Published news!')
  }, 2000)
}

fn()
