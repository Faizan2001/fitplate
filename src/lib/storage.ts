export const PROFILE_KEY = 'fitplate:v1:profile'
export const TODAY_KEY = 'fitplate:v1:today'

export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveState(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private modes; the app stays usable in-memory.
  }
}
