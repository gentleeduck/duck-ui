import type { Metadata } from 'next'
import { absoluteUrl } from '~/lib'

const title = '@gentleduck/error'
const description =
  'Typed, registry-driven error classes for TypeScript. Branded codes, secret-safe serialization, framework-agnostic, zero dependencies.'

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl('/duck-error') },
  description,
  title,
  openGraph: {
    title,
    description,
    images: [{ url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}` }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}` }],
  },
}

export default function DuckErrorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
