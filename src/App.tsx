import { useEffect, useMemo, useState } from 'react'
import { IdeasIcon, LeafIcon, SetupIcon, TodayIcon } from './components/Icons'
import { allowedFoods, foods, formatNumber, totals } from './lib/nutrition'
import { PROFILE_KEY, TODAY_KEY, loadProfile, loadTodayLog, localDate, saveState } from './lib/storage'
import { ProfileScreen } from './screens/ProfileScreen'
import { SuggestionsScreen } from './screens/SuggestionsScreen'
import { TodayScreen } from './screens/TodayScreen'
import type { DailyLog, Food, LoggedFood, Profile, Screen } from './types'

const DEFAULT_PROFILE: Profile = { calories: 2000, weight: 70, height: 170, allergies: [] }

const TABS: { id: Screen; label: string; Icon: typeof SetupIcon }[] = [
  { id: 'profile', label: 'Setup', Icon: SetupIcon },
  { id: 'today', label: 'Today', Icon: TodayIcon },
  { id: 'suggestions', label: 'Ideas', Icon: IdeasIcon },
]

export function App() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile(DEFAULT_PROFILE))
  const [dailyLog, setDailyLog] = useState<DailyLog>(loadTodayLog)
  const [screen, setScreen] = useState<Screen>(() => 'profile')
  const [toast, setToast] = useState('')

  useEffect(() => saveState(PROFILE_KEY, profile), [profile])
  useEffect(() => saveState(TODAY_KEY, dailyLog), [dailyLog])
  useEffect(() => {
    const resetIfNewDay = () => {
      const today = localDate()
      setDailyLog(current => (current.date === today ? current : { date: today, entries: [] }))
    }
    window.addEventListener('focus', resetIfNewDay)
    document.addEventListener('visibilitychange', resetIfNewDay)
    return () => {
      window.removeEventListener('focus', resetIfNewDay)
      document.removeEventListener('visibilitychange', resetIfNewDay)
    }
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const loggedItems = useMemo(
    () =>
      dailyLog.entries
        .map(entry => {
          const food = foods.find(item => item.id === entry.foodId)
          return food ? { entry, food } : undefined
        })
        .filter((item): item is LoggedFood => Boolean(item)),
    [dailyLog.entries],
  )
  const loggedFoods = loggedItems.map(item => item.food)
  const eaten = totals(loggedFoods)
  const remaining = (profile.calories || 0) - eaten.calories
  const candidates = useMemo(() => allowedFoods(profile.allergies), [profile.allergies])
  const proteinGap = profile.protein ? Math.max(0, profile.protein - eaten.protein) : undefined

  const logFoods = (items: Food[]) => {
    const now = Date.now()
    setDailyLog(current => ({
      date: localDate(now),
      entries: [
        ...(current.date === localDate(now) ? current.entries : []),
        ...items.map((food, index) => ({
          entryId: `${now}-${index}-${food.id}`,
          foodId: food.id,
          loggedAt: now,
        })),
      ],
    }))
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

      <main id="main-content" tabIndex={-1}>
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
            loggedItems={loggedItems}
            candidates={candidates}
            onLog={logFoods}
            onRemove={entryId => {
              setDailyLog(current => ({
                ...current,
                entries: current.entries.filter(entry => entry.entryId !== entryId),
              }))
              setToast('Removed')
            }}
            onReset={() => {
              setDailyLog({ date: localDate(), entries: [] })
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
