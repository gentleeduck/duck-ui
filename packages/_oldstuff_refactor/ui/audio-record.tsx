import {
  ArrowBigUp,
  Download,
  Ellipsis,
  Mic,
  Pause,
  Play,
  Trash2,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import * as React from 'react'
import { Button } from '@/registry/registry-ui-components'
import { cn } from '@/lib'
import { Input } from './input'
import { AudioVisualizer, dataPoint, new_audio, process_blob, ProcessBlobParams, ThemeColor } from './audio-visualizer'
import { uuidv7 } from 'uuidv7'
import { AttachmentType } from './swapy'
import { PopoverWrapper } from './popover'
import { Slider } from './ShadcnUI'
import { downloadAttachment } from './comment'

export interface RecordingtType {
  id: string
  file: File | null
  url: string | null
  type: string
  name: string
  size: string
}

export interface RecordingParams {
  setRecordings: React.Dispatch<React.SetStateAction<RecordingtType[]>>
  setRecordedDuration: React.Dispatch<React.SetStateAction<number>>
  audioChunksRef: React.MutableRefObject<Blob[]>
}

export interface StopRecordingHandlerParam {
  setRecording: React.Dispatch<React.SetStateAction<boolean>>
  intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>
  durationRef: React.MutableRefObject<number>
}

export interface DeleteRecordingHandlerParams
  extends Pick<RecordingParams, 'audioChunksRef'>,
    StopRecordingHandlerParam {}

export interface StopRecordingHandlerParams
  extends Omit<StopRecordingHandlerParam, 'setRecording' | 'mediaRecorderRef' | 'durationRef'>,
    Omit<RecordingParams, 'setRecordedDuration'> {}

export interface StartTimerParams
  extends Omit<StopRecordingHandlerParam, 'setRecording' | 'mediaRecorderRef'>,
    Pick<RecordingParams, 'setRecordedDuration'> {}

export interface StartRecordingHandlerParams extends StopRecordingHandlerParam, RecordingParams {}

export const format_time_handler = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export interface VisualizerClickHandlerParams {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>
  event: React.MouseEvent<HTMLDivElement>
}

// Handle audio visualizer click
const visualizer_click_handler = ({ audioRef, event, setCurrentTime }: VisualizerClickHandlerParams) => {
  if (audioRef.current == null) return
  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const duration = audioRef.current.duration

  if (duration && duration > 0) {
    const newTime = (clickX / rect.width) * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime * 1000)
  }
}

// Start recording audio
export const start_recording_handler = async ({
  setRecordings,
  setRecording,
  setRecordedDuration,
  durationRef,
  intervalRef,
  audioChunksRef,
  mediaRecorderRef,
}: StartRecordingHandlerParams) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorderRef.current = new MediaRecorder(stream)
  audioChunksRef.current = []

  mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
    audioChunksRef.current.push(event.data)
  }

  mediaRecorderRef.current.onstop = () => {
    setRecordedDuration((_) => 0)
    durationRef.current > 0 &&
      Stop_recording_handler({
        setRecordings,
        intervalRef,
        audioChunksRef,
      })
  }

  mediaRecorderRef.current.start()
  setRecording(true)
  durationRef.current = 0
  start_timer_handler({ durationRef, intervalRef, setRecordedDuration })
}

// Stop recording and process audio blob
export const Stop_recording_handler = ({ setRecordings, intervalRef, audioChunksRef }: StopRecordingHandlerParams) => {
  const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })

  setRecordings((prev) => [
    ...prev,
    {
      id: uuidv7(),
      file: audioBlob as File,
      url: URL.createObjectURL(audioBlob),
      type: 'audio/wav',
      name: 'recording.wav',
      size: String(audioBlob.size),
    },
  ])
  clearInterval(intervalRef.current!)
}

// Stop recording audio
export const stop_recording_handle = ({ setRecording, intervalRef, mediaRecorderRef }: StopRecordingHandlerParam) => {
  mediaRecorderRef.current?.stop()
  setRecording(false)
  clearInterval(intervalRef.current!)
}

// Delete recording
export const deleteRecordingHandler = ({
  setRecording,
  intervalRef,
  mediaRecorderRef,
  durationRef,
  audioChunksRef,
}: DeleteRecordingHandlerParams) => {
  durationRef.current = 0
  audioChunksRef.current = []
  stop_recording_handle({
    setRecording,
    intervalRef,
    mediaRecorderRef,
    durationRef,
  })
}

