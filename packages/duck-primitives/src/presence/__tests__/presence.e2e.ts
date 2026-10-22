import { expect, type Page, test } from '@playwright/test'
import { visitStoryById } from '../../__tests__/e2e-helpers'

const content = (page: Page) => page.locator('#content')

async function visit(page: Page, exit: string, ...checks: string[]) {
  await visitStoryById(page, 'utilities-presence--animated')
  await page.getByLabel(exit, { exact: true }).check()
  for (const check of checks) await page.getByLabel(check).check()
}

async function open(page: Page) {
  await page.getByRole('button', { name: 'Open' }).click()
  await expect(content(page)).toBeVisible()
  await content(page).evaluate((element) => Promise.all(element.getAnimations().map((animation) => animation.finished)))
}

// Clicks the toggle inside the page, so the time runs from the click to the content leaving the document, or is
// Infinity when it stays past 2s.
const msToUnmount = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const mounted = document.getElementById('content')
        const clicked = performance.now()
        const observer = new MutationObserver(() => {
          if (mounted?.isConnected) return
          observer.disconnect()
          resolve(performance.now() - clicked)
        })
        observer.observe(document.body, { childList: true, subtree: true })
        setTimeout(() => resolve(Number.POSITIVE_INFINITY), 2000)
        document.querySelector('button')?.click()
      }),
  )

test.describe('Presence', () => {
  test('drops content with no exit animation as soon as it closes', async ({ page }) => {
    await visit(page, 'no animation')
    await open(page)

    expect(await msToUnmount(page)).toBeLessThan(150)
  })

  test('keeps content until its exit animation ends', async ({ page }) => {
    await visit(page, 'fade-out 300ms')
    await open(page)

    const ms = await msToUnmount(page)

    expect(ms).toBeGreaterThanOrEqual(290)
    expect(ms).toBeLessThan(700)
  })

  test('keeps content until the last of its exit animations ends', async ({ page }) => {
    await visit(page, 'fade-out 200ms and slide-out 500ms')
    await open(page)

    const ms = await msToUnmount(page)

    expect(ms).toBeGreaterThanOrEqual(490)
    expect(ms).toBeLessThan(900)
  })

  test('runs the whole exit when it interrupts an opening animation whose name the exit contains', async ({ page }) => {
    await visit(page, 'fade-out 300ms, opening with fade 600ms')
    await page.getByRole('button', { name: 'Open' }).click()
    await expect(content(page)).toBeVisible()

    expect(await msToUnmount(page)).toBeGreaterThanOrEqual(290)
  })

  test('drops content at once when its exit animation is cancelled', async ({ page }) => {
    await visit(page, 'fade-out 300ms')
    await open(page)

    const ms = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const element = document.getElementById('content')
          let cancelled = Number.NaN
          const observer = new MutationObserver(() => {
            if (element?.isConnected) return
            observer.disconnect()
            resolve(performance.now() - cancelled)
          })
          observer.observe(document.body, { childList: true, subtree: true })
          setTimeout(() => resolve(Number.POSITIVE_INFINITY), 2000)
          document.querySelector('button')?.click()
          requestAnimationFrame(() => {
            cancelled = performance.now()
            element?.style.setProperty('animation', 'none')
          })
        }),
    )

    expect(ms).toBeLessThan(150)
  })

  test('drops content at once when its exit animation has no keyframes', async ({ page }) => {
    await visit(page, 'an animation with no keyframes')
    await open(page)

    expect(await msToUnmount(page)).toBeLessThan(150)
  })

  test('drops content at once when the animation on close is the one it opened with', async ({ page }) => {
    await visit(page, 'the animation it opened with')
    await open(page)

    expect(await msToUnmount(page)).toBeLessThan(150)
  })

  test('drops content at once when it is hidden on close', async ({ page }) => {
    await visit(page, 'fade-out 300ms while display is none')
    await open(page)

    expect(await msToUnmount(page)).toBeLessThan(150)
  })

  test('keeps the same element when it reopens during the exit', async ({ page }) => {
    await visit(page, 'fade-out 300ms')
    await open(page)
    await content(page).evaluate((element) => {
      element.dataset.first = ''
    })

    // Both clicks inside the page, a frame apart, so a slow machine cannot let the exit end between them.
    await page.evaluate(async () => {
      const toggle = document.querySelector('button')
      toggle?.click()
      await new Promise(requestAnimationFrame)
      toggle?.click()
      await new Promise((resolve) => setTimeout(resolve, 400))
    })

    await expect(content(page)).toHaveAttribute('data-first', '')
  })

  test('keeps a render function content once the exit ends, telling it it is not present', async ({ page }) => {
    await visit(page, 'fade-out 300ms', 'Render function')
    await open(page)

    await page.getByRole('button', { name: 'Close' }).click()

    await expect(content(page)).toHaveText('Saved, not present')
    await expect(content(page)).toBeAttached()
  })
})
