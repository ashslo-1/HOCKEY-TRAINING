// Upcoming sessions, camps, clinics and games. Add entries here; past events are hidden automatically.
// Dates use ISO format with a time zone offset so they display correctly everywhere, e.g. '2026-12-05T17:00:00-06:00'.

export type EventKind = 'Private lesson' | 'Group session' | 'Camp' | 'Clinic' | 'Game' | 'Other'

export type SiteEvent = {
  id: string // unique, used for links and calendar files
  title: string
  kind: EventKind
  start: string // ISO date-time with offset
  end: string // ISO date-time with offset
  location: string
  details?: string
  spots?: number | null // open spots, if limited
  signupUrl?: string // optional external sign-up link (https only)
}

export const events: SiteEvent[] = []
