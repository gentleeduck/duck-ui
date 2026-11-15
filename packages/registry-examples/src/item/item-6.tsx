import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@gentleduck/registry-ui/item'
import Image from 'next/image'

const articles = [
  {
    author: 'Dana Whitfield',
    category: 'Engineering',
    readTime: '6 min',
    title: 'Building Accessible Components from Scratch',
  },
  {
    author: 'Marcus Lee',
    category: 'Design',
    readTime: '4 min',
    title: 'Color Systems That Scale Across Themes',
  },
  {
    author: 'Priya Sharma',
    category: 'DevOps',
    readTime: '8 min',
    title: 'Zero-Downtime Deployments with Blue-Green Strategy',
  },
]

export default function Demo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup className="gap-4">
        {articles.map((article) => (
          <Item asChild key={article.title} variant="outline">
            {/* biome-ignore lint/a11y/useValidAnchor: placeholder href in demo component */}
            <a href="#">
              <ItemMedia variant="image">
                <Image
                  alt={article.title}
                  className="object-cover grayscale"
                  height={32}
                  src={`https://avatar.vercel.sh/${article.title}`}
                  width={32}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  {article.title} - <span className="text-muted-foreground">{article.category}</span>
                </ItemTitle>
                <ItemDescription>{article.author}</ItemDescription>
              </ItemContent>
              <ItemContent className="flex-none text-center">
                <ItemDescription>{article.readTime}</ItemDescription>
              </ItemContent>
            </a>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}
