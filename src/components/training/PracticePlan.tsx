import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { drills, type Drill } from '../../data/training'
import { colors, fonts } from '../../theme'
import { MAX_MINUTES, MIN_MINUTES, type PracticePlanApi } from './usePracticePlan'
import { bodyText, iconButton, smallLabel } from './styles'

const drillById = new Map(drills.map((d) => [d.id, d]))

type Row = { drill: Drill; minutes: number }

function planText(rows: Row[], total: number) {
  const lines = ['Goalie practice plan', `Total: ${total} min`, '']
  rows.forEach((r, i) => {
    lines.push(`${i + 1}. ${r.drill.name} (${r.minutes} min) - ${r.drill.category}, ${r.drill.level}`)
    r.drill.steps.forEach((s) => lines.push(`   - ${s}`))
    lines.push('')
  })
  return lines.join('\n').trimEnd()
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to the textarea method
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export function PracticePlan({ plan }: { plan: PracticePlanApi }) {
  const rows: Row[] = plan.items.flatMap((i) => {
    const drill = drillById.get(i.drillId)
    return drill ? [{ drill, minutes: i.minutes }] : []
  })
  const total = rows.reduce((n, r) => n + r.minutes, 0)
  const [status, setStatus] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const flash = (msg: string) => {
    setStatus(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setStatus(''), 3000)
  }

  const onCopy = async () => {
    const ok = await copyText(planText(rows, total))
    flash(ok ? 'Plan copied to clipboard.' : 'Copy did not work in this browser. Use Print instead.')
  }

  return (
    <aside aria-labelledby="plan-heading" style={{ minWidth: 0, padding: '22px', borderRadius: '18px', background: 'rgba(10,21,32,0.9)', border: `1px solid ${colors.border}` }}>
      <div style={smallLabel}>Practice plan builder</div>
      <h3 id="plan-heading" style={{ fontFamily: fonts.serif, fontSize: '24px', fontWeight: 700, margin: '6px 0 4px' }}>Your plan</h3>
      <p style={{ fontFamily: fonts.sans, fontSize: '14px', color: colors.ice, margin: 0 }} aria-live="polite">
        {rows.length} {rows.length === 1 ? 'drill' : 'drills'} · {total} min total
      </p>

      {rows.length === 0 ? (
        <p style={{ ...bodyText, fontSize: '14px', marginTop: '16px' }}>
          Open a drill and choose “Add to plan”. Set the minutes for each drill and put them in order. The plan is saved in this browser.
        </p>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'grid', gap: '10px' }}>
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.li
                key={r.drill.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                style={{ padding: '12px', borderRadius: '12px', background: colors.surface, border: `1px solid ${colors.border}` }}
              >
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                  <span style={{ ...smallLabel, color: colors.ice }}>{i + 1}</span>
                  <span style={{ fontFamily: fonts.sans, fontSize: '14px', fontWeight: 600, flex: 1, minWidth: 0 }}>{r.drill.name}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: fonts.sans, fontSize: '13px', color: colors.textMuted }}>
                    <input
                      type="number"
                      className="tr-input"
                      min={MIN_MINUTES}
                      max={MAX_MINUTES}
                      value={r.minutes}
                      onChange={(e) => plan.setMinutes(r.drill.id, Number(e.target.value))}
                      aria-label={`Minutes for ${r.drill.name}`}
                      style={{ width: '58px', height: '34px', padding: '0 8px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.06)', color: colors.text, fontFamily: fonts.sans, fontSize: '14px' }}
                    />
                    min
                  </label>
                  <span style={{ flex: 1 }} />
                  <button type="button" className="tr-focus" style={iconButton} onClick={() => plan.move(r.drill.id, -1)} disabled={i === 0} aria-label={`Move ${r.drill.name} up`}>
                    <span aria-hidden="true">↑</span>
                  </button>
                  <button type="button" className="tr-focus" style={iconButton} onClick={() => plan.move(r.drill.id, 1)} disabled={i === rows.length - 1} aria-label={`Move ${r.drill.name} down`}>
                    <span aria-hidden="true">↓</span>
                  </button>
                  <button type="button" className="tr-focus" style={iconButton} onClick={() => plan.remove(r.drill.id)} aria-label={`Remove ${r.drill.name} from plan`}>
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      )}

      {rows.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
          <button type="button" className="tr-focus" style={actionButton(true)} onClick={onCopy}>Copy as text</button>
          <button type="button" className="tr-focus" style={actionButton(false)} onClick={() => window.print()}>Print</button>
          <button type="button" className="tr-focus" style={actionButton(false)} onClick={() => { plan.clear(); flash('Plan cleared.') }}>Clear</button>
        </div>
      )}
      <p role="status" style={{ fontFamily: fonts.sans, fontSize: '13px', color: colors.textMuted, minHeight: '18px', margin: '10px 0 0' }}>{status}</p>

      {/* Print-only copy of the plan. Hidden on screen; shown alone when printing. */}
      <div className="tr-print" aria-hidden="true">
        <h1>Goalie practice plan</h1>
        <p>Total: {total} min</p>
        <ol>
          {rows.map((r) => (
            <li key={r.drill.id}>
              <strong>{r.drill.name}</strong> ({r.minutes} min) - {r.drill.category}, {r.drill.level}
              <ul>{r.drill.steps.map((s) => <li key={s}>{s}</li>)}</ul>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  )
}

const actionButton = (primary: boolean) => ({
  padding: '10px 16px', borderRadius: '999px', cursor: 'pointer',
  fontFamily: fonts.sans, fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const,
  border: `1px solid ${primary ? colors.ice : 'rgba(255,255,255,0.4)'}`,
  background: primary ? colors.ice : 'transparent',
  color: primary ? '#06121c' : colors.text,
})
