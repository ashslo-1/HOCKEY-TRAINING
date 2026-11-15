import type { Difficulty, Mode } from './config'

export type ShotKind = 'shot' | 'pass' | 'rebound'
export type ShotResult = 'save' | 'goal' | 'wide'

export type GameStatus = {
  phase: 'playing' | 'done'
  mode: Mode
  difficulty: Difficulty
  shot: number // shots counted so far (saves + goals)
  saves: number
  goals: number
  total: number | null // shots in the round, or null in Survival
  score: number // points in the Save Challenge, saves in Survival
  streak: number // current run of saves in a row
  bestStreak: number
  last: ShotResult | null // result of the most recent shot
  lastId: number // increases with every result, for keying flashes
  lastPoints: number // points from the most recent save
  incoming: ShotKind | null // what the shooter is doing now
}

// Moments the page can react to, for example with a sound
export type GameEvent = 'shot' | 'pass' | 'save' | 'goal' | 'board' | 'post' | 'wide'
