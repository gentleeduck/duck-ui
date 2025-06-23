/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import styles from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'description',
        content: 'gentleduck',
      },
      {
        type: 'image/svg',
        href: '/logomark.svg',
        rel: 'icon',
      },
      {
        title: 'gentleduck | home page',
      },
    ],
    links: [
      {
        rel: 'preload',
        href: '/satoshi-VF.woff2',
        as: 'font',
        fetchPriority: 'high',
        type: 'font/woff2',
        crossOrigin: '',
      },
      {
        rel: 'stylesheet',
        href: styles,
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // @ts-expect-error xml:lang not declared TODO: declare it
    <html lang="en" xml:lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
