import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import Rink from './Rink'

const label: CSSProperties = {
  fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.6)', fontFamily: "'Inter', sans-serif", textDecoration: 'none',
}

function Social({ path }: { path: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)" xmlns="http://www.w3.org/2000/svg">
      <path d={path} />
    </svg>
  )
}

export default function Hero() {
  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#04080c', '--rink-w': '90vw', '--rink-h': '60vh' } as CSSProperties}>
      <Rink />
      {/* Overlays */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.26) 0%, transparent 22%, transparent 60%, rgba(0,0,0,0.38) 100%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 18%, transparent 82%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />
      {/* Dark radial gradient behind the text to keep it readable */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(760px, 100%)', height: '520px', background: 'radial-gradient(ellipse at center, rgba(2,10,18,0.5) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Centered lockup. Sizes come from .hero-* classes in index.css so the text fits inside the rink. */}
      <div className="hero-content" style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
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
        <motion.a
          href="#train"
          className="hero-btn"
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.58, ease: 'easeOut' }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.97 }}
          style={{ borderRadius: '50%', border: '1px solid rgba(255,255,255,0.6)', color: '#fff', textDecoration: 'none', fontWeight: 500, textTransform: 'uppercase', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', pointerEvents: 'auto' }}
        >
          Start Training
        </motion.a>
      </div>

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
