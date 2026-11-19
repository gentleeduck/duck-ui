'use client'

import { cn } from '@gentleduck/libs/cn'
import type { Block } from '@gentleduck/registers'
import { Badge } from '@gentleduck/registry-ui/badge'
import { Label } from '@gentleduck/registry-ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { Separator } from '@gentleduck/registry-ui/separator'
import { Switch } from '@gentleduck/registry-ui/switch'
import { TabsList, TabsTrigger } from '@gentleduck/registry-ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@gentleduck/registry-ui/toggle-group'
import { CircleHelp, Monitor, Smartphone, Tablet } from 'lucide-react'
import type * as React from 'react'
import type { PanelImperativeHandle } from 'react-resizable-panels'
import { StyleSwitcher } from '~/components/themes'
import { useLiftMode } from '~/hooks/use-lift-mode'
import { trackEvent } from '~/lib'
import { BlockCopyButton } from './block-copy-button'

export function BlockToolbar({
  block,
  resizablePanelRef,
}: {
  block: Block & { hasLiftMode: boolean }
  resizablePanelRef: React.RefObject<PanelImperativeHandle>
}) {
  const { isLiftMode, toggleLiftMode } = useLiftMode(block.name)

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="flex items-center gap-2">
        <TabsList className="hidden h-7 rounded-md p-0 px-[calc(theme(spacing.1)_-_2px)] py-[theme(spacing.1)] sm:flex">
          <TabsTrigger className="h-[1.45rem] rounded-xs px-2 text-xs" disabled={isLiftMode} value="preview">
            Preview
          </TabsTrigger>
          <TabsTrigger className="h-[1.45rem] rounded-xs px-2 text-xs" disabled={isLiftMode} value="code">
            Code
          </TabsTrigger>
        </TabsList>
        <Separator className="mx-2 hidden h-4 md:flex" orientation="vertical" />
        <StyleSwitcher className="h-[calc(theme(spacing.7)_-_1px)] dark:h-7" disabled={isLiftMode} />
        <Popover>
          <PopoverTrigger
            className="hidden text-muted-foreground hover:text-foreground disabled:opacity-50 sm:flex"
            disabled={isLiftMode}>
            <CircleHelp aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="sr-only">Block description</span>
          </PopoverTrigger>
          <PopoverContent className="space-y-3 rounded-[0.5rem] text-sm" side="top" sideOffset={20}>
            <p className="font-medium">What is the difference between the New York and Default style?</p>
            <p>A style comes with its own set of components, animations, icons and more.</p>
            <p>
              The <span className="font-medium">Default</span> style has larger inputs, uses lucide-react for icons and
              tailwindcss-animate for animations.
            </p>
            <p>
              The <span className="font-medium">New York</span> style ships with smaller buttons and inputs. It also
              uses shadows on cards and buttons.
            </p>
          </PopoverContent>
        </Popover>
        <div className="hidden items-center gap-2 sm:flex">
          <Separator className="mx-2 mr-0 hidden h-4 md:flex" orientation="vertical" />
          <div className="flex items-center gap-2">
            <a href={`#${block.name}`}>
              <Badge className={cn('bg-transparent', isLiftMode && 'opacity-50')} variant="secondary">
                {block.name}
              </Badge>
            </a>
          </div>
        </div>
      </div>
      {block.code && (
        <div className="flex items-center gap-2 pr-[14px] sm:ml-auto">
          {block.hasLiftMode && (
            <>
              <div className="flex h-7 items-center justify-between gap-2">
                <Label className="text-xs" htmlFor={`lift-mode-${block.name}`}>
                  Lift Mode
                </Label>
                <Switch
                  checked={isLiftMode}
                  id={`lift-mode-${block.name}`}
                  onCheckedChange={(value) => {
                    resizablePanelRef.current?.resize(100)
                    toggleLiftMode(block.name)

                    if (value) {
                      trackEvent({
                        name: 'enable_lift_mode',
                        properties: {
                          name: block.name,
                        },
                      })
                    }
                  }}
                />
              </div>
              <Separator className="mx-2 hidden h-4 lg:inline-flex" orientation="vertical" />
            </>
          )}
          <div className="hidden h-7 items-center gap-1.5 rounded-md border p-[2px] shadow-xs md:flex">
            <ToggleGroup
              defaultValue="100"
              deselectable={false}
              disabled={isLiftMode}
              onValueChange={(value) => {
                if (resizablePanelRef.current) {
                  resizablePanelRef.current.resize(Number.parseInt(value, 10))
                }
              }}
              type="single">
              <ToggleGroupItem aria-label="Desktop view" className="size-6 rounded-xs p-0" value="100">
                <Monitor aria-hidden="true" className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem aria-label="Tablet view" className="size-6 rounded-xs p-0" value="60">
                <Tablet aria-hidden="true" className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem aria-label="Mobile view" className="size-6 rounded-xs p-0" value="30">
                <Smartphone aria-hidden="true" className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Separator className="mx-2 hidden h-4 md:flex" orientation="vertical" />
          <BlockCopyButton
            code={block.files?.[0]?.content as string}
            disabled={isLiftMode}
            event="copy_block_code"
            name={block.name}
          />
        </div>
      )}
    </div>
  )
}
