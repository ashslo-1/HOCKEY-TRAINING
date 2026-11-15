import { useEffect, useState } from 'react'
import { drills, type Drill } from '../../data/training'

// Practice plan state, saved to localStorage when storage is available.

export type PlanItem = { drillId: string; minutes: number }

const STORAGE_KEY = 'nolan-sloan-practice-plan-v1'
export const MIN_MINUTES = 1
export const MAX_MINUTES = 60

const drillIds = new Set(drills.map((d) => d.id))

export const clampMinutes = (n: number) => Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(n) || MIN_MINUTES))

function loadPlan(): PlanItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const seen = new Set<string>()
    const items: PlanItem[] = []
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue
      const { drillId, minutes } = entry as Record<string, unknown>
      if (typeof drillId !== 'string' || !drillIds.has(drillId) || seen.has(drillId)) continue
      seen.add(drillId)
      items.push({ drillId, minutes: clampMinutes(typeof minutes === 'number' ? minutes : MIN_MINUTES) })
    }
    return items
  } catch {
    return []
  }
}

function savePlan(items: PlanItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage is blocked or full. The plan still works for this visit.
  }
}

export function usePracticePlan() {
  const [items, setItems] = useState<PlanItem[]>(loadPlan)

  useEffect(() => {
    savePlan(items)
  }, [items])

  const has = (id: string) => items.some((i) => i.drillId === id)

  const add = (drill: Drill) =>
    setItems((prev) => (prev.some((i) => i.drillId === drill.id) ? prev : [...prev, { drillId: drill.id, minutes: drill.suggestedMinutes }]))

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.drillId !== id))

  const setMinutes = (id: string, minutes: number) =>
    setItems((prev) => prev.map((i) => (i.drillId === id ? { ...i, minutes: clampMinutes(minutes) } : i)))

  const move = (id: string, delta: -1 | 1) =>
    setItems((prev) => {
      const from = prev.findIndex((i) => i.drillId === id)
      const to = from + delta
      if (from < 0 || to < 0 || to >= prev.length) return prev
      const next = [...prev]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })

  const clear = () => setItems([])

  return { items, has, add, remove, setMinutes, move, clear }
}

export type PracticePlanApi = ReturnType<typeof usePracticePlan>
