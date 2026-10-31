'use client'

import { cn } from '@gentleduck/libs/cn'
import { Button } from '@gentleduck/registry-ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@gentleduck/registry-ui/drawer'
import { Separator } from '@gentleduck/registry-ui/separator'
import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import * as React from 'react'

const TASKS = [
  { id: 'plan', title: 'Plan the project', description: 'Outline key milestones and deliverables.' },
  { id: 'gather', title: 'Gather resources', description: 'Collect tools, assets, and information.' },
  { id: 'develop', title: 'Start development', description: 'Implement core features and iterate.' },
  { id: 'test', title: 'Testing phase', description: 'Debug, QA, and performance optimization.' },
  { id: 'launch', title: 'Launch & review', description: 'Deploy and gather feedback.' },
]

export default function Demo() {
  const [checked, setChecked] = React.useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const progress = Math.round((checked.size / TASKS.length) * 100)
  const allDone = checked.size === TASKS.length

  return (
    <Drawer shouldScaleBackground={false}>
      <DrawerTrigger asChild>
        <Button variant="outline">Open checklist</Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-md">
        <DrawerHeader className="text-start">
          <div className="flex items-center justify-between">
            <DrawerTitle>Launch checklist</DrawerTitle>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold text-xs transition-colors',
                allDone
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-muted text-muted-foreground',
              )}>
              {progress}%
            </span>
          </div>
          <DrawerDescription>Complete all steps before going live.</DrawerDescription>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all duration-500', allDone ? 'bg-green-500' : 'bg-primary')}
              style={{ width: `${progress}%` }}
            />
          </div>
        </DrawerHeader>

        <Separator />

        <div className="flex flex-col gap-1 px-4 py-3">
          {TASKS.map((task) => {
            const done = checked.has(task.id)
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => toggle(task.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5 text-start transition-colors hover:bg-accent/50',
                  done && 'opacity-60',
                )}>
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div>
                  <span className={cn('font-medium text-sm', done && 'line-through')}>{task.title}</span>
                  <p className="text-muted-foreground text-xs">{task.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <DrawerFooter>
          {allDone ? (
            <DrawerClose asChild>
              <Button className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Sparkles className="me-2 h-4 w-4" />
                Ship it
              </Button>
            </DrawerClose>
          ) : (
            <Button variant="secondary" disabled>
              {TASKS.length - checked.size} step{TASKS.length - checked.size !== 1 ? 's' : ''} remaining
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
