import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { buttonStyle, colors, eyebrow, fonts } from '../theme'
import { formatSvPct } from '../data/nolan'
import { DIFFICULTY_LABEL, MODE_INFO, MODE_LABEL, SURVIVAL_GOALS, type Difficulty, type GameSettings, type Mode } from './config'
import type { Best } from './storage'
import type { GameStatus } from './types'

// Overlays for the /play page: start menu, HUD, result flash, pause and results.

const panel: CSSProperties = {
  width: 'min(520px, 100%)', padding: '22px 22px', borderRadius: '24px',
  background: 'rgba(8,16,24,0.9)', border: `1px solid ${colors.border}`,
  backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
}

const sectionLabel: CSSProperties = { ...eyebrow, marginTop: '18px', marginBottom: '8px' }

const smallButton: CSSProperties = { ...buttonStyle('outline'), padding: '9px 16px', fontSize: '10.5px' }

const iconButton: CSSProperties = {
  width: '38px', height: '38px', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(4,10,16,0.7)', color: '#fff', cursor: 'pointer',
  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', flexShrink: 0,
}

function choiceStyle(selected: boolean): CSSProperties {
  return {
    flex: '1 1 0', minWidth: 0, textAlign: 'left', cursor: 'pointer', padding: '12px 14px', borderRadius: '14px',
    border: `1px solid ${selected ? colors.gold : colors.border}`,
    background: selected ? 'rgba(255,205,80,0.1)' : colors.surface,
    color: colors.text, fontFamily: fonts.sans,
  }
}