// Start timer to track recording duration
export const start_timer_handler = ({ durationRef, intervalRef, setRecordedDuration }: StartTimerParams) => {
  clearInterval(intervalRef.current!)
  intervalRef.current = setInterval(() => {
    durationRef.current += 1000
    setRecordedDuration(durationRef.current)
  }, 1000)
}

// Define the type for the context
interface AudioContextType {
  recording: boolean
  recordedDuration: number
  startRecording: () => void
  stopRecording: () => void
  deleteRecording: () => void
}

// Default values for the context
const AudioContext = React.createContext<AudioContextType | undefined>(undefined)

// Use the custom hook to access the audio context
export const useAudioProvider = (): AudioContextType => {
  const context = React.useContext(AudioContext)
  if (!context) {
    throw new Error('useAudioContext must be used within an Audio')
  }
  return context
}

// AudioProvider component that will wrap the rest of the app
const Audio: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recordedDuration, setRecordedDuration] = React.useState<number>(0)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioChunksRef = React.useRef<Blob[]>([])
  const intervalRef = React.useRef<NodeJS.Timer | null>(null)
  const durationRef = React.useRef<number>(0)
  const { setRecordings, setRecording, recording } = useAudioDataProvider()

  // Start recording handler
  const startRecording = () => {
    start_recording_handler({
      setRecordings,
      setRecording,
      setRecordedDuration,
      durationRef,
      intervalRef,
      audioChunksRef,
      mediaRecorderRef,
    })
  }

  // Stop recording handler
  const stopRecording = () => {
    stop_recording_handle({
      setRecording,
      intervalRef,
      mediaRecorderRef,
      durationRef,
    })
  }

  // Delete recording handler
  const deleteRecording = () => {
    deleteRecordingHandler({
      intervalRef,
      mediaRecorderRef,
      setRecording,
      durationRef,
      audioChunksRef,
    })
  }

  // Cleanup audio element and interval on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Provide the state and functions to the children components
  return (
    <AudioContext.Provider
      value={{
        recording,
        recordedDuration,
        startRecording,
        stopRecording,
        deleteRecording,
      }}>
      {children}
    </AudioContext.Provider>
  )
}

export interface AudioTimerProps extends React.HTMLAttributes<HTMLDivElement> {
  showInput?: boolean
}

export const AudioTimer = React.forwardRef<HTMLDivElement, AudioTimerProps>(({ showInput, className }, ref) => {
  const { recording, recordedDuration } = useAudioProvider()
  return (
    <div className={cn('relative', className)} ref={ref}>
      <div
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 transition duration-100',
          recording ? 'opacity-1' : 'opacity-0 pointer-events-none right-4',
        )}>
        <span className="font-mono">{format_time_handler(recordedDuration)}</span>
        <span className="font-mono w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>
      <div>
        {showInput && (
          <Input
            disabled={recording}
            className={cn('transition fade_animation', recording ? 'w-[179px] !opacity-100' : 'w-[235px]')}
          />
        )}
      </div>
    </div>
  )
})

export interface AudioDeleteProps extends React.ComponentPropsWithoutRef<typeof Button> {}

export const AudioDelete = React.forwardRef<HTMLButtonElement, AudioDeleteProps>(
  ({ size, type, onClick, className, ...props }, ref) => {
    const { deleteRecording, recording } = useAudioProvider()
    return (
      <Button
        size={size ?? 'icon'}
        type={type ?? 'button'}
        onClick={(e) => {
          deleteRecording()
          onClick && onClick(e)
        }}
        className={cn(
          'rounded-full relative transition fade_animation',
          recording ? 'scale-1 opacity-1 w-8 h-8' : 'scale-0 opacity-0 pointer-events-none w-0 h-0',
          className,
        )}
        ref={ref}
        {...props}>
        <Trash2 className="size-[1rem] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition fade_animation" />
      </Button>
    )
  },
)

export interface AudioStartProps extends React.ComponentPropsWithoutRef<typeof Button> {}

