import { Link } from './Link'
import { nav, site } from '../data/site'
import { colors, eyebrow, fonts } from '../theme'

export default function SiteFooter() {
  return (
    <footer style={{ background: colors.bg, borderTop: `1px solid ${colors.border}`, padding: '40px 20px 48px' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: fonts.serif, fontSize: '22px', fontWeight: 700, textTransform: 'uppercase' }}>{site.coachName}</div>
          <div style={{ ...eyebrow, marginTop: '6px' }}>{site.role}{site.location ? ` · ${site.location}` : ''}</div>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px' }}>
          {nav.map((n) => (
            <Link key={n.path} to={n.path} style={{ ...eyebrow, color: colors.textMuted, textDecoration: 'none' }}>{n.label}</Link>
          ))}
        </nav>
        {(site.contactEmail || site.socials.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px' }}>
            {site.contactEmail && <a href={`mailto:${site.contactEmail}`} style={{ ...eyebrow, color: colors.textMuted, textDecoration: 'none' }}>{site.contactEmail}</a>}
            {site.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" style={{ ...eyebrow, color: colors.textMuted, textDecoration: 'none' }}>{s.label}</a>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
