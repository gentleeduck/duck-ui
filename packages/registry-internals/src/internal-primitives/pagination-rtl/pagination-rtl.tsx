'use client'

import * as Pagination from '@gentleduck/primitives/pagination'
import styles from '../primitives.module.css'

export default function PaginationRtlExample() {
  return (
    <Pagination.Root defaultPage={3} dir="rtl" pageCount={8}>
      <Pagination.Content className={styles.pages}>
        <Pagination.Item>
          <Pagination.Previous>السابق</Pagination.Previous>
        </Pagination.Item>
        <Pagination.Pages />
        <Pagination.Item>
          <Pagination.Next>التالي</Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination.Root>
  )
}
