'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import styles from '../primitives.module.css'

export default function PaginationLinksExample() {
  return (
    <div className={styles.stack}>
      <Pagination.Root defaultPage={2} getPageHref={(page) => `?page=${page}`} pageCount={6}>
        <Pagination.Content className={styles.pages}>
          <Pagination.Item>
            <Pagination.Previous />
          </Pagination.Item>
          <Pagination.Pages />
          <Pagination.Item>
            <Pagination.Next rel="next" />
          </Pagination.Item>
          <Pagination.Item>
            <Pagination.Last rel="noopener" target="_blank">
              Last, in a new tab
            </Pagination.Last>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination.Root>
      <p className={styles.note}>
        getPageHref makes every control a link, with a link's own target and rel. One with nowhere to go loses its
        address.
      </p>
    </div>
  )
}
