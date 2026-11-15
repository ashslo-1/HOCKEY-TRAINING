import { useState } from 'react'
import { motion } from 'framer-motion'

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.3 4.6 L4.7 10.1 c-.44.37-.7.92-.7 1.5 V19 a1.6 1.6 0 001.6 1.6 H9 v-4.4 a3 3 0 016 0 V20.6 h3.4 A1.6 1.6 0 0020 19 v-7.4 c0-.58-.26-1.13-.7-1.5 L12.7 4.6 a1.1 1.1 0 00-1.4 0 Z" fill="currentColor" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 20 V13 M10 20 V8 M15 20 V11 M20 20 V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function TargetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="13" r="7.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="11" cy="13" r="3.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 13 L19 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 5 H19 V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const items = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'stats', label: 'Stats', Icon: StatsIcon },
  { key: 'play', label: 'Play the save challenge', Icon: TargetIcon },
]

function go(key: string) {
  if (key === 'stats') document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' })
  else if (key === 'play') window.dispatchEvent(new Event('save-challenge:start'))
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function Navbar() {
  const [active, setActive] = useState('home')

  return (
    <div style={{ position: 'fixed', top: '26px', left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
      <motion.nav
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px',
          borderRadius: '999px',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          boxShadow: '0 12px 44px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.16)',
        }}
      >
        {items.map(({ key, label, Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => { setActive(key); go(key) }}
              aria-label={label}
              title={label}
              style={{
                position: 'relative', width: '58px', height: '30px', borderRadius: '999px',
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.62)',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)' }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.62)' }}
            >
              {isActive && (
                <motion.span
                  layoutId="dock-active"
                  style={{ position: 'absolute', inset: 0, borderRadius: '999px', background: 'rgba(0,0,0,0.34)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex' }}><Icon /></span>
            </button>
          )
        })}
      </motion.nav>
    </div>
  )
}
