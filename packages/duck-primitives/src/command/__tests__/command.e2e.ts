import { expect, type Page, test } from '@playwright/test'
import { visitStory } from '../../__tests__/e2e-helpers'

const shown = (page: Page) => page.getByRole('option')
const highlighted = (page: Page) => page.locator('[data-highlighted]')

test.describe('Command', () => {
  test('filters as you type, and hides a group and shows the empty state once nothing matches', async ({ page }) => {
    await visitStory(page, 'command--basic')
    const search = page.getByRole('combobox')

    await search.fill('an')
    await expect(shown(page)).toHaveText(['Banana'])
    await expect(page.getByText('Vegetables')).toBeHidden()

    await search.fill('zzz')
    await expect(shown(page)).toHaveCount(0)
    await expect(page.getByText('No results')).toBeVisible()
  })

  test('finds an item by a keyword it does not show', async ({ page }) => {
    await visitStory(page, 'command--basic')

    await page.getByRole('combobox').fill('plant')

    await expect(shown(page)).toHaveText(['Banana'])
  })

  test('moves the highlight with the arrow keys, Home and End, past a disabled item, and names it to the input', async ({
    page,
  }) => {
    await visitStory(page, 'command--basic')
    const search = page.getByRole('combobox')
    await search.focus()

    await search.press('ArrowDown')
    await search.press('ArrowDown')
    await expect(highlighted(page)).toHaveText('Carrot')
    await expect(search).toHaveAttribute('aria-activedescendant', (await highlighted(page).getAttribute('id')) ?? '')

    await search.press('End')
    await expect(highlighted(page)).toHaveText('Leek')

    await search.press('Home')
    await expect(highlighted(page)).toHaveText('Apple')
  })

  test('moves on Ctrl+N, Ctrl+P, Ctrl+J and Ctrl+K, by group on Alt and to an end on Meta', async ({ page }) => {
    await visitStory(page, 'command--basic')
    const search = page.getByRole('combobox')
    const after = async (key: string) => {
      await search.press(key)
      return highlighted(page).textContent()
    }

    expect([
      await after('Control+n'),
      await after('Control+j'),
      await after('Control+p'),
      await after('Control+k'),
      await after('Alt+ArrowDown'),
      await after('Alt+ArrowUp'),
      await after('Meta+ArrowDown'),
      await after('Meta+ArrowUp'),
    ]).toEqual(['Banana', 'Carrot', 'Banana', 'Apple', 'Carrot', 'Apple', 'Leek', 'Apple'])
  })

  test('writes the height of the rows it shows to --gentleduck-command-list-height', async ({ page }) => {
    await visitStory(page, 'command--basic')
    const list = page.getByRole('listbox')
    const variable = () => list.evaluate((node) => node.style.getPropertyValue('--gentleduck-command-list-height'))
    const vegetables = page.locator('[data-slot="command-group"]').last()

    await page.getByRole('combobox').fill('lee')

    await expect.poll(variable).toBe(`${await vegetables.evaluate((node) => node.getBoundingClientRect().height)}px`)
  })

  test('selects the highlighted item on Enter, and an item on a click', async ({ page }) => {
    await visitStory(page, 'command--basic')
    const picked = page.getByRole('status', { name: 'Picked' })

    await page.getByRole('combobox').press('Enter')
    await expect(picked).toHaveText('apple')

    await page.getByRole('option', { name: 'Leek' }).click()
    await expect(picked).toHaveText('leek')
  })

  test('highlights the item under the mouse', async ({ page }) => {
    await visitStory(page, 'command--basic')

    await page.getByRole('option', { name: 'Carrot' }).hover()

    await expect(highlighted(page)).toHaveText('Carrot')
  })

  test('wraps the highlight from one end to the other with loop', async ({ page }) => {
    await visitStory(page, 'command--loop')
    const search = page.getByRole('combobox')

    await search.press('ArrowUp')
    await expect(highlighted(page)).toHaveText('Last')

    await search.press('ArrowDown')
    await expect(highlighted(page)).toHaveText('First')
  })

  test('orders the matches by their score, and keeps a Create item beside the empty state', async ({ page }) => {
    await visitStory(page, 'command--ranked')
    const search = page.getByRole('combobox')

    await search.fill('app')
    await expect(shown(page)).toHaveText(['Apple', 'Applesauce', 'Pineapple', 'Create "app"'])

    await search.fill('kiwi')
    await expect(shown(page)).toHaveText(['Create "kiwi"'])
    await expect(page.getByText('No fruit matches')).toBeVisible()

    await search.fill('')
    await expect(shown(page)).toHaveText(['Pineapple', 'Grape', 'Apple', 'Applesauce'])
  })

  test('moves a controlled highlight through its owner', async ({ page }) => {
    await visitStory(page, 'command--ranked')
    const search = page.getByRole('combobox')
    const output = page.getByRole('status', { name: 'Highlighted' })

    await expect(highlighted(page)).toHaveText('Grape')

    await search.press('ArrowDown')
    await expect(output).toHaveText('apple')
    await expect(highlighted(page)).toHaveText('Apple')

    await search.fill('sauce')
    await expect(output).toHaveText('applesauce')
  })

  test('highlights the results of its own search as they arrive, and shows the empty state without them', async ({
    page,
  }) => {
    await visitStory(page, 'command--own-search')
    const search = page.getByRole('combobox')
    await expect(page.getByText('No one found')).toBeVisible()

    await search.fill('a')
    await expect(page.getByRole('progressbar', { name: 'Loading' })).toHaveText('Searching...')
    await expect(shown(page)).toHaveText(['Ada Lovelace', 'Alan Turing', 'Barbara Liskov', 'Grace Hopper'])
    await expect(page.getByRole('progressbar')).toHaveCount(0)
    await expect(page.getByRole('status')).toHaveText('4 found')
    await expect(highlighted(page)).toHaveText('Ada Lovelace')
    await expect(page.getByText('No one found')).toBeHidden()

    await search.fill('gr')
    await expect(shown(page)).toHaveText(['Grace Hopper'])
    await expect(highlighted(page)).toHaveText('Grace Hopper')
  })

  test('finds an item by letters in order, best first, whatever their case and accents', async ({ page }) => {
    await visitStory(page, 'command--fuzzy')
    const search = page.getByRole('combobox')

    await search.fill('apl')
    await expect(shown(page)).toHaveText(['Apple', 'Green apple', 'Pineapple'])

    await search.fill('CREME')
    await expect(shown(page)).toHaveText(['Crème brûlée'])

    await search.fill('cafe')
    await expect(shown(page)).toHaveText(['Café au lait'])
  })

  test('shows the best few matches up to its limit, and announces how many', async ({ page }) => {
    await visitStory(page, 'command--limited')
    const search = page.getByRole('combobox')
    const status = page.getByRole('status')

    await expect(shown(page)).toHaveText(['Apple', 'Apricot', 'Avocado'])
    await expect(status).toHaveText('3 shown')

    await search.fill('ap')
    await expect(shown(page)).toHaveText(['Apple', 'Apricot', 'Green apple'])

    await search.fill('blue')
    await expect(shown(page)).toHaveText(['Blueberry'])
    await expect(status).toHaveText('1 shown')
  })

  test('moves a page of a scrolling list on PageDown and PageUp, keeping the item in view', async ({ page }) => {
    await visitStory(page, 'command--long-list')
    const search = page.getByRole('combobox')

    await search.press('PageDown')
    await expect(highlighted(page)).toHaveText('Item 5')

    await search.press('PageDown')
    await expect(highlighted(page)).toHaveText('Item 9')
    await expect(highlighted(page)).toBeInViewport()

    await search.press('PageUp')
    await expect(highlighted(page)).toHaveText('Item 5')
    await expect(highlighted(page)).toBeInViewport()
  })

  test('leaves the highlight where it is under the mouse with disablePointerSelection, and still selects a click', async ({
    page,
  }) => {
    await visitStory(page, 'command--no-pointer-highlight')
    const cherry = page.getByRole('option', { name: 'Cherry' })

    await cherry.hover()
    await expect(highlighted(page)).toHaveText('Apple')

    await cherry.click()
    await expect(page.getByRole('status', { name: 'Picked' })).toHaveText('cherry')
  })

  test('moves through a virtual list past the rows drawn, placing each in the whole list', async ({ page }) => {
    await visitStory(page, 'command--virtual')
    const search = page.getByRole('combobox')

    await expect(page.getByRole('status')).toHaveText('1000 rows')
    await expect(shown(page).first()).toHaveAttribute('aria-setsize', '1000')
    expect(await shown(page).count()).toBeLessThan(20)

    await search.press('End')
    await expect(highlighted(page)).toHaveText('Row 1000')
    await expect(highlighted(page)).toHaveAttribute('aria-posinset', '1000')
    await expect(highlighted(page)).toBeInViewport()

    await search.press('Home')
    await search.press('PageDown')
    await expect(highlighted(page)).toHaveText('Row 7')

    for (let press = 0; press < 10; press++) await search.press('ArrowDown')
    await expect(highlighted(page)).toHaveText('Row 17')
    await expect(highlighted(page)).toBeInViewport()
    await expect(search).toHaveAttribute('aria-activedescendant', (await highlighted(page).getAttribute('id')) ?? '')
  })

  test('keeps a virtual row highlighted while it is scrolled away, and draws it again when it is back', async ({
    page,
  }) => {
    await visitStory(page, 'command--virtual')
    const search = page.getByRole('combobox')
    const view = page.getByRole('listbox').locator('..')

    await search.press('ArrowDown')
    await search.press('ArrowDown')
    await view.evaluate((node) => {
      node.scrollTop = 10_000
    })
    await expect(highlighted(page)).toHaveCount(0)
    await expect(search).not.toHaveAttribute('aria-activedescendant')

    await view.evaluate((node) => {
      node.scrollTop = 0
    })
    await expect(highlighted(page)).toHaveText('Row 3')

    await search.fill('500')
    await expect(highlighted(page)).toHaveText('Row 500')
    await expect(page.getByRole('status')).toHaveText('1 rows')
  })

  test('follows a link item on Enter', async ({ page }) => {
    await visitStory(page, 'command--links')
    const search = page.getByRole('combobox')

    await search.press('ArrowDown')
    await search.press('Enter')

    await expect(page).toHaveURL(/#settings$/)
  })

  test('writes the direction on the root alone, which the parts inherit', async ({ page }) => {
    await visitStory(page, 'command--right-to-left')
    const command = page.getByTestId('command')

    await expect(command).toHaveAttribute('dir', 'rtl')
    await expect(command.locator('[dir]')).toHaveCount(0)
    expect(await page.getByRole('option', { name: 'تفاح' }).evaluate((item) => getComputedStyle(item).direction)).toBe(
      'rtl',
    )
  })

  test('highlights the item defaultValue names first, and the best match once a search starts', async ({ page }) => {
    await visitStory(page, 'command--default-highlight')
    await expect(highlighted(page)).toHaveText('Paste')

    await page.getByRole('combobox').fill('c')

    await expect(highlighted(page)).toHaveText('Copy')
  })

  test('leaves Ctrl+N to the input with vimBindings off, and still moves on the arrows', async ({ page }) => {
    await visitStory(page, 'command--no-vim-keys')
    const search = page.getByRole('combobox')
    await expect(highlighted(page)).toHaveText('Copy')

    await search.press('Control+n')
    await expect(highlighted(page)).toHaveText('Copy')

    await search.press('ArrowDown')
    await expect(highlighted(page)).toHaveText('Cut')
  })

  test('keeps a forceMount group and its heading through any search, beside the empty state', async ({ page }) => {
    await visitStory(page, 'command--pinned-group')

    await page.getByRole('combobox').fill('zzz')

    await expect(page.getByText('Recent')).toBeVisible()
    await expect(page.getByText('Edit')).toBeHidden()
    await expect(shown(page)).toHaveCount(0)
    await expect(page.getByText('No results')).toBeVisible()
  })
})
