import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const sheet = (page: Page) => page.getByRole('dialog', { name: 'Settings' })
const trigger = (page: Page) => page.getByRole('button', { name: 'Settings' })
const output = (page: Page, name: string) => page.getByRole('status', { name })

async function visit(page: Page, ...toggles: string[]) {
  await visitStory(page, 'sheet--basic')
  for (const toggle of toggles) await page.getByRole('checkbox', { name: toggle }).check()
}

async function edges(page: Page) {
  const box = await sheet(page).boundingBox()
  const width = page.viewportSize()?.width ?? 0
  return { left: Math.round(box?.x ?? -1), right: Math.round(width - (box?.x ?? 0) - (box?.width ?? 0)) }
}

test.describe('Sheet', () => {
  test('the trigger opens it with focus inside, and Escape closes it back to the trigger', async ({ page }) => {
    await visit(page)

    await trigger(page).click()

    await expect(sheet(page)).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Option 1', exact: true })).toBeFocused()

    await page.keyboard.press('Shift+Tab')

    await expect(page.getByRole('button', { name: 'Done' })).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(sheet(page)).toHaveCount(0)
    await expect(trigger(page)).toBeFocused()
    await expect(output(page, 'State')).toHaveText('closed')
  })

  test('its close button closes it', async ({ page }) => {
    await visit(page)
    await trigger(page).click()

    await page.getByRole('button', { name: 'Done' }).click()

    await expect(sheet(page)).toHaveCount(0)
  })

  test('modal, a press outside closes it without reaching the page, and the page does not scroll', async ({ page }) => {
    await visit(page)
    const outside = await page.getByRole('button', { name: 'Outside' }).boundingBox()
    await trigger(page).click()

    await page.mouse.move(20, 300)
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(100)

    expect(await page.evaluate(() => window.scrollY)).toBe(0)

    await page.mouse.click((outside?.x ?? 0) + 5, (outside?.y ?? 0) + 5)

    await expect(sheet(page)).toHaveCount(0)
    await expect(output(page, 'Outside clicks')).toHaveText('0')
  })

  test('a long body scrolls inside the panel, and the page behind it stays put', async ({ page }) => {
    await visit(page)
    await trigger(page).click()
    const options = page.getByRole('group', { name: 'Options' })

    await options.hover()
    await page.mouse.wheel(0, 600)

    await expect.poll(() => options.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('non-modal, the page stays usable and a press outside closes it', async ({ page }) => {
    await visit(page, 'Non-modal')
    await trigger(page).click()

    await expect(sheet(page)).toBeVisible()

    await page.getByRole('button', { name: 'Outside' }).click()

    await expect(output(page, 'Outside clicks')).toHaveText('1')
    await expect(sheet(page)).toHaveCount(0)
  })

  test('it sits at the end edge, the start edge when asked, and both mirror in right-to-left', async ({ page }) => {
    await visit(page)
    await trigger(page).click()

    expect((await edges(page)).right).toBe(0)

    await page.keyboard.press('Escape')
    await page.getByRole('checkbox', { name: 'Start side' }).check()
    await trigger(page).click()

    expect((await edges(page)).left).toBe(0)

    await page.keyboard.press('Escape')
    await page.getByRole('checkbox', { name: 'Right-to-left' }).check()
    await trigger(page).click()

    await expect(sheet(page)).toHaveAttribute('dir', 'rtl')
    expect((await edges(page)).right).toBe(0)

    await page.keyboard.press('Escape')
    await page.getByRole('checkbox', { name: 'Start side' }).uncheck()
    await trigger(page).click()

    expect((await edges(page)).left).toBe(0)
  })
})
