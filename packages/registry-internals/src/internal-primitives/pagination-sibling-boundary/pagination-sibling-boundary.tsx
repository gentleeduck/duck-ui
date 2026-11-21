'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import * as React from 'react'
import styles from '../primitives.module.css'

export default function PaginationSiblingBoundaryExample() {
  const [siblingCount, setSiblingCount] = React.useState(1)
  const [boundaryCount, setBoundaryCount] = React.useState(1)

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <button className={styles.button} onClick={() => setSiblingCount((value) => (value + 1) % 3)} type="button">
          siblingCount {siblingCount}
        </button>
        <button className={styles.button} onClick={() => setBoundaryCount((value) => (value + 1) % 3)} type="button">
          boundaryCount {boundaryCount}
        </button>
      </div>
      <Pagination.Root boundaryCount={boundaryCount} defaultPage={10} pageCount={20} siblingCount={siblingCount}>
        <Pagination.Content className={styles.pages}>
          <Pagination.Pages />
        </Pagination.Content>
      </Pagination.Root>
      <p className={styles.note}>
        The list keeps one length on every page, so the controls never move under the pointer.
      </p>
    </div>
  )
}
