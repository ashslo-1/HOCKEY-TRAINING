import { motion } from 'framer-motion'
import { profile, seasons, careerSvPct, formatSvPct } from '../data/nolan'

const label = { fontFamily: "'Inter', sans-serif", fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.55)' }

const formatNum = (v: number | null | undefined, digits = 0) => (v == null ? '—' : v.toFixed(digits))

function Tile({ value, caption }: { value: string; caption: string }) {
  return (
    <div style={{ flex: '1 1 140px', padding: '22px 20px', borderRadius: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '40px', fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ ...label, marginTop: '10px' }}>{caption}</div>
    </div>
  )
}

export default function Stats() {
  const regular = seasons.filter((s) => !s.playoffs)
  const games = regular.reduce((n, s) => n + (s.gp ?? 0), 0)
  const latest = regular[0]
  const bestSv = regular.reduce<number | null>((b, s) => (s.svPct != null && (b == null || s.svPct > b) ? s.svPct : b), null)

  return (
    <section id="stats" style={{ position: 'relative', padding: '110px 20px 120px', background: 'linear-gradient(to bottom, #04080c, #0a1520 60%, #04080c)' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: 'easeOut' }}>
          <div style={label}>{profile.position} · Stats</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 700, textTransform: 'uppercase', margin: '10px 0 0', lineHeight: 1 }}>
            {profile.name}
          </h2>
          {profile.details.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', marginTop: '18px' }}>
              {profile.details.map((d) => (
                <div key={d.label} style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{ ...label, marginRight: '8px' }}>{d.label}</span>{d.value}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {seasons.length === 0 ? (
          <div style={{ marginTop: '40px', padding: '28px', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif", fontSize: '15px', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
            Season stats are not added yet. See them on{' '}
            <a href={profile.eliteProspectsUrl} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>Elite Prospects</a>.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '40px' }}>
              <Tile value={formatNum(games)} caption="Career games" />
              <Tile value={formatSvPct(careerSvPct())} caption="Career save %" />
              <Tile value={formatSvPct(bestSv)} caption="Best season save %" />
              <Tile value={formatNum(latest?.gaa, 2)} caption={`GAA ${latest?.season ?? ''}`} />
            </div>

            <div style={{ marginTop: '28px', overflowX: 'auto', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter', sans-serif", fontSize: '14px', minWidth: '560px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {['Season', 'Team', 'League', 'GP', 'GAA', 'SV%', 'W-L', 'SO'].map((h, i) => (
                      <th key={h} style={{ ...label, textAlign: i < 3 ? 'left' : 'right', padding: '14px 16px', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {seasons.map((s, i) => (
                    <tr key={`${s.season}-${s.team}-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>{s.season}{s.playoffs ? ' (playoffs)' : ''}</td>
                      <td style={{ padding: '13px 16px' }}>{s.team}</td>
                      <td style={{ padding: '13px 16px', color: 'rgba(255,255,255,0.7)' }}>{s.league}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>{formatNum(s.gp)}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>{formatNum(s.gaa, 2)}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'right', fontWeight: 600 }}>{formatSvPct(s.svPct)}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>{s.wins == null && s.losses == null ? '—' : `${s.wins ?? 0}-${s.losses ?? 0}`}</td>
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>{formatNum(s.shutouts)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ ...label, marginTop: '14px', letterSpacing: '0.08em', textTransform: 'none' }}>
              Source: <a href={profile.eliteProspectsUrl} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.8)' }}>Elite Prospects</a>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
