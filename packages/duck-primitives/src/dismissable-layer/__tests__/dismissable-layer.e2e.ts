import { expect, type Locator, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

// Headless Chromium hides every scrollbar unless told otherwise.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

const layer = (page: Page, name = 'Layer') => page.getByRole('group', { name })
const output = (page: Page, name: string) => page.getByRole('status', { exact: true, name })
const button = (page: Page, name: string) => page.getByRole('button', { exact: true, name })
const check = (page: Page, name: string) => page.getByRole('checkbox', { name }).check()
const center = async (locator: Locator) => {
  const box = await locator.boundingBox()
  if (!box) throw new Error('No box')
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

test.describe('DismissableLayer', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dismissablelayer--basic')
  })

  test('stays open after the press that opened it, and closes on Escape', async ({ page }) => {
    await button(page, 'Open').click()

    await expect(layer(page)).toBeVisible()
    await expect(output(page, 'Events')).toHaveText('')

    await page.keyboard.press('Escape')

    await expect(layer(page)).toHaveCount(0)
    await expect(output(page, 'Events')).toHaveText('onEscapeKeyDown, onDismiss')
  })

  test('stays open on an Escape that onEscapeKeyDown prevents', async ({ page }) => {
    await check(page, 'Prevent Escape')
    await button(page, 'Open').click()
    await page.keyboard.press('Escape')

    await expect(output(page, 'Events')).toHaveText('onEscapeKeyDown')
    await expect(layer(page)).toBeVisible()
  })

  test('closes on a press outside, which still reaches what it pressed', async ({ page }) => {
    await button(page, 'Open').click()
    await button(page, 'Outside').click()

    await expect(layer(page)).toHaveCount(0)
    await expect(output(page, 'Events')).toHaveText('onPointerDownOutside, onInteractOutside, onDismiss')
    await expect(output(page, 'Outside presses')).toHaveText('1')
  })

  test('stays open on a press outside that onPointerDownOutside prevents', async ({ page }) => {
    await check(page, 'Prevent press outside')
    await button(page, 'Open').click()
    await page.getByText('Outside text').click()

    await expect(output(page, 'Events')).toHaveText('onPointerDownOutside, onInteractOutside')
    await expect(layer(page)).toBeVisible()
  })

  test('stays open while focus moves inside it, and closes once it moves outside', async ({ page }) => {
    await button(page, 'Open').click()
    await page.getByLabel('Inside field').click()
    await button(page, 'Inside').focus()

    await expect(layer(page)).toBeVisible()
    await expect(output(page, 'Events')).toHaveText('')

    await page.getByLabel('Outside field').focus()

    await expect(layer(page)).toHaveCount(0)
    await expect(output(page, 'Events')).toHaveText('onFocusOutside, onInteractOutside, onDismiss')
  })

  test('stays open on focus outside that onFocusOutside prevents', async ({ page }) => {
    await check(page, 'Prevent focus outside')
    await button(page, 'Open').click()
    await page.getByLabel('Outside field').focus()

    await expect(output(page, 'Events')).toHaveText('onFocusOutside, onInteractOutside')
    await expect(layer(page)).toBeVisible()
  })

  test('blocks the page once told to while open, and a press on the page closes it without reaching what it pressed', async ({
    page,
  }) => {
    await button(page, 'Open').click()
    await check(page, 'Block the page')

    await expect(page.locator('body')).toHaveCSS('pointer-events', 'none')
    await expect(layer(page)).toHaveCSS('pointer-events', 'auto')

    await button(page, 'Outside').click({ force: true })

    await expect(layer(page)).toHaveCount(0)
    await expect(output(page, 'Outside presses')).toHaveText('0')
    await expect(page.locator('body')).toHaveCSS('pointer-events', 'auto')

    await button(page, 'Outside').click()

    await expect(output(page, 'Outside presses')).toHaveText('1')
  })

  test('gives the page back once told to stop blocking it while open', async ({ page }) => {
    await button(page, 'Open').click()
    await check(page, 'Block the page')
    await expect(page.locator('body')).toHaveCSS('pointer-events', 'none')

    await page.getByRole('checkbox', { name: 'Block the page' }).uncheck()

    await expect(page.locator('body')).toHaveCSS('pointer-events', 'auto')

    await button(page, 'Outside').click()

    await expect(output(page, 'Outside presses')).toHaveText('1')
    await expect(layer(page)).toHaveCount(0)
  })
})

