import { createFileRoute, Link } from '@tanstack/react-router'
import { BlogPostGrid } from '~/components/BlogPostGrid'
import Header from '~/components/Header'

export const Route = createFileRoute('/blog/')({
  component: Blog,
})

// import { allPosts } from 'content-collections'

function Blog() {
  return (
    <>
      <Header />
      <div className="mx-auto px-4 py-8 container">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="font-bold text-4xl tracking-tight">Blog</h1>
            <p className="text-muted-foreground text-lg">
              Welcome to the blog of Gentleduck. Here you can find all the latest news and updates from our team.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-2xl tracking-tight">Latest Posts</h2>

            <ul>
              {/* {allPosts.map((post) => (
                <li>
                  <Link to="/blog/$slug" params={{ slug: post._meta.path }}>
                    <h3>{post.title}</h3>
                    <p>{post.summary}</p>
                  </Link>
                </li>
              ))} */}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
