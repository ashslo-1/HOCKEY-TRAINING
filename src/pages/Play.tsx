import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, useReducedMotion } from 'framer-motion'
import Rink from '../components/Rink'
import { careerSvPct } from '../data/nolan'
import { colors } from '../theme'
import type { GameSettings } from '../game/config'
import type { GameEvent, GameStatus } from '../game/types'
import { getBest, getSoundOn, recordResult, setSoundOn, type Best } from '../game/storage'
import { GameSound } from '../game/sound'
import { Hud, IncomingTag, PauseMenu, ResultFlash, Results, StartMenu } from '../game/PlayUI'

type Screen = 'menu' | 'playing' | 'results'
type Outcome = { status: GameStatus; best: Best | null; newBest: boolean }

// The HUD moves into the navbar's row when there is room on both sides of it
const WIDE_HUD_MIN = 1100

function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }))
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

export default function PlayPage() {
  const reduced = !!useReducedMotion()
  const { w } = useViewport()
  const wide = w >= WIDE_HUD_MIN

  const [screen, setScreen] = useState<Screen>('menu')
  const [settings, setSettings] = useState<GameSettings>({ mode: 'challenge', difficulty: 'easy' })
  const [round, setRound] = useState(0)
  const [paused, setPaused] = useState(false)
  const [status, setStatus] = useState<GameStatus | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [soundOn, setSound] = useState(getSoundOn)
  const [menuBest, setMenuBest] = useState<Best | null>(() => getBest('challenge', 'easy'))

  // Sound effects. The AudioContext is closed when the page unmounts.
  const soundRef = useRef<GameSound | null>(null)
  const soundOnRef = useRef(soundOn)
  useEffect(() => {
    soundOnRef.current = soundOn
  }, [soundOn])
  useEffect(() => {
    const sound = new GameSound()
    soundRef.current = sound
    return () => {
      sound.close()
      soundRef.current = null
    }
  }, [])

  const toggleSound = () => {
    const next = !soundOn
    setSound(next)
    setSoundOn(next)
    if (next) soundRef.current?.unlock()
  }

  const onEvent = useCallback((e: GameEvent) => {
    if (soundOnRef.current) soundRef.current?.play(e)
  }, [])

  const onUpdate = useCallback((s: GameStatus) => {
    setStatus(s)
    if (s.phase === 'done') {
      const newBest = recordResult(s.mode, s.difficulty, { score: s.score, saves: s.saves, shots: s.shot })
      const stored = getBest(s.mode, s.difficulty)
      setOutcome({ status: s, newBest, best: newBest ? { score: s.score, saves: s.saves, shots: s.shot } : stored })
      setScreen('results')
    }
  }, [])

  const changeSettings = (next: GameSettings) => {
    setSettings(next)
    setMenuBest(getBest(next.mode, next.difficulty))
  }

  const start = () => {
    if (soundOn) soundRef.current?.unlock()
    window.scrollTo(0, 0)
    setStatus(null)
    setOutcome(null)
    setPaused(false)
    setRound((n) => n + 1)
    setScreen('playing')
  }

  const toMenu = () => {
    setPaused(false)
    setStatus(null)
    setOutcome(null)
    setMenuBest(getBest(settings.mode, settings.difficulty))
    setScreen('menu')
  }

  // Esc or P toggles pause during a round
  useEffect(() => {
    if (screen !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen])

  // Pause when the tab is hidden or the window loses focus
  useEffect(() => {
    if (screen !== 'playing') return
    const onHide = () => {
      if (document.hidden) setPaused(true)
    }
    const onBlur = () => setPaused(true)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('blur', onBlur)
    }
  }, [screen])

  const playing = screen !== 'menu'
  const active = screen === 'playing' && !paused
  const hudBottom = wide ? 90 : 124
  const insets = { top: hudBottom + 4, bottom: 20 }

  const main: CSSProperties = {
    position: 'relative', width: '100%', height: '100svh', minHeight: '320px', overflow: 'hidden',
    background: `radial-gradient(ellipse at center, ${colors.bgRaised} 0%, ${colors.bg} 70%)`,
    // Block page scrolling and text selection only while the player is controlling the goalie
    touchAction: active ? 'none' : 'auto',
    userSelect: active ? 'none' : 'auto',
    WebkitUserSelect: active ? 'none' : 'auto',
  }

  return (
    <main style={main} aria-label="Goalie game">
      <Rink playing={playing} paused={paused || screen !== 'playing'} round={round} settings={settings} insets={insets} onUpdate={onUpdate} onEvent={onEvent} />

      {screen === 'playing' && (
        <>
          <Hud status={status} settings={settings} wide={wide} soundOn={soundOn} onToggleSound={toggleSound} onPause={() => setPaused(true)} />
          <IncomingTag status={status} top={hudBottom + 10} />
          <ResultFlash status={status} reduced={reduced} />
        </>
      )}

      <AnimatePresence>
        {screen === 'menu' && (
          <StartMenu key="menu" settings={settings} onChange={changeSettings} best={menuBest} soundOn={soundOn} onToggleSound={toggleSound} onStart={start} reduced={reduced} />
        )}
        {screen === 'playing' && paused && (
          <PauseMenu key="pause" onResume={() => setPaused(false)} onRestart={start} onQuit={toMenu} reduced={reduced} />
        )}
        {screen === 'results' && outcome && (
          <Results key="results" status={outcome.status} best={outcome.best} newBest={outcome.newBest} nolanSv={careerSvPct()} onAgain={start} onMenu={toMenu} reduced={reduced} />
        )}
      </AnimatePresence>
    </main>
  )
}
