'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@gentleduck/registry-ui/navigation-menu'

export default function Demo() {
  return (
    <NavigationMenu closeDelay={400} defaultValue="" delayDuration={500} skipDelayDuration={1000}>
      <NavigationMenuList>
        {['Products', 'Solutions', 'Pricing'].map((name) => (
          <NavigationMenuItem key={name} value={name}>
            <NavigationMenuTrigger>{name}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-60 gap-1 p-2">
                <NavigationMenuLink href="#">All {name.toLowerCase()}</NavigationMenuLink>
                <NavigationMenuLink href="#">What is new</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuIndicator forceMount />
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  )
}
