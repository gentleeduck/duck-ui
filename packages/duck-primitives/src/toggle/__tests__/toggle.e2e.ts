import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const toggle = (page: Page, name: string) => page.getByRole('button', { exact: true, name })
const output = (page: Page, name: string) => page.getByRole('status', { name })

test.describe('Toggle', () => {
  test('a click, Space and Enter each flip it, and the render function reads the state', async ({ page }) => {
    await visitStory(page, 'toggle--basic')
    const bold = toggle(page, 'Bold')

    await expect(bold).toHaveAttribute('aria-pressed', 'false')
    await expect(bold).toHaveText('Bold off')

    await bold.click()

    await expect(bold).toHaveAttribute('aria-pressed', 'true')
    await expect(bold).toHaveAttribute('data-state', 'on')
    await expect(bold).toHaveText('Bold on')

    await bold.press('Space')
    await bold.press('Enter')

    await expect(bold).toHaveAttribute('aria-pressed', 'true')
    await expect(output(page, 'Changes')).toHaveText('true, false, true')
  })

  test('defaultPressed starts it on, and it stays independent of the one beside it', async ({ page }) => {
    await visitStory(page, 'toggle--basic')

    await expect(toggle(page, 'Italic')).toHaveAttribute('aria-pressed', 'true')

    await toggle(page, 'Italic').click()

    await expect(toggle(page, 'Italic')).toHaveAttribute('aria-pressed', 'false')
    await expect(toggle(page, 'Bold')).toHaveAttribute('aria-pressed', 'false')
  })

  test('disabled, it neither flips nor takes focus', async ({ page }) => {
    await visitStory(page, 'toggle--basic')
    await page.getByRole('checkbox', { name: 'Disabled' }).check()
    const bold = toggle(page, 'Bold')

    await expect(bold).toBeDisabled()
    await expect(bold).toHaveAttribute('data-disabled', '')

    await bold.click({ force: true })
    await page.keyboard.press('Tab')

    await expect(bold).toHaveAttribute('aria-pressed', 'false')
    await expect(bold).not.toBeFocused()
    await expect(output(page, 'Changes')).toHaveText('')
  })

  test('controlled, it reports each press and moves only when its owner follows', async ({ page }) => {
    await visitStory(page, 'toggle--controlled')
    const mute = toggle(page, 'Mute')

    await mute.click()

    await expect(mute).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('checkbox', { name: 'Locked' }).check()
    await mute.click()

    await expect(mute).toHaveAttribute('aria-pressed', 'true')
    await expect(output(page, 'Asked')).toHaveText('true, false')

    await page.getByRole('checkbox', { name: 'Locked' }).uncheck()
    await mute.click()
    await page.getByRole('button', { name: 'Mute from outside' }).click()

    await expect(mute).toHaveAttribute('aria-pressed', 'true')
    await expect(output(page, 'Asked')).toHaveText('true, false, false')
  })

  test('asChild hands its state, class and ref to the child, and an onClick that prevents default keeps it as it is', async ({
    page,
  }) => {
    await visitStory(page, 'toggle--composed')
    const pin = toggle(page, 'Pin')

    await expect(output(page, 'Ref')).toHaveText('BUTTON')
    await expect(pin).toHaveClass(/composed/)
    await expect(pin).toHaveAttribute('data-state', 'on')

    await pin.click()

    await expect(pin).toHaveAttribute('aria-pressed', 'true')
    await expect(pin).toHaveText('Pinned')

    await page.getByRole('checkbox', { name: 'Allow unpin' }).check()
    await pin.click()

    await expect(pin).toHaveAttribute('aria-pressed', 'false')
    await expect(pin).toHaveText('Not pinned')
  })
})
