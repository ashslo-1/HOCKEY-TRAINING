import type { CSSProperties } from 'react'

// Shared design tokens and building blocks. Every page should use these so the site looks consistent.

export const colors = {
  bg: '#04080c',
  bgRaised: '#0a1520',
  surface: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.1)',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.7)',
  textFaint: 'rgba(255,255,255,0.55)',
  ice: '#9fd8ff', // light blue accent
  red: '#e12d39', // rink red line
  blue: '#2e74f5', // rink blue line
  gold: '#ffcd50', // player highlight in the game
}

export const fonts = {
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Inter', sans-serif",
}

export const eyebrow: CSSProperties = {
  fontFamily: fonts.sans, fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.16em',
  textTransform: 'uppercase', color: colors.textFaint,
}

export const buttonStyle = (variant: 'solid' | 'outline' = 'outline'): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  padding: '13px 28px', borderRadius: '999px', cursor: 'pointer', textDecoration: 'none',
  fontFamily: fonts.sans, fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
  border: '1px solid rgba(255,255,255,0.55)',
  background: variant === 'solid' ? '#fff' : 'rgba(255,255,255,0.06)',
  color: variant === 'solid' ? '#06121c' : '#fff',
})

