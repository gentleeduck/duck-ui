import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const trigger = (page: Page, name: string) => page.getByRole('button', { exact: true, name })
const CLOCK_START = new Date('2026-01-01T08:00:00Z')
const CLOCK_PAUSED = new Date('2026-01-01T09:00:00Z')
const link = (page: Page, name: string) => page.getByRole('link', { exact: true, name })
const viewport = (page: Page) => page.locator('[data-slot="navigation-menu-viewport"]')
const indicator = (page: Page) => page.locator('[data-slot="navigation-menu-indicator"]')

async function box(page: Page, selector: ReturnType<Page['locator']>) {
  const rect = await selector.boundingBox()
  if (!rect) throw new Error('no box')
  return rect
}

test.describe('NavigationMenu', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'navigationmenu--basic')
  })

  test('opens on hover, sizes the viewport to the open content, and moves to the next item at once', async ({
    page,
  }) => {
    await page.clock.install({ time: CLOCK_START })
    await trigger(page, 'Learn').hover()

    await expect(link(page, 'Stitches')).toBeVisible()
    await expect(page.getByLabel('Open item')).toHaveText('learn')
    const learn = await box(page, page.locator('[data-slot="navigation-menu-content"]'))
    await expect.poll(async () => (await box(page, viewport(page))).width).toBeCloseTo(learn.width, 0)

    // The page clock holds still across the hover, so only a switch that waits for no delay can pass.
    await page.clock.pauseAt(CLOCK_PAUSED)
    await trigger(page, 'Overview').hover()

    await expect(page.getByLabel('Open item')).toHaveText('overview')
    await page.clock.resume()
    await expect(link(page, 'Releases')).toBeVisible()
    await expect.poll(async () => (await box(page, viewport(page))).width).toBeGreaterThan(learn.width)
  })

  test('draws the indicator under the open trigger, not under the first one', async ({ page }) => {
    await trigger(page, 'Overview').hover()
    await expect(indicator(page)).toHaveAttribute('data-state', 'visible')

    const overview = await box(page, trigger(page, 'Overview'))
    await expect.poll(async () => (await box(page, indicator(page))).x).toBeCloseTo(overview.x, 0)
    expect((await box(page, indicator(page))).width).toBeCloseTo(overview.width, 0)
  })

  test('closes once a link is chosen', async ({ page }) => {
    await trigger(page, 'Learn').hover()
    await link(page, 'Colors').click()

    await expect(page.getByLabel('Selected link')).toHaveText('Colors')
    await expect(page.getByLabel('Open item')).toHaveText('none')
    await expect(link(page, 'Colors')).toHaveCount(0)
  })

  test('stays open after a link is clicked with Shift held, which opens it outside the page', async ({ page }) => {
    await trigger(page, 'Learn').hover()
    await link(page, 'Colors').click({ modifiers: ['Shift'] })

    await expect(page.getByLabel('Selected link')).toHaveText('Colors')
    await expect(link(page, 'Colors')).toBeVisible()
  })

  test('stays open after a link is chosen when asked to keep open on select', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Keep open on select' }).check()
    await trigger(page, 'Learn').hover()
    await link(page, 'Colors').click()

    await expect(page.getByLabel('Selected link')).toHaveText('Colors')
    await expect(page.getByLabel('Open item')).toHaveText('learn')
  })

  test('force mounted, keeps every content in the document and shows only the open one', async ({ page }) => {
    const hidden = (name: string) => page.locator(`a[href="#${name}"]`)
    await page.getByRole('checkbox', { name: 'Force mount' }).check()

    await expect(viewport(page)).toBeAttached()
    await expect(hidden('Stitches')).toBeAttached()
    await expect(hidden('Stitches')).toBeHidden()

    await trigger(page, 'Learn').hover()

    await expect(link(page, 'Stitches')).toBeVisible()
    await expect(hidden('Introduction')).toBeAttached()
    await expect(hidden('Introduction')).toBeHidden()

    await page.mouse.move(0, 0)

    await expect(page.getByLabel('Open item')).toHaveText('none')
    await expect(hidden('Stitches')).toBeAttached()
    await expect(hidden('Stitches')).toBeHidden()
    await expect(indicator(page)).toHaveAttribute('data-state', 'hidden')
  })

  test('tabs from a trigger through its links and on to the next trigger, and Escape returns to the trigger', async ({
    page,
  }) => {
    await trigger(page, 'Learn').focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')

    await expect(link(page, 'Stitches')).toBeFocused()

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    await expect(trigger(page, 'Overview')).toBeFocused()

    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowDown')

    await expect(link(page, 'Introduction')).toBeFocused()

    await page.keyboard.press('Escape')

    await expect(page.getByLabel('Open item')).toHaveText('none')
    await expect(trigger(page, 'Overview')).toBeFocused()
  })

  test('passes over a disabled trigger with the arrows, and opens nothing under the pointer', async ({ page }) => {
    await trigger(page, 'Soon').hover({ force: true })
    await page.waitForTimeout(400)

    await expect(page.getByLabel('Open item')).toHaveText('none')

    await trigger(page, 'Overview').focus()
    await page.keyboard.press('ArrowRight')

    await expect(link(page, 'Blog')).toBeFocused()
    await expect(link(page, 'Blog')).toHaveAttribute('aria-current', 'page')
  })

  test('in manual mode opens on a click only, and stays open once the pointer leaves', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Manual' }).check()
    await trigger(page, 'Learn').hover()
    await page.waitForTimeout(400)

    await expect(page.getByLabel('Open item')).toHaveText('none')

    await trigger(page, 'Learn').click()
    await page.mouse.move(0, 0)
    await page.waitForTimeout(400)

    await expect(link(page, 'Stitches')).toBeVisible()
  })

  test('without a viewport, draws the content in its item', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Viewport' }).uncheck()
    await trigger(page, 'Learn').hover()

    await expect(viewport(page)).toHaveCount(0)
    await expect(page.getByRole('listitem').filter({ has: link(page, 'Stitches') })).toHaveCount(1)
  })

  test('vertical, moves between triggers on the up and down arrows and enters content on the right one', async ({
    page,
  }) => {
    await page.getByRole('checkbox', { name: 'Vertical' }).check()
    await trigger(page, 'Learn').focus()
    await page.keyboard.press('ArrowDown')

    await expect(trigger(page, 'Overview')).toBeFocused()

    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')

    await expect(link(page, 'Introduction')).toBeFocused()

    const overview = await box(page, trigger(page, 'Overview'))
    await expect.poll(async () => (await box(page, indicator(page))).y).toBeCloseTo(overview.y, 0)
  })

  test('right to left, moves to the next trigger on ArrowLeft', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Right-to-left' }).check()
    await trigger(page, 'Learn').focus()
    await page.keyboard.press('ArrowLeft')

    await expect(trigger(page, 'Overview')).toBeFocused()
  })
})