export const AudioStart = React.forwardRef<HTMLButtonElement, AudioStartProps>(
  ({ size, type, onClick, className, ...props }, ref) => {
    const { startRecording, stopRecording, recording } = useAudioProvider()
    return (
      <Button
        size={size ?? 'icon'}
        type={type ?? 'button'}
        onClick={(e) => {
          recording ? stopRecording() : startRecording()
          onClick && onClick(e)
        }}
        className={cn('rounded-full transition relative w-8 h-8', recording ? 'ml-2' : 'ml-0', className)}
        ref={ref}
        {...props}>
        <Mic
          className={cn(
            'size-[1rem] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition fade_animation',
            recording ? 'scale-0 opacity-0 pointer-events-none' : 'scale-1 opacity-1',
          )}
        />
        <ArrowBigUp
          className={cn(
            'size-[1.18rem] absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition fade_animation stroke-[1.5]',
            recording ? 'scale-[1.1] opacity-1' : 'scale-0 opacity-0 pointer-events-none',
          )}
        />
      </Button>
    )
  },
)

const AudioVisualizerMemo = React.memo(AudioVisualizer)

const AudioItemWrapper = ({
  children,
  loading,
  isPlaying,
  attachment,
  timeLeft,
  size = 'sm',
  duration,
  handlePlayPause,
}: {
  size: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  attachment: AttachmentType
  duration: number
  loading: boolean
  isPlaying: boolean
  timeLeft: number
  handlePlayPause: () => void
}) => {
  return (
    <>
      <div
        className={cn(
          'flex items-center gap-4 transition bg-secondary hover:bg-secondary/70 py-2 px-4 rounded-lg w-fit relative overflow-hidden',
        )}>
        <div
          className={cn(
            'w-[150%] h-[200%] flex justify-center items-center bg-primary/5 rounded-full absolute top-50% -left-[150%] z-1 transition-all duration-500 ease-out',
            isPlaying && '-left-[25%]',
          )}
        />
        <Button
          onClick={handlePlayPause}
          size="icon"
          className={cn(
            'rounded-full relative z-10',
            size === 'sm' ? 'w-8 h-8 [&_svg]:size-4' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12',
          )}
          loading={loading}>
          <Play
            className={cn(
              'absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition fade_animation',
              !isPlaying && !loading ? 'scale-1 opacity-1' : 'scale-0 opacity-0 pointer-events-none',
            )}
          />
          <Pause
            className={cn(
              'absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 transition fade_animation',
              isPlaying && !loading ? 'scale-1 opacity-1' : 'scale-0 opacity-0 pointer-events-none',
            )}
          />
        </Button>

        {
          <div className="flex flex-col z-10">
            <div className="cursor-pointer w-fit p-0">{children}</div>

            <div className="flex items-center gap-2 mt-1">
              <span className={cn('flex items-center text-primary', size === 'sm' ? 'text-xs' : 'text-sm')}>
                {isPlaying || timeLeft < duration
                  ? format_time_handler(timeLeft > 0 ? timeLeft : 0)
                  : format_time_handler(duration)}
              </span>
              {
                /* TODO: YOU SHOULD EDIT THE OBJ TO GIVE YOU VALUE OF RECIPIENT OPENED THE RECORD */
                <span className="w-2 h-2 bg-primary rounded-full" />
              }

              <AudioSpeed />
              <AudioVolume />
              <AudioMoreOptions attachment={attachment} />
            </div>
          </div>
        }
      </div>
    </>
  )
}
export const AudioMoreOptions = ({ attachment }: { attachment: AttachmentType }) => {
  return (
    <PopoverWrapper
      trigger={{
        children: (
          <Button
            className={cn('w-8 h-4 rounded-full text-[.6rem] font-semibold')}
            variant={'default'}
            size={'sm'}
            icon={{
              className: '!w-3 !h-3',
              children: Ellipsis,
            }}
          />
        ),
      }}
      content={{
        side: 'top',
        align: 'center',
        className: 'w-fit p-2',
        children: (
          <div className="flex items-center space-x-2">
            <Button
              variant={'ghost'}
              size={'sm'}
              icon={{ children: Download, className: 'h-4 w-4' }}
              onClick={() => downloadAttachment({ attachment })}>
              Download
            </Button>
          </div>
        ),
      }}
    />
  )
}

const VolumeIcons = {
  0: VolumeX, // Muted
  1: Volume, // Low volume
  2: Volume1, // Medium volume
  3: Volume2, // High volume
}

