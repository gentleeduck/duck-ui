'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import styles from '../primitives.module.css'

export default function PaginationCustomPagesExample() {
  return (
    <Pagination.Root defaultPage={4} pageCount={9}>
      <Pagination.Content className={styles.pages}>
        <Pagination.Pages>
          {(items) =>
            items.map((item) => (
              <Pagination.Item key={item}>
                {typeof item === 'number' ? (
                  <Pagination.Page aria-label={`Page ${item}`} value={item}>
                    {String(item).padStart(2, '0')}
                  </Pagination.Page>
                ) : (
                  <Pagination.Ellipsis>...</Pagination.Ellipsis>
                )}
              </Pagination.Item>
            ))
          }
        </Pagination.Pages>
      </Pagination.Content>
    </Pagination.Root>
  )
}
