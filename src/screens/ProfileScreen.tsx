import { Field, Segmented } from '../components/Field'
import { ArrowIcon, CheckIcon } from '../components/Icons'
import { ACTIVITY_LEVELS, bmiCategory, calculateBmi, formatNumber, suggestedCalories } from '../lib/nutrition'
import { ALLERGENS, ALLERGEN_LABELS, type Allergen, type Profile, type Sex } from '../types'

type Props = {
  profile: Profile
  update: (patch: Partial<Profile>) => void
  onContinue: () => void
}

const numberValue = (raw: string) => (raw === '' ? undefined : Math.max(0, Number(raw)))

export function ProfileScreen({ profile, update, onContinue }: Props) {
  const bmi = calculateBmi(profile.weight, profile.height)
  const suggestion = suggestedCalories(profile)
  const ready = Boolean(profile.calories && profile.weight && profile.height)

  const toggleAllergy = (allergen: Allergen) =>
    update({
      allergies: profile.allergies.includes(allergen)
        ? profile.allergies.filter(item => item !== allergen)
        : [...profile.allergies, allergen],
    })

  return (
    <section className="screen">
      <header className="screen-intro">
        <span className="kicker">Your starting point</span>
        <h2>
          Make your plate
          <em>fit your day.</em>
        </h2>
        <p>Set your basics once. Suggestions stay practical and inside your budget.</p>
      </header>

      <div className="panel">
        <div className="panel-head">
          <h3>Daily target</h3>
          <span className="panel-note">Saved automatically</span>
        </div>
        <Field label="Calories" hint="kcal per day" htmlFor="target-calories">
          <input
            id="target-calories"
            type="number"
            min="1"
            inputMode="numeric"
            value={profile.calories || ''}
            onChange={event => update({ calories: numberValue(event.target.value) ?? 0 })}
          />
        </Field>
        {suggestion > 0 && (
          <div className="suggestion-strip">
            <div>
              <span>Suggested target</span>
              <strong>{formatNumber(suggestion)} kcal</strong>
              <small>From your height, weight, age, sex, and activity</small>
            </div>
            <button type="button" className="pill-button" onClick={() => update({ calories: suggestion })}>
              Use this
            </button>
          </div>
        )}
        <Field label="Protein goal" hint="grams per day · optional" htmlFor="target-protein">
          <input
            id="target-protein"
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Leave blank to skip"
            value={profile.protein ?? ''}
            onChange={event => update({ protein: numberValue(event.target.value) })}
          />
        </Field>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Body stats</h3>
        </div>
        <div className="field-row">
          <Field label="Weight" hint="kg" htmlFor="weight">
            <input
              id="weight"
              type="number"
              min="1"
              inputMode="decimal"
              value={profile.weight || ''}
              onChange={event => update({ weight: numberValue(event.target.value) ?? 0 })}
            />
          </Field>
          <Field label="Height" hint="cm" htmlFor="height">
            <input
              id="height"
              type="number"
              min="1"
              inputMode="decimal"
              value={profile.height || ''}
              onChange={event => update({ height: numberValue(event.target.value) ?? 0 })}
            />
          </Field>
        </div>
        {bmi > 0 && (
          <div className="readout">
            <span>Your BMI</span>
            <strong>{bmi.toFixed(1)}</strong>
            <b>{bmiCategory(bmi)}</b>
          </div>
        )}
        <div className="field-row">
          <Field label="Age" hint="years · optional" htmlFor="age">
            <input
              id="age"
              type="number"
              min="1"
              inputMode="numeric"
              placeholder="Optional"
              value={profile.age ?? ''}
              onChange={event => update({ age: numberValue(event.target.value) })}
            />
          </Field>
          <Segmented<Sex>
            label="Sex"
            hint="optional"
            value={profile.sex ?? ''}
            options={[
              { value: 'female', label: 'Female' },
              { value: 'male', label: 'Male' },
            ]}
            onChange={sex => update({ sex })}
          />
        </div>
        {profile.age && profile.sex ? (
          <Field label="Activity level" htmlFor="activity">
            <select
              id="activity"
              value={profile.activity || 1.2}
              onChange={event => update({ activity: Number(event.target.value) })}
            >
              {ACTIVITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label} · {level.hint}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <p className="field-note">Add your age and sex to see a suggested calorie target.</p>
        )}
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Allergies</h3>
          <span className="panel-note">
            {profile.allergies.length ? `${profile.allergies.length} selected` : 'None selected'}
          </span>
        </div>
        <p className="field-note">These foods stay out of your search results and suggestions.</p>
        <div className="chips">
          {ALLERGENS.map(allergen => {
            const selected = profile.allergies.includes(allergen)
            return (
              <button
                key={allergen}
                type="button"
                aria-pressed={selected}
                className={`chip ${selected ? 'selected' : ''}`}
                onClick={() => toggleAllergy(allergen)}
              >
                {selected && <CheckIcon />}
                {ALLERGEN_LABELS[allergen]}
              </button>
            )
          })}
        </div>
      </div>

      <button type="button" className="primary-button" onClick={onContinue} disabled={!ready}>
        See my day
        <ArrowIcon />
      </button>
    </section>
  )
}
