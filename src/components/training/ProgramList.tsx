import { programs } from '../../data/training'
import { colors, fonts } from '../../theme'
import { Card } from '../ui'
import { Link } from '../Link'
import { bodyText, smallLabel } from './styles'

// Program formats. Price and duration show "Contact for details" until they are filled in.
export function ProgramList() {
  return (
    <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))' }}>
      {programs.map((p) => (
        <Card key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontFamily: fonts.serif, fontSize: '22px', fontWeight: 700, margin: 0 }}>{p.name}</h3>
          <p style={bodyText}>{p.summary}</p>
          <ul style={{ ...bodyText, fontSize: '14px', paddingLeft: '18px', display: 'grid', gap: '6px' }}>
            {p.whatHappens.map((w) => <li key={w}>{w}</li>)}
          </ul>
          <dl style={{ marginTop: 'auto', display: 'grid', gap: '8px', paddingTop: '14px', borderTop: `1px solid ${colors.border}` }}>
            {([['Price', p.price], ['Duration', p.duration]] as const).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4px 12px', alignItems: 'baseline' }}>
                <dt style={smallLabel}>{label}</dt>
                <dd style={{ margin: 0, fontFamily: fonts.sans, fontSize: '14px', whiteSpace: 'nowrap' }}>
                  {value ? value : <Link to="/contact" className="tr-focus" style={{ color: colors.ice }}>Contact for details</Link>}
                </dd>
              </div>
            ))}
          </dl>
        </Card>
      ))}
    </div>
  )
}
