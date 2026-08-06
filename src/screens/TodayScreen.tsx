import { useMemo, useState } from 'react'
import { BudgetMeter } from '../components/BudgetMeter'
import { ArrowIcon, CloseIcon, PlusIcon, SearchIcon } from '../components/Icons'
import { formatNumber, totals } from '../lib/nutrition'
import { ALLERGEN_LABELS, type Food, type LoggedFood, type Profile } from '../types'

type Props = {
  profile: Profile
  loggedItems: LoggedFood[]
  candidates: Food[]
  onLog: (foods: Food[]) => void
  onRemove: (entryId: string) => void
  onReset: () => void
  onFindFood: () => void
}

export function TodayScreen({ profile, loggedItems, candidates, onLog, onRemove, onReset, onFindFood }: Props) {
  const [query, setQuery] = useState('')
  const loggedFoods = loggedItems.map(item => item.food)
  const eaten = totals(loggedFoods)
  const remaining = (profile.calories || 0) - eaten.calories
  const overBudget = remaining < 0

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return candidates.filter(food => food.name.toLowerCase().includes(term)).slice(0, 6)
  }, [candidates, query])

  return (
    <section className="screen">
      <header className="screen-intro compact">
        <span className="kicker">Today</span>
        <h2>
          A good day
          <em>has room.</em>
        </h2>
      </header>

      <div className={`budget-card ${overBudget ? 'over' : ''}`}>
        <div className="budget-head">
          <span>{overBudget ? 'Over your budget by' : 'Calories remaining'}</span>
          <span className="tally">
            {formatNumber(eaten.calories)} / {formatNumber(profile.calories || 0)} kcal
          </span>
        </div>
        <strong className="big-number">
          {formatNumber(Math.abs(remaining))}
          <small>kcal</small>
        </strong>
        <BudgetMeter eaten={eaten.calories} target={profile.calories || 0} />
        <div className="meter-scale">
          <span>0</span>
          <span>each block is 5% of your day</span>
          <span>{formatNumber(profile.calories || 0)}</span>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat">
          <span>Protein</span>
          <strong>
            {formatNumber(eaten.protein)}
            <small>g</small>
          </strong>
          <small className="stat-note">
            {profile.protein ? `of ${formatNumber(profile.protein)}g goal` : 'no goal set'}
          </small>
        </div>
        <div className="stat">
          <span>Items logged</span>
          <strong>{loggedItems.length}</strong>
          <small className="stat-note">
            {profile.allergies.length
              ? `${profile.allergies.length} allergen ${profile.allergies.length === 1 ? 'filter' : 'filters'}`
              : 'no filters'}
          </small>
        </div>
      </div>

      <section className="section" aria-labelledby="logged-heading">
        <div className="section-head">
          <h3 id="logged-heading">Logged today</h3>
          <button type="button" className="quiet-button" onClick={onReset} disabled={!loggedItems.length}>
            Reset day
          </button>
        </div>
        {loggedItems.length === 0 ? (
          <div className="empty">
            <p>Nothing logged yet.</p>
            <button type="button" className="link-button" onClick={onFindFood}>
              Find something that fits
              <ArrowIcon />
            </button>
          </div>
        ) : (
          <ul className="logged-list" aria-label="Foods logged today">
            {loggedItems.map(({ entry, food }) => (
              <li key={entry.entryId}>
                <div>
                  <strong>{food.name}</strong>
                  <span>
                    {food.serving} · {food.protein}g protein
                  </span>
                </div>
                <b aria-label={`${food.calories} calories`}>{food.calories} kcal</b>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Remove ${food.name}`}
                  onClick={() => onRemove(entry.entryId)}
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section search-section" aria-labelledby="quick-log-heading">
        <div className="section-head">
          <h3 id="quick-log-heading">Quick log</h3>
        </div>
        <div className="search-field">
          <SearchIcon />
          <input
            id="food-search"
            type="search"
            aria-label="Search foods to log"
            value={query}
            placeholder="Search a food to log"
            onChange={event => setQuery(event.target.value)}
          />
          {query && (
            <button type="button" className="icon-button" aria-label="Clear search" onClick={() => setQuery('')}>
              <CloseIcon />
            </button>
          )}
        </div>
        {query.trim() && (
          <div className="search-results" aria-live="polite">
            {results.length ? (
              results.map(food => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => {
                    onLog([food])
                    setQuery('')
                  }}
                >
                  <span className="result-name">
                    <strong>{food.name}</strong>
                    <small>
                      {food.serving}
                      {food.allergens.length
                        ? ` · contains ${food.allergens.map(a => ALLERGEN_LABELS[a].toLowerCase()).join(', ')}`
                        : ''}
                    </small>
                  </span>
                  <span className="result-add">
                    <b>{food.calories} kcal</b>
                    <PlusIcon />
                  </span>
                </button>
              ))
            ) : (
              <p className="no-results">No food matches that name within your allergy filters.</p>
            )}
          </div>
        )}
      </section>
    </section>
  )
}
