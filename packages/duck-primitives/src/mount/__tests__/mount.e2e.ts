import { expect, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

const visit = (page: Page, story: string) => visitStoryById(page, `utilities-mount--${story}`)

const content = (page: Page) => page.locator('#content')

// Clicks the toggle inside the page, so the time runs from the click itself to the content leaving the document.
const msToUnmount = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const mounted = document.getElementById('content')
        let clicked = 0
        new MutationObserver((_, observer) => {
          if (mounted?.isConnected) return
          observer.disconnect()
          resolve(performance.now() - clicked)
        }).observe(document.body, { childList: true, subtree: true })
        clicked = performance.now()
        document.querySelector('button')?.click()
      }),
  )

const pause = (page: Page, ms: number) => page.evaluate((ms) => new Promise((resolve) => setTimeout(resolve, ms)), ms)

async function openMinimal(page: Page, transition: string, ...checks: string[]) {
  await visit(page, 'minimal')
  await page.getByLabel(transition, { exact: true }).check()
  for (const check of checks) await page.getByLabel(check).click()
  await page.getByRole('button', { name: 'Open' }).click()
  await expect(content(page)).toBeAttached()
  // Closed while still in its delay, the panel has not moved, so no transition runs and nothing is waited for.
  await page
    .locator('[data-transition]')
    .evaluate((panel) => Promise.all(panel.getAnimations().map((animation) => animation.finished)))
}

test.describe('Mount', () => {
  test('keeps its children for its fixed duration after it closes, then drops them', async ({ page }) => {
    await visit(page, 'fixed-duration')
    await page.getByRole('button', { name: 'Show' }).click()
    await expect(content(page)).toBeVisible()

    const ms = await msToUnmount(page)

    expect(ms).toBeGreaterThanOrEqual(290)
    expect(ms).toBeLessThan(700)
  })
})

test.describe('MountMinimal', () => {
  for (const [transition, end] of [
    ['opacity 300ms', 300],
    ['opacity 300ms after 300ms', 600],
    ['opacity 200ms, then translate 300ms after 300ms', 600],
  ] as const) {
    test(`keeps its children until the panel's transition ends: ${transition}`, async ({ page }) => {
      await openMinimal(page, transition)

      const ms = await msToUnmount(page)

      expect(ms).toBeGreaterThanOrEqual(end - 10)
      expect(ms).toBeLessThan(end + 400)
    })
  }

  test('drops its children as soon as it closes when no property transitions', async ({ page }) => {
    await openMinimal(page, 'none, under reduced motion')

    expect(await msToUnmount(page)).toBeLessThan(150)
  })

  test('drops its children as soon as it closes when its transition cannot run', async ({ page }) => {
    await openMinimal(page, 'height 300ms to auto, which cannot run')

    expect(await msToUnmount(page)).toBeLessThan(150)
  })

  test('drops its children as soon as it closes with skipWaiting', async ({ page }) => {
    await openMinimal(page, 'opacity 300ms after 300ms', 'skipWaiting')

    expect(await msToUnmount(page)).toBeLessThan(150)
  })

  test('drops its children as soon as it closes with no element to wait for', async ({ page }) => {
    await openMinimal(page, 'opacity 300ms after 300ms', 'Wait for the panel')

    expect(await msToUnmount(page)).toBeLessThan(150)
  })

  test('keeps its children mounted before the first open and after it closes with forceMount', async ({ page }) => {
    await visit(page, 'minimal')
    await page.getByLabel('forceMount').check()
    await expect(content(page)).toBeAttached()
    await page.getByRole('textbox').fill('kept')

    await page.getByRole('button', { name: 'Open' }).click()
    await page.getByRole('button', { name: 'Close' }).click()
    await pause(page, 500)

    await expect(page.getByRole('textbox')).toHaveValue('kept')
  })

  test('mounts its children on the first open and keeps them after with renderOnce', async ({ page }) => {
    await visit(page, 'minimal')
    await page.getByLabel('renderOnce').check()
    await expect(content(page)).not.toBeAttached()

    await page.getByRole('button', { name: 'Open' }).click()
    await page.getByRole('textbox').fill('kept')
    await page.getByRole('button', { name: 'Close' }).click()
    await pause(page, 500)

    await expect(page.getByRole('textbox')).toHaveValue('kept')
  })
})
