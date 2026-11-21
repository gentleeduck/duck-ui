```tsx title="components/typeset-1.tsx"
// import from your project: import Demo from '@/components/typeset-1'
import { Typeset } from '@gentleduck/registry-ui/typeset'

export default function Demo() {
  return (
    <Typeset className="w-full max-w-xl">
      <h2>Ship the source, not a black box</h2>
      <p>
        Every component lands in your repo as plain files. Read them, change them, and commit them like the rest of your
        code. Run <code>duck add button</code> to try it.
      </p>
      <h3>What you get</h3>
      <ul>
        <li>Accessible primitives with keyboard support built in</li>
        <li>
          Variants written with <code>cva()</code>
        </li>
        <li>Theme tokens in CSS variables, with dark mode included</li>
      </ul>
      <blockquote>Own the code, and upgrades become a diff you can read.</blockquote>
      <pre>
        <code>{`import { Button } from '@/components/ui/button'

export function Save() {
  return <Button>Save</Button>
}`}</code>
      </pre>
      <table>
        <thead>
          <tr>
            <th>Package</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>@gentleduck/primitives</code>
            </td>
            <td>Headless behavior</td>
          </tr>
          <tr>
            <td>
              <code>@gentleduck/registry-ui</code>
            </td>
            <td>Styled components</td>
          </tr>
        </tbody>
      </table>
      <p>
        Read the <a href="#installation">installation guide</a> to set up your project.
      </p>
    </Typeset>
  )
}
```

## When to use it

Rendered markdown comes back as bare HTML. Without styles you end up sizing headings, spacing lists, and padding tables by hand, once for the blog, again for the docs, and again for the chat panel.

`Typeset` styles everything inside one wrapper, so you never add classes to a `<p>` or `<li>`. Reach for it when you don't control the markup: markdown, CMS content, or AI answers.

Use [typography](/duck-ui/components/typography) when you write the JSX yourself and want a component per element.

## Installation

CLI
Manual

```bash
npx @gentleduck/cli add typeset
```

The CLI copies `typeset.css` with the component and imports it in the CSS file set in `duck-ui.config.json`, right after Tailwind.

Install the following dependencies:

```bash
npm install @gentleduck/libs @gentleduck/primitives @gentleduck/variants
```

Copy and paste the following code into your project.

Import the stylesheet after Tailwind in your global CSS.

```css title="globals.css"
@import "tailwindcss";
@import "./components/ui/typeset/typeset.css";
```

## Usage

```tsx
import { Typeset } from "@/components/ui/typeset"
```

Wrap the rendered content. Any markdown renderer works.

```tsx
import Markdown from "react-markdown"

<Typeset>
  <Markdown>{content}</Markdown>
</Typeset>
```

The component only adds the `typeset` class, so plain HTML works too.

```html
<article class="typeset">...</article>
```

`asChild` puts the class on the element you give it instead of a `div`, such as an `article`.

## What it styles

Everything a markdown renderer writes: headings, paragraphs, links, ordered, nested and task lists, definition lists, inline code, `kbd`, `mark`, `abbr`, `sub` and `sup`, quotes, rules, code blocks, figures with captions, `details` and tables.

```tsx title="components/typeset-9.tsx"
// import from your project: import Demo from '@/components/typeset-9'
import { Typeset } from '@gentleduck/registry-ui/typeset'

export default function Demo() {
  return (
    <Typeset className="w-full max-w-xl">
      <h1>Shipping a release</h1>
      <p>
        Every element below is what a markdown renderer writes. Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to search, and read
        the <abbr title="Changelog">CHANGELOG</abbr> first. The build takes <mark>about two minutes</mark>. Lookups take
        log
        <sub>2</sub> n steps, and the cache holds 10<sup>4</sup> entries.
      </p>
      <h2>Steps</h2>
      <ol>
        <li>
          Bump the version
          <ul>
            <li>Patch for fixes</li>
            <li>Minor for features</li>
          </ul>
        </li>
        <li>Tag the commit</li>
      </ol>
      <h3>Checklist</h3>
      <ul className="contains-task-list">
        <li className="task-list-item">
          <input aria-label="Tests pass" checked disabled type="checkbox" /> Tests pass
        </li>
        <li className="task-list-item">
          <input aria-label="Docs updated" disabled type="checkbox" /> Docs updated
        </li>
      </ul>
      <h4>Terms</h4>
      <dl>
        <dt>Changeset</dt>
        <dd>A file naming the packages a change bumps, and by how much.</dd>
      </dl>
      <hr />
      <figure>
        <pre>
          <code>git tag v2.4.0 && git push --tags</code>
        </pre>
        <figcaption>Tagging starts the release.</figcaption>
      </figure>
      <details>
        <summary>What if the build fails?</summary>
        <p>Fix it on a branch and tag again. A failed build publishes nothing.</p>
      </details>
      <p>
        <small>Last reviewed in October 2026.</small>
      </p>
    </Typeset>
  )
}
```

