import * as React from 'react'
import type { IUseJsonEditorHotkeysOptions } from './json-editor.types'

export function useJsonEditorHotkeys({ enabled, onEscape, onSave }: IUseJsonEditorHotkeysOptions) {
  return React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // A key that confirms or cancels an IME composition belongs to the composition.
      if (!enabled || event.nativeEvent.isComposing) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape()
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        onSave()
      }
    },
    [enabled, onEscape, onSave],
  )
}