test.describe('NavigationMenu timing', () => {
  const open = (page: Page) => page.getByLabel('Open item')
  const field = (page: Page, name: string) => page.getByLabel(name, { exact: true })

  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'navigationmenu--timing')
  })

  test('waits delayDuration before it opens the item under the pointer', async ({ page }) => {
    await field(page, 'delayDuration').fill('1000')
    await trigger(page, 'Learn').hover()
    await page.waitForTimeout(500)

    await expect(open(page)).toHaveText('none')
    await expect(open(page)).toHaveText('learn')
  })

  test('keeps an item open for closeDelay after the pointer leaves it', async ({ page }) => {
    await field(page, 'closeDelay').fill('1000')
    await trigger(page, 'Learn').hover()
    await expect(open(page)).toHaveText('learn')

    await page.mouse.move(0, 0)
    await page.waitForTimeout(500)

    await expect(open(page)).toHaveText('learn')
    await expect(open(page)).toHaveText('none')
  })

  test('leaves an item a double-click closed shut once the open delay the pointer started runs out', async ({
    page,
  }) => {
    await field(page, 'delayDuration').fill('1000')
    await trigger(page, 'Learn').dblclick()
    await page.waitForTimeout(1300)

    await expect(open(page)).toHaveText('none')
  })

  test('with no skipDelayDuration, waits out the open delay again from one item to the next', async ({ page }) => {
    await field(page, 'skipDelayDuration').fill('0')
    await field(page, 'delayDuration').fill('600')
    await trigger(page, 'Learn').hover()
    await expect(open(page)).toHaveText('learn')

    await trigger(page, 'Overview').hover()
    await page.waitForTimeout(300)

    await expect(open(page)).toHaveText('none')
    await expect(open(page)).toHaveText('overview')
  })
})