## Rhythm

Type has a lot of dials: scale ratios, tracking, measure, the space above and below every element. Exposing all of them makes markdown harder to style, not easier.

Typeset keeps three. Heading sizes, list indents, the gap under a heading, and the space around a rule all derive from them.

| Variable | Default | Controls |
| --- | --- | --- |
| `--typeset-size` | `1em` | Base font size. `1em` follows the surrounding text |
| `--typeset-leading` | `1.75` | Line height |
| `--typeset-flow` | `1.25em` | Space between blocks |

Three more pick the font families. Leave them alone and Typeset follows your app.

| Variable | Default |
| --- | --- |
| `--typeset-font-body` | `inherit` |
| `--typeset-font-heading` | `var(--font-heading, inherit)` |
| `--typeset-font-mono` | `var(--font-mono)` |

Colors, borders, and radius come from your theme tokens, so dark mode needs no extra setup. Typeset never sets a `max-width`; your layout owns the measure.

Because sizes are relative, the same stylesheet fits a chat bubble and a full article. On screens narrower than `40rem` the base size gets a small bump for readability.

## Sizes

`size` sets the three rhythm variables for you. Use `sm` for chat and side panels, `lg` for long reads.

```tsx title="components/typeset-2.tsx"
// import from your project: import Demo from '@/components/typeset-2'
import { Typeset } from '@gentleduck/registry-ui/typeset'

const SIZES = ['sm', 'default', 'lg'] as const

export default function Demo() {
  return (
    <div className="grid w-full max-w-xl gap-8">
      {SIZES.map((size) => (
        <section className="grid gap-2" key={size}>
          <span className="font-mono text-muted-foreground text-xs">size="{size}"</span>
          <Typeset size={size}>
            <h3>Release notes</h3>
            <p>
              The calendar now supports range selection. Pass <code>mode="range"</code> to turn it on.
            </p>
          </Typeset>
        </section>
      ))}
    </div>
  )
}
```

## Presets

A preset is a class that sets the variables. Keep as many as you need, one per context.

```css title="globals.css"
.typeset-chat {
  --typeset-flow: 1em;
  --typeset-leading: 1.6;
}

.typeset-docs {
  --typeset-size: 15px;
  --typeset-flow: 1.5em;
}
```

```tsx
<Typeset className="typeset-chat">{message}</Typeset>
<Typeset asChild className="typeset-docs">
  <article>{page}</article>
</Typeset>
```

For a one-off change, set a value on the wrapper instead.

```tsx title="components/typeset-5.tsx"
// import from your project: import Demo from '@/components/typeset-5'
import { Typeset } from '@gentleduck/registry-ui/typeset'

export default function Demo() {
  return (
    <Typeset className="w-full max-w-xl [--typeset-flow:1.75em] [--typeset-font-heading:ui-serif,Georgia,serif] [--typeset-leading:1.9]">
      <h2>A slower read</h2>
      <p>
        Set the typeset variables on the container to change the rhythm. Here the blocks have more room and the headings
        use a serif.
      </p>
      <p>Everything else, from heading sizes to list indents, follows from those values.</p>
    </Typeset>
  )
}
```

Presets can change the whole feel, not just the spacing. A serif reading mode and a compact UI mode are two classes:

```css
.typeset-reading {
  --typeset-font-body: var(--font-serif);
  --typeset-font-heading: var(--font-serif);
  --typeset-size: 18px;
  --typeset-leading: 1.9;
  --typeset-flow: 2em;
}

.typeset-compact {
  --typeset-size: 14px;
  --typeset-leading: 1.6;
  --typeset-flow: 1em;
}
```