test.describe('DismissableLayer nested', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dismissablelayer--nested')
  })

  const openBoth = async (page: Page) => {
    await button(page, 'Open parent').click()
    await button(page, 'Open child').click()
    await expect(layer(page, 'Child')).toBeVisible()
  }

  test('closes the child on Escape, then the parent', async ({ page }) => {
    await openBoth(page)
    await page.keyboard.press('Escape')

    await expect(layer(page, 'Child')).toHaveCount(0)
    await expect(layer(page, 'Parent')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(layer(page, 'Parent')).toHaveCount(0)
  })

  test('closes neither on a press in the child portalled out of the parent, and only the child on one in the parent', async ({
    page,
  }) => {
    await openBoth(page)
    await button(page, 'Child button').click()

    await expect(layer(page, 'Child')).toBeVisible()
    await expect(layer(page, 'Parent')).toBeVisible()

    await button(page, 'Parent button').click()

    await expect(layer(page, 'Child')).toHaveCount(0)
    await expect(layer(page, 'Parent')).toBeVisible()
  })

  test('closes both on a press outside both, where focus stays put', async ({ page }) => {
    await openBoth(page)
    await page.getByText('Outside text').click()

    await expect(layer(page, 'Child')).toHaveCount(0)
    await expect(layer(page, 'Parent')).toHaveCount(0)
  })

  test('keeps a child over a parent that blocks the page pressable', async ({ page }) => {
    await check(page, 'Parent blocks the page')
    await openBoth(page)

    await expect(layer(page, 'Child')).toHaveCSS('pointer-events', 'auto')
    await expect(layer(page, 'Parent')).toHaveCSS('pointer-events', 'auto')

    await button(page, 'Child button').click()

    await expect(layer(page, 'Child')).toBeVisible()

    await button(page, 'Outside').click({ force: true })

    await expect(layer(page, 'Parent')).toHaveCount(0)
    await expect(output(page, 'Outside presses')).toHaveText('0')
  })

  test('blocks the parent under a child that blocks the page, and a press outside closes only the child', async ({
    page,
  }) => {
    await check(page, 'Child blocks the page')
    await openBoth(page)

    await expect(layer(page, 'Parent')).toHaveCSS('pointer-events', 'none')

    await button(page, 'Outside').click({ force: true })

    await expect(layer(page, 'Child')).toHaveCount(0)
    await expect(layer(page, 'Parent')).toBeVisible()
    await expect(layer(page, 'Parent')).toHaveCSS('pointer-events', 'auto')
    await expect(output(page, 'Outside presses')).toHaveText('0')

    await button(page, 'Outside').click()

    await expect(layer(page, 'Parent')).toHaveCount(0)
    await expect(output(page, 'Outside presses')).toHaveText('1')
  })
})

test.describe('DismissableLayer branch', () => {
  test('stays open on a press or focus in a branch, and closes on a press outside it', async ({ page }) => {
    await visitStory(page, 'dismissablelayer--branch')
    await button(page, 'Open').click()
    await button(page, 'Branch button').click()
    await page.getByLabel('Branch field').focus()

    await expect(layer(page)).toBeVisible()

    await button(page, 'Outside').click()

    await expect(layer(page)).toHaveCount(0)
  })
})

