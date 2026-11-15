import type { EventKind, SiteEvent } from '../../data/events'
import { dayKeysBetween, parseDate } from '../../lib/dates'
import { colors } from '../../theme'

// Badge and calendar dot color for each event kind
export const kindColor: Record<EventKind, string> = {
  'Private lesson': colors.ice,
  'Group session': colors.blue,
  Camp: colors.red,
  Clinic: colors.gold,
  Game: '#5fd3a5',
  Other: 'rgba(255,255,255,0.6)',
}

// Map of local day key to the events that touch that day
export function eventsByDay(list: SiteEvent[]): Map<string, SiteEvent[]> {
  const map = new Map<string, SiteEvent[]>()
  for (const e of list) {
    const start = parseDate(e.start)
    const end = parseDate(e.end)
    if (!start || !end) continue
    for (const key of dayKeysBetween(start, end)) {
      const bucket = map.get(key)
      if (bucket) bucket.push(e)
      else map.set(key, [e])
    }
  }
  return map
}

