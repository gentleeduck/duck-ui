import { describe, expect, test } from 'bun:test'
import { DirectionProvider } from '@gentleduck/primitives/direction'
import { renderToStaticMarkup } from 'react-dom/server'
import { getTabsKeyTarget, Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

describe('registry-ui tabs', () => {
  test('ArrowRight moves forward and ArrowLeft moves back in LTR, wrapping at the ends', () => {
    expect(getTabsKeyTarget('ArrowRight', 0, 3, 'ltr')).toBe(1)
    expect(getTabsKeyTarget('ArrowRight', 2, 3, 'ltr')).toBe(0)
    expect(getTabsKeyTarget('ArrowLeft', 0, 3, 'ltr')).toBe(2)
  })

  test('arrow keys follow the visual order in RTL', () => {
    expect(getTabsKeyTarget('ArrowLeft', 0, 3, 'rtl')).toBe(1)
    expect(getTabsKeyTarget('ArrowRight', 0, 3, 'rtl')).toBe(2)
  })

  test('Home and End jump to the first and last tab; other keys are ignored', () => {
    expect(getTabsKeyTarget('Home', 2, 3, 'rtl')).toBe(0)
    expect(getTabsKeyTarget('End', 0, 3, 'ltr')).toBe(2)
    expect(getTabsKeyTarget('ArrowDown', 0, 3, 'ltr')).toBeNull()
  })

  test('Tabs takes its direction from the nearest DirectionProvider', () => {
    const html = renderToStaticMarkup(
      <DirectionProvider dir="rtl">
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
        </Tabs>
      </DirectionProvider>,
    )

    expect(html).toContain('data-slot="tabs" dir="rtl"')
  })

  test('only the active panel renders its children by default; forceMount renders inactive ones too', () => {
    const html = renderToStaticMarkup(
      <Tabs defaultValue="a">
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
        <TabsContent renderOnce value="c">
          Panel C
        </TabsContent>
        <TabsContent forceMount value="d">
          Panel D
        </TabsContent>
      </Tabs>,
    )

    expect(html).toContain('Panel A')
    expect(html).not.toContain('Panel B')
    expect(html).not.toContain('Panel C')
    expect(html).toContain('Panel D')
  })
})
