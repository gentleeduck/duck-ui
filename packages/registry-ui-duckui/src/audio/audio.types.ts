export interface RecordingParams {
  setRecordings: React.Dispatch<React.SetStateAction<RecordingtType[]>>
  setRecordedDuration: React.Dispatch<React.SetStateAction<number>>
  audioChunksRef: React.RefObject<Blob[]>
}

export interface StopRecordingHandlerParam {
  setRecording: React.Dispatch<React.SetStateAction<boolean>>
  intervalRef: React.RefObject<NodeJS.Timeout | null>
  mediaRecorderRef: React.RefObject<MediaRecorder | null>
  durationRef: React.RefObject<number>
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
export interface RecordingtType {
  id: string
  file: File | null
  url: string | null
  type: string
  name: string
  size: string
}

export interface VisualizerClickHandlerParams {
  audioRef: React.RefObject<HTMLAudioElement | null>
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>
  event: React.MouseEvent<HTMLDivElement>
}

export interface AttachmentType {
  id: string
  file: Blob | null
  url: string | null
  type: string
  name: string
  size: string
}
