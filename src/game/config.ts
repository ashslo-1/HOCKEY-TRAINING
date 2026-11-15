export type Mode = 'challenge' | 'survival'
export type Difficulty = 'easy' | 'medium' | 'hard'

export const SHOTS_PER_ROUND = 10 // Save Challenge length
export const SURVIVAL_GOALS = 3 // Survival ends after this many goals

export type GameSettings = { mode: Mode; difficulty: Difficulty }

export type DifficultyTuning = {
  shotSpeed: number // base shot speed, ft/s
  shotSpeedRandom: number // extra random speed added to each shot
  ramp: number // speed added per shot taken
  maxRamp: number // cap on the added speed
  windup: number // seconds the shooter holds the puck before the first shot
  windupMin: number // shortest windup after the ramp
  windupRamp: number // seconds removed from the windup per shot taken
  reboundWindup: number // seconds before a rebound shot
  passChance: number // chance a play starts with a pass
  reboundChance: number // chance a save is followed by a rebound shot
  goalieSpeed: number // player goalie side-to-side speed, ft/s
}

export const DIFFICULTY: Record<Difficulty, DifficultyTuning> = {
  easy: {
    shotSpeed: 50, shotSpeedRandom: 10, ramp: 2.5, maxRamp: 30,
    windup: 1.3, windupMin: 0.8, windupRamp: 0.03, reboundWindup: 0.7,
    passChance: 0.2, reboundChance: 0.25, goalieSpeed: 42,
  },
  medium: {
    shotSpeed: 62, shotSpeedRandom: 14, ramp: 4, maxRamp: 45,
    windup: 1.0, windupMin: 0.5, windupRamp: 0.04, reboundWindup: 0.5,
    passChance: 0.35, reboundChance: 0.35, goalieSpeed: 34,
  },
  hard: {
    shotSpeed: 74, shotSpeedRandom: 18, ramp: 5, maxRamp: 55,
    windup: 0.8, windupMin: 0.38, windupRamp: 0.04, reboundWindup: 0.38,
    passChance: 0.5, reboundChance: 0.45, goalieSpeed: 29,
  },
}

// In Survival the speed and windup ramp more slowly, since the round can run long
export const SURVIVAL_RAMP_SCALE = 0.6

export const MODE_LABEL: Record<Mode, string> = { challenge: 'Save Challenge', survival: 'Survival' }
export const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

export const MODE_INFO: Record<Mode, string> = {
  challenge: `Face ${SHOTS_PER_ROUND} shots. Each save scores points, with a bonus for streaks and rebound saves.`,
  survival: `Shots keep coming and get faster. The round ends after ${SURVIVAL_GOALS} goals. Your score is your number of saves.`,
}

// Points for a save in the Save Challenge
export function savePoints(streak: number, rebound: boolean) {
  return 100 + Math.min(100, (streak - 1) * 20) + (rebound ? 50 : 0)
}
