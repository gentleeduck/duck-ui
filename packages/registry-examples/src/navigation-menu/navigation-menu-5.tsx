'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@gentleduck/registry-ui/navigation-menu'

const sections = [
  { links: ['Overview', 'Members', 'Billing'], title: 'Workspace' },
  { links: ['Profile', 'Notifications', 'Security'], title: 'Account' },
  { links: ['Guides', 'Changelog'], title: 'Help' },
]

export default function Demo() {
  return (
    <NavigationMenu className="items-start" orientation="vertical">
      <NavigationMenuList className="w-44">
        {sections.map((section) => (
          <NavigationMenuItem key={section.title} value={section.title}>
            <NavigationMenuTrigger>{section.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-48 gap-1">
                {section.links.map((link) => (
                  <li key={link}>
                    <NavigationMenuLink href={`#${link.toLowerCase()}`}>{link}</NavigationMenuLink>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  )
}
