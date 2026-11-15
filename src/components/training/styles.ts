import type { CSSProperties } from 'react'
import { colors, eyebrow, fonts } from '../../theme'

// Shared styles for the Training page components.

export const smallLabel: CSSProperties = { ...eyebrow }

export const bodyText: CSSProperties = { fontFamily: fonts.sans, fontSize: '15px', lineHeight: 1.6, color: colors.textMuted, margin: 0 }

export const chipStyle = (active: boolean): CSSProperties => ({
  padding: '8px 14px', borderRadius: '999px', cursor: 'pointer',
  fontFamily: fonts.sans, fontSize: '12.5px', fontWeight: 500, letterSpacing: '0.02em',
  border: `1px solid ${active ? colors.ice : 'rgba(255,255,255,0.22)'}`,
  background: active ? 'rgba(159,216,255,0.16)' : 'transparent',
  color: active ? colors.ice : colors.textMuted,
})

export const iconButton: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minWidth: '34px', height: '34px', padding: '0 8px', borderRadius: '10px', cursor: 'pointer',
  border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.04)', color: colors.text,
  fontFamily: fonts.sans, fontSize: '13px',
}

export const levelColor: Record<string, string> = {
  Beginner: '#8be3b0',
  Intermediate: colors.ice,
  Advanced: colors.gold,
}

// Focus ring and print rules. Plain CSS text, no HTML injection.
export const trainingCss = `
.tr-focus:focus-visible { outline: 2px solid ${colors.ice}; outline-offset: 2px; }
.tr-focus:disabled { opacity: 0.35; cursor: default; }
.tr-input:focus-visible { outline: 2px solid ${colors.ice}; outline-offset: 1px; }
.tr-print { display: none; }
@media print {
  body * { visibility: hidden !important; }
  .tr-print, .tr-print * { visibility: visible !important; }
  .tr-print { display: block !important; position: absolute; left: 0; top: 0; width: 100%; color: #000; background: #fff; font-family: Georgia, serif; padding: 24px; }
  .tr-print h1 { font-size: 22px; margin: 0 0 6px; }
  .tr-print ol { padding-left: 20px; }
  .tr-print li { margin: 0 0 12px; }
}
`
