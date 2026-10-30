import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const VARIABLES = ['--svg-off', '--svg-on', '--svg-indeterminate']

const mask = (page: Page) =>
  page.getByRole('checkbox').evaluate((input) => getComputedStyle(input, '::after').maskImage)

test.describe('Checkers', () => {
  test('hands over every indicator as an image that decodes, one written without a namespace included', async ({
    page,
  }) => {
    await visitStory(page, 'checkers--checkbox')

    const decoded = await page.getByRole('checkbox').evaluate(async (input, names) => {
      return Promise.all(
        names.map(async (name) => {
          const image = new Image()
          image.src = input.style.getPropertyValue(name).slice(5, -2)
          return image.decode().then(
            () => true,
            () => false,
          )
        }),
      )
    }, VARIABLES)

    expect(decoded).toEqual([true, true, true])
  })

  test('masks the input with the indicator of the state it is in', async ({ page }) => {
    await visitStory(page, 'checkers--checkbox')
    const checkbox = page.getByRole('checkbox')
    const url = (name: string) => checkbox.evaluate((input, name) => input.style.getPropertyValue(name), name)

    expect(await mask(page)).toBe(await url('--svg-off'))

    await checkbox.check()
    expect(await mask(page)).toBe(await url('--svg-on'))

    await page.getByRole('button', { name: 'Mixed' }).click()
    expect(await mask(page)).toBe(await url('--svg-indeterminate'))
  })
})

test.describe('Checkers switch', () => {
  test('masks a switch with the thumb of the state it is in, and toggles on Space', async ({ page }) => {
    await visitStory(page, 'checkers--switch')
    const wifi = page.getByRole('switch', { name: 'Wi-Fi' })
    const url = (name: string) => wifi.evaluate((input, name) => input.style.getPropertyValue(name), name)
    const masked = () => wifi.evaluate((input) => getComputedStyle(input, '::after').maskImage)

    expect(await masked()).toBe(await url('--svg-off'))

    await wifi.press('Space')
    await expect(wifi).toBeChecked()
    expect(await masked()).toBe(await url('--svg-on'))
  })
})

test.describe('Checkers indicator', () => {
  test('redraws the mask when the indicator it was given changes', async ({ page }) => {
    await visitStory(page, 'checkers--changing-indicator')
    const done = page.getByRole('checkbox', { name: 'Done' })
    const on = () => done.evaluate((input) => input.style.getPropertyValue('--svg-on'))
    const before = await on()

    await page.getByRole('button', { name: 'Swap mark' }).click()

    await expect.poll(on).not.toBe(before)
    expect(await done.evaluate((input) => getComputedStyle(input, '::after').maskImage)).toBe(await on())
  })
})

test.describe('Checkers useCheckedSync', () => {
  const heard = (page: Page) => page.getByRole('status', { name: 'Form heard' })
  const holds = (page: Page) => page.getByRole('status', { name: 'Owner holds' })

  test('tells the form about a change its owner makes, as a click would', async ({ page }) => {
    await visitStory(page, 'checkers--held-by-its-owner')

    await page.getByRole('button', { name: 'Toggle from outside' }).click()

    await expect(page.getByRole('checkbox', { name: 'Subscribe' })).toBeChecked()
    await expect(heard(page)).toHaveText('1')
    await expect(holds(page)).toHaveText('true')
  })

  test('hands a click to its owner and to the form once', async ({ page }) => {
    await visitStory(page, 'checkers--held-by-its-owner')

    await page.getByRole('checkbox', { name: 'Subscribe' }).click()

    await expect(holds(page)).toHaveText('true')
    await expect(heard(page)).toHaveText('1')
  })

  test('goes back on what its owner holds after a form reset the owner does not follow', async ({ page }) => {
    await visitStory(page, 'checkers--held-by-its-owner')
    const subscribe = page.getByRole('checkbox', { name: 'Subscribe' })
    await page.getByRole('button', { name: 'Toggle from outside' }).click()

    await page.getByRole('button', { name: 'Reset' }).click()

    await expect(subscribe).toBeChecked()
    await expect(holds(page)).toHaveText('true')
  })

  test('leaves an input nobody holds to its own state, so a form reset puts its default back', async ({ page }) => {
    await visitStory(page, 'checkers--left-to-itself')
    const newsletter = page.getByRole('checkbox', { name: 'Newsletter' })

    await newsletter.click()
    await expect(newsletter).not.toBeChecked()
    await page.getByRole('button', { name: 'Reset' }).click()

    await expect(newsletter).toBeChecked()
    await expect(page.getByRole('status', { name: 'Clicks' })).toHaveText('1')
  })

  test('follows its owner with no form to tell', async ({ page }) => {
    await visitStory(page, 'checkers--held-without-form')
    const remember = page.getByRole('checkbox', { name: 'Remember me' })

    await page.getByRole('button', { name: 'Toggle from outside' }).click()
    await expect(remember).toBeChecked()

    await remember.click()
    await expect(remember).not.toBeChecked()
  })
})
