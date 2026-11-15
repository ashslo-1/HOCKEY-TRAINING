import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EmptyNote, Page, PageHeader, Section } from '../components/ui'
import { Link } from '../components/Link'
import { EventCard } from '../components/schedule/EventCard'
import { MonthCalendar } from '../components/schedule/MonthCalendar'
import { eventsByDay, kindColor } from '../components/schedule/shared'
import { eventKinds, upcomingEvents } from '../data/events'
import type { EventKind, SiteEvent } from '../data/events'
import { dayKey, formatLongDate, formatMonth, localTimeZone, monthKey, parseDate, startOfMonth } from '../lib/dates'
import { colors, eyebrow, fonts } from '../theme'

type View = 'list' | 'calendar'

const pill = (active: boolean, accent: string = colors.ice): CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '999px', cursor: 'pointer',
  fontFamily: fonts.sans, fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
  border: `1px solid ${active ? accent : colors.border}`,
  background: active ? 'rgba(159,216,255,0.12)' : 'transparent',
  color: active ? colors.text : colors.textMuted,
})

const linkStyle: CSSProperties = { color: colors.ice, textDecoration: 'underline', textUnderlineOffset: '3px' }
const codeStyle: CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.9em', color: colors.ice, overflowWrap: 'anywhere' }

function groupByMonth(list: SiteEvent[]): { key: string; label: string; items: SiteEvent[] }[] {
  const groups: { key: string; label: string; items: SiteEvent[] }[] = []
  for (const e of list) {
    const start = parseDate(e.start)
    if (!start) continue
    const key = monthKey(start)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.items.push(e)
    else groups.push({ key, label: formatMonth(start), items: [e] })
  }
  return groups
}

