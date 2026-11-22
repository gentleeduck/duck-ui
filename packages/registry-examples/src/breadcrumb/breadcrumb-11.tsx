'use client'

import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  MotionBreadcrumbItem,
  MotionBreadcrumbSeparator,
} from '@gentleduck/registry-ui/breadcrumb'
import Link from 'next/link'

export default function Demo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <MotionBreadcrumbItem index={4}>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </MotionBreadcrumbItem>
        <MotionBreadcrumbSeparator index={3} />
        <MotionBreadcrumbItem index={2}>
          <BreadcrumbLink asChild>
            <Link href="/docs">Docs</Link>
          </BreadcrumbLink>
        </MotionBreadcrumbItem>
        <MotionBreadcrumbSeparator index={1} />
        <MotionBreadcrumbItem index={0}>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </MotionBreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