// Full-screen layer that centers its card. Scrolls when the card is taller than the screen.
function Overlay({ children, reduced, dim = 0.35, label }: { children: ReactNode; reduced: boolean; dim?: number; label: string }) {
  return (
    <motion.div
      role="dialog" aria-label={label}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.25 }}
      style={{ position: 'absolute', inset: 0, zIndex: 30, overflowY: 'auto', background: `rgba(2,6,10,${dim})`, padding: '84px 16px 24px', display: 'flex' }}
    >
      <motion.div
        initial={{ y: reduced ? 0 : 14 }} animate={{ y: 0 }} transition={{ duration: reduced ? 0 : 0.3, ease: 'easeOut' }}
        style={{ ...panel, margin: 'auto' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      {on ? (
        <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  )
}

function bestText(mode: Mode, best: Best | null) {
  if (!best) return 'No best score yet for this mode and difficulty.'
  return mode === 'challenge'
    ? `Your best: ${best.score} points (${best.saves}/${best.shots} saves)`
    : `Your best: ${best.score} saves`
}

const DIFFICULTY_INFO: Record<Difficulty, string> = {
  easy: 'Slower shots and longer windups.',
  medium: 'Faster shots and more passes.',
  hard: 'Quick releases, more passes and rebounds.',
}

type MenuProps = {
  settings: GameSettings
  onChange: (s: GameSettings) => void
  best: Best | null
  soundOn: boolean
  onToggleSound: () => void
  onStart: () => void
  reduced: boolean
}

export function StartMenu({ settings, onChange, best, soundOn, onToggleSound, onStart, reduced }: MenuProps) {
  return (
    <Overlay reduced={reduced} label="Game menu">
      <div style={eyebrow}>Goalie game</div>
      <h1 style={{ fontFamily: fonts.serif, fontSize: 'clamp(2rem, 7vw, 2.8rem)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1, margin: '10px 0 0' }}>Play Goalie</h1>
      <p style={{ fontFamily: fonts.sans, fontSize: '14px', lineHeight: 1.55, color: colors.textMuted, marginTop: '12px' }}>
        You play the goalie with the gold ring in the right net, or the bottom net when the rink is upright. Slide across the crease to block shots.
        A dashed line shows where each shot is aimed.
      </p>

      <div style={sectionLabel}>Mode</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['challenge', 'survival'] as Mode[]).map((m) => (
          <button key={m} type="button" aria-pressed={settings.mode === m} onClick={() => onChange({ ...settings, mode: m })} style={{ ...choiceStyle(settings.mode === m), textAlign: 'center', padding: '11px 6px', fontSize: '13.5px', fontWeight: 600 }}>
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>
      <div style={{ fontFamily: fonts.sans, fontSize: '12.5px', lineHeight: 1.45, color: colors.textMuted, marginTop: '8px' }}>{MODE_INFO[settings.mode]}</div>

      <div style={sectionLabel}>Difficulty</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
          <button key={d} type="button" aria-pressed={settings.difficulty === d} onClick={() => onChange({ ...settings, difficulty: d })} style={{ ...choiceStyle(settings.difficulty === d), textAlign: 'center', padding: '10px 6px', fontSize: '13px', fontWeight: 600 }}>
            {DIFFICULTY_LABEL[d]}
          </button>
        ))}
      </div>
      <div style={{ fontFamily: fonts.sans, fontSize: '12.5px', color: colors.textMuted, marginTop: '8px' }}>{DIFFICULTY_INFO[settings.difficulty]}</div>
      <div style={{ fontFamily: fonts.sans, fontSize: '13px', color: colors.ice, marginTop: '14px' }}>{bestText(settings.mode, best)}</div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
        <button type="button" onClick={onToggleSound} aria-pressed={soundOn} style={{ ...smallButton, gap: '8px' }}>
          <SoundIcon on={soundOn} /> Sound {soundOn ? 'on' : 'off'}
        </button>
        <button type="button" onClick={onStart} style={buttonStyle('solid')}>Start</button>
      </div>

      <div style={sectionLabel}>Controls</div>
      <ul style={{ listStyle: 'none', fontFamily: fonts.sans, fontSize: '13px', lineHeight: 1.6, color: colors.textMuted, display: 'grid', gap: '2px' }}>
        <li><strong style={{ color: colors.text }}>Mouse:</strong> move the pointer along the goal line and the goalie follows it.</li>
        <li><strong style={{ color: colors.text }}>Touch:</strong> drag anywhere on the screen. The goalie moves as far as you drag.</li>
        <li><strong style={{ color: colors.text }}>Keyboard:</strong> arrow keys move the goalie. Esc or P pauses.</li>
      </ul>
    </Overlay>
  )
}

function Stat({ label, value, color }: { label: string; value: ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
      <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: colors.textFaint, whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{ fontSize: '15px', fontWeight: 700, color: color ?? colors.text, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  )
}

type HudProps = {
  status: GameStatus | null
  settings: GameSettings
  wide: boolean // true when the HUD shares the navbar's row
  soundOn: boolean
  onToggleSound: () => void
  onPause: () => void
}

export function Hud({ status, settings, wide, soundOn, onToggleSound, onPause }: HudProps) {
  const challenge = settings.mode === 'challenge'
  const pill: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: wide ? '18px' : '12px', padding: '6px 16px', borderRadius: '999px',
    background: 'rgba(4,10,16,0.72)', border: '1px solid rgba(255,255,255,0.14)',
    backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', fontFamily: fonts.sans, minWidth: 0,
  }
  const s = status
  const stats = (
    <div style={pill} aria-live="polite">
      {challenge
        ? <Stat label="Shot" value={`${Math.min((s?.shot ?? 0) + 1, s?.total ?? 10)}/${s?.total ?? 10}`} />
        : <Stat label="Goals" value={`${s?.goals ?? 0}/${SURVIVAL_GOALS}`} color="#ff8a8a" />}
      <Stat label="Saves" value={s?.saves ?? 0} color={colors.ice} />
      {challenge && <Stat label="Goals" value={s?.goals ?? 0} color="#ff8a8a" />}
      <Stat label="Streak" value={s?.streak ?? 0} color={colors.gold} />
      {challenge && <Stat label="Points" value={s?.score ?? 0} />}
    </div>
  )
  const buttons = (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button type="button" onClick={onToggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'} title={soundOn ? 'Sound on' : 'Sound off'} style={iconButton}>
        <SoundIcon on={soundOn} />
      </button>
      <button type="button" onClick={onPause} aria-label="Pause" title="Pause (Esc or P)" style={iconButton}>
        <PauseIcon />
      </button>
    </div>
  )
  const label = `${MODE_LABEL[settings.mode]} · ${DIFFICULTY_LABEL[settings.difficulty]}`

  if (wide) {
    return (
      <>
        <div style={{ position: 'absolute', top: '26px', left: '24px', zIndex: 20, display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
          {stats}
          <span style={{ ...eyebrow, paddingLeft: '16px' }}>{label}</span>
        </div>
        <div style={{ position: 'absolute', top: '28px', right: '24px', zIndex: 20 }}>{buttons}</div>
      </>
    )
  }
  return (
    <div style={{ position: 'absolute', top: '78px', left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '0 12px' }}>
      {stats}
      {buttons}
    </div>
  )
}

// Short message under the HUD for passes and rebounds
export function IncomingTag({ status, top }: { status: GameStatus | null; top: number }) {
  const kind = status?.incoming
  const text = kind === 'pass' ? 'Pass across' : kind === 'rebound' ? 'Rebound' : null
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          style={{ position: 'absolute', top: `${top}px`, left: 0, right: 0, zIndex: 19, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}
        >
          <span style={{ padding: '4px 12px', borderRadius: '999px', background: kind === 'rebound' ? 'rgba(255,205,80,0.9)' : 'rgba(159,216,255,0.9)', color: '#06121c', fontFamily: fonts.sans, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {text}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// "Save", "Goal" or "Wide" after each shot
export function ResultFlash({ status, reduced }: { status: GameStatus | null; reduced: boolean }) {
  const last = status?.last
  const show = !!status && status.phase === 'playing' && !!last
  const text = last === 'save' ? 'Save' : last === 'goal' ? 'Goal' : 'Wide'
  const color = last === 'save' ? '#bfe6ff' : last === 'goal' ? '#ff6b6b' : 'rgba(255,255,255,0.75)'
  let detail = ''
  if (status && last === 'save') {
    const parts = []
    if (status.lastPoints) parts.push(`+${status.lastPoints}`)
    if (status.streak >= 2) parts.push(`${status.streak} in a row`)
    detail = parts.join(' · ')
  } else if (last === 'wide') {
    detail = 'Missed the net. Shot retaken.'
  }
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`flash-${status.lastId}`}
          initial={{ opacity: 0, scale: reduced ? 1 : 0.8 }} animate={{ opacity: [0, 1, 1, 0], scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1.1, times: [0, 0.15, 0.75, 1] }}
          style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', zIndex: 20, textAlign: 'center', pointerEvents: 'none' }}
        >
          <div style={{ fontFamily: fonts.serif, fontWeight: 700, fontSize: last === 'wide' ? 'clamp(1.8rem, 6vw, 3rem)' : 'clamp(2.4rem, 9vw, 5rem)', textTransform: 'uppercase', color, textShadow: '0 2px 30px rgba(0,0,0,0.7)', lineHeight: 1 }}>{text}</div>
          {detail && <div style={{ fontFamily: fonts.sans, fontSize: '14px', fontWeight: 600, color: colors.gold, marginTop: '8px', textShadow: '0 1px 10px rgba(0,0,0,0.8)' }}>{detail}</div>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function PauseMenu({ onResume, onRestart, onQuit, reduced }: { onResume: () => void; onRestart: () => void; onQuit: () => void; reduced: boolean }) {
  return (
    <Overlay reduced={reduced} dim={0.55} label="Paused">
      <div style={{ textAlign: 'center' }}>
        <div style={eyebrow}>Game paused</div>
        <h2 style={{ fontFamily: fonts.serif, fontSize: '2.4rem', fontWeight: 700, textTransform: 'uppercase', margin: '10px 0 0' }}>Paused</h2>
        <p style={{ fontFamily: fonts.sans, fontSize: '13px', color: colors.textMuted, marginTop: '10px' }}>Press Esc or P to resume.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '22px' }}>
          <button type="button" onClick={onResume} style={buttonStyle('solid')} autoFocus>Resume</button>
          <button type="button" onClick={onRestart} style={buttonStyle('outline')}>Restart</button>
          <button type="button" onClick={onQuit} style={buttonStyle('outline')}>Quit to menu</button>
        </div>
      </div>
    </Overlay>
  )
}

type ResultsProps = {
  status: GameStatus
  best: Best | null
  newBest: boolean
  nolanSv: number | null
  onAgain: () => void
  onMenu: () => void
  reduced: boolean
}

export function Results({ status, best, newBest, nolanSv, onAgain, onMenu, reduced }: ResultsProps) {
  const challenge = status.mode === 'challenge'
  const svPct = status.shot ? status.saves / status.shot : null
  const big: CSSProperties = { fontSize: '22px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }
  const small: CSSProperties = { ...eyebrow, fontSize: '9.5px', marginTop: '4px' }
  const cell: CSSProperties = { width: '108px' }
  return (
    <Overlay reduced={reduced} dim={0.45} label="Results">
      <div style={{ textAlign: 'center' }}>
        <div style={eyebrow}>{MODE_LABEL[status.mode]} · {DIFFICULTY_LABEL[status.difficulty]}</div>
        <div style={{ fontFamily: fonts.serif, fontSize: '60px', fontWeight: 700, lineHeight: 1.05, marginTop: '10px' }}>
          {challenge ? `${status.saves}/${status.shot}` : status.saves}
        </div>
        <div style={{ ...eyebrow, marginTop: '6px' }}>Saves</div>
        {newBest && (
          <div style={{ display: 'inline-block', marginTop: '14px', padding: '4px 12px', borderRadius: '999px', background: colors.gold, color: '#06121c', fontFamily: fonts.sans, fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            New personal best
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 8px', marginTop: '22px', fontFamily: fonts.sans }}>
          <div style={cell}><div style={big}>{formatSvPct(svPct)}</div><div style={small}>Your save %</div></div>
          {challenge && <div style={cell}><div style={big}>{status.score}</div><div style={small}>Points</div></div>}
          <div style={cell}><div style={big}>{status.bestStreak}</div><div style={small}>Longest streak</div></div>
          <div style={cell}><div style={big}>{best ? best.score : '—'}</div><div style={small}>{challenge ? 'Best points' : 'Best saves'}</div></div>
          {nolanSv != null && <div style={cell}><div style={big}>{formatSvPct(nolanSv)}</div><div style={small}>Nolan's career save %</div></div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '28px', flexWrap: 'wrap' }}>
          <button type="button" onClick={onAgain} style={buttonStyle('solid')} autoFocus>Play again</button>
          <button type="button" onClick={onMenu} style={buttonStyle('outline')}>Change mode</button>
        </div>
      </div>
    </Overlay>
  )
}
