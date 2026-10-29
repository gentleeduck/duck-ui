import { expect, type Locator, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'
import { COMBINATION_ITEMS, COMBINATIONS, type ICombination } from '../__stories__/accordion.combinations'

type Scope = Page | Locator

const running = (locator: Locator) =>
  locator.evaluate((node) => node.getAnimations().filter((animation) => animation.playState === 'running').length)

const trigger = (scope: Scope, name: string) => scope.getByRole('button', { name, exact: true })
const item = (scope: Scope, value: string) => scope.locator(`[data-slot="accordion-item"][data-value="${value}"]`)
const content = (scope: Scope, value: string) => item(scope, value).locator(':scope > [data-slot="accordion-content"]')

// Firefox measures in 1/60px, so two reads of one size can differ in the fifth decimal.
const sizeVariable = (locator: Locator, side: 'height' | 'width') =>
  locator.evaluate(
    (node, side) => ({
      variable: Number.parseFloat(node.style.getPropertyValue(`--gentleduck-accordion-content-${side}`)),
      size: node.getBoundingClientRect()[side],
    }),
    side,
  )

// Playwright's WebKit counts a box under `content-visibility: hidden` as visible, though nothing of it is painted.
const expectUnseen = (locator: Locator) =>
  expect.poll(() => locator.evaluate((node) => node.checkVisibility({ visibilityProperty: true }))).toBe(false)

async function expectSettled(locator: Locator) {
  await expect.poll(() => running(locator)).toBe(0)
}

test.describe('Accordion', () => {
  test.describe('single and collapsible', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--single')
    })

    test('starts with every item closed and no content in the page', async ({ page }) => {
      await expect(page.locator('[data-slot="accordion-content"]')).toHaveCount(0)
      for (const name of ['Is it accessible?', 'Is it styled?', 'Is it animated?'])
        await expect(trigger(page, name)).toHaveAttribute('aria-expanded', 'false')
    })

    test('opens with an animation and exposes the open height for it', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()
      const opened = content(page, 'item-1')

      expect(await running(opened)).toBe(1)
      await expect(opened).toHaveAttribute('data-state', 'open')
      await expectSettled(opened)
      const { variable, size } = await sizeVariable(opened, 'height')
      expect(variable).toBeCloseTo(size, 2)
    })

    test('ties each trigger to the region it controls', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()
      const region = page.getByRole('region', { name: 'Is it accessible?' })

      await expect(region).toHaveText('Yes. It adheres to the WAI-ARIA design pattern.')
      await expect(trigger(page, 'Is it accessible?')).toHaveAttribute(
        'aria-controls',
        (await region.getAttribute('id')) ?? '',
      )
    })

    test('plays the exit animation of the open item before removing it when another opens', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()
      await expectSettled(content(page, 'item-1'))

      await trigger(page, 'Is it styled?').click()
      const closing = content(page, 'item-1')

      expect(await running(closing)).toBe(1)
      await expect(closing).toHaveAttribute('data-state', 'closed')
      await expect(closing).toHaveAttribute('aria-hidden', 'true')
      await expect(closing).toHaveCount(0)
      await expect(content(page, 'item-2')).toBeVisible()
    })

    test('collapses the open item when its trigger is pressed again', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()
      await expectSettled(content(page, 'item-1'))

      await trigger(page, 'Is it accessible?').click()

      expect(await running(content(page, 'item-1'))).toBe(1)
      await expect(trigger(page, 'Is it accessible?')).toHaveAttribute('aria-expanded', 'false')
      await expect(content(page, 'item-1')).toHaveCount(0)
    })

    test('passes over a trigger a stylesheet hides, since it cannot take focus', async ({ page }) => {
      await page.addStyleTag({ content: '[data-value="item-2"] { display: none }' })

      await trigger(page, 'Is it accessible?').focus()
      await page.keyboard.press('ArrowDown')

      await expect(trigger(page, 'Is it animated?')).toBeFocused()
    })

    test('opens and closes from the keyboard', async ({ page }) => {
      await trigger(page, 'Is it accessible?').focus()

      await page.keyboard.press('Enter')
      await expect(content(page, 'item-1')).toBeVisible()

      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Space')
      await expect(content(page, 'item-2')).toBeVisible()
      await expect(content(page, 'item-1')).toHaveCount(0)
    })

    test('moves focus with the arrow keys, Home and End, and wraps at the ends', async ({ page }) => {
      await trigger(page, 'Is it accessible?').focus()

      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it styled?')).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it accessible?')).toBeFocused()
      await page.keyboard.press('ArrowUp')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()
      await page.keyboard.press('Home')
      await expect(trigger(page, 'Is it accessible?')).toBeFocused()
      await page.keyboard.press('End')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()
    })
  })

  test.describe('open on load', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--default-open')
    })

    test('skips the open animation of an item open on load', async ({ page }) => {
      const opened = content(page, 'item-1')

      await expect(opened).toHaveAttribute('data-state', 'open')
      expect(await running(opened)).toBe(0)
    })

    test('exposes the open height of an item open on load', async ({ page }) => {
      const { variable, size } = await sizeVariable(content(page, 'item-1'), 'height')

      expect(variable).toBeCloseTo(size, 2)
    })

    test('plays every animation after the first frame', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()
      expect(await running(content(page, 'item-1'))).toBe(1)
      await expect(content(page, 'item-1')).toHaveCount(0)

      await trigger(page, 'Is it accessible?').click()
      expect(await running(content(page, 'item-1'))).toBe(1)
    })
  })

  test.describe('not collapsible', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--not-collapsible')
    })

    test('keeps the open item open when its trigger is pressed', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()

      await expect(trigger(page, 'Is it accessible?')).toHaveAttribute('aria-expanded', 'true')
      await expect(content(page, 'item-1')).toHaveAttribute('data-state', 'open')
      expect(await running(content(page, 'item-1'))).toBe(0)
    })

    test('still swaps the open item for another', async ({ page }) => {
      await trigger(page, 'Is it styled?').click()

      await expect(content(page, 'item-2')).toBeVisible()
      await expect(content(page, 'item-1')).toHaveCount(0)
    })
  })

  test.describe('without an animation', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--not-animated')
    })

    test('removes closed content at once', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()

      expect(await content(page, 'item-1').count()).toBe(0)
    })

    test('opens without an animation', async ({ page }) => {
      await trigger(page, 'Is it styled?').click()

      await expect(content(page, 'item-2')).toBeVisible()
      expect(await running(content(page, 'item-2'))).toBe(0)
    })
  })

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('opens and closes without waiting for an animation the page turned off', async ({ page }) => {
      await visitStory(page, 'accordion--default-open')

      await trigger(page, 'Is it accessible?').click()
      expect(await content(page, 'item-1').count()).toBe(0)

      await trigger(page, 'Is it styled?').click()
      await expect(content(page, 'item-2')).toBeVisible()
      expect(await running(content(page, 'item-2'))).toBe(0)
    })
  })

  test.describe('indicator', () => {
    test('turns with its item and stays out of the trigger name', async ({ page }) => {
      await visitStory(page, 'accordion--indicator')
      const indicator = item(page, 'item-1').locator('[data-slot="accordion-indicator"]')

      await expect(indicator).toHaveAttribute('aria-hidden', 'true')
      await expect(indicator).toHaveAttribute('data-state', 'closed')

      await trigger(page, 'Is it accessible?').click()

      expect(await running(indicator)).toBe(1)
      await expect(indicator).toHaveAttribute('data-state', 'open')
      await expectSettled(indicator)
      await expect(indicator).not.toHaveCSS('transform', 'none')
    })
  })

  test.describe('multiple', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--multiple')
    })

    test('keeps every opened item open, each with its own animation', async ({ page }) => {
      for (const [name, value] of [
        ['Is it accessible?', 'item-1'],
        ['Is it styled?', 'item-2'],
        ['What are some use cases for this component?', 'item-5'],
      ] as const) {
        await trigger(page, name).click()
        expect(await running(content(page, value))).toBe(1)
      }

      for (const value of ['item-1', 'item-2', 'item-5']) await expect(content(page, value)).toBeVisible()
      await expect(content(page, 'item-5').getByRole('listitem')).toHaveCount(4)
    })

    test('closes one item and leaves the others open', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()
      await trigger(page, 'Is it styled?').click()
      await expectSettled(content(page, 'item-2'))

      await trigger(page, 'Is it styled?').click()

      await expect(content(page, 'item-2')).toHaveCount(0)
      await expect(content(page, 'item-1')).toBeVisible()
    })

    test('turns each plus indicator with its own item', async ({ page }) => {
      await trigger(page, 'Is it styled?').click()

      await expect(item(page, 'item-2').locator('[data-slot="accordion-indicator"]')).toHaveAttribute(
        'data-state',
        'open',
      )
      await expect(item(page, 'item-1').locator('[data-slot="accordion-indicator"]')).toHaveAttribute(
        'data-state',
        'closed',
      )
    })
  })

  test.describe('right to left', () => {
    test('lays out right to left and keeps the vertical arrows', async ({ page }) => {
      await visitStory(page, 'accordion--rtl')
      const first = trigger(page, 'هل يدعم إمكانية الوصول؟')

      await expect(page.locator('[data-slot="accordion"]')).toHaveCSS('direction', 'rtl')
      await first.focus()
      await page.keyboard.press('ArrowLeft')
      await expect(first).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'هل يأتي بتنسيق جاهز؟')).toBeFocused()

      await page.keyboard.press('Enter')
      expect(await running(content(page, 'item-2'))).toBe(1)
    })
  })

  test.describe('styled trigger', () => {
    test('styles the open trigger from its state', async ({ page }) => {
      await visitStory(page, 'accordion--styled-trigger')

      await trigger(page, 'Is it styled?').click()

      await expect(trigger(page, 'Is it styled?')).toHaveCSS('font-weight', '600')
      await expect(trigger(page, 'Is it accessible?')).toHaveCSS('font-weight', '400')
    })
  })

  test.describe('force mounted', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--force-mount')
    })

    test('keeps every item in the page, the closed ones hidden', async ({ page }) => {
      for (const value of ['item-1', 'item-2', 'item-3']) {
        await expect(content(page, value)).toHaveAttribute('data-state', 'closed')
        await expect(content(page, value)).toHaveAttribute('aria-hidden', 'true')
        await expect(content(page, value)).toBeHidden()
      }
    })

    test('opens and closes with the item transition, keeping the content mounted', async ({ page }) => {
      await trigger(page, 'Is it accessible?').click()

      expect(await running(item(page, 'item-1'))).toBe(1)
      await expect(content(page, 'item-1')).toHaveAttribute('data-state', 'open')
      await expect(content(page, 'item-1')).toBeVisible()
      await expectSettled(item(page, 'item-1'))

      await trigger(page, 'Is it accessible?').click()

      expect(await running(item(page, 'item-1'))).toBe(1)
      await expect(content(page, 'item-1')).toBeHidden()
      await expect(content(page, 'item-1')).toHaveAttribute('data-state', 'closed')
    })
  })

  test.describe('hidden until found', () => {
    test('keeps closed content in the page for find-in-page', async ({ page }) => {
      await visitStory(page, 'accordion--hidden-until-found')

      for (const value of ['item-1', 'item-2', 'item-3']) {
        await expect(content(page, value)).toHaveAttribute('hidden', 'until-found')
        await expectUnseen(content(page, value).getByText(/working days|thirty days/))
      }
    })

    test('opens the item whose content the browser finds', async ({ page, browserName }) => {
      test.skip(browserName === 'firefox', 'Firefox looks for a text fragment once, at load, before the story renders')
      await page.goto('/iframe.html?id=components-accordion--hidden-until-found#:~:text=Refunds%20reach')

      await expect(trigger(page, 'How do refunds work?')).toHaveAttribute('aria-expanded', 'true')
      await expect(content(page, 'item-2')).not.toHaveAttribute('hidden')
      await expect(content(page, 'item-2')).toBeVisible()
    })

    test('hides the content until found again only once its exit animation ends', async ({ page }) => {
      await visitStory(page, 'accordion--hidden-until-found')
      await trigger(page, 'Can I exchange an item?').click()
      await expectSettled(content(page, 'item-3'))

      await trigger(page, 'Can I exchange an item?').click()

      expect(await running(content(page, 'item-3'))).toBe(1)
      await expect(content(page, 'item-3')).not.toHaveAttribute('hidden')
      await expect(content(page, 'item-3')).toHaveAttribute('hidden', 'until-found')
    })
  })

  test.describe('horizontal', () => {
    test('moves with the horizontal arrows only', async ({ page }) => {
      await visitStory(page, 'accordion--horizontal')
      await trigger(page, 'Is it accessible?').focus()

      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it accessible?')).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect(trigger(page, 'Is it styled?')).toBeFocused()
      await page.keyboard.press('ArrowLeft')
      await expect(trigger(page, 'Is it accessible?')).toBeFocused()
      await page.keyboard.press('ArrowLeft')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()
    })

    test('opens across with an animation and exposes the open width for it', async ({ page }) => {
      await visitStory(page, 'accordion--horizontal')

      await trigger(page, 'Is it styled?').click()
      const opened = content(page, 'item-2')

      expect(await running(opened)).toBe(1)
      await expect(opened).toHaveAttribute('data-orientation', 'horizontal')
      await expectSettled(opened)
      const { variable, size } = await sizeVariable(opened, 'width')
      expect(variable).toBeCloseTo(size, 2)
    })

    test('turns the arrows around right to left', async ({ page }) => {
      await visitStory(page, 'accordion--horizontal-rtl')
      await trigger(page, 'Is it accessible?').focus()

      await page.keyboard.press('ArrowLeft')
      await expect(trigger(page, 'Is it styled?')).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect(trigger(page, 'Is it accessible?')).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()
    })
  })

  test.describe('disabled', () => {
    test('disables every trigger and leaves the open item open', async ({ page }) => {
      await visitStory(page, 'accordion--disabled')

      await expect(page.locator('[data-slot="accordion"]')).toHaveAttribute('data-disabled', '')
      for (const name of ['Is it accessible?', 'Is it styled?', 'Is it animated?'])
        await expect(trigger(page, name)).toBeDisabled()
      await expect(content(page, 'item-1')).toBeVisible()
      await expect(content(page, 'item-1')).toHaveAttribute('data-disabled', '')
    })

    test('skips a disabled item with the arrow keys and keeps it closed', async ({ page }) => {
      await visitStory(page, 'accordion--disabled-item')

      await expect(trigger(page, 'Is it styled?')).toBeDisabled()
      await expect(item(page, 'item-2')).toHaveAttribute('data-disabled', '')
      await trigger(page, 'Is it accessible?').focus()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()
      await page.keyboard.press('ArrowUp')
      await expect(trigger(page, 'Is it accessible?')).toBeFocused()
      await expect(content(page, 'item-2')).toHaveCount(0)
    })
  })

  test.describe('without loop', () => {
    test('stops at the first and the last trigger', async ({ page }) => {
      await visitStory(page, 'accordion--no-loop')

      await trigger(page, 'Is it animated?').focus()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()

      await page.keyboard.press('Home')
      await page.keyboard.press('ArrowUp')
      await expect(trigger(page, 'Is it accessible?')).toBeFocused()
    })
  })

  test.describe('controlled', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--controlled')
    })

    test('opens what the parent sets, with the animation', async ({ page }) => {
      expect(await running(content(page, 'item-1'))).toBe(0)

      await page.getByRole('button', { name: 'Open item-2' }).click()

      expect(await running(content(page, 'item-2'))).toBe(1)
      await expect(content(page, 'item-2')).toHaveAttribute('data-state', 'open')
      await expect(content(page, 'item-1')).toHaveCount(0)
      await expect(page.locator('output')).toHaveText('value: item-2')
    })

    test('hands a trigger press to the parent', async ({ page }) => {
      await trigger(page, 'Is it animated?').click()

      await expect(page.locator('output')).toHaveText('value: item-3')
      await expect(content(page, 'item-3')).toBeVisible()

      await trigger(page, 'Is it animated?').click()

      await expect(page.locator('output')).toHaveText('value: none')
      await expect(content(page, 'item-3')).toHaveCount(0)
    })

    test('closes everything from outside', async ({ page }) => {
      await page.getByRole('button', { name: 'Close all' }).click()

      await expect(content(page, 'item-1')).toHaveCount(0)
      await expect(trigger(page, 'Is it accessible?')).toHaveAttribute('aria-expanded', 'false')
    })

    test('opens and closes several items for a multiple parent', async ({ page }) => {
      await visitStory(page, 'accordion--controlled-multiple')

      await page.getByRole('button', { name: 'Open all' }).click()
      for (const value of ['item-1', 'item-2', 'item-3']) await expect(content(page, value)).toBeVisible()
      await expect(page.locator('output')).toHaveText('value: item-1, item-2, item-3')

      await trigger(page, 'Is it styled?').click()
      await expect(page.locator('output')).toHaveText('value: item-1, item-3')

      await page.getByRole('button', { name: 'Close all' }).click()
      await expect(page.locator('output')).toHaveText('value: none')
      for (const value of ['item-1', 'item-2', 'item-3']) await expect(content(page, value)).toHaveCount(0)
    })
  })

  test.describe('events', () => {
    test('reports focus, opening and the value in the order they happen', async ({ page }) => {
      await visitStory(page, 'accordion--events')
      const log = page.locator('pre[aria-label="Events"]')

      await trigger(page, 'Is it accessible?').focus()
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Enter')

      await expect
        .poll(() => log.textContent())
        .toBe(
          [
            'focus item-1',
            'focus item-2',
            'item-2 opened',
            'value item-2',
            'focus item-3',
            'focus none',
            'focus item-3',
            'item-3 opened',
            'value item-3',
          ].join('\n'),
        )
    })
  })

  test.describe('nested', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--nested')
    })

    test('keeps the arrow keys among each accordion own triggers', async ({ page }) => {
      await trigger(page, 'Is it animated?').focus()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it accessible?')).toBeFocused()

      await trigger(page, 'Shipping').focus()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Returns')).toBeFocused()
      await page.keyboard.press('End')
      await expect(trigger(page, 'Payments')).toBeFocused()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Shipping')).toBeFocused()
      await page.keyboard.press('ArrowUp')
      await expect(trigger(page, 'Payments')).toBeFocused()
    })

    test('opens an inner item without touching the outer one', async ({ page }) => {
      await trigger(page, 'Is it styled?').click()

      await expect(content(page, 'item-2')).toBeVisible()
      await expect(trigger(page, 'Shipping')).toHaveAttribute('aria-expanded', 'true')
      expect(await running(content(page, 'shipping'))).toBe(0)
    })

    test('closes the outer item with the inner accordion inside it', async ({ page }) => {
      await trigger(page, 'Is it styled?').click()

      await trigger(page, 'Returns').click()

      expect(await running(content(page, 'shipping'))).toBe(1)
      await expect(content(page, 'shipping')).toHaveCount(0)
      await expect(trigger(page, 'Is it styled?')).toHaveCount(0)
      await expect(content(page, 'returns')).toBeVisible()
    })
  })

  test.describe('dynamic items', () => {
    test.beforeEach(async ({ page }) => {
      await visitStory(page, 'accordion--dynamic')
    })

    test('follows an item added before the others', async ({ page }) => {
      await page.getByRole('button', { name: 'Add an item first' }).click()

      await trigger(page, 'Is it accessible?').focus()
      await page.keyboard.press('ArrowUp')
      await expect(trigger(page, 'Is it new?')).toBeFocused()
      await page.keyboard.press('End')
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it new?')).toBeFocused()

      await page.keyboard.press('Enter')
      await expect(content(page, 'item-0')).toBeVisible()
    })

    test('skips an item once it is removed', async ({ page }) => {
      await page.getByRole('button', { name: 'Remove item-2' }).click()

      await trigger(page, 'Is it accessible?').focus()
      await page.keyboard.press('ArrowDown')
      await expect(trigger(page, 'Is it animated?')).toBeFocused()
    })
  })

  test.describe('as child', () => {
    test('renders each part as the element it is given and keeps working', async ({ page }) => {
      await visitStory(page, 'accordion--as-child')
      const root = page.locator('[data-slot="accordion"]')

      expect(await root.evaluate((node) => node.tagName)).toBe('SECTION')
      expect(await item(page, 'item-1').evaluate((node) => node.tagName)).toBe('ARTICLE')
      expect(
        await page
          .locator('[data-slot="accordion-header"]')
          .first()
          .evaluate((node) => node.tagName),
      ).toBe('H2')

      await trigger(page, 'Is it styled?').click()
      const region = page.getByRole('region', { name: 'Is it styled?' })

      expect(await running(region)).toBe(1)
      await expect(region).toBeVisible()
      expect(await region.evaluate((node) => node.tagName)).toBe('SECTION')
    })
  })
})

