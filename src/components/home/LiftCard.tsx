import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from '../Link'
import { colors, eyebrow, fonts } from '../../theme'

// Linked card that lifts slightly on hover and keyboard focus
export function LiftCard({ to, kicker, title, children, cta }: { to: string; kicker: string; title: string; children: ReactNode; cta: string }) {
  return (
    <motion.div whileHover={{ y: -6 }} whileFocus={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} style={{ height: '100%' }}>
      <Link
        to={to}
        className="group block h-full rounded-[18px] transition-colors hover:border-[#9fd8ff]/60 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9fd8ff]"
        style={{ padding: '24px', background: colors.surface, border: `1px solid ${colors.border}`, color: colors.text, textDecoration: 'none' }}
      >
        <div style={eyebrow}>{kicker}</div>
        <h3 style={{ fontFamily: fonts.serif, fontSize: '24px', fontWeight: 700, textTransform: 'uppercase', margin: '10px 0 10px', lineHeight: 1.1 }}>{title}</h3>
        <p style={{ fontFamily: fonts.sans, fontSize: '15px', lineHeight: 1.6, color: colors.textMuted }}>{children}</p>
        <div style={{ ...eyebrow, color: colors.ice, marginTop: '18px' }}>
          {cta} <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </div>
      </Link>
    </motion.div>
  )
}
