import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { colors, eyebrow, fonts } from '../theme'

// Shared page building blocks. Style values live in src/theme.ts.

// Full page wrapper for every route except Home. Leaves room for the fixed navbar.
export function Page({ children }: { children: ReactNode }) {
  return (
    <main style={{ minHeight: '100svh', background: `linear-gradient(to bottom, ${colors.bg}, ${colors.bgRaised} 40%, ${colors.bg})`, padding: '120px 20px 80px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto' }}>{children}</div>
    </main>
  )
}

export function PageHeader({ kicker, title, intro }: { kicker: string; title: string; intro?: ReactNode }) {
  return (
    <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ marginBottom: '48px' }}>
      <div style={eyebrow}>{kicker}</div>
      <h1 style={{ fontFamily: fonts.serif, fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1, margin: '12px 0 0' }}>{title}</h1>
      {intro && <p style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: '18px', lineHeight: 1.6, color: colors.textMuted, maxWidth: '640px', marginTop: '18px' }}>{intro}</p>}
    </motion.header>
  )
}

export function Section({ title, kicker, children, id }: { title?: string; kicker?: string; children: ReactNode; id?: string }) {
  return (
    <motion.section id={id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ marginTop: '64px' }}>
      {kicker && <div style={eyebrow}>{kicker}</div>}
      {title && <h2 style={{ fontFamily: fonts.serif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, margin: kicker ? '8px 0 22px' : '0 0 22px' }}>{title}</h2>}
      {children}
    </motion.section>
  )
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ padding: '24px', borderRadius: '18px', background: colors.surface, border: `1px solid ${colors.border}`, ...style }}>{children}</div>
  )
}

// Honest empty state for content the site owner has not filled in yet
export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '24px', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.22)', fontFamily: fonts.sans, fontSize: '15px', lineHeight: 1.6, color: colors.textMuted }}>{children}</div>
  )
}
