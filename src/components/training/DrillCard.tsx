import { AnimatePresence, motion } from 'framer-motion'
import type { Drill } from '../../data/training'
import { colors, fonts } from '../../theme'
import { bodyText, levelColor, smallLabel } from './styles'

type Props = {
  drill: Drill
  expanded: boolean
  onToggle: () => void
  inPlan: boolean
  onAdd: () => void
  onRemove: () => void
}

export function DrillCard({ drill, expanded, onToggle, inPlan, onAdd, onRemove }: Props) {
  const panelId = `drill-panel-${drill.id}`
  const buttonId = `drill-toggle-${drill.id}`
  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ borderRadius: '16px', background: colors.surface, border: `1px solid ${expanded ? 'rgba(159,216,255,0.4)' : colors.border}`, overflow: 'hidden', minWidth: 0 }}
    >
      <h3 style={{ margin: 0 }}>
        <button
          id={buttonId}
          type="button"
          className="tr-focus"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '18px 20px', background: 'transparent', border: 'none', color: colors.text, textAlign: 'left', cursor: 'pointer', borderRadius: '16px' }}
        >
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'center' }}>
              <span style={{ ...smallLabel, color: levelColor[drill.level] }}>{drill.level}</span>
              <span style={smallLabel}>{drill.category}</span>
            </span>
            <span style={{ display: 'block', fontFamily: fonts.serif, fontSize: '20px', fontWeight: 700, marginTop: '6px' }}>{drill.name}</span>
            <span style={{ ...bodyText, display: 'block', fontSize: '14px', marginTop: '6px' }}>{drill.description}</span>
          </span>
          <motion.span aria-hidden="true" animate={{ rotate: expanded ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ fontFamily: fonts.sans, fontSize: '24px', lineHeight: 1, color: colors.ice, marginTop: '2px' }}>
            +
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 20px 20px', display: 'grid', gap: '18px' }}>
              <div>
                <div style={smallLabel}>Equipment</div>
                <p style={{ ...bodyText, fontSize: '14px', marginTop: '6px' }}>{drill.equipment.join(', ')}</p>
              </div>
              <div>
                <div style={smallLabel}>Steps</div>
                <ol style={{ ...bodyText, fontSize: '14px', paddingLeft: '20px', marginTop: '6px', display: 'grid', gap: '6px' }}>
                  {drill.steps.map((s) => <li key={s}>{s}</li>)}
                </ol>
              </div>
              <div>
                <div style={smallLabel}>Coaching points</div>
                <ul style={{ ...bodyText, fontSize: '14px', paddingLeft: '20px', marginTop: '6px', display: 'grid', gap: '6px' }}>
                  {drill.coachingPoints.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {inPlan ? (
                  <button type="button" className="tr-focus" onClick={onRemove} style={planButton(false)}>
                    Remove from plan
                  </button>
                ) : (
                  <button type="button" className="tr-focus" onClick={onAdd} style={planButton(true)}>
                    Add to plan ({drill.suggestedMinutes} min)
                  </button>
                )}
                {inPlan && <span style={{ ...smallLabel, color: colors.ice }}>In your plan</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

const planButton = (primary: boolean) => ({
  padding: '10px 18px', borderRadius: '999px', cursor: 'pointer',
  fontFamily: fonts.sans, fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  border: `1px solid ${primary ? colors.ice : 'rgba(255,255,255,0.4)'}`,
  background: primary ? colors.ice : 'transparent',
  color: primary ? '#06121c' : colors.text,
})
