import type { Difficulty, Mode } from './config'

// Personal bests and the sound setting live in localStorage. Every access is wrapped in
// try/catch so the game still works when storage is blocked or full.
const BEST_KEY = 'nolan-goalie-best-v1'
const SOUND_KEY = 'nolan-goalie-sound-v1'

export type Best = { score: number; saves: number; shots: number }
type BestTable = Partial<Record<string, Best>>

const bestKey = (mode: Mode, difficulty: Difficulty) => `${mode}:${difficulty}`

function readTable(): BestTable {
  try {
    const raw = window.localStorage.getItem(BEST_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as BestTable) : {}
  } catch {
    return {}
  }
}

function isBest(v: unknown): v is Best {
  return !!v && typeof v === 'object' && typeof (v as Best).score === 'number' && typeof (v as Best).saves === 'number' && typeof (v as Best).shots === 'number'
}

export function getBest(mode: Mode, difficulty: Difficulty): Best | null {
  const v = readTable()[bestKey(mode, difficulty)]
  return isBest(v) ? v : null
}

// Saves the result if it beats the stored best. Returns true for a new best.
export function recordResult(mode: Mode, difficulty: Difficulty, result: Best): boolean {
  const prev = getBest(mode, difficulty)
  if (prev && prev.score >= result.score) return false
  try {
    const table = readTable()
    table[bestKey(mode, difficulty)] = result
    window.localStorage.setItem(BEST_KEY, JSON.stringify(table))
  } catch {
    // Storage blocked: the result still counts as a best for this visit
  }
  return true
}

export function getSoundOn(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) === 'on'
  } catch {
    return false
  }
}

export function setSoundOn(on: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    // Storage blocked: the setting lasts until the page closes
  }
}
