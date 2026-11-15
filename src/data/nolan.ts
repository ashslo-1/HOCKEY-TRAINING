// Nolan Sloan's profile and season-by-season goalie stats.
// Source: https://www.eliteprospects.com/player/971563/nolan-sloan
// Add one entry per season to `seasons` (newest first). Leave a value as null if the source has no number for it.

export type Season = {
  season: string // e.g. "2025-26"
  team: string
  league: string
  gp: number | null // games played
  gaa: number | null // goals against average
  svPct: number | null // save percentage as a decimal, e.g. 0.915
  wins?: number | null
  losses?: number | null
  shutouts?: number | null
  playoffs?: boolean
}

export const profile = {
  name: 'Nolan Sloan',
  position: 'Goalie',
  eliteProspectsUrl: 'https://www.eliteprospects.com/player/971563/nolan-sloan',
  // Optional details shown in the profile row when filled in
  details: [] as { label: string; value: string }[],
}

export const seasons: Season[] = []

// .915 style, the way hockey save percentages are usually written
export const formatSvPct = (v: number | null | undefined) => (v == null ? '—' : v.toFixed(3).replace(/^0/, ''))

// Career save percentage weighted by games played, for comparison in the save challenge
export function careerSvPct(rows: Season[] = seasons): number | null {
  const valid = rows.filter((r) => !r.playoffs && r.svPct != null && r.gp)
  const games = valid.reduce((n, r) => n + (r.gp ?? 0), 0)
  if (!games) return null
  return valid.reduce((n, r) => n + (r.svPct ?? 0) * (r.gp ?? 0), 0) / games
}

