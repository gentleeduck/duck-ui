'use client'

import { useCopyToClipboard } from '@gentleduck/hooks/use-copy-to-clipboard'
import { Button } from '@gentleduck/registry-ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@gentleduck/registry-ui/tooltip'
import { Check, Copy } from 'lucide-react'
import * as React from 'react'

const COMMAND = 'npx @gentleduck/cli add tooltip'

export default function Demo() {
  const [open, setOpen] = React.useState(false)
  // A tap opens no tooltip, so the copy opens it to show that it worked.
  const { copyToClipboard, isCopied } = useCopyToClipboard({ onCopy: () => setOpen(true) })

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 rounded-md border py-1 ps-3 pe-1">
        <code className="text-sm">{COMMAND}</code>
        <Tooltip onOpenChange={setOpen} open={open}>
          <TooltipTrigger asChild disableCloseOnClick>
            <Button aria-label="Copy the command" onClick={() => copyToClipboard(COMMAND)} size="icon" variant="ghost">
              {isCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isCopied ? 'Copied' : 'Copy'}</TooltipContent>
        </Tooltip>
        <span aria-live="polite" className="sr-only">
          {isCopied ? 'Copied the command.' : ''}
        </span>
      </div>
    </TooltipProvider>
  )
}
