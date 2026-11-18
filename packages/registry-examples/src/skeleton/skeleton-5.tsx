'use client'

import { Avatar, AvatarFallback } from '@gentleduck/registry-ui/avatar'
import { Button } from '@gentleduck/registry-ui/button'
import { Skeleton } from '@gentleduck/registry-ui/skeleton'
import * as React from 'react'

export default function Demo() {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!loading) return
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [loading])

  return (
    <div className="grid w-72 gap-4">
      <section aria-busy={loading} aria-label="Profile" className="flex items-center gap-4 rounded-lg border p-4">
        {loading ? (
          <>
            <span className="sr-only" role="status">
              Loading the profile
            </span>
            <Skeleton className="size-12 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="size-12">
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="font-medium text-sm leading-4">Ada Lovelace</p>
              <p className="text-muted-foreground text-xs leading-3">Analyst, London</p>
            </div>
          </>
        )}
      </section>
      <Button disabled={loading} onClick={() => setLoading(true)} size="sm" variant="outline">
        Reload
      </Button>
    </div>
  )
}