test.describe('DismissableLayer deferring a press outside', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dismissablelayer--deferred-press')
  })

  test('closes once the click lands, or on the press itself when it does not defer', async ({ page }) => {
    await button(page, 'Open').click()
    const outside = await center(button(page, 'Outside'))
    await page.mouse.move(outside.x, outside.y)
    await page.mouse.down()

    await expect(layer(page)).toBeVisible()

    await page.mouse.up()

    await expect(layer(page)).toHaveCount(0)
    await expect(output(page, 'Events')).toHaveText('onPointerDownOutside, onDismiss')

    await page.getByRole('checkbox', { name: 'Defer press outside' }).uncheck()
    await button(page, 'Open').click()
    await page.mouse.move(outside.x, outside.y)
    await page.mouse.down()

    await expect(layer(page)).toHaveCount(0)

    await page.mouse.up()
  })

  test('closes on a right press or a control press without waiting, since neither sends a click', async ({ page }) => {
    await button(page, 'Open').click()
    const outside = await center(button(page, 'Outside'))
    await page.mouse.move(outside.x, outside.y)
    await page.mouse.down({ button: 'right' })

    await expect(layer(page)).toHaveCount(0)

    await page.mouse.up({ button: 'right' })
    await button(page, 'Open').click()
    await page.keyboard.down('Control')
    await page.mouse.move(outside.x, outside.y)
    await page.mouse.down()

    await expect(layer(page)).toHaveCount(0)

    await page.mouse.up()
    await page.keyboard.up('Control')
  })

  test('stays open when code outside stops the click, and closes when it does not defer', async ({ page }) => {
    await button(page, 'Open').click()
    await button(page, 'Stops its click').click()

    await expect(output(page, 'Stops its click presses')).toHaveText('1')
    await expect(layer(page)).toBeVisible()
    await expect(output(page, 'Events')).toHaveText('')

    await page.getByRole('checkbox', { name: 'Defer press outside' }).uncheck()
    await button(page, 'Stops its click').click()

    await expect(layer(page)).toHaveCount(0)
  })

  test('closes on a press on a surface, though the surface stops its click', async ({ page }) => {
    await button(page, 'Open').click()
    await page.getByTestId('surface').click()

    await expect(layer(page)).toHaveCount(0)
    await expect(output(page, 'Events')).toHaveText('onPointerDownOutside, onDismiss')
    await expect(output(page, 'Behind presses')).toHaveText('0')
  })

  test('waits for the click after a tap even when it does not defer, so that click lands on the surface and not behind it', async ({
    page,
  }) => {
    await page.getByRole('checkbox', { name: 'Defer press outside' }).uncheck()
    await button(page, 'Open').click()
    await page.getByTestId('surface').tap()

    await expect(layer(page)).toHaveCount(0)
    await expect(output(page, 'Behind presses')).toHaveText('0')
  })
})

test.describe('DismissableLayer and scrollbars outside it', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dismissablelayer--scrollbars')
    await button(page, 'Open').click()
  })

  test('stays open on a press on a scrollbar outside it, on either side of a box, and closes on the box beside it', async ({
    page,
  }) => {
    const box = page.getByRole('region', { name: 'Scroll box ltr' })
    const room = await box.evaluate((node: HTMLElement) => node.offsetWidth - node.clientWidth)
    test.skip(
      room <= 2,
      'This browser draws its scrollbars over the box, taking no room, so a press on one is a press on the box',
    )
    const ltr = await box.boundingBox()
    const rtl = await page.getByRole('region', { name: 'Scroll box rtl' }).boundingBox()
    if (!ltr || !rtl) throw new Error('No box')

    await page.mouse.click(ltr.x + ltr.width - 6, ltr.y + 20)
    await expect(output(page, 'Events')).toHaveText('')
    await page.mouse.click(ltr.x + 20, ltr.y + ltr.height - 6)
    await expect(output(page, 'Events')).toHaveText('')
    await page.mouse.click(rtl.x + 6, rtl.y + 20)
    await expect(output(page, 'Events')).toHaveText('')

    await expect(layer(page)).toBeVisible()

    await page.mouse.click(rtl.x + rtl.width - 6, rtl.y + 20)

    await expect(layer(page)).toHaveCount(0)
  })

  test("stays open on a press on the page's own scrollbar", async ({ page }) => {
    const room = await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)
    test.skip(room === 0, 'This browser draws the page scrollbar over the page, taking no room')

    await page.mouse.click((page.viewportSize()?.width ?? 0) - 6, 300)

    await expect(layer(page)).toBeVisible()
  })
})

