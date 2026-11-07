import { expect, type Locator, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const dialog = (page: Page) => page.getByRole('dialog', { name: 'Layer size' })
const state = (page: Page) => page.getByRole('status', { name: 'State' })

async function visit(page: Page, ...toggles: string[]) {
  await visitStory(page, 'popover--basic')
  for (const toggle of toggles) await page.getByRole('checkbox', { name: toggle }).check()
}

test.describe('Popover', () => {
  test('opens a dialog named by its title and described by its description, focusing the first field', async ({
    page,
  }) => {
    await visit(page)
    const trigger = page.getByRole('button', { name: 'Dimensions' })

    await trigger.click()

    await expect(dialog(page)).toHaveAccessibleDescription('Set the width and height of the layer.')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(trigger).toHaveAttribute('aria-controls', (await dialog(page).getAttribute('id')) ?? '')
    await expect(page.getByRole('textbox', { name: 'Width' })).toBeFocused()
  })

  test('closes on Escape and on its close button, handing focus back to the trigger', async ({ page }) => {
    await visit(page)
    const trigger = page.getByRole('button', { name: 'Dimensions' })

    await trigger.click()
    await page.keyboard.press('Escape')
    await expect(state(page)).toHaveText('closed')
    await expect(trigger).toBeFocused()
    await trigger.click()
    await page.getByRole('button', { name: 'Close' }).click()

    await expect(dialog(page)).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('opens from controlled state', async ({ page }) => {
    await visit(page)

    await page.getByRole('button', { name: 'Open from outside' }).click()

    await expect(dialog(page)).toBeVisible()
    await expect(state(page)).toHaveText('open')
  })

  test('without modal, lets an outside click reach the page and closes', async ({ page }) => {
    await visit(page)
    await page.getByRole('button', { name: 'Dimensions' }).click()

    await page.getByRole('button', { name: 'Outside', exact: true }).click()

    await expect(page.getByRole('status', { name: 'Outside clicks' })).toHaveText('1')
    await expect(state(page)).toHaveText('closed')
  })

  test('modal, holds focus inside, hides the page from a screen reader and swallows an outside click', async ({
    page,
  }) => {
    await visit(page, 'Modal')
    await page.getByRole('button', { name: 'Dimensions' }).click()

    await page.getByRole('button', { name: 'Close' }).focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('textbox', { name: 'Width' })).toBeFocused()
    await expect(page.getByRole('button', { name: 'Outside', exact: true })).toHaveCount(0)
    await page.mouse.click(5, 5)

    await expect(state(page)).toHaveText('closed')
    await expect(page.getByRole('status', { name: 'Outside clicks' })).toHaveText('0')
  })

  test('focuses the field it is given on open, and leaves focus alone on close when told to', async ({ page }) => {
    await visit(page, 'Focus height first', 'Leave focus on close')
    const trigger = page.getByRole('button', { name: 'Dimensions' })

    await trigger.click()
    await expect(page.getByRole('textbox', { name: 'Height' })).toBeFocused()
    await page.keyboard.press('Escape')

    await expect(state(page)).toHaveText('closed')
    await expect(trigger).not.toBeFocused()
  })

  test('sits beside a custom anchor instead of the trigger, on the side asked, the arrow past its offset', async ({
    page,
  }) => {
    await visit(page, 'Custom anchor', 'Side right')
    await page.getByRole('button', { name: 'Dimensions' }).click()

    const anchor = await page.getByText('Anchor', { exact: true }).boundingBox()
    const content = await dialog(page).boundingBox()

    expect(anchor && content && Math.round(content.x - (anchor.x + anchor.width))).toBe(15)
  })

  test('writes its direction on the content', async ({ page }) => {
    await visit(page, 'Right-to-left')

    await page.getByRole('button', { name: 'Dimensions' }).click()

    await expect(dialog(page)).toHaveAttribute('dir', 'rtl')
  })

  test('kept mounted, stays in the page while closed, marked closed', async ({ page }) => {
    await visit(page, 'Keep mounted')

    await expect(page.locator('[role="dialog"]')).toHaveAttribute('data-state', 'closed')
    await page.getByRole('button', { name: 'Dimensions' }).click()

    await expect(dialog(page)).toHaveAttribute('data-state', 'open')
  })
})

test.describe('Popover animated', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'popover--animated')
  })

  test('stays in the page until its exit animation ends, then hands focus back', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Filters' })
    const panel = page.locator('[role="dialog"][aria-label="Filters"]')
    await trigger.click()

    await expect(panel).toHaveAttribute('data-state', 'open')

    await page.keyboard.press('Escape')

    await expect(panel).toHaveAttribute('data-state', 'closed')
    await expect(panel).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('leaves focus where the user clicked once its exit animation ends', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Filters' })
    const panel = page.locator('[role="dialog"][aria-label="Filters"]')
    await trigger.click()
    await expect(panel).toHaveAttribute('data-state', 'open')
    const viewport = page.viewportSize() ?? { width: 800, height: 600 }

    await page.mouse.click(viewport.width - 5, viewport.height - 5)

    await expect(panel).toHaveCount(0)
    await page.waitForTimeout(100)
    await expect(trigger).not.toBeFocused()
  })

  test('hands focus back to the trigger after a keyboard reopens it during its exit animation', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Filters' })
    const panel = page.locator('[role="dialog"][aria-label="Filters"]')
    await trigger.click()
    await expect(panel).toHaveAttribute('data-state', 'open')
    const viewport = page.viewportSize() ?? { width: 800, height: 600 }
    await page.mouse.click(viewport.width - 5, viewport.height - 5)
    await expect(panel).toHaveAttribute('data-state', 'closed')

    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(panel).toHaveAttribute('data-state', 'open')
    await page.getByRole('checkbox', { name: 'In stock' }).focus()
    await page.keyboard.press('Escape')

    await expect(panel).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('stays in the page while closed when kept mounted', async ({ page }) => {
    const panel = page.locator('[role="dialog"][aria-label="Filters"]')
    await page.getByRole('checkbox', { name: 'Keep mounted' }).check()

    await expect(panel).toHaveAttribute('data-state', 'closed')

    await page.getByRole('button', { name: 'Filters' }).click()

    await expect(panel).toHaveAttribute('data-state', 'open')

    await page.getByRole('button', { name: 'Done' }).click()
    await page.waitForTimeout(600)

    await expect(panel).toHaveAttribute('data-state', 'closed')
  })
})

