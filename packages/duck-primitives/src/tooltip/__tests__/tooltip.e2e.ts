import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const tip = (page: Page) => page.getByRole('tooltip')
const trigger = (page: Page, name: string) => page.getByRole('button', { exact: true, name })
const output = (page: Page, name: string) => page.getByRole('status', { name })

async function visit(page: Page, story: string, ...toggles: string[]) {
  await visitStory(page, `tooltip--${story}`)
  for (const toggle of toggles) await page.getByRole('checkbox', { name: toggle }).check()
}

async function hoverOpen(page: Page) {
  await trigger(page, 'Bold').hover()
  await expect(tip(page)).toHaveText('Makes the text bold')
}

const leave = (page: Page) => page.mouse.move(600, 500, { steps: 6 })

async function glideTo(page: Page, name: string) {
  const box = await trigger(page, name).boundingBox()
  if (!box) throw new Error(`no ${name}`)
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 })
}

async function moveOntoContent(page: Page) {
  const box = await page.getByText('Makes the text bold').boundingBox()
  if (!box) throw new Error('no tooltip')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 6 })
}

test.describe('Tooltip', () => {
  test('a hover opens it after the delay, the trigger names it, and the pointer leaving closes it', async ({
    page,
  }) => {
    await visit(page, 'basic')
    await trigger(page, 'Bold').hover()
    await page.waitForTimeout(150)

    await expect(tip(page)).toHaveCount(0)

    await expect(tip(page)).toHaveText('Makes the text bold')
    await expect(tip(page)).toHaveAttribute('data-state', 'delayed-open')
    await expect(trigger(page, 'Bold')).toHaveAttribute('aria-describedby', (await tip(page).getAttribute('id')) ?? '')
    await expect(tip(page).locator('svg')).toBeVisible()

    await leave(page)

    await expect(tip(page)).toHaveCount(0)
    await expect(trigger(page, 'Bold')).not.toHaveAttribute('aria-describedby')
    await expect(output(page, 'Changes')).toHaveText('true, false')
  })

  test('keyboard focus opens it at once, and Escape closes it with focus left on the trigger', async ({ page }) => {
    await visit(page, 'basic')
    await page.getByRole('button', { name: 'Before' }).focus()
    await page.keyboard.press('Tab')

    await expect(tip(page)).toHaveAttribute('data-state', 'instant-open')

    await page.keyboard.press('Escape')

    await expect(tip(page)).toHaveCount(0)
    await expect(trigger(page, 'Bold')).toBeFocused()
  })

  test('moving to another trigger in the provider soon after opens the next one at once', async ({ page }) => {
    await visit(page, 'basic')
    await hoverOpen(page)
    await glideTo(page, 'Italic')

    await expect(tip(page)).toHaveText('Slants the text')
    await expect(tip(page)).toHaveAttribute('data-state', 'instant-open')
  })

  test('a pointer that jumps off the trigger closes it, or opens the next trigger it lands on, in that one move', async ({
    page,
  }) => {
    await visit(page, 'basic')
    await hoverOpen(page)
    await page.mouse.move(600, 500)

    await expect(tip(page)).toHaveCount(0)

    await hoverOpen(page)
    const box = await trigger(page, 'Italic').boundingBox()
    if (!box) throw new Error('no Italic')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)

    await expect(tip(page)).toHaveText('Slants the text')
    await expect(tip(page)).toHaveAttribute('data-state', 'instant-open')
  })

  test('the pointer can cross onto the content and stay, unless the content is not hoverable', async ({ page }) => {
    await visit(page, 'basic')
    await hoverOpen(page)
    await moveOntoContent(page)
    await page.waitForTimeout(200)

    await expect(tip(page)).toBeVisible()

    await visit(page, 'basic', 'Content not hoverable')
    await hoverOpen(page)
    await moveOntoContent(page)

    await expect(tip(page)).toHaveCount(0)
  })

  test('closeDelay keeps it open a while after the pointer leaves', async ({ page }) => {
    await visit(page, 'basic', 'Close delay')
    await hoverOpen(page)
    await leave(page)
    await page.waitForTimeout(300)

    await expect(tip(page)).toBeVisible()
    await expect(tip(page)).toHaveCount(0)
  })

  test('pressing the trigger closes it, unless disableCloseOnClick', async ({ page }) => {
    await visit(page, 'basic')
    await hoverOpen(page)
    await trigger(page, 'Bold').click()

    await expect(tip(page)).toHaveCount(0)

    await visit(page, 'basic', 'Stay open on click')
    await hoverOpen(page)
    await trigger(page, 'Bold').click()
    await page.waitForTimeout(200)

    await expect(tip(page)).toBeVisible()
  })

  test('on a toggle under disableCloseOnClick, a press toggles it and leaves its on state and the tooltip showing', async ({
    page,
  }) => {
    await visitStory(page, 'tooltip--toggle-trigger')
    const toggle = page.getByRole('button', { name: 'Underline' })
    await toggle.hover()
    await expect(tip(page)).toHaveText('Underlines the text')
    await toggle.click()

    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(toggle).toHaveAttribute('data-state', 'on')
    await expect(toggle).toHaveAttribute('data-slot', 'toggle')
    await expect(tip(page)).toBeVisible()
  })

  test('disabled, it never opens, and turning it off closes an open one', async ({ page }) => {
    await visit(page, 'basic', 'Disabled')
    await trigger(page, 'Bold').hover()
    await page.waitForTimeout(600)

    await expect(tip(page)).toHaveCount(0)

    await visit(page, 'basic')
    await page.getByRole('button', { name: 'Before' }).focus()
    await page.keyboard.press('Tab')

    await expect(tip(page)).toBeVisible()

    await page.getByRole('checkbox', { name: 'Disabled' }).dispatchEvent('click')

    await expect(tip(page)).toHaveCount(0)
    await expect(trigger(page, 'Bold')).toBeFocused()
  })

  test('controlled, it asks its owner on every dismissal and stays as the owner says', async ({ page }) => {
    await visit(page, 'controlled', 'Locked')
    await page.getByRole('button', { name: 'Toggle from outside' }).click()

    await expect(page.getByText('Opens the guide (F1)')).toBeVisible()
    await expect(page.getByRole('tooltip', { name: 'Opens the guide' })).toHaveCount(1)

    await page.mouse.click(600, 500)
    await page.keyboard.press('Escape')

    await expect(page.getByText('Opens the guide (F1)')).toBeVisible()
    await expect(output(page, 'Asked')).toHaveText('false, false')

    await page.getByRole('checkbox', { name: 'Locked' }).uncheck()
    await page.keyboard.press('Escape')

    await expect(page.getByText('Opens the guide (F1)')).toHaveCount(0)

    await trigger(page, 'Help').hover()

    await expect(page.getByText('Opens the guide (F1)')).toBeVisible()
    await expect(output(page, 'Asked')).toHaveText('false, false, false, false, true')
  })
})

test.describe('Tooltip on a dialog trigger', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'tooltip--on-dialog-trigger')
  })

  test('stays closed when the dialog closed with the pointer gives focus back to the trigger', async ({ page }) => {
    await trigger(page, 'Share').click()
    await page.getByRole('button', { name: 'Done' }).click()

    await expect(trigger(page, 'Share')).toBeFocused()
    await expect(tip(page)).toHaveCount(0)
  })

  test('opens when Escape closes the dialog and gives focus back to the trigger', async ({ page }) => {
    await trigger(page, 'Share').focus()
    await page.keyboard.press('Enter')

    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(trigger(page, 'Share')).toBeFocused()
    await expect(tip(page)).toHaveText('Shares the file')
  })
})
