import { expect, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

const visit = (page: Page, story: string) => visitStoryById(page, `utilities-hooks--${story}`)

test.describe('useEscapeKeydown', () => {
  test('hears Escape anywhere on the page, but not one that ends an IME composition', async ({ page }) => {
    await visit(page, 'escape-keydown')
    await page.getByLabel('Text').press('Escape')
    await expect(page.getByLabel('Escapes')).toHaveText('1')

    await page.getByLabel('Text').evaluate((input) => {
      for (const init of [{ isComposing: true }, { keyCode: 229 }])
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, ...init }))
    })
    await page.keyboard.press('Escape')

    await expect(page.getByLabel('Escapes')).toHaveText('2')
  })
})

test.describe('useFocusGuards', () => {
  test('keeps one pair of guards at the edges of the body while any user is mounted, however they come and go', async ({
    page,
  }) => {
    await visit(page, 'guards')
    const settled = async () => {
      await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))
      return page.evaluate(() => {
        const edges = [document.body.firstElementChild, document.body.lastElementChild]
        return [
          document.querySelectorAll('[data-slot="focus-guard"]').length,
          ...edges.map((edge) => edge?.getAttribute('data-slot')),
        ]
      })
    }
    const pair = [2, 'focus-guard', 'focus-guard']

    await page.getByLabel('First').check()
    await page.getByLabel('Second').check()
    expect(await settled()).toEqual(pair)
    await page.getByLabel('First').uncheck()
    expect(await settled()).toEqual(pair)
    await page.getByLabel('First').check()
    expect(await settled()).toEqual(pair)
    await page.getByLabel('First').uncheck()
    await page.getByLabel('Second').uncheck()
    expect((await settled())[0]).toBe(0)
  })
})

test.describe('useSize', () => {
  test('reports each size the element takes, a height set from the reported width included', async ({ page }) => {
    await visit(page, 'size')
    await expect(page.getByLabel('Size')).toHaveText('100 x 40')

    await page.getByRole('button', { name: 'Wider' }).click()
    await expect(page.getByLabel('Size')).toHaveText('200 x 80')
  })
})

test.describe('useControllableState', () => {
  test('reports a change once in each mode, and a controlled value moves only when its owner moves it', async ({
    page,
  }) => {
    await visit(page, 'controllable-state')
    const uncontrolled = page.getByRole('button', { name: 'Uncontrolled' })
    const controlled = page.getByRole('button', { name: 'Controlled', exact: true })

    await uncontrolled.click()
    await controlled.click()

    await expect(uncontrolled).toHaveAttribute('aria-pressed', 'false')
    await expect(controlled).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByLabel('Changes')).toHaveText('uncontrolled false, controlled true')
  })
})

test.describe('usePrevious', () => {
  test('gives the value before the last change, through renders that change nothing', async ({ page }) => {
    await visit(page, 'previous')
    await page.getByRole('button', { name: 'Count' }).click()
    await page.getByRole('button', { name: 'Count' }).click()
    await page.getByRole('button', { name: 'Render' }).click()
    await page.getByRole('button', { name: 'Render' }).click()

    await expect(page.getByLabel('Previous')).toHaveText('1 then 2')
  })
})

test.describe('useStateMachine', () => {
  test('moves only on an event its state takes, reading two sends in one handler in order', async ({ page }) => {
    await visit(page, 'state-machine')
    const state = page.getByLabel('State')

    await page.getByRole('button', { name: 'pause', exact: true }).click()
    await expect(state).toHaveText('stopped')
    await page.getByRole('button', { name: 'play then pause' }).click()
    await expect(state).toHaveText('paused')
    await page.getByRole('button', { name: 'stop' }).click()
    await expect(state).toHaveText('stopped')
  })
})

test.describe('useId', () => {
  test('gives each field its own id, so each label names its own input', async ({ page }) => {
    await visit(page, 'id')
    const first = await page.getByLabel('First').getAttribute('id')
    const second = await page.getByLabel('Second').getAttribute('id')

    expect(first).toMatch(/^gentleduck-/)
    expect(second).not.toBe(first)
  })
})
