import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import { Section } from '../components/ui'
import { Link } from '../components/Link'
import { LiftCard } from '../components/home/LiftCard'
import { skillAreas } from '../components/home/skills'
import { buttonStyle, colors, eyebrow, fonts } from '../theme'
import { site } from '../data/site'

const pages = [
  { to: '/training', kicker: 'Drills and sessions', title: 'Training', text: 'Session types and the drills used to build each goalie skill.', cta: 'See training' },
  { to: '/schedule', kicker: 'Dates and rinks', title: 'Schedule', text: 'Upcoming lessons, clinics and camps with dates and locations.', cta: 'View schedule' },
  { to: '/stats', kicker: 'Season numbers', title: 'Stats', text: `${site.coachName}'s season-by-season goalie statistics.`, cta: 'View stats' },
]

export default function HomePage() {
  return (
    <>
      <Hero />
      <main style={{ background: `linear-gradient(to bottom, ${colors.bg}, ${colors.bgRaised} 50%, ${colors.bg})`, padding: '40px 20px 100px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <Section kicker="Goalie coaching" title="What sessions cover">
            <p style={{ fontFamily: fonts.sans, fontSize: '16px', lineHeight: 1.7, color: colors.textMuted, maxWidth: '640px', marginBottom: '28px' }}>
              Sessions work on the core skill areas of goaltending. Each one can be the focus of a lesson or combined in game-like drills.
            </p>
            <ul style={{ listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
              {skillAreas.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
                  className="transition-colors hover:border-[#9fd8ff]/50"
                  style={{ padding: '22px', borderRadius: '18px', background: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <div style={{ ...eyebrow, color: colors.ice }}>{String(i + 1).padStart(2, '0')}</div>
                  <h3 style={{ fontFamily: fonts.serif, fontSize: '21px', fontWeight: 700, margin: '8px 0 8px' }}>{s.title}</h3>
                  <p style={{ fontFamily: fonts.sans, fontSize: '14.5px', lineHeight: 1.6, color: colors.textMuted }}>{s.text}</p>
                </motion.li>
              ))}
            </ul>
          </Section>

          <Section kicker="Explore" title="Training, schedule and stats">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
              {pages.map((p, i) => (
                <motion.div
                  key={p.to}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                >
                  <LiftCard to={p.to} kicker={p.kicker} title={p.title} cta={p.cta}>{p.text}</LiftCard>
                </motion.div>
              ))}
            </div>
          </Section>

          <Section>
            <div style={{ padding: 'clamp(28px, 6vw, 56px)', borderRadius: '24px', border: `1px solid ${colors.border}`, background: 'radial-gradient(ellipse at top, rgba(159,216,255,0.12), rgba(255,255,255,0.03) 70%)', textAlign: 'center' }}>
              <div style={eyebrow}>Contact</div>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 700, textTransform: 'uppercase', margin: '10px 0 14px', lineHeight: 1.1 }}>Book a session or ask a question</h2>
              <p style={{ fontFamily: fonts.sans, fontSize: '16px', lineHeight: 1.6, color: colors.textMuted, maxWidth: '520px', margin: '0 auto 28px' }}>
                Send a message about private lessons, group sessions, camps or clinics. Include the goalie's age or level so the reply can cover the right options.
              </p>
              <Link to="/contact" style={buttonStyle('solid')} className="transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9fd8ff]">
                Contact {site.coachName.split(' ')[0]}
              </Link>
            </div>
          </Section>
        </div>
      </main>
    </>
  )
}
