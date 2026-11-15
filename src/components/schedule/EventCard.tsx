import type { SiteEvent } from '../../data/events'
import { downloadIcs } from '../../lib/ics'
import { formatEventWhen, parseDate } from '../../lib/dates'
import { safeHttpsUrl } from '../../lib/url'
import { buttonStyle, colors, eyebrow, fonts } from '../../theme'
import { Card } from '../ui'
import { Link } from '../Link'
import { KindBadge } from './KindBadge'

const smallButton = (variant: 'solid' | 'outline') => ({ ...buttonStyle(variant), padding: '10px 18px', fontSize: '10.5px' })

export function EventCard({ event }: { event: SiteEvent }) {
  const start = parseDate(event.start)
  const end = parseDate(event.end)
  if (!start || !end) return null
  const when = formatEventWhen(start, end)
  const signup = safeHttpsUrl(event.signupUrl)
  const spots = typeof event.spots === 'number' && event.spots >= 0 ? event.spots : null

  return (
    <Card style={{ padding: '22px' }}>
      <article aria-labelledby={`event-${event.id}`}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <KindBadge kind={event.kind} />
          {spots !== null && (
            <span style={{ ...eyebrow, color: spots === 0 ? colors.red : colors.textMuted }}>
              {spots === 0 ? 'Full' : `${spots} ${spots === 1 ? 'spot' : 'spots'} open`}
            </span>
          )}
        </div>
        <h3 id={`event-${event.id}`} style={{ fontFamily: fonts.serif, fontSize: '22px', fontWeight: 700, margin: 0, lineHeight: 1.25, overflowWrap: 'anywhere' }}>
          {event.title}
        </h3>
        <dl style={{ margin: '14px 0 0', fontFamily: fonts.sans, fontSize: '14.5px', lineHeight: 1.6, color: colors.textMuted, display: 'grid', gap: '4px' }}>
          <div>
            <dt className="sr-only">Date</dt>
            <dd style={{ margin: 0, color: colors.text }}>
              <time dateTime={event.start}>{when.date}</time>
            </dd>
          </div>
          {when.time && (
            <div>
              <dt className="sr-only">Time</dt>
              <dd style={{ margin: 0 }}>{when.time}</dd>
            </div>
          )}
          {event.location.trim() && (
            <div>
              <dt className="sr-only">Location</dt>
              <dd style={{ margin: 0, overflowWrap: 'anywhere' }}>{event.location}</dd>
            </div>
          )}
        </dl>
        {event.details?.trim() && (
          <p style={{ fontFamily: fonts.sans, fontSize: '14.5px', lineHeight: 1.6, color: colors.textMuted, margin: '12px 0 0', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
            {event.details}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '18px' }}>
          <button type="button" style={smallButton('outline')} onClick={() => downloadIcs(event, signup)} aria-label={`Add ${event.title} to calendar`}>
            Add to calendar
          </button>
          {signup ? (
            <a href={signup} target="_blank" rel="noopener noreferrer" style={smallButton('solid')} aria-label={`Sign up for ${event.title} (opens in a new tab)`}>
              Sign up
            </a>
          ) : (
            <Link to="/contact" style={smallButton('solid')}>
              Ask about this
            </Link>
          )}
        </div>
      </article>
    </Card>
  )
}
