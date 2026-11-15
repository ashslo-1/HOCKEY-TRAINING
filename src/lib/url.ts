// Returns the normalized URL when the input parses as an absolute https: URL, otherwise null.
export function safeHttpsUrl(raw: string | undefined | null): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw.trim())
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