const LABELS: Record<string, string> = Object.fromEntries(COMBINATION_ITEMS.map((entry) => [entry.value, entry.label]))
const DISABLED = new Set<string>(COMBINATION_ITEMS.filter((entry) => entry.disabled).map((entry) => entry.value))

function keysFor({ orientation, dir }: ICombination) {
  if (orientation === 'vertical') return { next: 'ArrowDown', previous: 'ArrowUp', across: 'ArrowRight' }
  return dir === 'ltr'
    ? { next: 'ArrowRight', previous: 'ArrowLeft', across: 'ArrowDown' }
    : { next: 'ArrowLeft', previous: 'ArrowRight', across: 'ArrowDown' }
}

async function checkCombination(page: Page, combination: ICombination) {
  const { type, orientation, motion, mode } = combination
  const root = page.locator(`[data-combination="${combination.key}"]`)
  const animated = motion === 'animated'
  const button = (value: string) => trigger(root, LABELS[value])
  const moving = (value: string) => (mode === 'force-mount' ? item(root, value) : content(root, value))

  const expectOpen = async (value: string) => {
    await expect(button(value)).toHaveAttribute('aria-expanded', 'true')
    await expect(content(root, value)).toHaveAttribute('data-state', 'open')
    await expect(content(root, value)).toBeVisible()
  }
  const expectClosed = async (value: string) => {
    await expect(button(value)).toHaveAttribute('aria-expanded', 'false')
    if (mode === 'unmount') return expect(content(root, value)).toHaveCount(0)
    await expect(content(root, value)).toHaveAttribute('data-state', 'closed')
    await expectUnseen(content(root, value).getByText(`Answer ${value}`))
    // A disabled item stays out of find-in-page.
    if (mode === 'until-found') {
      await expect(content(root, value)).toHaveAttribute('hidden', DISABLED.has(value) ? '' : 'until-found')
      // Inert content is out of find-in-page too, so it is inert only while it animates closed.
      expect(await content(root, value).evaluate((node) => node.inert)).toBe(false)
    }
  }

  await expectOpen('one')
  expect(await running(moving('one'))).toBe(0)
  for (const value of ['two', 'three', 'four']) await expectClosed(value)
  await expect(button('four')).toBeDisabled()

  await button('two').click()
  if (animated) {
    expect(await running(moving('two'))).toBe(1)
    if (type === 'single') expect(await running(moving('one'))).toBe(1)
    // Content animating closed is out of reach of Tab. A force-mounted item animates itself, not its content.
    if (type === 'single' && mode !== 'force-mount')
      expect(await content(root, 'one').evaluate((node) => node.inert)).toBe(true)
  }
  await expectOpen('two')
  if (type === 'multiple') await expectOpen('one')
  else {
    await expect(button('one')).toHaveAttribute('aria-expanded', 'false')
    if (animated) await expect(content(root, 'one')).toHaveAttribute('data-state', 'closed')
    await expectClosed('one')
  }
  await expectSettled(moving('two'))
  if (mode !== 'force-mount') {
    const side = orientation === 'vertical' ? 'height' : 'width'
    const { variable, size } = await sizeVariable(content(root, 'two'), side)
    expect(variable).toBeCloseTo(size, 2)
  }

  await button('two').click()
  if (type === 'single') {
    await expectOpen('two')
    expect(await running(moving('two'))).toBe(0)
  } else {
    if (animated) expect(await running(moving('two'))).toBe(1)
    await expectClosed('two')
  }

  const keys = keysFor(combination)
  await button('one').focus()
  for (const [key, value] of [
    [keys.next, 'two'],
    [keys.next, 'three'],
    [keys.next, 'one'],
    [keys.previous, 'three'],
    ['Home', 'one'],
    ['End', 'three'],
    [keys.across, 'three'],
  ]) {
    await page.keyboard.press(key)
    await expect(button(value)).toBeFocused()
  }

  await page.keyboard.press('Enter')
  await expectOpen('three')
}

test.describe('Accordion combinations', () => {
  for (const combination of COMBINATIONS) {
    test(combination.key, async ({ page }) => {
      await visitStory(page, 'accordion--combinations')
      await checkCombination(page, combination)
    })
  }
})
