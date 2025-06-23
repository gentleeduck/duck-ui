export type Message<T extends 'init' | 'message' | 'history' = 'init'> = {
  type: 'init' | 'message' | 'history'
  data: T extends 'init'
    ? { user_id: string; name: string }
    : T extends 'history'
      ? ChatHistory[]
      : {
          user_id: string
          name: string
          message: string
          timestamp: number
        }
}

export type ChatHistory = {
  user_id: string
  name: string
  message: string
  timestamp: number
}
