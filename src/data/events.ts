// Upcoming sessions, camps, clinics and games. Add entries here; past events are hidden automatically.
// Dates use ISO format with a time zone offset so they display correctly everywhere, e.g. '2026-12-05T17:00:00-06:00'.
//
// Example entry (copy into the array below and edit):
// {
//   id: 'group-session-2026-12-05',      // unique, letters/numbers/dashes
//   title: 'Goalie group session',
//   kind: 'Group session',               // one of the EventKind values below
//   start: '2026-12-05T17:00:00-06:00',
//   end: '2026-12-05T18:30:00-06:00',
//   location: 'Rink name, City',
//   details: 'Bring full gear. Ages 10 to 14.',  // optional
//   spots: 6,                            // optional, open spots left
//   signupUrl: 'https://example.com/signup',     // optional, https only
// },

export type EventKind = 'Private lesson' | 'Group session' | 'Camp' | 'Clinic' | 'Game' | 'Other'

export const eventKinds: EventKind[] = ['Private lesson', 'Group session', 'Camp', 'Clinic', 'Game', 'Other']

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

// Events that have not ended yet, sorted by start time. Entries with unreadable dates are skipped.
export function upcomingEvents(now: Date = new Date(), list: SiteEvent[] = events): SiteEvent[] {
  const t = now.getTime()
  return list
    .map((e) => ({ e, start: Date.parse(e.start), end: Date.parse(e.end) }))
    .filter(({ start, end }) => !Number.isNaN(start) && !Number.isNaN(end) && Math.max(start, end) >= t)
    .sort((a, b) => a.start - b.start || a.e.title.localeCompare(b.e.title))
    .map(({ e }) => e)
}
