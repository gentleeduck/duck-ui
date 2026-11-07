import { type ElementHandle, expect, type FrameLocator, type Locator, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

type Box = { x: number; y: number; width: number; height: number }

const away = { x: 520, y: 390 }

async function box(locator: Locator): Promise<Box> {
  const found = await locator.boundingBox()
  if (!found) throw new Error('The element has no box.')
  return found
}

async function drag(page: Page, from: Locator, to: Locator, edge: 'start' | 'end' = 'end') {
  const start = await box(from)
  const end = await box(to)
  await page.mouse.move(start.x + 1, start.y + start.height / 2)
  await page.mouse.down()
  await page.mouse.move(edge === 'end' ? end.x + end.width - 1 : end.x + 1, end.y + end.height / 2, { steps: 5 })
  await page.mouse.up()
}

const selection = (root: Page | FrameLocator) =>
  root.locator('body').evaluate((body) => body.ownerDocument.getSelection()?.toString() ?? '')

const isConnected = (element: ElementHandle | null) => element?.evaluate((node) => node.isConnected)

async function watchFor(page: Page, label: string) {
  await page.evaluate((label) => {
    new MutationObserver((_, observer) => {
      if (!document.querySelector(`[aria-label="${label}"]`)) return
      document.documentElement.dataset.shown = label
      observer.disconnect()
    }).observe(document.body, { childList: true, subtree: true })
  }, label)
}

const shown = (page: Page) => page.evaluate(() => document.documentElement.dataset.shown ?? null)

test.describe('HoverCard delays', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'hovercard--delays')
  })

  test('waits openDelay before opening on hover, and closeDelay before closing once the pointer leaves', async ({
    page,
  }) => {
    await page.getByRole('link', { name: '@mallard' }).hover()

    await page.waitForTimeout(300)
    await expect(page.getByLabel('Mallard profile')).toHaveCount(0)
    await expect(page.getByLabel('Mallard profile')).toBeVisible()

    await page.mouse.move(0, 0)

    await page.waitForTimeout(200)
    await expect(page.getByLabel('Mallard profile')).toBeVisible()
    await expect(page.getByLabel('Mallard profile')).toHaveCount(0)
    await expect(page.getByLabel('Open cards')).toHaveText('none')
  })

  test('stays open while the pointer moves about on its trigger', async ({ page }) => {
    const trigger = await box(page.getByRole('link', { name: '@teal' }))
    await page.mouse.move(trigger.x + 2, trigger.y + trigger.height / 2)
    const card = await page.getByLabel('Teal profile').elementHandle()
    await page.mouse.move(trigger.x + trigger.width - 2, trigger.y + trigger.height / 2, { steps: 5 })
    await page.waitForTimeout(200)

    expect(await isConnected(card)).toBe(true)
  })

  test('keeps the same card open while the pointer moves from the trigger onto it', async ({ page }) => {
    await page.getByRole('link', { name: '@mallard' }).hover()
    const card = await page.getByLabel('Mallard profile').elementHandle()

    await page.getByRole('link', { name: 'Follow' }).hover()
    await page.waitForTimeout(700)

    expect(await isConnected(card)).toBe(true)
    await expect(page.getByLabel('Open cards')).toHaveText('mallard')
  })

  // WebKit leaves links out of the Tab order by default, so focus is moved directly.
  test('opens on focus, closes on Escape, and closes once focus leaves', async ({ page }) => {
    await page.getByRole('link', { name: '@teal' }).focus()

    await expect(page.getByLabel('Teal profile')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByLabel('Teal profile')).toHaveCount(0)

    await page.getByRole('link', { name: '@mallard' }).focus()
    await expect(page.getByLabel('Mallard profile')).toBeVisible()
    await page.getByRole('link', { name: '@mallard' }).blur()

    await expect(page.getByLabel('Mallard profile')).toHaveCount(0)
  })
})

test.describe('HoverCard controlled and disabled', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'hovercard--controlled-and-disabled')
  })

  test('opens from its owner, and closes on Escape through onOpenChange', async ({ page }) => {
    await page.getByRole('button', { name: 'Show card' }).click()

    await expect(page.getByLabel('Pintail profile')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByLabel('Pintail profile')).toHaveCount(0)
    await expect(page.getByLabel('Card')).toHaveText('closed')
  })

  test('closes once it is disabled while open, and stays shut on hover and focus while disabled', async ({ page }) => {
    await page.getByRole('button', { name: 'Show card' }).click()
    await expect(page.getByLabel('Pintail profile')).toBeVisible()

    await page.getByRole('checkbox', { name: 'Disabled' }).focus()
    await page.keyboard.press('Space')

    await expect(page.getByLabel('Pintail profile')).toHaveCount(0)
    await expect(page.getByLabel('Card')).toHaveText('closed')

    await page.getByRole('link', { name: '@pintail' }).hover()
    await page.getByRole('link', { name: '@pintail' }).focus()
    await page.waitForTimeout(100)

    await expect(page.getByLabel('Pintail profile')).toHaveCount(0)
  })
})

