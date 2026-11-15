import type { EventKind } from '../../data/events'
import { fonts } from '../../theme'
import { kindColor } from './shared'

export function KindBadge({ kind }: { kind: EventKind }) {
  const c = kindColor[kind]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '999px', border: `1px solid ${c}`, color: c, fontFamily: fonts.sans, fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      <span aria-hidden style={{ width: '6px', height: '6px', borderRadius: '50%', background: c }} />
      {kind}
    </span>
  )
}
