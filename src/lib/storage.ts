import { ALLERGENS, type Allergen, type DailyLog, type LogEntry, type Profile } from '../types'

export const PROFILE_KEY = 'fitplate:v1:profile'
export const TODAY_KEY = 'fitplate:v1:today'

const activities = new Set([1.2, 1.375, 1.55, 1.725])
const allergenSet = new Set<string>(ALLERGENS)

export function localDate(timestamp = Date.now()) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function positiveNumber(value: unknown, max: number) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= max ? value : undefined
}

export function loadProfile(fallback: Profile): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return fallback
    const value = JSON.parse(raw) as Record<string, unknown>
    if (!value || typeof value !== 'object') return fallback
    const allergies = Array.isArray(value.allergies)
      ? value.allergies.filter((item): item is Allergen => typeof item === 'string' && allergenSet.has(item))
      : []
    const sex = value.sex === 'male' || value.sex === 'female' ? value.sex : undefined
    const activity = typeof value.activity === 'number' && activities.has(value.activity) ? value.activity : undefined
    return {
      calories: positiveNumber(value.calories, 10000) ?? fallback.calories,
      weight: positiveNumber(value.weight, 500) ?? fallback.weight,
      height: positiveNumber(value.height, 300) ?? fallback.height,
      allergies,
      protein: positiveNumber(value.protein, 500),
      age: positiveNumber(value.age, 130),
      sex,
      activity,
    }
  } catch {
    return fallback
  }
}

function validEntry(value: unknown, index: number): LogEntry | undefined {
  if (!value || typeof value !== 'object') return undefined
  const entry = value as Record<string, unknown>
  const foodId = typeof entry.foodId === 'string' ? entry.foodId : typeof entry.id === 'string' ? entry.id : undefined
  if (!foodId || typeof entry.loggedAt !== 'number' || !Number.isFinite(entry.loggedAt)) return undefined
  return {
    entryId: typeof entry.entryId === 'string' ? entry.entryId : `${entry.loggedAt}-${index}-${foodId}`,
    foodId,
    loggedAt: entry.loggedAt,
  }
}

export function loadTodayLog(): DailyLog {
  const today = localDate()
  try {
    const raw = localStorage.getItem(TODAY_KEY)
    if (!raw) return { date: today, entries: [] }
    const value = JSON.parse(raw) as unknown
    const source = Array.isArray(value)
      ? value
      : value && typeof value === 'object' && Array.isArray((value as Record<string, unknown>).entries)
        ? ((value as Record<string, unknown>).entries as unknown[])
        : []
    const entries = source
      .map(validEntry)
      .filter((entry): entry is LogEntry => Boolean(entry))
      .filter(entry => localDate(entry.loggedAt) === today)
    return { date: today, entries }
  } catch {
    return { date: today, entries: [] }
  }
}

export function saveState(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private modes; the app stays usable in-memory.
  }
}
