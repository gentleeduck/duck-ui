import { CardsDemo } from '~/components/cards'
import { ThemeCustomizer } from '~/components/theme-customizer'
import { ThemeWrapper } from '~/components/theme-wrapper'

export const dynamic = 'force-static'
export const revalidate = false

export default function ThemesPage() {
  return (
    <ThemeWrapper>
      <div id="themes" className="container-wrapper scroll-mt-20">
        <div className="container flex items-center justify-between gap-8 px-6 py-4 md:px-8">
          <ThemeCustomizer />
        </div>
      </div>
      <div className="container-wrapper section-soft flex flex-1 flex-col pb-6">
        <div className="theme-container container flex flex-1 flex-col">
          <CardsDemo />
        </div>
      </div>
    </ThemeWrapper>
  )
}
