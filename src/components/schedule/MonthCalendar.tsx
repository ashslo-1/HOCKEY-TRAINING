import { useMemo } from 'react'
import type { SiteEvent } from '../../data/events'
import { addMonths, dayKey, daysInMonth, formatLongDate, formatMonth, startOfMonth, weekdayNames } from '../../lib/dates'
import { colors, eyebrow, fonts } from '../../theme'
import { eventsByDay, kindColor } from './shared'

type Props = {
  events: SiteEvent[]
  month: Date // any date inside the shown month
  onMonthChange: (month: Date) => void
  selectedDay: string | null // local day key
  onSelectDay: (key: string) => void
  today: Date
}

const navButton = {
  width: '40px', height: '40px', borderRadius: '999px', border: `1px solid ${colors.border}`, background: colors.surface,
  color: colors.text, cursor: 'pointer', fontSize: '18px', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
} as const

export function MonthCalendar({ events, month, onMonthChange, selectedDay, onSelectDay, today }: Props) {
  const first = startOfMonth(month)
  const byDay = useMemo(() => eventsByDay(events), [events])
  const shortNames = useMemo(() => weekdayNames('short'), [])
  const todayKey = dayKey(today)
  const leading = first.getDay()
  const count = daysInMonth(first)
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: count }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const monthLabel = formatMonth(first)

  return (
    <div style={{ borderRadius: '18px', border: `1px solid ${colors.border}`, background: colors.surface, padding: 'clamp(12px, 3vw, 24px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <button type="button" style={navButton} onClick={() => onMonthChange(addMonths(first, -1))} aria-label={`Previous month, ${formatMonth(addMonths(first, -1))}`}>
          <span aria-hidden>‹</span>
        </button>
        <h3 aria-live="polite" style={{ fontFamily: fonts.serif, fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', fontWeight: 700, textTransform: 'uppercase', margin: 0, textAlign: 'center' }}>
          {monthLabel}
        </h3>
        <button type="button" style={navButton} onClick={() => onMonthChange(addMonths(first, 1))} aria-label={`Next month, ${formatMonth(addMonths(first, 1))}`}>
          <span aria-hidden>›</span>
        </button>
      </div>

      <div style={{ display: 'grid', gap: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
          {shortNames.map((name, i) => (
            <div key={name + i} aria-hidden style={{ ...eyebrow, fontSize: '10px', letterSpacing: '0.08em', textAlign: 'center', padding: '4px 0' }}>
              {name}
            </div>
          ))}
        </div>
        {Array.from({ length: cells.length / 7 }, (_, row) => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
            {cells.slice(row * 7, row * 7 + 7).map((d, col) => {
              if (!d) return <div key={col} aria-hidden />
              const key = dayKey(d)
              const dayEvents = byDay.get(key) ?? []
              const selected = key === selectedDay
              const isToday = key === todayKey
              const kinds = [...new Set(dayEvents.map((e) => e.kind))].slice(0, 3)
              const label = `${formatLongDate(d)}${isToday ? ', today' : ''}, ${dayEvents.length === 0 ? 'no sessions' : `${dayEvents.length} ${dayEvents.length === 1 ? 'session' : 'sessions'}`}`
              return (
                <div key={col}>
                  <button
                    type="button"
                    onClick={() => onSelectDay(key)}
                    aria-label={label}
                    aria-pressed={selected}
                    style={{
                      width: '100%', height: 'clamp(42px, 10vw, 72px)', borderRadius: '12px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      fontFamily: fonts.sans, fontSize: '14px', fontWeight: isToday ? 700 : 500,
                      color: selected ? '#06121c' : dayEvents.length ? colors.text : colors.textMuted,
                      background: selected ? colors.ice : dayEvents.length ? 'rgba(159,216,255,0.08)' : 'transparent',
                      border: `1px solid ${isToday && !selected ? colors.ice : selected ? colors.ice : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <span>{d.getDate()}</span>
                    <span aria-hidden style={{ display: 'flex', gap: '3px', height: '6px' }}>
                      {kinds.map((k) => (
                        <span key={k} style={{ width: '6px', height: '6px', borderRadius: '50%', background: selected ? '#06121c' : kindColor[k] }} />
                      ))}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
