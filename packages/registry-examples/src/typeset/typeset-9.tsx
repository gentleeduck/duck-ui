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
