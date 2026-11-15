// Date helpers for the schedule. All grouping uses the visitor's local time zone.

export function parseDate(iso: string): Date | null {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

const pad = (n: number) => String(n).padStart(2, '0')

// Local calendar day key, e.g. '2026-12-05'
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Local month key, e.g. '2026-12'
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

export function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

// Local day keys covered by [start, end]. Capped so a bad entry cannot create a huge loop.
export function dayKeysBetween(start: Date, end: Date, max = 62): string[] {
  const keys: string[] = []
  const cursor = startOfDay(start)
  const last = startOfDay(end < start ? start : end)
  while (cursor <= last && keys.length < max) {
    keys.push(dayKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

export function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return ''
  }
}

const dateFmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
const dateTimeFmt = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
const monthFmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })

export const formatMonth = (d: Date) => monthFmt.format(d)
export const formatLongDate = (d: Date) => dateFmt.format(d)

// Returns a date line and a time line for an event, in the visitor's time zone.
export function formatEventWhen(start: Date, end: Date): { date: string; time: string } {
  if (dayKey(start) === dayKey(end)) {
    return { date: dateFmt.format(start), time: timeFmt.formatRange(start, end) }
  }
  return { date: dateTimeFmt.formatRange(start, end), time: '' }
}

// Weekday short names starting on Sunday, in the visitor's locale.
export function weekdayNames(style: 'short' | 'long' = 'short'): string[] {
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: style })
  // 2023-01-01 was a Sunday
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)))
}
