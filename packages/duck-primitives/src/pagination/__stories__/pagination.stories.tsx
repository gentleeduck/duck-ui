import * as React from 'react'
import * as Pagination from '..'
import styles from './pagination.stories.module.css'

export default {
  title: 'Components/Pagination',
}

function Controls() {
  return (
    <Pagination.Content className={styles.content}>
      <Pagination.Item>
        <Pagination.First />
      </Pagination.Item>
      <Pagination.Item>
        <Pagination.Previous />
      </Pagination.Item>
      <Pagination.Pages />
      <Pagination.Item>
        <Pagination.Next />
      </Pagination.Item>
      <Pagination.Item>
        <Pagination.Last />
      </Pagination.Item>
    </Pagination.Content>
  )
}

export const Buttons = () => (
  <Pagination.Root pageCount={20}>
    <Controls />
  </Pagination.Root>
)

export const Links = () => (
  <Pagination.Root
    pageCount={20}
    defaultPage={Number(new URLSearchParams(window.location.search).get('page') ?? 1)}
    getPageHref={(page) => `?id=components-pagination--links&page=${page}`}>
    <Controls />
  </Pagination.Root>
)

export const ClientRouting = () => {
  const navigate = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    window.history.pushState(null, '', event.currentTarget.getAttribute('href'))
  }

  return (
    <Pagination.Root pageCount={20} getPageHref={(page) => `?id=components-pagination--client-routing&page=${page}`}>
      <Pagination.Content className={styles.content}>
        <Pagination.Item>
          <Pagination.Previous onClick={navigate} />
        </Pagination.Item>
        <Pagination.Pages>
          {(items) =>
            items.map((item) => (
              <Pagination.Item key={item}>
                {typeof item === 'number' ? (
                  <Pagination.Page onClick={navigate} value={item} />
                ) : (
                  <Pagination.Ellipsis />
                )}
              </Pagination.Item>
            ))
          }
        </Pagination.Pages>
        <Pagination.Item>
          <Pagination.Next onClick={navigate} />
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}

export const Empty = () => (
  <Pagination.Root pageCount={0}>
    <Controls />
  </Pagination.Root>
)

export const Compact = () => {
  const [page, setPage] = React.useState(1)

  return (
    <Pagination.Root aria-label="Orders" onPageChange={setPage} page={page} pageCount={12}>
      <Pagination.Content className={styles.content}>
        <Pagination.Item>
          <Pagination.Previous>Previous</Pagination.Previous>
        </Pagination.Item>
        <Pagination.Item>
          <output>Page {page} of 12</output>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next>Next</Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}

export const Controlled = () => {
  const [page, setPage] = React.useState(6)
  const [pageCount, setPageCount] = React.useState(20)
  const [wide, setWide] = React.useState(false)
  const [rtl, setRtl] = React.useState(false)

  return (
    <div>
      <Pagination.Root
        boundaryCount={wide ? 0 : 1}
        dir={rtl ? 'rtl' : 'ltr'}
        onPageChange={setPage}
        page={page}
        pageCount={pageCount}
        siblingCount={wide ? 2 : 1}>
        <Controls />
      </Pagination.Root>
      <output aria-label="Page">{page}</output>
      <button type="button" onClick={() => setPage(10)}>
        Go to 10
      </button>
      <button type="button" onClick={() => setPageCount((count) => (count === 20 ? 4 : 20))}>
        Toggle page count
      </button>
      <label>
        <input type="checkbox" checked={wide} onChange={(event) => setWide(event.target.checked)} />
        Wide window
      </label>
      <label>
        <input type="checkbox" checked={rtl} onChange={(event) => setRtl(event.target.checked)} />
        Right-to-left
      </label>
    </div>
  )
}

export const CustomRange = () => (
  <Pagination.Root aria-label="Results" defaultPage={8} pageCount={30}>
    <Pagination.Content className={styles.content}>
      <Pagination.Item>
        <Pagination.Previous aria-label="Newer results">Newer</Pagination.Previous>
      </Pagination.Item>
      <Pagination.Pages>
        {(items) =>
          items.map((item) => (
            <Pagination.Item key={item}>
              {typeof item === 'number' ? (
                <Pagination.Page aria-label={`Results page ${item}`} value={item}>
                  {`p${item}`}
                </Pagination.Page>
              ) : (
                <Pagination.Ellipsis aria-label={item === 'start-ellipsis' ? 'Earlier pages' : 'Later pages'}>
                  ...
                </Pagination.Ellipsis>
              )}
            </Pagination.Item>
          ))
        }
      </Pagination.Pages>
      <Pagination.Item>
        <Pagination.Next disabled>Older</Pagination.Next>
      </Pagination.Item>
    </Pagination.Content>
  </Pagination.Root>
)