## Accessibility and dark mode

Offer a roomier preset as a reading setting for people who want larger type and more space.

```css
.typeset-large {
  --typeset-size: 1.125rem;
  --typeset-leading: 2;
  --typeset-flow: 2em;
}
```

Light text on a dark surface can feel tighter. Loosen the leading only there:

```css
.dark .typeset {
  --typeset-leading: 1.85;
}
```

## Streaming

Typeset is built so a new block never restyles the blocks already on screen.

* Blocks only get `margin-block-start`, so each new block brings its own space.
* Layout rules avoid `:last-child`, `:has()`, and `:empty`, whose matches change as content arrives.
* Table rows carry their own borders, so a new row leaves the one above it alone.

```tsx title="components/typeset-3.tsx"
// import from your project: import Demo from '@/components/typeset-3'
'use client'

import { Button } from '@gentleduck/registry-ui/button'
import { Typeset } from '@gentleduck/registry-ui/typeset'
import * as React from 'react'

const BLOCKS: React.ReactNode[] = [
  <p key="intro">Sure. Wrap the rendered markdown in a typeset container:</p>,
  <pre key="code">
    <code>{'<Typeset size="sm">\n  <Markdown>{message}</Markdown>\n</Typeset>'}</code>
  </pre>,
  <p key="why">Each new block only adds space above itself, so nothing on screen moves while the answer streams.</p>,
  <ul key="list">
    <li>No layout jumps</li>
    <li>No per-element classes</li>
  </ul>,
]

export default function Demo() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    if (count >= BLOCKS.length) return
    const timer = setTimeout(() => setCount((value) => value + 1), 700)
    return () => clearTimeout(timer)
  }, [count])

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="self-end rounded-2xl rounded-ee-md bg-primary px-3.5 py-2 text-primary-foreground text-sm">
        How do I style chat answers?
      </div>
      <Typeset aria-live="polite" size="sm">
        {BLOCKS.slice(0, count)}
      </Typeset>
      <Button className="self-start" onClick={() => setCount(0)} size="sm" variant="outline">
        Replay
      </Button>
    </div>
  )
}
```

## Opting out

Add `data-not-typeset` or the `not-typeset` class to a component inside the prose. It keeps its own styles, and so do its children.

```tsx title="components/typeset-4.tsx"
// import from your project: import Demo from '@/components/typeset-4'
import { Typeset } from '@gentleduck/registry-ui/typeset'

const TAGS = ['react', 'tailwind', 'a11y']

export default function Demo() {
  return (
    <Typeset className="w-full max-w-xl">
      <p>This list is part of the prose, so it gets bullets and indents:</p>
      <ul>
        {TAGS.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <p>
        This one is a component. <code>data-not-typeset</code> keeps prose styles off it and its children:
      </p>
      <ul className="flex gap-2" data-not-typeset="">
        {TAGS.map((tag) => (
          <li className="rounded-full border px-2.5 py-0.5 text-xs" key={tag}>
            {tag}
          </li>
        ))}
      </ul>
    </Typeset>
  )
}
```

A `Typeset` nested inside an opted-out component turns styling back on for its own content, so a preview card can still show prose.

```tsx title="components/typeset-7.tsx"
// import from your project: import Demo from '@/components/typeset-7'
import { Typeset } from '@gentleduck/registry-ui/typeset'

export default function Demo() {
  return (
    <Typeset className="w-full max-w-md" size="sm">
      <p>This page covers it:</p>
      <div className="flex flex-col gap-2 rounded-lg border p-4" data-not-typeset="">
        <span className="text-muted-foreground text-xs">docs / calendar</span>
        <a className="font-semibold hover:underline" href="#selecting-a-range">
          Selecting a range
        </a>
        <Typeset size="sm">
          <p>
            Pass <code>mode="range"</code> and the calendar keeps a start and an end:
          </p>
          <ul>
            <li>The first click sets the start</li>
            <li>The second click sets the end</li>
          </ul>
        </Typeset>
      </div>
      <p>The card lays itself out with utilities, and the excerpt inside it is prose again.</p>
    </Typeset>
  )
}
```

## Wide tables

