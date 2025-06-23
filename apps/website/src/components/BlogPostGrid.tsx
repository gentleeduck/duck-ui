import { BlogPostCard } from './BlogPostCard'

interface BlogPost {
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

interface BlogPostGridProps {
  posts: BlogPost[]
}

export function BlogPostGrid({ posts }: BlogPostGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogPostCard key={post.slug} {...post} />
      ))}
    </div>
  )
}
