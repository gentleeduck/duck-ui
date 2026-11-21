'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import * as React from 'react'
import styles from '../primitives.module.css'

const ITEMS = Array.from({ length: 47 }, (_, index) => `Order #${1000 + index}`)
const PER_PAGE = 5

export default function PaginationControlledExample() {
  const [page, setPage] = React.useState(1)
  const shown = ITEMS.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className={styles.stack}>
      <ul className={styles.note} style={{ margin: 0, paddingInlineStart: '1rem' }}>
        {shown.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Pagination.Root onPageChange={setPage} page={page} pageCount={Math.ceil(ITEMS.length / PER_PAGE)}>
        <Pagination.Content className={styles.pages}>
          <Pagination.Item>
            <Pagination.Previous />
          </Pagination.Item>
          <Pagination.Pages />
          <Pagination.Item>
            <Pagination.Next />
          </Pagination.Item>
        </Pagination.Content>
      </Pagination.Root>
    </div>
  )
}