A table wraps its text to fit, but one whose columns cannot wrap any narrower is wider than its container and widens the page. Wrap a wide table in `typeset-scroll` so what still does not fit scrolls inside the wrapper. The easiest place is your renderer's `table` component.

```tsx
<div className="typeset-scroll">
  <table>...</table>
</div>
```

A column marked `align="right"`, which markdown writes for `--:`, lines up at the end of its cells.

```tsx title="components/typeset-6.tsx"
// import from your project: import Demo from '@/components/typeset-6'
import { Typeset } from '@gentleduck/registry-ui/typeset'

const RELEASES = [
  {
    downloads: '1,204,311',
    gzip: '12.9 kB',
    highlight: 'Range selection',
    released: '2026-10-02',
    size: '41.2 kB',
    version: '2.4.0',
  },
  {
    downloads: '1,180,042',
    gzip: '12.8 kB',
    highlight: 'Accordion arrow keys',
    released: '2026-09-14',
    size: '40.8 kB',
    version: '2.3.0',
  },
  {
    downloads: '1,091,876',
    gzip: '12.6 kB',
    highlight: 'Sheet focus trap',
    released: '2026-08-30',
    size: '40.1 kB',
    version: '2.2.0',
  },
]

export default function Demo() {
  return (
    <Typeset asChild className="w-full max-w-sm">
      <article>
        <h3>Release history</h3>
        <p>The table wraps its text first. What still does not fit scrolls inside the wrapper, not the page.</p>
        <div className="typeset-scroll">
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Released</th>
                <th align="right">Size</th>
                <th align="right">Gzipped</th>
                <th align="right">Downloads</th>
                <th>Highlight</th>
              </tr>
            </thead>
            <tbody>
              {RELEASES.map((release) => (
                <tr key={release.version}>
                  <td>
                    <code>{release.version}</code>
                  </td>
                  <td>{release.released}</td>
                  <td align="right">{release.size}</td>
                  <td align="right">{release.gzip}</td>
                  <td align="right">{release.downloads}</td>
                  <td>{release.highlight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </Typeset>
  )
}
```

## Overrides

Typeset lives in `@layer components` and uses `:where()`, so any Tailwind utility on an element wins without `!important`. A plain CSS selector wins too.

```tsx
<Typeset>
  <h2 className="text-primary">Overrides the heading color</h2>
</Typeset>
```

```tsx title="components/typeset-8.tsx"
// import from your project: import Demo from '@/components/typeset-8'
import { Typeset } from '@gentleduck/registry-ui/typeset'

export default function Demo() {
  return (
    <Typeset className="w-full max-w-xl">
      <h2 className="text-primary">Version 2.4</h2>
      <p className="mt-1 text-muted-foreground text-sm">Released on 2 October 2026</p>
      <p>
        The calendar selects ranges. Pass <code>mode="range"</code> and read the start and end from{' '}
        <code>onSelect</code>.
      </p>
      <blockquote className="border-s-primary text-foreground">
        Upgrading needs no code changes unless you styled the selected day yourself.
      </blockquote>
    </Typeset>
  )
}
```

## Compared with typography plugins

`@tailwindcss/typography` and its `prose` class are a great fit for static pages. Typeset trades a few of its choices for app content:

| | `prose` | Typeset |
| --- | --- | --- |
| Sizing | Fixed steps, `prose-sm` to `prose-2xl` | Relative to the container, any size |
| Dark mode | A second palette with `prose-invert` | Your theme tokens flip on their own |
| Overrides | Modifiers like `prose-a:` | Plain utilities and CSS |
| Streaming | No guarantees for appended content | Appends never restyle earlier blocks |
| Distribution | npm plugin | One CSS file in your repo |

The `:where()` guard and the opt-out class (in the spirit of `not-prose`) come straight from the plugin.

## API Reference

### Typeset

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Sets `--typeset-size`, `--typeset-leading` and `--typeset-flow` together. A variable in `className` replaces the one the size sets |
| `asChild` | `boolean` | `false` | Puts the class and props on the child element instead of a `div` |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Passed to the element |

### Classes

| Class | Effect |
| --- | --- |
| `typeset` | Styles everything inside. What `Typeset` renders |
| `not-typeset`, `data-not-typeset` | Keeps prose styles off an element and its children |
| `typeset-scroll` | Scrolls a wide table inside its wrapper |