test.describe('NavigationMenu viewport children', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'navigationmenu--viewport-children')
  })

  test('draws its own children before the content', async ({ page }) => {
    await trigger(page, 'Learn').hover()

    await expect(viewport(page).locator(':scope > *').first()).toHaveAttribute('data-testid', 'viewport-bar')
    await expect(viewport(page).getByRole('link', { name: 'Stitches' })).toBeVisible()
  })

  test('with asChild, is its child element and draws the content inside it, sized to the content', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'asChild' }).check()
    await trigger(page, 'Learn').hover()
    const panel = page.getByRole('region', { name: 'Menu panel' })

    await expect(panel).toHaveAttribute('data-slot', 'navigation-menu-viewport')
    await expect(panel.getByTestId('viewport-bar')).toBeAttached()
    await expect(panel.getByRole('link', { name: 'Stitches' })).toBeVisible()
    const content = await box(page, page.locator('[data-slot="navigation-menu-content"]'))
    await expect.poll(async () => (await box(page, panel)).width).toBeCloseTo(content.width, 0)
  })
})

test.describe('NavigationMenu sub menu', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'navigationmenu--submenu')
  })

  test('opens the sub item under the pointer in place of its default', async ({ page }) => {
    await trigger(page, 'Products').hover()
    await expect(link(page, 'Plugins')).toBeVisible()

    await trigger(page, 'Security').hover()

    await expect(link(page, 'Audit log')).toBeVisible()
    await expect(link(page, 'Plugins')).toHaveCount(0)
  })

  test('in manual mode, opens a sub item on a click only', async ({ page }) => {
    await page.getByRole('radio', { name: 'manual' }).check()
    await trigger(page, 'Products').hover()
    await trigger(page, 'Security').hover()
    await page.waitForTimeout(300)

    await expect(link(page, 'Plugins')).toBeVisible()

    await trigger(page, 'Security').click()

    await expect(link(page, 'Audit log')).toBeVisible()
  })

  test("takes the root's manual mode unless given its own", async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Manual' }).check()
    await trigger(page, 'Products').click()
    await trigger(page, 'Security').hover()
    await page.waitForTimeout(300)

    await expect(link(page, 'Plugins')).toBeVisible()
  })

  test('opens the sub item under the pointer when given automatic under a manual root', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Manual' }).check()
    await page.getByRole('radio', { name: 'automatic' }).check()
    await trigger(page, 'Products').click()
    await trigger(page, 'Security').hover()

    await expect(link(page, 'Audit log')).toBeVisible()
  })

  test('keeps the open sub item when its trigger is clicked again', async ({ page }) => {
    await trigger(page, 'Products').hover()
    await trigger(page, 'Extensibility').click()
    await page.waitForTimeout(300)

    await expect(link(page, 'Plugins')).toBeVisible()
  })

  test('closes the open sub item when its trigger is clicked again, when asked to', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Close on a second click' }).check()
    await trigger(page, 'Products').hover()
    await trigger(page, 'Extensibility').click()

    await expect(link(page, 'Plugins')).toHaveCount(0)
    await expect(trigger(page, 'Products')).toHaveAttribute('aria-expanded', 'true')
    await expect(trigger(page, 'Security')).toBeVisible()
  })

  test('closes the whole menu on Escape inside the sub menu and hands focus to the top trigger', async ({ page }) => {
    await trigger(page, 'Products').hover()
    await link(page, 'Plugins').focus()
    await page.keyboard.press('Escape')

    await expect(link(page, 'Plugins')).toHaveCount(0)
    await expect(trigger(page, 'Products')).toBeFocused()
  })
})
