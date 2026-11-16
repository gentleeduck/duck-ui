import { CircleCheck, Loader } from 'lucide-react'
import type React from 'react'
import { toast } from 'sonner'
import { Button } from '../button'
import { Progress } from '../progress'
import { formatTime } from './sonner.libs'
import type { IUploadSonnerProps } from './sonner.types'

const dismiss = (id: string) => {
  toast.dismiss(id)
}

const SonnerUpload = ({
  progress,
  attachments,
  remainingTime = 0,
  onCancel,
  onComplete,
}: IUploadSonnerProps): React.JSX.Element => {
  const done = progress >= 100
  const percent = Math.min(100, Math.max(0, progress))
  const showRemaining = !done && remainingTime > 0 && Number.isFinite(remainingTime)

  return (
    <div className="flex w-full gap-3" data-slot="content">
      {done ? (
        <CircleCheck aria-hidden="true" className="mt-2 size-[18px]! fill-primary [&_path]:stroke-primary-foreground" />
      ) : (
        <Loader aria-hidden="true" className="mt-2 size-[18px]! animate-spin text-muted-foreground" />
      )}
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full justify-between">
          <p className="text-foreground text-sm">
            {done
              ? 'Upload complete'
              : attachments
                ? `Uploading ${attachments} file${attachments > 1 ? 's' : ''}...`
                : 'Uploading...'}
          </p>
          <div className="flex items-center gap-2">
            {showRemaining && (
              <p className="font-mono text-muted-foreground text-sm">{`${formatTime(remainingTime)} remaining -`}</p>
            )}
            <p className="font-mono text-muted-foreground text-sm">{`${percent}%`}</p>
          </div>
        </div>
        <Progress aria-label="Upload progress" className="h-1 w-full" value={percent} />
        <div className="flex w-full items-center justify-between gap-2">
          <small className="w-full text-muted-foreground text-xs">
            {done ? 'It is safe to close the browser now' : 'Please do not close the browser until completed'}
          </small>
          <Button
            border="default"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => (done ? onComplete : onCancel)?.(event, dismiss)}
            size="sm"
            variant="default">
            {done ? 'Complete' : 'Cancel'}
          </Button>
        </div>
      </div>
    </div>
  )
}

SonnerUpload.displayName = 'SonnerUpload'

export { SonnerUpload }