test.describe('HoverCard by touch', () => {
  test.use({ hasTouch: true })

  test('never shows the card for a tap on the trigger, even for a moment', async ({ page }) => {
    await visitStory(page, 'hovercard--delays')
    await watchFor(page, 'Teal profile')
    await page.getByRole('link', { name: '@teal' }).tap()
    await page.waitForTimeout(200)

    expect(await shown(page)).toBeNull()
    await expect(page.getByLabel('Open cards')).toHaveText('none')
  })
})

test.describe('HoverCard in a list', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'hovercard--list')
  })

  test('opens nothing for a pointer that sweeps across the triggers', async ({ page }) => {
    const first = await box(page.getByRole('link', { name: '@mallard' }))
    const last = await box(page.getByRole('link', { name: '@wigeon' }))
    const y = first.y + first.height / 2
    await page.mouse.move(first.x - 20, y)
    await page.mouse.move(last.x + last.width + 20, y, { steps: 20 })
    await page.mouse.move(last.x + last.width + 20, y + 200)
    await page.waitForTimeout(1000)

    await expect(page.getByLabel(/ profile$/)).toHaveCount(0)
  })

  test('hands the open card to the next trigger the pointer rests on', async ({ page }) => {
    await page.getByRole('link', { name: '@mallard' }).hover()

    await expect(page.getByLabel('Mallard profile')).toBeVisible()

    await page.getByRole('link', { name: '@teal' }).hover()

    await expect(page.getByLabel('Teal profile')).toBeVisible()
    await expect(page.getByLabel('Mallard profile')).toHaveCount(0)
  })
})

test.describe('HoverCard holding selected text', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'hovercard--selection')
    await page.getByRole('link', { name: '@gadwall' }).hover()
  })

  test('stays open once the pointer leaves after text in it is selected, until a press outside', async ({ page }) => {
    const text = page.getByText('Dabbles for pondweed.')
    await drag(page, text, text)

    expect(await selection(page)).toContain('Dabbles')

    await page.mouse.move(away.x, away.y)
    await page.waitForTimeout(300)

    await expect(page.getByLabel('Gadwall profile')).toBeVisible()

    await page.mouse.click(away.x, away.y)

    await expect(page.getByLabel('Gadwall profile')).toHaveCount(0)
  })

  test('keeps a drag that starts in the card from selecting the page', async ({ page }) => {
    await drag(page, page.getByText('Dabbles for pondweed.'), page.getByText('Page text below the card.'), 'start')

    expect(await selection(page)).not.toContain('Page text')
  })

  test('closes once the pointer leaves after a click that clears the text selected in it', async ({ page }) => {
    const text = page.getByText('Dabbles for pondweed.')
    await drag(page, text, text)
    await text.click()

    expect(await selection(page)).toBe('')

    await page.mouse.move(away.x, away.y)

    await expect(page.getByLabel('Gadwall profile')).toHaveCount(0)
  })

  test('closes as the pointer leaves the next time it opens, after it closed with text in it selected', async ({
    page,
  }) => {
    const text = page.getByText('Dabbles for pondweed.')
    await drag(page, text, text)
    await page.mouse.move(away.x, away.y)
    await page.waitForTimeout(300)

    await expect(page.getByLabel('Gadwall profile')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByLabel('Gadwall profile')).toHaveCount(0)

    await page.getByRole('link', { name: '@gadwall' }).hover()

    await expect(page.getByLabel('Gadwall profile')).toBeVisible()

    await page.mouse.move(away.x, away.y)

    await expect(page.getByLabel('Gadwall profile')).toHaveCount(0)
  })

  test('closes once the pointer leaves after a press that selected nothing', async ({ page }) => {
    await page.getByText('Dabbles for pondweed.').click()
    await page.mouse.move(away.x, away.y)

    await expect(page.getByLabel('Gadwall profile')).toHaveCount(0)
  })
})

test.describe('HoverCard whose content arrives late', () => {
  test('takes what arrives in it after it opens out of the tab order too', async ({ page }) => {
    await visitStory(page, 'hovercard--late-content')
    await page.getByRole('link', { name: '@shoveler' }).hover()

    await expect(page.getByRole('link', { name: 'Follow' })).toHaveAttribute('tabindex', '-1')
    await expect(page.getByRole('button', { name: 'Follow back' })).toHaveAttribute('tabindex', '-1')
  })
})