function DayPanel({ day, items }: { day: string | null; items: SiteEvent[] }) {
  if (!day) {
    return <p style={{ fontFamily: fonts.sans, fontSize: '14.5px', color: colors.textMuted }}>Select a day to see its sessions.</p>
  }
  const [y, m, d] = day.split('-').map(Number)
  return (
    <div aria-live="polite">
      <h3 style={{ ...eyebrow, marginBottom: '14px' }}>{formatLongDate(new Date(y, m - 1, d))}</h3>
      {items.length === 0 ? (
        <p style={{ fontFamily: fonts.sans, fontSize: '14.5px', color: colors.textMuted }}>No sessions on this day.</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {items.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  )
}

function CalendarView({ list, today }: { list: SiteEvent[]; today: Date }) {
  const [month, setMonth] = useState(() => startOfMonth(today))
  const [selected, setSelected] = useState<string | null>(() => dayKey(today))
  const byDay = useMemo(() => eventsByDay(list), [list])
  return (
    <div style={{ display: 'grid', gap: '28px' }}>
      <MonthCalendar
        events={list}
        month={month}
        onMonthChange={(m) => { setMonth(m); setSelected(null) }}
        selectedDay={selected}
        onSelectDay={setSelected}
        today={today}
      />
      <DayPanel day={selected} items={selected ? byDay.get(selected) ?? [] : []} />
    </div>
  )
}

function OwnerNote() {
  return (
    <div style={{ padding: '20px 22px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border}`, fontFamily: fonts.sans, fontSize: '13.5px', lineHeight: 1.65, color: colors.textFaint }}>
      <div style={{ ...eyebrow, marginBottom: '8px' }}>Note for the site owner</div>
      <p>
        Add sessions to the <code style={codeStyle}>events</code> array in <code style={codeStyle}>src/data/events.ts</code>. Each entry needs{' '}
        <code style={codeStyle}>id</code>, <code style={codeStyle}>title</code>, <code style={codeStyle}>kind</code> (Private lesson, Group session, Camp, Clinic, Game or Other),{' '}
        <code style={codeStyle}>start</code>, <code style={codeStyle}>end</code> and <code style={codeStyle}>location</code>. The fields{' '}
        <code style={codeStyle}>details</code>, <code style={codeStyle}>spots</code> (open spots left) and <code style={codeStyle}>signupUrl</code> are optional.
      </p>
      <p style={{ marginTop: '8px' }}>
        Write start and end as ISO dates with a time zone offset, for example <code style={codeStyle}>2026-12-05T17:00:00-06:00</code>. Sign-up links must start with{' '}
        <code style={codeStyle}>https://</code>. A session drops off this page once its end time has passed.
      </p>
    </div>
  )
}

export default function SchedulePage() {
  const [now] = useState(() => new Date())
  const [view, setView] = useState<View>('list')
  const [kindFilter, setKindFilter] = useState<EventKind | 'all'>('all')
  const upcoming = useMemo(() => upcomingEvents(now), [now])
  const presentKinds = useMemo(() => eventKinds.filter((k) => upcoming.some((e) => e.kind === k)), [upcoming])
  const activeFilter = kindFilter !== 'all' && presentKinds.includes(kindFilter) ? kindFilter : 'all'
  const filtered = useMemo(() => (activeFilter === 'all' ? upcoming : upcoming.filter((e) => e.kind === activeFilter)), [upcoming, activeFilter])
  const groups = useMemo(() => groupByMonth(filtered), [filtered])
  const tz = localTimeZone()

  const intro = (
    <>
      Private lessons, group sessions, camps and clinics with Nolan Sloan. Dates and times are shown in your local time zone{tz ? ` (${tz.replace(/_/g, ' ')})` : ''}.
    </>
  )

  if (upcoming.length === 0) {
    return (
      <Page>
        <PageHeader kicker="Schedule" title="Schedule" intro={intro} />
        <Section title="Upcoming sessions">
          <EmptyNote>
            No sessions are posted yet. To ask about available times for lessons or group sessions, use the{' '}
            <Link to="/contact" style={linkStyle}>contact page</Link>.
          </EmptyNote>
        </Section>
        <Section title="Calendar">
          <CalendarView list={upcoming} today={now} />
        </Section>
        <div style={{ marginTop: '56px' }}>
          {import.meta.env.DEV && <OwnerNote />}
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <PageHeader kicker="Schedule" title="Schedule" intro={intro} />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div role="group" aria-label="View" style={{ display: 'inline-flex', gap: '6px', padding: '4px', borderRadius: '999px', border: `1px solid ${colors.border}` }}>
          {(['list', 'calendar'] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} style={{ ...pill(view === v), border: '1px solid transparent', background: view === v ? colors.ice : 'transparent', color: view === v ? '#06121c' : colors.textMuted }}>
              {v === 'list' ? 'List' : 'Calendar'}
            </button>
          ))}
        </div>
        {presentKinds.length > 1 && (
          <div role="group" aria-label="Filter by type" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button type="button" aria-pressed={activeFilter === 'all'} onClick={() => setKindFilter('all')} style={pill(activeFilter === 'all')}>
              All
            </button>
            {presentKinds.map((k) => (
              <button key={k} type="button" aria-pressed={activeFilter === k} onClick={() => setKindFilter(k)} style={pill(activeFilter === k, kindColor[k])}>
                <span aria-hidden style={{ width: '7px', height: '7px', borderRadius: '50%', background: kindColor[k] }} />
                {k}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} style={{ marginTop: '40px' }}>
          {view === 'list' ? (
            <div>
              <h2 style={{ fontFamily: fonts.serif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, margin: '0 0 8px' }}>Upcoming sessions</h2>
              {groups.map((g) => (
                <section key={g.key} aria-labelledby={`month-${g.key}`} style={{ marginTop: '28px' }}>
                  <h3 id={`month-${g.key}`} style={{ ...eyebrow, color: colors.ice, paddingBottom: '10px', marginBottom: '16px', borderBottom: `1px solid ${colors.border}` }}>
                    {g.label}
                  </h3>
                  <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))' }}>
                    {g.items.map((e) => <EventCard key={e.id} event={e} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <CalendarView list={filtered} today={now} />
          )}
        </motion.div>
      </AnimatePresence>

      <p style={{ fontFamily: fonts.sans, fontSize: '14.5px', lineHeight: 1.6, color: colors.textMuted, marginTop: '48px' }}>
        Looking for a different time? <Link to="/contact" style={linkStyle}>Get in touch</Link> to ask about availability.
      </p>
    </Page>
  )
}
