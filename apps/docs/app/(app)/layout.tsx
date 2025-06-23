'use client'
import { SiteHeader } from '~/components/layouts/site-header'
import { SiteFooter } from '~/components/layouts/site-footer'
import { CommandMenu } from '~/components/layouts'
import {
  Audio,
  AudioDataProvider,
  AudioDelete,
  AudioStart,
  AudioTimer,
  useAudioDataProvider,
} from '@gentleduck/registry-ui-duckui/audio'
import { Popover, PopoverContent, PopoverTrigger } from '@gentleduck/registry-ui-duckui/popover'
import { ScrollArea } from '@gentleduck/registry-ui-duckui/scroll-area'
import { Button } from '@gentleduck/registry-ui-duckui/button'
import { cn } from '@gentleduck/libs/cn'
import { Paperclip } from 'lucide-react'
import React from 'react'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  // const html = document.documentElement
  // html.setAttribute('dir', 'rtl')
  return (
    <div data-wrapper="" className="flex items-center place-content-center min-h-screen flex-col gap-8">
      <AudioProvider />
    </div>
    // <SiteHeader />
    // <main className="flex flex-1 flex-col">{children}</main>
    //   <SiteFooter />
  )
}

export function AudioProvider() {
  return (
    <AudioDataProvider>
      <Audio>
        <AudioTimer />
        {
          // <CommentExtraButton />
        }
        <AudioDelete />
        <AudioStart />
        asdf
        {
          // <CommentSendButton />
        }
      </Audio>
    </AudioDataProvider>
  )
}

export const CommentsAttachments = React.forwardRef<HTMLDivElement, CommentBottomButtonsProps>(
  ({ className, children, ...props }, ref) => {
    const { recordings } = useAudioDataProvider()

    return (
      <div className={cn('absolute bottom-6 w-full', className)} ref={ref} {...props}>
        <Popover>
          <PopoverTrigger className={cn('')}>
            <Button
              size={'sm'}
              className={cn(
                'absolute left-0 gap-2 flex items-center h-fit py-1 transition-all duration-400 ease-out',
                [...recordings].length > 0
                  ? 'bottom-4 opacity-100 pointer-events-all'
                  : '-bottom-4 opacity-0 pointer-events-none',
              )}
              icon={<Paperclip className="!size-[.8rem]" />}>
              <span className="text-xs">Attachments</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" side="top" className={cn('p-2 mb-1 w-full')}>
            <ScrollArea>
              <div className="grid items justify-start gap-2 shrink-0 w-full grid-cols-2 max-h-[104px]">
                {children
                  ? children
                  : [...recordings].map((attachment, idx) => (
                      <CommentAttachmentItem key={attachment.id ?? idx} attachment={attachment} />
                    ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    )
  },
)
