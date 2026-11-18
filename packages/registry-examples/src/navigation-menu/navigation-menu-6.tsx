'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@gentleduck/registry-ui/navigation-menu'
import * as React from 'react'

export default function Demo() {
  const [open, setOpen] = React.useState('')
  const [compared, setCompared] = React.useState<string[]>([])
  const compare = (plan: string) => setCompared((plans) => (plans.includes(plan) ? plans : [...plans, plan]))

  return (
    <div className="flex flex-col items-center gap-3">
      <NavigationMenu activationMode="manual" onValueChange={setOpen} value={open}>
        <NavigationMenuList>
          <NavigationMenuItem value="plans">
            <NavigationMenuTrigger>Plans</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-56 gap-1">
                {['Starter', 'Team', 'Enterprise'].map((plan) => (
                  <li key={plan}>
                    <NavigationMenuLink
                      closeOnSelect={false}
                      href={`#${plan.toLowerCase()}`}
                      onSelect={() => compare(plan)}>
                      Compare {plan}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="roadmap">
            <NavigationMenuTrigger disabled>Roadmap</NavigationMenuTrigger>
            <NavigationMenuContent />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <p className="text-muted-foreground text-sm">
        Open: {open || 'none'}, comparing: {compared.join(', ') || 'nothing yet'}
      </p>
    </div>
  )
}