// macOS shows a scrollbar drawn over its box only while the box scrolls, and takes a press on it once it has grown
// under the pointer. A press on its track pages the box with an animation.
async function pressTrack(
  page: Page,
  scrolled: () => Promise<number>,
  over: { x: number; y: number },
  at: { x: number; y: number },
) {
  const before = await scrolled()
  await page.mouse.move(over.x, over.y)
  await page.mouse.wheel(0, 2)
  await expect.poll(scrolled).toBeGreaterThan(before)
  await page.mouse.move(at.x, at.y, { steps: 4 })
  await page.waitForTimeout(400)
  await page.mouse.down()
  await page.mouse.up()
}

const pages = (scrolled: () => Promise<number>, past: number) =>
  expect
    .poll(scrolled, { timeout: 2000 })
    .toBeGreaterThan(past)
    .then(
      () => true,
      () => false,
    )

test.describe('DismissableLayer and scrollbars drawn over what is outside it', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dismissablelayer--system-scrollbars')
  })

  // Skips unless this browser draws the box's scrollbar over it and takes a press on it, as WebKit on macOS does.
  async function overlayScrollbar(page: Page) {
    const box = page.getByRole('region', { name: 'Scroll box ltr' })
    const room = await box.evaluate((node: HTMLElement) => node.offsetWidth - node.clientWidth - 2)
    test.skip(room > 0, 'This browser draws its scrollbars beside the box, as the tests above cover')
    const { x, y, width } = (await box.boundingBox()) ?? { x: 0, y: 0, width: 0 }
    const scrolled = () => box.evaluate((node) => node.scrollTop)
    const press = () => pressTrack(page, scrolled, { x: x + 40, y: y + 20 }, { x: x + width - 6, y: y + 60 })
    await press()
    test.skip(!(await pages(scrolled, 40)), 'This browser takes no press on a scrollbar drawn over the box')
    await box.evaluate((node) => node.scrollTo(0, 0))
    return { press, scrolled, content: { x: x + 40, y: y + 20 } }
  }

  test('stays open on a press on a box scrollbar that takes no room, and closes on the box beside it', async ({
    page,
  }) => {
    const { press, scrolled, content } = await overlayScrollbar(page)
    await button(page, 'Open').click()

    await press()

    await expect.poll(scrolled).toBeGreaterThan(40)
    await expect(output(page, 'Events')).toHaveText('')
    await expect(layer(page)).toBeVisible()

    await page.mouse.click(content.x, content.y)

    await expect(layer(page)).toHaveCount(0)
  })

  test('closes when focus leaves once the press on that scrollbar is over', async ({ page }) => {
    const { press, scrolled } = await overlayScrollbar(page)
    await button(page, 'Open').click()
    await press()
    await expect.poll(scrolled).toBeGreaterThan(40)
    await expect(layer(page)).toBeVisible()

    await page.keyboard.press('Tab')

    await expect(layer(page)).toHaveCount(0)
    await expect(output(page, 'Events')).toHaveText('onFocusOutside')
  })

  test('stays open on Enter on a button inside it once the press on that scrollbar is over', async ({ page }) => {
    const { press, scrolled } = await overlayScrollbar(page)
    await button(page, 'Open').click()
    await press()
    await expect.poll(scrolled).toBeGreaterThan(40)

    await button(page, 'Inside').focus()
    await page.keyboard.press('Enter')

    await expect(output(page, 'Events')).toHaveText('')
    await expect(layer(page)).toBeVisible()
  })

  test("stays open on a press on the page's own scrollbar when it takes no room", async ({ page }) => {
    const room = await page.evaluate(() => window.innerWidth - document.documentElement.clientWidth)
    test.skip(room > 0, 'This browser draws the page scrollbar beside the page, as the test above covers')
    const width = page.viewportSize()?.width ?? 0
    const scrolled = () => page.evaluate(() => window.scrollY)
    await pressTrack(page, scrolled, { x: 600, y: 300 }, { x: width - 6, y: 500 })
    test.skip(!(await pages(scrolled, 100)), 'This browser takes no press on a scrollbar drawn over the page')
    await page.evaluate(() => window.scrollTo(0, 0))
    await button(page, 'Open').click()

    await pressTrack(page, scrolled, { x: 600, y: 300 }, { x: width - 6, y: 500 })

    await expect.poll(scrolled).toBeGreaterThan(100)
    await expect(output(page, 'Events')).toHaveText('')
    await expect(layer(page)).toBeVisible()
  })
})

