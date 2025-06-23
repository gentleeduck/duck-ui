import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Clock, User } from 'lucide-react'
import Header from '~/components/Header'

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPost,
})

function BlogPost() {
  return (
    <>
      <Header />
      <article className="container mx-auto px-4 py-8"></article>
    </>
  )
}
