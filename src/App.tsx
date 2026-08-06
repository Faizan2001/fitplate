import { useEffect, useMemo, useState } from 'react'
import { IdeasIcon, LeafIcon, SetupIcon, TodayIcon } from './components/Icons'
import { allowedFoods, foods, formatNumber, totals } from './lib/nutrition'
import { PROFILE_KEY, TODAY_KEY, loadState, saveState } from './lib/storage'
import { ProfileScreen } from './screens/ProfileScreen'
import { SuggestionsScreen } from './screens/SuggestionsScreen'
import { TodayScreen } from './screens/TodayScreen'
import type { Food, LogEntry, Profile, Screen } from './types'

const DEFAULT_PROFILE: Profile = { calories: 2000, weight: 70, height: 170, allergies: [] }

const TABS: { id: Screen; label: string; Icon: typeof SetupIcon }[] = [
  { id: 'profile', label: 'Setup', Icon: SetupIcon },
  { id: 'today', label: 'Today', Icon: TodayIcon },
  { id: 'suggestions', label: 'Ideas', Icon: IdeasIcon },
]

export function App() {
  const [profile, setProfile] = useState<Profile>(() => loadState(PROFILE_KEY, DEFAULT_PROFILE))
  const [log, setLog] = useState<LogEntry[]>(() => loadState(TODAY_KEY, [] as LogEntry[]))
  const [screen, setScreen] = useState<Screen>('profile')
  const [toast, setToast] = useState('')

  useEffect(() => saveState(PROFILE_KEY, profile), [profile])
  useEffect(() => saveState(TODAY_KEY, log), [log])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const loggedFoods = useMemo(
    () => log.map(entry => foods.find(food => food.id === entry.id)).filter((food): food is Food => Boolean(food)),
    [log],
  )
  const eaten = totals(loggedFoods)
  const remaining = (profile.calories || 0) - eaten.calories
  const candidates = useMemo(() => allowedFoods(profile.allergies), [profile.allergies])
  const proteinGap = profile.protein ? Math.max(0, profile.protein - eaten.protein) : undefined

  const logFoods = (items: Food[]) => {
    setLog(current => [...current, ...items.map(food => ({ id: food.id, loggedAt: Date.now() }))])
    setToast(items.length > 1 ? `Logged · ${formatNumber(totals(items).calories)} kcal` : 'Logged')
  }

  const goToSearch = () => {
    setScreen('today')
    window.requestAnimationFrame(() => document.getElementById('food-search')?.focus())
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="kicker">A little room to eat well</span>
          <h1>
            Fit<span>Plate</span>
          </h1>
        </div>
        <span className="brand-mark" aria-hidden="true">
          <LeafIcon />
        </span>
      </header>

      <main>
        {screen === 'profile' && (
          <ProfileScreen
            profile={profile}
            update={patch => setProfile(current => ({ ...current, ...patch }))}
            onContinue={() => setScreen('today')}
          />
        )}
        {screen === 'today' && (
          <TodayScreen
            profile={profile}
            loggedFoods={loggedFoods}
            candidates={candidates}
            onLog={logFoods}
            onRemove={index => {
              setLog(current => current.filter((_, position) => position !== index))
              setToast('Removed')
            }}
            onReset={() => {
              setLog([])
              setToast('Day reset')
            }}
            onFindFood={goToSearch}
          />
        )}
        {screen === 'suggestions' && (
          <SuggestionsScreen
            remaining={remaining}
            proteinGoal={profile.protein}
            proteinGap={proteinGap}
            candidates={candidates}
            onLog={foodsToLog => {
              logFoods(foodsToLog)
              setScreen('today')
            }}
          />
        )}
      </main>

      <p className="disclaimer">
        Demo data — not medical or dietary advice. Verify allergens yourself before eating anything.
      </p>

      <nav className="tabbar" aria-label="Screens">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={screen === id ? 'page' : undefined}
            className={`tab ${screen === id ? 'active' : ''}`}
            onClick={() => setScreen(id)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>

      <div className="toast-slot" aria-live="polite" role="status">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  )
}