export const AudioVolume = () => {
  const { volume, setVolume } = useAudioDataProvider()

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
  }

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeIcons[0] // Muted
    if (volume > 0 && volume <= 0.33) return VolumeIcons[1] // Low volume
    if (volume > 0.33 && volume <= 0.66) return VolumeIcons[2] // Medium volume
    return VolumeIcons[3] // High volume
  }

  return (
    <PopoverWrapper
      trigger={{
        children: (
          <Button
            className={cn('w-8 h-4 rounded-full text-[.6rem] font-semibold')}
            variant={'default'}
            size={'sm'}
            icon={{
              className: '!w-3 !h-3',
              children: getVolumeIcon(),
            }}
          />
        ),
      }}
      content={{
        side: 'top',
        align: 'center',
        className: 'w-[100px] p-2',
        children: (
          <div className="flex items-center space-x-2">
            <Slider
              className="[&>span]:h-[4px] [&_span[role='slider']]:w-4 [&_span[role='slider']]:h-4 [&_span[role='slider']]:mt-[-6px]"
              defaultValue={[volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
            />
          </div>
        ),
      }}
    />
  )
}

export const AudioSpeed = () => {
  const { speed, setSpeed } = useAudioDataProvider()

  return (
    <>
      <Button
        className={cn('w-8 h-4 rounded-full text-[.6rem] font-semibold')}
        variant={'default'}
        size={'sm'}
        onClick={() => setSpeed(speed > 1.5 ? 0.5 : speed + 0.5)}>
        x{speed}
      </Button>
    </>
  )
}

export interface AudioRecordItemProps {
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
  barHeight?: number
  barWidth?: number
  gap?: number
  attachment: AttachmentType
  backgroundColor?: ThemeColor
  barColor?: ThemeColor
  barPlayedColor?: ThemeColor
  minBarHeight?: number
  style?: React.CSSProperties
  audio: Blob | null
}

const AudioRecordItem = ({
  size = 'sm',
  audio,
  loading: loadingState,
  attachment,
  style,
  minBarHeight,
  barPlayedColor,
  gap,
  barColor,
  barWidth,
  barHeight,
  backgroundColor,
}: AudioRecordItemProps) => {
  const { duration: audioDuration, speed, volume } = useAudioDataProvider()
  const duration = audioDuration * 1000

  const [isPlaying, setIsPlaying] = React.useState<boolean>(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [loading, setLoading] = React.useState<boolean>(loadingState ?? true)
  const [currentTime, setCurrentTime] = React.useState<number>(0)
  const [timeLeft, setTimeLeft] = React.useState<number>(duration)

  React.useEffect(() => {
    setTimeLeft(duration - currentTime)
  }, [currentTime, duration])

  React.useEffect(() => {
    if (audio) {
      const audioURL = URL.createObjectURL(audio)
      audioRef.current = new_audio(audioURL)

      // Handle end of the audio
      audioRef.current.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        setTimeLeft(duration)
      }

      // Update current time as the audio plays
      audioRef.current.ontimeupdate = () => {
        setCurrentTime(audioRef.current!.currentTime * 1000)
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = ''
        }
      }
    }
  }, [audio])

  // Update the playback rate and keep the audio playing at the current time
  React.useEffect(() => {
    if (audioRef.current) {
      const wasPlaying = isPlaying
      const currentAudioTime = audioRef.current.currentTime

      // Pause the audio temporarily, change playback rate, and resume if it was playing
      audioRef.current.pause()
      audioRef.current.playbackRate = speed
      audioRef.current.currentTime = currentAudioTime
      audioRef.current.volume = volume

      if (wasPlaying) {
        audioRef.current.play()
      }
    }
  }, [speed, volume])

  // Play or pause audio
  const handlePlayPause = React.useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause()
    } else {
      audioRef.current?.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  return (
    <>
      <AudioItemWrapper
        size={size}
        attachment={{
          ...attachment,
          file: attachment.file ?? audio,
        }}
        loading={loading}
        duration={duration}
        isPlaying={isPlaying}
        handlePlayPause={handlePlayPause}
        timeLeft={timeLeft}
        children={
          <div onClick={(event) => visualizer_click_handler({ audioRef, event, setCurrentTime })}>
            <AudioVisualizerMemo
              setCurrentTime={setCurrentTime}
              blob={audio}
              width={barWidth ?? 180}
              height={barHeight ?? 27}
              barWidth={barWidth ?? 3}
              barPlayedColor={barPlayedColor}
              barColor={barColor}
              backgroundColor={backgroundColor}
              gap={gap ?? 2}
              currentTime={currentTime / 1000}
              setLoading={setLoading}
              style={style}
              minBarHeight={minBarHeight ?? 1}
            />
          </div>
        }
      />
    </>
  )
}