type Box = { x: number; y: number; width: number; height: number }

async function box(locator: Locator): Promise<Box> {
  const found = await locator.boundingBox()
  if (!found) throw new Error('The element has no box.')
  return found
}

const sides: Record<string, (content: Box, trigger: Box) => boolean> = {
  top: (content, trigger) => content.y + content.height <= trigger.y,
  right: (content, trigger) => content.x >= trigger.x + trigger.width,
  bottom: (content, trigger) => content.y >= trigger.y + trigger.height,
  left: (content, trigger) => content.x + content.width <= trigger.x,
}

test.describe('Popover placement', () => {
  async function place(page: Page, side: string, align: string, rtl = false) {
    await visitStory(page, 'popover--placement')
    await page.getByRole('radio', { exact: true, name: side }).check()
    await page.getByRole('radio', { exact: true, name: align }).check()
    if (rtl) await page.getByRole('checkbox', { name: 'Right to left' }).check()
    const trigger = page.getByRole('button', { name: 'Placed' })
    await trigger.click()
    const content = page.getByRole('dialog', { name: 'Placement' })
    await expect(content).toBeVisible()
    return { trigger, content }
  }

  for (const [side, isOn] of Object.entries(sides)) {
    test(`opens on the ${side} of its trigger`, async ({ page }) => {
      const { trigger, content } = await place(page, side, 'center')

      await expect.poll(async () => isOn(await box(content), await box(trigger))).toBe(true)
    })
  }

  test('lines its start up with the start of the trigger, the right edge right to left', async ({ page }) => {
    const ltr = await place(page, 'bottom', 'start')
    const [content, trigger] = [await box(ltr.content), await box(ltr.trigger)]
    const rtl = await place(page, 'bottom', 'start', true)
    const [rtlContent, rtlTrigger] = [await box(rtl.content), await box(rtl.trigger)]
    const end = (edge: Box) => edge.x + edge.width

    expect([content.x - trigger.x, end(rtlContent) - end(rtlTrigger)].map((gap) => Math.abs(gap) <= 1)).toEqual([
      true,
      true,
    ])
    await expect(rtl.content).toHaveAttribute('dir', 'rtl')
    await expect(rtl.trigger).not.toHaveAttribute('dir')
  })

  test('opens on the right for the left side, right to left', async ({ page }) => {
    const { trigger, content } = await place(page, 'left', 'center', true)

    await expect.poll(async () => sides.right?.(await box(content), await box(trigger))).toBe(true)
  })
})

