import { useEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Rink, { type GameStatus } from './Rink'
import { careerSvPct, formatSvPct } from '../data/nolan'

// Background video from the original template, loaded from its hosted URL
const VIDEO_URL = 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/templates/glacier/hero.mp4'

const label: CSSProperties = {
  fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.6)', fontFamily: "'Inter', sans-serif", textDecoration: 'none',
}

const pillButton: CSSProperties = {
  padding: '12px 26px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)',
  color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
}

function Social({ path }: { path: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" xmlns="http://www.w3.org/2000/svg">
      <path d={path} />
    </svg>
  )
}

export default function Hero() {
  const [playing, setPlaying] = useState(false)
  const [round, setRound] = useState(0)
  const [status, setStatus] = useState<GameStatus | null>(null)

  const start = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setStatus(null)
    setRound((n) => n + 1)
    setPlaying(true)
  }
  const quit = () => {
    setPlaying(false)
    setStatus(null)
  }

  // The navbar's target button starts a round through this event
  useEffect(() => {
    const onStart = () => start()
    window.addEventListener('save-challenge:start', onStart)
    return () => window.removeEventListener('save-challenge:start', onStart)
  }, [])

  const nolanSv = careerSvPct()
  const done = status?.phase === 'done'

  return (
    <section id="top" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#04080c', touchAction: playing ? 'none' : 'auto', '--rink-w': '90vw', '--rink-h': '60vh' } as CSSProperties}>
      <video style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} src={VIDEO_URL} autoPlay muted loop playsInline />
      <Rink playing={playing} round={round} onUpdate={setStatus} />
      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.26) 0%, transparent 22%, transparent 60%, rgba(0,0,0,0.38) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />
      {/* Dark radial gradient behind the text to keep it readable */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(760px, 100%)', height: '520px', background: 'radial-gradient(ellipse at center, rgba(2,10,18,0.5) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Centered lockup. Sizes come from .hero-* classes in index.css so the text fits inside the rink. */}
      <motion.div className="hero-content" animate={{ opacity: playing ? 0 : 1 }} transition={{ duration: 0.4 }} style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
        {/* Brand */}
        <motion.div
          className="hero-lockup"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Crossed sticks over a puck */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 2.5 L14.6 16.2 Q15.4 17.4 16.9 17.4 H21" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5 L9.4 16.2 Q8.6 17.4 7.1 17.4 H3" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              <ellipse cx="12" cy="21" rx="3.2" ry="1.3" fill="#fff" />
            </svg>
            <span className="hero-brand" style={{ fontWeight: 500, textTransform: 'uppercase', color: '#fff', fontFamily: "'Inter', sans-serif" }}>Goalie Coaching</span>
          </div>
          <span className="hero-tag" style={{ fontWeight: 500, textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', fontFamily: "'Inter', sans-serif" }}>Drills · Schedule · Goals</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.24, ease: 'easeOut' }}
          style={{ margin: 0, fontFamily: "'Playfair Display', Georgia, serif", textTransform: 'uppercase', color: '#fff', textShadow: '0 2px 40px rgba(0,0,0,0.55)' }}
        >
          <span className="hero-h1-top" style={{ display: 'block', fontWeight: 400, lineHeight: 1, letterSpacing: '0.02em' }}>Nolan</span>
          <span className="hero-h1-bottom" style={{ display: 'block', fontWeight: 700, lineHeight: 0.98, letterSpacing: '0.01em' }}>Sloan</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.42, ease: 'easeOut' }}
          style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5, color: 'rgba(255,255,255,0.88)', textShadow: '0 1px 20px rgba(0,0,0,0.6)' }}
        >
          Goalie drills, practice plans, and a training schedule from coach Nolan Sloan.
        </motion.p>

        {/* Oval button — true ellipse via border-radius: 50% */}
        <motion.button
          type="button"
          onClick={start}
          className="hero-btn"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.58, ease: 'easeOut' }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.97 }}
          style={{ borderRadius: '50%', border: '1px solid rgba(255,255,255,0.6)', color: '#fff', cursor: 'pointer', fontWeight: 500, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', pointerEvents: playing ? 'none' : 'auto' }}
        >
          Play Goalie
        </motion.button>
        <span className="hero-hint" style={{ marginTop: '12px', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
          Stop 10 shots in the save challenge
        </span>
      </motion.div>

      {/* Save challenge: score display while playing */}
      <AnimatePresence>
        {playing && !done && (
          <motion.div
            key="hud"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: '84px', left: 0, right: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none', padding: '0 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '10px 20px', borderRadius: '999px', background: 'rgba(4,10,16,0.7)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <span>Shot {Math.min((status?.shot ?? 0) + 1, status?.total ?? 10)}/{status?.total ?? 10}</span>
              <span style={{ color: '#9fd8ff' }}>Saves {status?.saves ?? 0}</span>
              <span style={{ color: '#ff8a8a' }}>Goals {status?.goals ?? 0}</span>
              <button type="button" onClick={quit} style={{ ...pillButton, padding: '6px 12px', fontSize: '10px', pointerEvents: 'auto' }}>Quit</button>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.75)', textAlign: 'center', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
              Slide the goalie with the gold ring to block shots. Use your mouse, finger, or arrow keys.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save challenge: "SAVE" or "GOAL" after each shot */}
      <AnimatePresence>
        {playing && !done && status?.last && (
          <motion.div
            key={`flash-${status.shot}`}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', zIndex: 20, textAlign: 'center', pointerEvents: 'none', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 'clamp(2.4rem, 9vw, 5rem)', textTransform: 'uppercase', color: status.last === 'save' ? '#bfe6ff' : '#ff6b6b', textShadow: '0 2px 30px rgba(0,0,0,0.7)' }}
          >
            {status.last === 'save' ? 'Save' : 'Goal'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save challenge: results */}
      <AnimatePresence>
        {playing && done && status && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(2,6,10,0.45)' }}
          >
            <div style={{ width: 'min(380px, 100%)', padding: '32px 26px', borderRadius: '24px', textAlign: 'center', background: 'rgba(8,16,24,0.88)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
              <div style={label}>Save challenge</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '64px', fontWeight: 700, lineHeight: 1.05, marginTop: '10px' }}>
                {status.saves}/{status.total}
              </div>
              <div style={{ ...label, marginTop: '6px' }}>Saves</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '22px', fontFamily: "'Inter', sans-serif" }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 600 }}>{formatSvPct(status.saves / status.total)}</div>
                  <div style={{ ...label, fontSize: '9.5px', marginTop: '4px' }}>Your save %</div>
                </div>
                {nolanSv != null && (
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 600 }}>{formatSvPct(nolanSv)}</div>
                    <div style={{ ...label, fontSize: '9.5px', marginTop: '4px' }}>Nolan's career save %</div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '28px', flexWrap: 'wrap' }}>
                <button type="button" onClick={start} style={{ ...pillButton, background: '#fff', color: '#06121c' }}>Play again</button>
                <button type="button" onClick={quit} style={pillButton}>Done</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer bar */}
      <motion.div
        className="hero-footer"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px 26px' }}
      >
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Social path="M15 8h-2a1 1 0 00-1 1v2h3l-.4 3H12v6H9v-6H7v-3h2V8.5A3.5 3.5 0 0112.5 5H15z" />
            <Social path="M4 4l6.8 8.2L4.3 20H6l5.6-6.3L16.5 20H20l-7.1-8.6L19.4 4h-1.7l-5.1 5.8L7.6 4z" />
            <Social path="M4.5 9H7v11H4.5zM5.75 4a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2zM9.5 9H12v1.6c.4-.8 1.6-1.7 3.2-1.7 2.6 0 3.3 1.6 3.3 4.2V20H16v-4.9c0-1.3-.5-2.1-1.6-2.1S12.5 13.8 12.5 15V20H9.5z" />
          </div>
          <a href="#privacy" style={label}>Privacy Policy</a>
        </div>

        {/* Center */}
        <div className="hero-footer-center" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', ...label, display: 'flex', gap: '5px' }}>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Scroll</span>
          <span>To Navigate</span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <a href="#terms" style={label}>Terms of Service</a>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.7 }}>
            <path d="M5 15V9M10 19V5M15 16V8M20 13v-2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>
    </section>
  )
}
