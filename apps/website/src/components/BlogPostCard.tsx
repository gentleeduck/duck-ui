import { Link } from '@tanstack/react-router'
import { Calendar, Clock, User } from 'lucide-react'

interface BlogPostCardProps {
  title: string
  excerpt: string
  slug: string
  coverImage: string
  author: {
    name: string
    avatar: string
  }
  publishedAt: string
  readingTime: string
  tags: string[]
}

export function BlogPostCard({
  title,
  excerpt,
  slug,
  coverImage,
  author,
  publishedAt,
  readingTime,
  tags,
}: BlogPostCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground transition-all hover:border-primary/50 hover:shadow-lg">
      <Link to="/blog/$slug" params={{ slug }} className="relative aspect-[16/9] overflow-hidden">
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {tag}
            </span>
          ))}
        </div>

        <Link to="/blog/$slug" params={{ slug }} className="group-hover:text-primary">
          <h2 className="mb-2 text-xl font-semibold tracking-tight transition-colors">{title}</h2>
        </Link>

        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>

        <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{author.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString(navigator.language, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{readingTime}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
