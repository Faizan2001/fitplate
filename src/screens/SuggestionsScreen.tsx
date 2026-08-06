import { useMemo, useState } from 'react'
import { ArrowIcon } from '../components/Icons'
import { MEAL_TAGS, buildSuggestions, formatNumber, totals } from '../lib/nutrition'
import type { Food } from '../types'

type Props = {
  remaining: number
  proteinGoal?: number
  proteinGap?: number
  candidates: Food[]
  onLog: (foods: Food[]) => void
}

export function SuggestionsScreen({ remaining, proteinGoal, proteinGap, candidates, onLog }: Props) {
  const [meal, setMeal] = useState<string>('all')

  const pool = useMemo(
    () => (meal === 'all' ? candidates : candidates.filter(food => food.tags.includes(meal))),
    [candidates, meal],
  )
  const suggestions = useMemo(
    () => buildSuggestions(pool, Math.max(0, remaining), proteinGap),
    [pool, remaining, proteinGap],
  )

  return (
    <section className="screen">
      <header className="screen-intro compact">
        <span className="kicker">Suggestions</span>
        <h2>
          What fits
          <em>right now.</em>
        </h2>
        <p>
          {remaining > 0
            ? `Combinations of one to three foods that fit the ${formatNumber(remaining)} kcal you have left.`
            : 'Your budget is spent for today. Reset the day or raise your target to see ideas.'}
        </p>
      </header>

      <div className="filter-row" role="group" aria-label="Filter by meal">
        {['all', ...MEAL_TAGS].map(tag => (
          <button
            key={tag}
            type="button"
            aria-pressed={meal === tag}
            className={`chip ${meal === tag ? 'selected' : ''}`}
            onClick={() => setMeal(tag)}
          >
            {tag === 'all' ? 'Anything' : tag[0].toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {suggestions.length ? (
        <div className="combo-list">
          {suggestions.map((combo, index) => {
            const sum = totals(combo)
            return (
              <article
                className="combo-card"
                key={combo.map(food => food.id).join('-')}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="combo-head">
                  <span className="rank">{index === 0 ? 'Best fit' : `Option ${index + 1}`}</span>
                  <b>
                    {formatNumber(sum.calories)} kcal · {formatNumber(sum.protein)}g protein
                  </b>
                </div>
                <ul className="combo-items">
                  {combo.map(food => (
                    <li key={food.id}>
                      <div>
                        <strong>{food.name}</strong>
                        <small>{food.serving}</small>
                      </div>
                      <b>{food.calories} kcal</b>
                    </li>
                  ))}
                </ul>
                <div className="combo-foot">
                  <span>
                    Leaves {formatNumber(Math.max(0, remaining - sum.calories))} kcal
                    {proteinGoal ? ` · ${formatNumber(sum.carbs)}g carbs · ${formatNumber(sum.fat)}g fat` : ''}
                  </span>
                  <button type="button" className="secondary-button" onClick={() => onLog(combo)}>
                    Log this meal
                    <ArrowIcon />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty">
          <p>Nothing fits the calories you have left.</p>
          <span>Try another meal filter, reset the day, or raise your target in Setup.</span>
        </div>
      )}
    </section>
  )
}
