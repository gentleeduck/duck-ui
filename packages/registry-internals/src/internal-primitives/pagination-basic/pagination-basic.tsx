'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import styles from '../primitives.module.css'

export default function PaginationBasicExample() {
  return (
    <Pagination.Root className={styles.pages} defaultPage={6} pageCount={12}>
      <Pagination.Content className={styles.pages}>
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
    </Pagination.Root>
  )
}
