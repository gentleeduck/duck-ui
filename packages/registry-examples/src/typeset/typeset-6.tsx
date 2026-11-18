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
