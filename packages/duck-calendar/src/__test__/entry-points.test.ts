import { describe, expect, it, vi } from 'vitest'

// Loading any of the optional date libraries fails, as it does when the consumer has not installed it.
vi.mock('date-fns', () => {
  throw new Error('date-fns loaded')
})
vi.mock('dayjs', () => {
  throw new Error('dayjs loaded')
})
vi.mock('luxon', () => {
  throw new Error('luxon loaded')
})

describe('entry points without the optional date libraries', () => {
  it.each([
    ['the root', () => import('../index')],
    ['/adapter', () => import('../adapter')],
  ])('%s loads without any of them', async (_, load) => {
    await expect(load()).resolves.toHaveProperty('NativeAdapter')
  })

  it.each([
    ['date-fns', () => import('../adapter/date-fns-adapter')],
    ['dayjs', () => import('../adapter/dayjs-adapter')],
    ['luxon', () => import('../adapter/luxon-adapter')],
  ])('/adapter/%s still needs its library', async (lib, load) => {
    await expect(load()).rejects.toHaveProperty('cause.message', `${lib} loaded`)
  })
})
