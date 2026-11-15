'use client'

import { useCopyToClipboard } from '@gentleduck/hooks/use-copy-to-clipboard'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@gentleduck/registry-ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui/popover'
import { IconBookmark, IconCheck, IconCopy, IconInfoCircle } from '@tabler/icons-react'
import * as React from 'react'

export default function Demo() {
  const { copyToClipboard, isCopied } = useCopyToClipboard()
  const [isBookmarked, setIsBookmarked] = React.useState(false)

  return (
    <div className="grid w-full max-w-sm gap-6">
      <InputGroup>
        <InputGroupInput placeholder="https://deploy.acme.dev/p/abc123" readOnly />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Copy"
            onClick={() => {
              copyToClipboard('https://deploy.acme.dev/p/abc123')
            }}
            size="icon-xs"
            title="Copy">
            {isCopied ? <IconCheck aria-hidden="true" /> : <IconCopy aria-hidden="true" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup className="[--radius:9999px]">
        <Popover>
          <PopoverTrigger asChild>
            <InputGroupAddon>
              <InputGroupButton aria-label="SSL info" size="icon-xs" variant="secondary">
                <IconInfoCircle aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="flex flex-col gap-1 rounded-xl text-sm">
            <p className="font-medium">SSL certificate is valid.</p>
            <p>Connection to this site is encrypted and verified.</p>
          </PopoverContent>
        </Popover>
        <InputGroupAddon className="ps-1.5 text-muted-foreground">https://</InputGroupAddon>
        <InputGroupInput id="input-secure-19" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Bookmark"
            aria-pressed={isBookmarked}
            onClick={() => setIsBookmarked(!isBookmarked)}
            size="icon-xs">
            <IconBookmark
              className="data-[saved=true]:fill-blue-600 data-[saved=true]:stroke-blue-600"
              data-saved={isBookmarked}
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Filter by tag..." />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Apply</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}
