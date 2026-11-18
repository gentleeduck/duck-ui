import stories from './iframe.html'

Bun.serve({ development: { hmr: false }, port: 9009, routes: { '/iframe.html': stories } })
