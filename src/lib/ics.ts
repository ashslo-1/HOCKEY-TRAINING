import type { SiteEvent } from '../data/events'

// Builds RFC 5545 iCalendar files in the browser. No runtime imports so the generator stays easy to test.

const CRLF = '\r\n'

// Escape TEXT values: backslash, semicolon, comma and newlines (RFC 5545 section 3.3.11).
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

const encoder = new TextEncoder()

// Fold a content line so no physical line exceeds 75 octets (RFC 5545 section 3.1).
// Splits only between code points so multi-byte UTF-8 characters stay intact.
export function foldIcsLine(line: string): string {
  const out: string[] = []
  let current = ''
  let octets = 0
  let limit = 75
  for (const ch of line) {
    const size = encoder.encode(ch).length
    if (octets + size > limit) {
      out.push(current)
      current = ' '
      octets = 1
      limit = 75
    }
    current += ch
    octets += size
  }
  out.push(current)
  return out.join(CRLF)
}

const pad = (n: number) => String(n).padStart(2, '0')

// UTC date-time in basic format, e.g. 20261205T230000Z
export function toIcsUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

const UID_DOMAIN = 'nolan-sloan-goalie-coaching'

// signupUrl must already be validated as https by the caller; pass null to leave it out.
export function buildIcs(event: SiteEvent, signupUrl: string | null, now: Date = new Date()): string {
  const start = new Date(event.start)
  const end = new Date(event.end)
  const descriptionParts = [event.details?.trim(), signupUrl ? `Sign up: ${signupUrl}` : undefined].filter(Boolean) as string[]
  const uidLocal = event.id.replace(/[^A-Za-z0-9._-]/g, '-') || 'event'

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nolan Sloan Goalie Coaching//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uidLocal}@${UID_DOMAIN}`,
    `DTSTAMP:${toIcsUtc(now)}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end > start ? end : start)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ]
  if (event.location.trim()) lines.push(`LOCATION:${escapeIcsText(event.location)}`)
  if (descriptionParts.length) lines.push(`DESCRIPTION:${escapeIcsText(descriptionParts.join('\n\n'))}`)
  if (signupUrl) lines.push(`URL:${signupUrl}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')

  return lines.map(foldIcsLine).join(CRLF) + CRLF
}

export function icsFileName(event: SiteEvent): string {
  const base = event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60).replace(/^-+|-+$/g, '')
  return `${base || 'event'}.ics`
}

// Triggers a download of the event's .ics file and revokes the object URL afterwards.
export function downloadIcs(event: SiteEvent, signupUrl: string | null): void {
  const blob = new Blob([buildIcs(event, signupUrl)], { type: 'text/calendar;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = icsFileName(event)
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  try {
    a.click()
  } finally {
    a.remove()
    // Give the browser a moment to start the download before releasing the URL
    window.setTimeout(() => URL.revokeObjectURL(href), 1000)
  }
}
