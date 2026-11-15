import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { drillCategories, drillLevels, drills, type DrillCategory, type DrillLevel } from '../../data/training'
import { colors, fonts } from '../../theme'
import { DrillCard } from './DrillCard'
import type { PracticePlanApi } from './usePracticePlan'
import { chipStyle, smallLabel } from './styles'

export function DrillLibrary({ plan }: { plan: PracticePlanApi }) {
  const [category, setCategory] = useState<DrillCategory | 'All'>('All')
  const [level, setLevel] = useState<DrillLevel | 'All'>('All')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return drills.filter((d) => {
      if (category !== 'All' && d.category !== category) return false
      if (level !== 'All' && d.level !== level) return false
      if (!q) return true
      const haystack = [d.name, d.category, d.level, d.description, ...d.equipment, ...d.steps, ...d.coachingPoints].join(' ').toLowerCase()
      return haystack.includes(q)
    })
  }, [category, level, query])

  const filtersActive = category !== 'All' || level !== 'All' || query !== ''

  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'grid', gap: '16px', marginBottom: '22px' }}>
        <div>
          <label htmlFor="drill-search" style={smallLabel}>Search drills</label>
          <input
            id="drill-search"
            type="search"
            className="tr-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “post”, “rebound” or “tennis ball”"
            style={{ display: 'block', width: '100%', marginTop: '8px', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.06)', color: colors.text, fontFamily: fonts.sans, fontSize: '15px' }}
          />
        </div>
        <ChipGroup label="Category" options={['All', ...drillCategories]} value={category} onChange={(v) => setCategory(v as DrillCategory | 'All')} />
        <ChipGroup label="Level" options={['All', ...drillLevels]} value={level} onChange={(v) => setLevel(v as DrillLevel | 'All')} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <p aria-live="polite" style={{ ...smallLabel, margin: 0 }}>
          {results.length} of {drills.length} drills
        </p>
        {filtersActive && (
          <button
            type="button"
            className="tr-focus"
            onClick={() => { setCategory('All'); setLevel('All'); setQuery('') }}
            style={{ ...chipStyle(false), padding: '6px 12px' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p style={{ fontFamily: fonts.sans, fontSize: '15px', color: colors.textMuted, padding: '24px', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.22)' }}>
          No drills match these filters. Clear the filters or try a different search.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          <AnimatePresence initial={false}>
            {results.map((d) => (
              <DrillCard
                key={d.id}
                drill={d}
                expanded={openId === d.id}
                onToggle={() => setOpenId((cur) => (cur === d.id ? null : d.id))}
                inPlan={plan.has(d.id)}
                onAdd={() => plan.add(d)}
                onRemove={() => plan.remove(d.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function ChipGroup({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset style={{ border: 'none', margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ ...smallLabel, marginBottom: '8px', padding: 0 }}>{label}</legend>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {options.map((o) => (
          <button key={o} type="button" className="tr-focus" aria-pressed={value === o} onClick={() => onChange(o)} style={chipStyle(value === o)}>
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