test.describe('HoverCard animated', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'hovercard--animated')
  })

  test('stays in the page until its exit animation ends', async ({ page }) => {
    const card = page.getByLabel('Scaup profile')
    await page.getByRole('link', { name: '@scaup' }).hover()

    await expect(card).toHaveAttribute('data-state', 'open')

    await page.mouse.move(away.x, away.y)

    await expect(card).toHaveAttribute('data-state', 'closed')
    await expect(card).toHaveCount(0)
  })

  test('stays in the page while closed when kept mounted', async ({ page }) => {
    const card = page.getByLabel('Scaup profile')
    await page.getByRole('checkbox', { name: 'Keep mounted' }).check()

    await expect(card).toHaveAttribute('data-state', 'closed')

    await page.getByRole('link', { name: '@scaup' }).hover()

    await expect(card).toHaveAttribute('data-state', 'open')

    await page.mouse.move(away.x, away.y)
    await page.waitForTimeout(700)

    await expect(card).toHaveAttribute('data-state', 'closed')
  })
})

test.describe('HoverCard with asChild', () => {
  test('puts the trigger and the content on the elements given to it', async ({ page }) => {
    await visitStory(page, 'hovercard--as-child')
    const trigger = page.getByRole('link', { name: 'Smew' })
    await trigger.hover()

    await expect(page.getByRole('article', { name: 'Smew profile' })).toHaveAttribute('data-slot', 'hover-card-content')
    await expect(trigger).toHaveAttribute('data-state', 'open')
  })
})

const sides: Record<string, (card: Box, trigger: Box) => boolean> = {
  top: (card, trigger) => card.y + card.height <= trigger.y,
  right: (card, trigger) => card.x >= trigger.x + trigger.width,
  bottom: (card, trigger) => card.y >= trigger.y + trigger.height,
  left: (card, trigger) => card.x + card.width <= trigger.x,
}

test.describe('HoverCard placement', () => {
  test.beforeEach(async ({ page }) => {
    await visitStory(page, 'hovercard--placement')
  })

  for (const [side, isOn] of Object.entries(sides)) {
    test(`opens on the ${side} of its trigger`, async ({ page }) => {
      const trigger = page.getByRole('link', { name: '@garganey' })
      const card = page.getByLabel('Garganey profile')
      await page.getByRole('radio', { exact: true, name: side }).check()
      await trigger.hover()

      await expect(card).toBeVisible()
      await expect.poll(async () => isOn(await box(card), await box(trigger))).toBe(true)
    })
  }

  test('puts the direction it is given on the card and not on the trigger', async ({ page }) => {
    const trigger = page.getByRole('link', { name: '@garganey' })
    await page.getByRole('checkbox', { name: 'Right to left' }).check()
    await trigger.hover()

    await expect(page.getByLabel('Garganey profile')).toHaveAttribute('dir', 'rtl')
    await expect(trigger).not.toHaveAttribute('dir')
  })
})

for (const [where, story, name, note, rootOf] of [
  [
    'in an iframe',
    'hovercard--in-iframe',
    'Eider',
    'Sea duck of the north.',
    (page: Page) => page.frameLocator('iframe[title="Frame"]'),
  ],
  ['in a shadow root', 'hovercard--in-shadow-root', 'Goldeneye', 'Whistling wings in winter.', (page: Page) => page],
] as const) {
  test.describe(`HoverCard ${where}`, () => {
    let root: Page | FrameLocator

    test.beforeEach(async ({ page }) => {
      await visitStory(page, story)
      root = rootOf(page)
      await root.getByRole('link', { name: `@${name.toLowerCase()}` }).hover()
    })

    test('closes once the pointer leaves after a press on it', async ({ page }) => {
      await root.getByText(note).click()
      await page.mouse.move(away.x, away.y)

      await expect(root.getByLabel(`${name} profile`)).toHaveCount(0)
    })

    test('stays open once the pointer leaves after text in it is selected', async ({ page }) => {
      await drag(page, root.getByText(note), root.getByText(note))
      await page.mouse.move(away.x, away.y)
      await page.waitForTimeout(300)

      await expect(root.getByLabel(`${name} profile`)).toBeVisible()
    })

    test('keeps a drag that starts in the card from selecting the text beside it', async ({ page }) => {
      await drag(page, root.getByText(note), root.getByText('Text beside the card.'), 'start')

      expect(await selection(root)).not.toContain('Text beside')
    })
  })
}

test.describe('HoverCard in an iframe, beside the page', () => {
  test('leaves the page selectable after a press on it', async ({ page }) => {
    await visitStory(page, 'hovercard--in-iframe')
    const frame = page.frameLocator('iframe[title="Frame"]')
    await frame.getByRole('link', { name: '@eider' }).hover()
    await frame.getByText('Sea duck of the north.').click()
    const text = page.getByText('Page text beside the frame.')
    await drag(page, text, text)

    expect(await selection(page)).toContain('Page text')
  })
})
