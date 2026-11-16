import { motion } from 'framer-motion'
import { Link } from './Link'
import { useRoute } from '../router'

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

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 12.2 L11 14.7 L15.6 9.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="5.5" width="16" height="15" rx="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 9.6 H20" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 3.6 V6.4 M15.5 3.6 V6.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <g fill="currentColor">
        <circle cx="8.4" cy="13" r="0.9" /><circle cx="12" cy="13" r="0.9" /><circle cx="15.6" cy="13" r="0.9" />
        <circle cx="8.4" cy="16.6" r="0.9" /><circle cx="12" cy="16.6" r="0.9" /><circle cx="15.6" cy="16.6" r="0.9" />
      </g>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8.5" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20 c0-3.6 3.1-6 7-6 s7 2.4 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7 L12 12.6 L19.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const items = [
  { path: '/', label: 'Home', Icon: HomeIcon },
  { path: '/training', label: 'Training', Icon: CheckIcon },
  { path: '/schedule', label: 'Schedule', Icon: CalendarIcon },
  { path: '/stats', label: 'Stats', Icon: StatsIcon },
  { path: '/about', label: 'About', Icon: PersonIcon },
  { path: '/contact', label: 'Contact', Icon: MailIcon },
]

export default function Navbar() {
  const path = useRoute()

  return (
    <div style={{ position: 'fixed', top: '26px', left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '0 12px' }}>
      <motion.nav
        aria-label="Main"
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}
        className="dock"
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
        {items.map(({ path: to, label, Icon }) => {
          const isActive = path === to
          return (
            <Link
              key={to}
              to={to}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              title={label}
              className="dock-btn"
              style={{
                position: 'relative', height: '30px', borderRadius: '999px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.62)',
                transition: 'color 0.2s ease',
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="dock-active"
                  style={{ position: 'absolute', inset: 0, borderRadius: '999px', background: 'rgba(0,0,0,0.34)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex' }}><Icon /></span>
            </Link>
          )
        })}
      </motion.nav>
    </div>
  )
}
