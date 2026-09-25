import { createDocsVeliteConfig } from './velite'

const cfg = createDocsVeliteConfig({
  // Root `docs` collection excludes per-package docs (they have dedicated
  // collections below); the default `docs/**/*.mdx` would duplicate them.
  docsPattern: 'docs/!(duck-*|www)/**/*.mdx',
  packages: [
    'duck-auth',
    'duck-calendar',
    'duck-cli',
    'duck-error',
    'duck-gen',
    'duck-hooks',
    'duck-iam',
    'duck-lazy',
    'duck-libs',
    'duck-motion',
    'duck-primitives',
    'duck-query',
    'duck-registry-build',
    'duck-shortcut',
    'duck-state',
    'duck-template',
    'duck-ttest',
    'duck-ttlog',
    'duck-ui',
    'duck-upload',
    'duck-variants',
    'duck-vim',
    'www',
  ],
})

export default {
  ...cfg,
  root: 'content',
  // `clean: true` wipes `.gentleduck/` (incl `.cache/dmc/`) per build, otherwise
  // the engine reuses cached MDX bodies even after the codegen Rust crate is
  // bumped and silently masks codegen-level fixes.
  // `html: false` drops the pre-rendered HTML string the app never reads
  // (pages use `<Mdx code={doc.body} />`, copy uses `doc.content`); halves the
  // output size.
  output: { ...cfg.output, data: '.gentleduck', html: false, clean: false },
}