test.describe('DismissableLayer in an iframe', () => {
  test('blocks only the frame, and hears presses and Escape only in the frame', async ({ page }) => {
    await visitStory(page, 'dismissablelayer--in-iframe')
    const frame = page.frameLocator('iframe[title="Frame"]')
    await frame.getByRole('button', { exact: true, name: 'Open' }).click()

    await expect(frame.getByRole('group', { name: 'Layer' })).toBeVisible()
    await expect(frame.locator('body')).toHaveCSS('pointer-events', 'none')
    await expect(page.locator('body')).toHaveCSS('pointer-events', 'auto')

    await button(page, 'Page button').click()
    await page.keyboard.press('Escape')

    await expect(output(page, 'Page button presses')).toHaveText('1')
    await expect(frame.getByRole('group', { name: 'Layer' })).toBeVisible()

    await frame.getByRole('button', { exact: true, name: 'Frame button' }).click({ force: true })

    await expect(frame.getByRole('group', { name: 'Layer' })).toHaveCount(0)
    await expect(frame.getByRole('status', { name: 'Frame button presses' })).toHaveText('0')
    await expect(frame.locator('body')).toHaveCSS('pointer-events', 'auto')

    await frame.getByRole('button', { exact: true, name: 'Open' }).click()
    await frame.getByRole('button', { exact: true, name: 'Inside' }).click()
    await page.keyboard.press('Escape')

    await expect(frame.getByRole('group', { name: 'Layer' })).toHaveCount(0)
  })
})

test.describe('DismissableLayer in a shadow root', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'dismissablelayer--in-shadow-root')
  })

  test('stays open on a press inside it, or a press or focus in its branch', async ({ page }) => {
    await button(page, 'Open').click()
    await button(page, 'Inside').click()
    await button(page, 'Branch button').click()
    await page.getByLabel('Branch field').focus()

    await expect(output(page, 'Events')).toHaveText('')
    await expect(layer(page)).toBeVisible()
  })

  test('closes once focus moves from inside it to an element outside it in the same shadow root', async ({ page }) => {
    await button(page, 'Open').click()
    await button(page, 'Inside').focus()
    await button(page, 'Outside').focus()

    await expect(output(page, 'Events')).toHaveText('onFocusOutside')
    await expect(layer(page)).toHaveCount(0)
  })

  for (const defer of [false, true]) {
    test(`closes on a press outside${defer ? ' once its click lands' : ''}, and names the element pressed`, async ({
      page,
    }) => {
      if (defer) await check(page, 'Defer press outside')
      await button(page, 'Open').click()
      await button(page, 'Outside').click()

      await expect(layer(page)).toHaveCount(0)
      await expect(output(page, 'Pressed')).toHaveText('Outside')
      await expect(output(page, 'Outside presses')).toHaveText('1')
    })
  }

  test('stays open on a press on a scrollbar beside it', async ({ page }) => {
    const box = page.getByRole('region', { name: 'Scroll box ltr' })
    const room = await box.evaluate((node: HTMLElement) => node.offsetWidth - node.clientWidth)
    test.skip(
      room <= 2,
      'This browser draws its scrollbars over the box, taking no room, so a press on one is a press on the box',
    )
    await button(page, 'Open').click()
    const { x, y, width } = (await box.boundingBox()) ?? { x: 0, y: 0, width: 0 }
    await page.mouse.click(x + width - 6, y + 20)

    await expect(output(page, 'Events')).toHaveText('')
    await expect(layer(page)).toBeVisible()
  })
})
