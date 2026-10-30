import stories from './iframe.html'

const server = Bun.serve({
  development: { hmr: false },
  port: 9009,
  routes: { '/': stories, '/iframe.html': stories },
})
console.log(`Stories at ${server.url}`)
