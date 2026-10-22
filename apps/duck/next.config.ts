import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const monorepoRoot = path.join(currentDir, '../..')

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingRoot: monorepoRoot,
  // Keeps the @netlify/plugin-nextjs Lambda under the 250 MB limit.
  outputFileTracingExcludes: {
    '*': [
      // Build-time toolchains never run at request time.
      '**/node_modules/@swc/core-linux-x64-gnu/**',
      '**/node_modules/@swc/core-linux-x64-musl/**',
      '**/node_modules/@swc/core-darwin-*/**',
      '**/node_modules/@swc/core-win32-*/**',
      '**/node_modules/@esbuild/**',
      '**/node_modules/esbuild/**',
      '**/node_modules/typescript/**',
      '**/node_modules/webpack/**',
      '**/node_modules/webpack-*/**',
      '**/node_modules/terser/**',
      '**/node_modules/@biomejs/**',
      '**/node_modules/sherif/**',
      '**/node_modules/turbo/**',
      '**/node_modules/turbo-*/**',
      '**/node_modules/velite/**',
      '**/node_modules/shiki/**',
      '**/node_modules/@shikijs/**',
      '**/node_modules/rehype-*/**',
      '**/node_modules/remark-*/**',
      '**/node_modules/unified/**',
      '**/node_modules/mdast-util-*/**',
      '**/node_modules/hast-util-*/**',
      '**/node_modules/@mdx-js/**',
      '**/node_modules/puppeteer/**',
      '**/node_modules/puppeteer-*/**',
      '**/node_modules/@puppeteer/**',
      '**/node_modules/sharp/**',
      '**/node_modules/@img/**',
      '**/node_modules/canvas/**',
      '**/node_modules/ts-morph/**',
      '**/node_modules/@ts-morph/**',
      // 3D/animation libs that no app/component code imports.
      '**/node_modules/three/**',
      '**/node_modules/@splinetool/**',
      '**/node_modules/@rive-app/**',
      '**/node_modules/@google/generative-ai/**',
      // Client-only libraries — still served to the browser via per-page chunks.
      '**/node_modules/recharts/**',
      '**/node_modules/three-stdlib/**',
      // lucide-react v1.x has no dist/cjs — exclude entire package; optimizePackageImports bundles only used icons.
      '**/node_modules/lucide-react/**',
      // mermaid + its heavy deps (d3, dagre, cytoscape) are build-time only (velite plugin uses Chromium headless).
      '**/node_modules/mermaid/**',
      '**/node_modules/d3/**',
      '**/node_modules/d3-*/**',
      '**/node_modules/dagre-d3-es/**',
      '**/node_modules/cytoscape/**',
      '**/node_modules/cytoscape-*/**',
      '**/node_modules/@mermaid-js/**',
      '**/node_modules/roughjs/**',
      '**/node_modules/khroma/**',
      '**/node_modules/katex/**',
      // Source registries — transpiled into the build output.
      '**/packages/registry-blocks/**',
      '**/packages/registry-examples/**',
      '**/packages/registry-internals/**',
      '**/packages/registry-ui/**',
      '**/__test__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/.next/cache/**',
      // velite collections are already inlined via `with { type: 'json' }`.
      '**/.gentleduck/*.json',
      '**/.gentleduck/index.js.map',
      // `@gentleduck/md` ships every platform's prebuilt `.node` (~95 MB)
      // plus the remark/unified toolchain — only used by build-time scripts.
      '**/node_modules/@gentleduck/md/**',
      '**/packages/_oldstuff_refactor/**',
      '**/packages/wip/**',
      '**/packages/deprecated/**',
      '**/apps/benchmark/**',
      '**/apps/duck-extension/**',
    ],
  },
  // Load these from node_modules at request time instead of inlining into the Lambda.
  serverExternalPackages: ['@modelcontextprotocol/sdk', 'lunr', 'puppeteer'],
  turbopack: {
    root: monorepoRoot,
  },
  allowedDevOrigins: ['192.168.1.36'],
  experimental: {
    externalDir: true,
    // Docs site holds ~93 MB of pre-tokenized MDX per worker; 31 default
    // forks blow past the 8 GB Netlify build sandbox and SIGKILL.
    cpus: 4,
    workerThreads: false,
    // Inlines CSS into HTML so no render-blocking <link rel="stylesheet">.
    inlineCss: true,
    // Rewrites barrel imports to drop unused symbols (lucide alone ~30 KB/route).
    optimizePackageImports: [
      'lucide-react',
      'jotai',
      'jotai/utils',
      'motion',
      'motion/react',
      '@tanstack/react-table',
      '@tanstack/react-virtual',
      'recharts',
      'date-fns',
      'culori',
      'next-themes',
      'sonner',
      'react-resizable-panels',
      'react-markdown',
      '@gentleduck/hooks',
    ],
  },
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
        protocol: 'https',
      },
      {
        hostname: 'zpgqhogoevbgpxustvmo.supabase.co',
        protocol: 'https',
      },
      {
        hostname: 'media.discordapp.net',
        protocol: 'https',
      },
      {
        hostname: 'images.unsplash.com',
        protocol: 'https',
      },
      {
        hostname: 'images.pexels.com',
        protocol: 'https',
      },
      {
        hostname: 'plus.unsplash.com',
        protocol: 'https',
      },
      {
        hostname: 'github.com',
        protocol: 'https',
      },
      {
        hostname: 'raw.githubusercontent.com',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: false,
  redirects: async () => {
    return [
      {
        destination: '/duck-ui/components',
        permanent: true,
        source: '/components',
      },
      {
        destination: '/duck-ui/components/:path*',
        permanent: true,
        source: '/docs/primitives/:path*',
      },
      {
        destination: '/duck-ui/components/:path*',
        permanent: true,
        source: '/docs/components/:path*',
      },
      {
        destination: '/duck-ui/components',
        permanent: true,
        source: '/docs/components',
      },
      {
        destination: '/duck-ui/installation/:path*',
        permanent: true,
        source: '/docs/installation/:path*',
      },
      {
        destination: '/duck-ui/installation',
        permanent: true,
        source: '/docs/installation',
      },
      {
        destination: '/duck-ui/theming',
        permanent: true,
        source: '/docs/theming',
      },
      {
        destination: '/duck-ui/javascript',
        permanent: true,
        source: '/docs/javascript',
      },
      {
        destination: '/www/:path*',
        permanent: true,
        source: '/docs/:path*',
      },
      {
        destination: '/www/introduction',
        permanent: true,
        source: '/docs',
      },
      {
        destination: '/www/introduction',
        permanent: true,
        source: '/www',
      },
      {
        destination: '/duck-ui/components/react-hook-form',
        permanent: false,
        source: '/forms',
      },
      {
        destination: '/duck-ui/components/react-hook-form',
        permanent: false,
        source: '/forms/react-hook-form',
      },
      {
        destination: '/duck-ui/components/sidebar',
        permanent: true,
        source: '/sidebar',
      },
      {
        destination: '/duck-ui/javascript',
        permanent: true,
        source: '/react-19',
      },
      {
        destination: '/charts/area',
        permanent: true,
        source: '/charts',
      },
      {
        destination: '/view/:name',
        permanent: true,
        source: '/view/styles/:style/:name',
      },
      {
        destination: '/:path*.md',
        permanent: true,
        source: '/:path*.mdx',
      },
    ]
  },
  rewrites: async () => {
    return [
      // *.md URLs serve the pre-rendered markdown via /llm/[...slug]
      // (used by "View as Markdown" in the Copy Page dropdown).
      {
        source: '/:path*.md',
        destination: '/llm/:path*',
      },
    ]
  },
  transpilePackages: [
    '@gentleduck/registry-ui',
    '@gentleduck/registry-examples',
    '@gentleduck/registry-blocks',
    '@gentleduck/registry-internals',
    '@gentleduck/registers',
  ],
}

export default nextConfig
