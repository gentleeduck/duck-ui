import type { IJsonParseResult } from './json-editor.types'

export function safeStringify(value: unknown): string {
  if (value === null || value === undefined) return ''
  // A string holding JSON text edits as that text; any other string is a JSON string, quoted.
  if (typeof value === 'string' && tryParseJson(value).ok) return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ''
  }
}

export function tryParseJson(text: string): IJsonParseResult {
  const raw = text.trim()
  if (!raw) return { ok: true, value: null }

  try {
    return { ok: true, value: JSON.parse(raw) }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Invalid JSON' }
  }
}

export function isObjectLike(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function formatJson(text: string): { ok: true; formatted: string } | { ok: false; message: string } {
  const parsed = tryParseJson(text)
  if (!parsed.ok) return parsed
  if (parsed.value === null) return { ok: true, formatted: '' }

  return { ok: true, formatted: JSON.stringify(parsed.value, null, 2) }
}
