import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@gentleduck/registry-ui-duckui/button'
import Header from '~/components/Header'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <>
      <div>
        <Header />

        <div className="container mx-auto px-10">
          <div className="flex flex-col max-sm:text-center justify-center gap-4 h-[calc(100vh-80px)] max-sm:items-center text-pretty text-primary">
            <h1 className="text-3xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-shadow-sm text-balance">
              The Future of
              <br />
              Web Infrastructure
              <br />
              Starts Here
            </h1>
            <h2 className="text-primary/80 text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-balance">
              Crafting the next generation of tools not just solutions, but the optimal foundation for tomorrow’s web.
            </h2>
            <div className="flex gap-4 max-sm:mx-auto">
              <Button>See Our Products</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
