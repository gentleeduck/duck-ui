import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@gentleduck/registry-ui-duckui/navigation-menu'
import { Link } from '@tanstack/react-router'
import Logo from '~/assets/logomark.svg?react'
import DuckUILogo from '~/assets/duck-ui.svg?react'

export default function Header() {
  return (
    <header className="mx-auo  p-10 h-10 flex gap-2 justify-between text-primary">
      <nav className="flex items-center gap-2 max-sm:flex-col max-sm:mx-auto max-sm:items-center">
        <div className="px-2 font-bold">
          <Link to="/" className="flex items-center gap-2">
            <Logo
              className="transition-transform duration-500 ease-(--duck-motion-spring) hover:rotate-360 "
              width={40}
              height={40}
            />
            <span className="font-semibold text-2xl mb-1">Gentleduck</span>
          </Link>
        </div>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent className="border-border">
                <ul className="grid grid-cols-12 w-xl gap-3 p-6  ">
                  <li className="col-span-6">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex h-full w-full text-white select-none flex-col justify-end rounded-md  bg-gradient-to-b from-black from-40% to-purple-500 p-6 no-underline outline-none transition-all"
                        to="/">
                        <DuckUILogo className="mx-auto" width={140} height={140} />
                        <p className="mb-2 mt-4 text-xl font-semibold">duck/ui 🦆</p>
                        <p className="text-sm leading-tight">the progressive UI framework</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>

                  <ul className="col-span-6">
                    <li className="border-b border-border">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex select-none flex-col justify-end px-4 py-3 rounded-md no-underline outline-none hover:-translate-y-0.5 focus:-translate-y-0.5 transition-all"
                          to="/">
                          <p className="text-lg font-medium whitespace-nowrap">@gentleduck/ui 🦆</p>
                          <p className="text-sm leading-tight text-pretty">the progressive UI framework</p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li className="border-b border-border">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex select-none flex-col justify-end px-4 py-3 rounded-md no-underline outline-none hover:-translate-y-0.5 focus:-translate-y-0.5 transition-all"
                          to="/">
                          <p className="text-lg font-medium whitespace-nowrap">@gentleduck/variants 🎨</p>
                          <p className="text-sm leading-tight text-pretty">
                            A lightweight utility for generating class names based on variant configurations
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex select-none flex-col justify-end px-4 py-3 rounded-md no-underline outline-none hover:-translate-y-0.5 focus:-translate-y-0.5 transition-all"
                          to="/">
                          <p className="text-lg font-medium whitespace-nowrap">@gentleduck/aria-feather 🦅</p>
                          <p className="text-sm leading-tight text-pretty">
                            an behavioral headless library for making interactive components
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Company</NavigationMenuTrigger>
              <NavigationMenuContent className="border-border">
                <ul className=" w-xs p-2 ">
                  <li className="border-b border-border">
                    <NavigationMenuLink asChild>
                      <Link
                        className="flex select-none flex-col justify-end px-4 py-3 rounded-md no-underline outline-none hover:-translate-y-0.5 focus:-translate-y-0.5 transition-all"
                        to="/">
                        <p className="text-lg font-medium whitespace-nowrap">About us</p>
                        <p className="text-sm leading-tight text-pretty">about gentleduck how are we</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        disabled
                        className="flex pointer-events-none text-muted-foreground select-none flex-col justify-end px-4 py-3 rounded-md no-underline outline-none hover:-translate-y-0.5 focus:-translate-y-0.5 transition-all"
                        to="/">
                        <p className="text-lg font-medium whitespace-nowrap">careers</p>
                        <p className="text-sm leading-tight text-pretty">work at gentleduck</p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem className="ms-3 text-base font-medium">
              <Link to="/blog">Blog</Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
    </header>
  )
}