for (const modal of [false, true]) {
  test.describe(`Popover nested${modal ? ', modal' : ''}`, () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'popover--nested')
      if (modal) await page.getByRole('checkbox', { name: 'Modal' }).check()
      await page.getByRole('button', { name: 'Share' }).click()
      await page.getByRole('button', { name: 'Permissions' }).click()
    })

    test('takes focus into the inner one and closes one layer per Escape', async ({ page }) => {
      await expect(page.getByRole('radio', { name: 'Can view' })).toBeFocused()
      await page.getByRole('radio', { name: 'Can edit' }).click()
      await expect(page.locator('[role="dialog"][aria-label="Share"]')).toBeVisible()

      await page.keyboard.press('Escape')

      await expect(page.getByRole('dialog', { name: 'Permissions' })).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Permissions' })).toBeFocused()

      await page.keyboard.press('Escape')

      await expect(page.getByRole('dialog', { name: 'Share' })).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Share' })).toBeFocused()
    })

    test(`closes on a press on the outer one, which stays open${modal ? ' and never sees the press' : ''}`, async ({
      page,
    }) => {
      const link = page.locator('input[readonly]')
      const { x, y, width, height } = await box(link)

      await page.mouse.click(x + width / 2, y + height / 2)

      await expect(page.getByRole('dialog', { name: 'Permissions' })).toHaveCount(0)
      await expect(page.getByRole('dialog', { name: 'Share' })).toBeVisible()
      await expect(modal ? page.getByRole('button', { name: 'Permissions' }) : link).toBeFocused()
    })
  })
}

test.describe('Popover with asChild', () => {
  test('puts the trigger and the content on the elements given to it', async ({ page }) => {
    await visitStory(page, 'popover--as-child')
    const trigger = page.getByRole('button', { name: 'Text colour' })

    await trigger.click()
    const content = page.getByRole('dialog', { name: 'Colours' })

    await expect(content).toHaveJSProperty('tagName', 'SECTION')
    await expect(content).toHaveAttribute('data-slot', 'popover-content')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await page.getByRole('button', { name: 'Moss' }).click()

    await expect(content).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })
})

test.describe('Popover in a scrolling box', () => {
  test('hides while its trigger is scrolled out of the box, and shows again when it is back', async ({ page }) => {
    await visitStory(page, 'popover--in-scroll-box')
    const orders = page.getByRole('region', { name: 'Orders' })
    await page.getByRole('button', { name: 'Order 1042' }).click()
    const details = page.getByRole('dialog', { name: 'Order details' })
    await expect(details).toBeVisible()

    await orders.evaluate((node) => node.scrollTo(0, 300))

    await expect(details).toBeHidden()

    await orders.evaluate((node) => node.scrollTo(0, 0))

    await expect(details).toBeVisible()
  })
})