export interface FetchAudioBlobParams {
  url: string
  setAudioBlob: React.Dispatch<React.SetStateAction<Blob | null>>
}

export const fetchAudioBlob = async ({ url, setAudioBlob }: FetchAudioBlobParams) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error('Failed to fetch audio:', response.statusText)
      return setAudioBlob(null)
    }

    const blob = await response.blob()
    setAudioBlob(blob)
  } catch (error) {
    setAudioBlob(null)
    console.error('Error fetching audio:', error)
  }
}

export interface AudioItemProps {
  attachment: AttachmentType
}

const AudioItem: React.FC<AudioItemProps> = ({ attachment }) => {
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(attachment.file ? attachment.file : null)

  React.useEffect(() => {
    // if (contentSchema.safeParse(attachment).error) return
    if (!attachment.url || !attachment.url.startsWith('https://')) return
    fetchAudioBlob({ url: attachment.url, setAudioBlob })
  }, [attachment])

  return (
    <AudioDataProvider>
      <AudioRecordItem loading={audioBlob === null ? true : false} audio={audioBlob} attachment={attachment} />
    </AudioDataProvider>
  )
}

// Audio Provider
export interface AudioDataContextType {
  process_audio: (args: Omit<ProcessBlobParams, 'setAnimationProgress' | 'setDuration' | 'setData'>) => Promise<void>
  data: dataPoint[]
  speed: number
  setSpeed: React.Dispatch<React.SetStateAction<number>>
  animationProgress: number
  setAnimationProgress: React.Dispatch<React.SetStateAction<number>>
  recordings: RecordingtType[]
  setRecordings: React.Dispatch<React.SetStateAction<RecordingtType[]>>
  duration: number
  setDuration: React.Dispatch<React.SetStateAction<number>>
  recording: boolean
  setRecording: React.Dispatch<React.SetStateAction<boolean>>
  volume: number
  setVolume: React.Dispatch<React.SetStateAction<number>>
}

export const AudioDataContext = React.createContext<AudioDataContextType | undefined>(undefined)

const useAudioDataProvider = (): AudioDataContextType => {
  const context = React.useContext(AudioDataContext)
  if (!context) {
    throw new Error('useAudioProvider must be used within an AudioServiceProvider')
  }
  return context
}

export interface AudioProviderProps {
  children: React.ReactNode
}

const AudioDataProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [data, setData] = React.useState<dataPoint[]>([])
  const [duration, setDuration] = React.useState<number>(0)
  const [recordings, setRecordings] = React.useState<RecordingtType[]>([])
  const [speed, setSpeed] = React.useState<number>(1)
  const [volume, setVolume] = React.useState(1)
  const [animationProgress, setAnimationProgress] = React.useState<number>(0)
  const [recording, setRecording] = React.useState<boolean>(false)

  const process_audio = React.useCallback(
    async ({
      canvasRef,
      blob,
      barWidth,
      gap,
      backgroundColor,
      barColor,
      barPlayedColor,
      minBarHeight,
      setLoading,
      width,
      height,
    }: Omit<ProcessBlobParams, 'setAnimationProgress' | 'setDuration' | 'setData'>) => {
      await process_blob({
        canvasRef,
        blob,
        barWidth,
        gap,
        backgroundColor,
        barColor,
        barPlayedColor,
        minBarHeight,
        setLoading,
        setData,
        setDuration,
        setAnimationProgress,
        width,
        height,
      })
    },
    [],
  )

  return (
    <AudioDataContext.Provider
      value={{
        process_audio,
        recordings,
        setDuration,
        setRecordings,
        setAnimationProgress,
        data,
        duration,
        animationProgress,
        speed,
        setSpeed,
        recording,
        setRecording,
        volume,
        setVolume,
      }}>
      {children}
    </AudioDataContext.Provider>
  )
}

export { Audio, AudioItem, AudioRecordItem, AudioItemWrapper, AudioDataProvider, useAudioDataProvider }
