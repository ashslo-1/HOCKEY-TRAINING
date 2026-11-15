import { Card, EmptyNote, Page, PageHeader, Section } from '../components/ui'
import { Link } from '../components/Link'
import { about } from '../data/about'
import { site } from '../data/site'
import { buttonStyle, colors, eyebrow, fonts } from '../theme'

const code = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.92em', color: colors.ice }

// Allow images from this site (paths starting with /) or https URLs only
function safeImageUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed
  try {
    return new URL(trimmed).protocol === 'https:' ? trimmed : null
  } catch {
    return null
  }
}

const principles = [
  { title: 'Fundamentals first', text: 'Stance, skating and positioning come before advanced save selection. A goalie who is set and square has more time to react.' },
  { title: 'Drills that look like games', text: 'Drills are built from situations goalies face in games, such as rush chances, screens, rebounds and plays from below the goal line.' },
  { title: 'Matched to age and level', text: 'Younger goalies work on balance, edges and basic positioning. Older and higher-level goalies add reads, tracking under pressure and game-specific detail.' },
  { title: 'Video and feedback', text: 'Reviewing video of saves and goals helps a goalie see their depth, angle and recovery, and gives a clear thing to work on next.' },
  { title: 'Mental routines', text: 'Simple routines before games and after goals help a goalie stay calm and ready for the next shot.' },
]

export default function AboutPage() {
  const photo = safeImageUrl(about.photoUrl)
  const firstName = site.coachName.split(' ')[0]

  return (
    <Page>
      <PageHeader kicker={site.role || 'About'} title={`About ${site.coachName}`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '28px', alignItems: 'start' }}>
        {photo ? (
          <img src={photo} alt={about.photoAlt} style={{ width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: '18px', border: `1px solid ${colors.border}` }} />
        ) : (
          <EmptyNote>Add a photo of {firstName} by setting <code style={code}>photoUrl</code> in <code style={code}>src/data/about.ts</code>.</EmptyNote>
        )}
        <div>
          <h2 style={{ fontFamily: fonts.serif, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 700, margin: '0 0 18px' }}>Background</h2>
          {about.bio.length > 0 ? (
            about.bio.map((p, i) => (
              <p key={i} style={{ fontFamily: fonts.sans, fontSize: '16px', lineHeight: 1.75, color: colors.textMuted, marginBottom: '16px' }}>{p}</p>
            ))
          ) : (
            <EmptyNote>Add {firstName}'s bio in <code style={code}>src/data/about.ts</code> (the <code style={code}>bio</code> list, one string per paragraph).</EmptyNote>
          )}
        </div>
      </div>

      <Section kicker="At a glance" title="Highlights">
        {about.highlights.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '14px' }}>
            {about.highlights.map((h) => (
              <Card key={h.label}>
                <div style={eyebrow}>{h.label}</div>
                <div style={{ fontFamily: fonts.serif, fontSize: '22px', fontWeight: 700, marginTop: '8px' }}>{h.value}</div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyNote>Add highlights in <code style={code}>src/data/about.ts</code> (the <code style={code}>highlights</code> list of label and value pairs).</EmptyNote>
        )}
      </Section>

      <Section kicker="Coaching approach" title="How sessions are run">
        <p style={{ fontFamily: fonts.sans, fontSize: '16px', lineHeight: 1.7, color: colors.textMuted, maxWidth: '680px', marginBottom: '24px' }}>
          These are common principles of goalie coaching that shape how lessons are planned.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
          {principles.map((p) => (
            <Card key={p.title}>
              <h3 style={{ fontFamily: fonts.serif, fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>{p.title}</h3>
              <p style={{ fontFamily: fonts.sans, fontSize: '14.5px', lineHeight: 1.6, color: colors.textMuted }}>{p.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section kicker="Playing record" title="Stats">
        <p style={{ fontFamily: fonts.sans, fontSize: '16px', lineHeight: 1.7, color: colors.textMuted, maxWidth: '640px', marginBottom: '24px' }}>
          {firstName}'s season-by-season goalie statistics are on the Stats page.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Link to="/stats" style={buttonStyle('outline')} className="transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9fd8ff]">View stats</Link>
          <Link to="/contact" style={buttonStyle('solid')} className="transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9fd8ff]">Get in touch</Link>
        </div>
      </Section>
    </Page>
  )
}
