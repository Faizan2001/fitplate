import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/bricolage-grotesque/500.css'
import '@fontsource/bricolage-grotesque/600.css'
import '@fontsource/public-sans/400.css'
import '@fontsource/public-sans/500.css'
import '@fontsource/public-sans/600.css'
import './styles.css'
import foodsData from './data/foods.json'

type Allergen = 'dairy' | 'gluten' | 'nuts' | 'peanuts' | 'eggs' | 'soy' | 'shellfish' | 'fish' | 'sesame'
type Food = { id:string; name:string; serving:string; calories:number; protein:number; carbs:number; fat:number; tags:string[]; allergens: Allergen[] }
type Profile = { calories:number; weight:number; height:number; allergies:Allergen[]; protein?:number; age?:number; sex?:'male'|'female'; activity?:number }
type LogItem = { id:string; loggedAt:number }
const foods = foodsData as Food[]
const allergens: {id:Allergen; label:string}[] = [['dairy','Dairy'],['gluten','Gluten'],['nuts','Tree nuts'],['peanuts','Peanuts'],['eggs','Eggs'],['soy','Soy'],['shellfish','Shellfish'],['fish','Fish'],['sesame','Sesame']].map(([id,label]) => ({id:id as Allergen,label}))
const PROFILE_KEY = 'fitplate:v1:profile'
const TODAY_KEY = 'fitplate:v1:today'
const validFoods = foods.filter(food => Array.isArray(food.allergens) && food.allergens.every(a => allergens.some(item => item.id === a)))

function load<T>(key:string, fallback:T):T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback } }
function bmi(weight:number, height:number) { return weight > 0 && height > 0 ? weight / ((height / 100) ** 2) : 0 }
function bmiLabel(value:number) { if (!value) return ''; if (value < 18.5) return 'Underweight'; if (value < 25) return 'Healthy range'; if (value < 30) return 'Overweight'; return 'Obesity range' }
function suggestedCalories(profile:Profile) { if (!profile.age || !profile.sex || !profile.weight || !profile.height) return 0; const bmr = profile.sex === 'male' ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5 : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161; return Math.round(bmr * (profile.activity || 1.2)) }
function formatNumber(value:number) { return new Intl.NumberFormat('en-US').format(Math.max(0, Math.round(value))) }
function App() {
  const [profile, setProfile] = useState<Profile>(() => load(PROFILE_KEY, { calories:2000, weight:70, height:170, allergies:[] }))
  const [logged, setLogged] = useState<LogItem[]>(() => load(TODAY_KEY, []))
  const [screen, setScreen] = useState<'profile'|'today'|'suggestions'>('profile')
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  useEffect(() => { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)) }, [profile])
  useEffect(() => { localStorage.setItem(TODAY_KEY, JSON.stringify(logged)) }, [logged])
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2200); return () => window.clearTimeout(timer) }, [toast])
  const loggedFoods = logged.map(item => validFoods.find(food => food.id === item.id)).filter(Boolean) as Food[]
  const eatenCalories = loggedFoods.reduce((sum, food) => sum + food.calories, 0)
  const eatenProtein = loggedFoods.reduce((sum, food) => sum + food.protein, 0)
  const remaining = (profile.calories || 0) - eatenCalories
  const allowedFoods = useMemo(() => validFoods.filter(food => !food.allergens.some(a => profile.allergies.includes(a))), [profile.allergies])
  const suggestions = useMemo(() => makeSuggestions(allowedFoods, Math.max(0, remaining), profile.protein ? Math.max(0, profile.protein - eatenProtein) : undefined), [allowedFoods, remaining, profile.protein, eatenProtein])
  const addFoods = (items:Food[]) => { setLogged(current => [...current, ...items.map(food => ({id:food.id, loggedAt:Date.now()}))]); setToast(items.length > 1 ? 'Meal logged' : 'Logged') }
  const update = (patch:Partial<Profile>) => setProfile(current => ({...current, ...patch}))
  return <div className="app-shell">
    <header className="topbar"><div><span className="eyebrow">A little room to eat well</span><h1>Fit<span>Plate</span></h1></div><div className="leaf-mark" aria-hidden="true">⌁</div></header>
    <main>
      {screen === 'profile' && <ProfileScreen profile={profile} update={update} onContinue={() => setScreen('today')} />}
      {screen === 'today' && <TodayScreen profile={profile} eatenCalories={eatenCalories} eatenProtein={eatenProtein} remaining={remaining} loggedFoods={loggedFoods} search={search} setSearch={setSearch} allowedFoods={allowedFoods} addFoods={addFoods} reset={() => { setLogged([]); setToast('Day reset') }} />}
      {screen === 'suggestions' && <SuggestionsScreen remaining={remaining} suggestions={suggestions} proteinGoal={profile.protein} onLog={addFoods} />}
    </main>
    <nav className="tabbar" aria-label="Main navigation">
      <Tab icon="○" label="Setup" active={screen === 'profile'} onClick={() => setScreen('profile')} />
      <Tab icon="▦" label="Today" active={screen === 'today'} onClick={() => setScreen('today')} />
      <Tab icon="✦" label="Ideas" active={screen === 'suggestions'} onClick={() => setScreen('suggestions')} />
    </nav>
    <p className="disclaimer">Demo data — not medical or dietary advice. Verify allergens yourself before eating anything.</p>
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}
function Tab({icon,label,active,onClick}:{icon:string;label:string;active:boolean;onClick:()=>void}) { return <button className={`tab ${active ? 'active' : ''}`} onClick={onClick}><span>{icon}</span>{label}</button> }
function Field({label, suffix, children}:{label:string;suffix?:string;children:React.ReactNode}) { return <label className="field"><span>{label}{suffix && <small>{suffix}</small>}</span>{children}</label> }
function ProfileScreen({profile,update,onContinue}:{profile:Profile;update:(patch:Partial<Profile>)=>void;onContinue:()=>void}) {
  const bmiValue = bmi(profile.weight, profile.height); const target = suggestedCalories(profile)
  return <section className="screen profile-screen"><div className="intro"><span className="section-kicker">Your starting point</span><h2>Make your plate<br /><em>fit your day.</em></h2><p>Set your basics once. We’ll keep suggestions practical and inside your budget.</p></div>
    <div className="card form-card"><div className="form-section"><h3>Daily target</h3><Field label="Calories" suffix="kcal / day"><input type="number" min="1" value={profile.calories || ''} onChange={e => update({calories:Number(e.target.value)})} /></Field>{target > 0 && <div className="target-helper"><div><span>Suggested target</span><strong>{formatNumber(target)} kcal</strong><small>Based on your details and activity</small></div><button className="text-button" onClick={() => update({calories:target})}>Use this</button></div>}<Field label="Protein goal" suffix="grams / day · optional"><input type="number" min="0" placeholder="Leave blank" value={profile.protein ?? ''} onChange={e => update({protein:e.target.value === '' ? undefined : Number(e.target.value)})} /></Field></div>
      <div className="form-section"><h3>Body stats</h3><div className="field-grid"><Field label="Weight" suffix="kg"><input type="number" min="1" value={profile.weight || ''} onChange={e => update({weight:Number(e.target.value)})} /></Field><Field label="Height" suffix="cm"><input type="number" min="1" value={profile.height || ''} onChange={e => update({height:Number(e.target.value)})} /></Field></div>{bmiValue > 0 && <div className="bmi-readout"><span>Your BMI</span><strong>{bmiValue.toFixed(1)}</strong><b>{bmiLabel(bmiValue)}</b></div>}<div className="field-grid"><Field label="Age" suffix="years · optional"><input type="number" min="1" value={profile.age ?? ''} placeholder="Optional" onChange={e => update({age:e.target.value === '' ? undefined : Number(e.target.value)})} /></Field><Field label="Sex"><select value={profile.sex ?? ''} onChange={e => update({sex:e.target.value ? e.target.value as 'male'|'female' : undefined})}><option value="">Select</option><option value="female">Female</option><option value="male">Male</option></select></Field></div>{profile.age && profile.sex && <Field label="Activity level"><select value={profile.activity || 1.2} onChange={e => update({activity:Number(e.target.value)})}><option value="1.2">Sedentary · little exercise</option><option value="1.375">Light · 1–3 days/week</option><option value="1.55">Moderate · 3–5 days/week</option><option value="1.725">Active · 6–7 days/week</option></select></Field>}</div>
      <div className="form-section"><h3>Allergies</h3><p className="field-note">We’ll leave these foods out of your search and suggestions.</p><div className="choices">{allergens.map(item => <label className={`choice ${profile.allergies.includes(item.id) ? 'selected' : ''}`} key={item.id}><input type="checkbox" checked={profile.allergies.includes(item.id)} onChange={() => update({allergies:profile.allergies.includes(item.id) ? profile.allergies.filter(a => a !== item.id) : [...profile.allergies, item.id]})} /><span>{item.label}</span></label>)}</div></div>
      <button className="primary-button" onClick={onContinue} disabled={!profile.calories || !profile.weight || !profile.height}>See my day <span>→</span></button>
    </div></section>
}
function BudgetMeter({percent}:{percent:number}) { return <div className="meter" aria-label={`${Math.round(percent)} percent of calorie budget used`}>{Array.from({length:20},(_,i) => <span key={i} className={i < Math.floor(percent / 5) ? (percent > 100 && i >= 16 ? 'over' : 'filled') : ''} style={{'--delay':`${i * 20}ms`} as React.CSSProperties} />)}</div> }
function TodayScreen({profile,eatenCalories,eatenProtein,remaining,loggedFoods,search,setSearch,allowedFoods,addFoods,reset}:{profile:Profile;eatenCalories:number;eatenProtein:number;remaining:number;loggedFoods:Food[];search:string;setSearch:(s:string)=>void;allowedFoods:Food[];addFoods:(foods:Food[])=>void;reset:()=>void}) {
  const results = allowedFoods.filter(food => food.name.toLowerCase().includes(search.toLowerCase())).slice(0,5); const used = profile.calories ? Math.max(0, eatenCalories / profile.calories * 100) : 0
  return <section className="screen"><div className="screen-heading"><div><span className="section-kicker">Today</span><h2>A good day<br /><em>has room.</em></h2></div><span className="date-pill">Local day</span></div><div className="budget-card card"><div className="budget-top"><span>Calories remaining</span><span>{formatNumber(eatenCalories)} / {formatNumber(profile.calories)} kcal</span></div><strong className="remaining">{formatNumber(remaining)}<small>kcal</small></strong><BudgetMeter percent={used} /><div className="meter-labels"><span>0</span><span>Daily budget</span><span>{formatNumber(profile.calories)}</span></div></div><div className="stats-row"><div><span>Protein</span><strong>{formatNumber(eatenProtein)}<small>g</small></strong>{profile.protein && <small className="goal">of {formatNumber(profile.protein)}g goal</small>}</div><div><span>Allergies</span><strong>{profile.allergies.length || 'None'}</strong><small className="goal">filtered</small></div></div><div className="log-section"><div className="section-line"><h3>Logged today</h3><button className="quiet-button" onClick={reset} disabled={!loggedFoods.length}>Reset day</button></div>{loggedFoods.length === 0 ? <div className="empty"><p>Nothing logged yet.</p><button className="link-button" onClick={() => document.getElementById('food-search')?.focus()}>Find something that fits <span>→</span></button></div> : <div className="logged-list">{loggedFoods.map((food,index) => <div className="logged-item" key={`${food.id}-${index}`}><div><strong>{food.name}</strong><span>{food.serving}</span></div><b>{food.calories} kcal</b></div>)}</div>}</div><div className="search-box"><label htmlFor="food-search">Quick log</label><div className="search-input"><span>⌕</span><input id="food-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search a food to log" /></div>{search && <div className="search-results">{results.length ? results.map(food => <button key={food.id} onClick={() => {addFoods([food]); setSearch('')}}><span><strong>{food.name}</strong><small>{food.serving}</small></span><b>{food.calories} kcal <i>+</i></b></button>) : <p>No matching foods fit your allergy filters.</p>}</div>}</div></section>
}
function SuggestionsScreen({remaining,suggestions,proteinGoal,onLog}:{remaining:number;suggestions:Food[][];proteinGoal?:number;onLog:(foods:Food[])=>void}) { return <section className="screen"><div className="screen-heading"><div><span className="section-kicker">Suggestions</span><h2>What fits<br /><em>right now.</em></h2></div><span className="remaining-pill">{formatNumber(remaining)} kcal left</span></div><p className="screen-copy">Simple combinations built around what you have left. {proteinGoal ? 'Protein is guiding the order.' : 'Choose what sounds good — protein is optional.'}</p>{suggestions.length ? <div className="suggestion-list">{suggestions.map((combo,index) => { const calories=combo.reduce((sum,f)=>sum+f.calories,0); const protein=combo.reduce((sum,f)=>sum+f.protein,0); return <article className="suggestion-card" style={{'--card-delay':`${index * 70}ms`} as React.CSSProperties} key={combo.map(f=>f.id).join('-')}><div className="suggestion-meta"><span>Option {String(index + 1).padStart(2,'0')}</span><b>{calories} kcal · {protein}g protein</b></div><div className="combo-items">{combo.map(food => <div key={food.id}><strong>{food.name}</strong><small>{food.serving} · {food.calories} kcal</small></div>)}</div><button className="secondary-button" onClick={() => onLog(combo)}>Log this meal <span>→</span></button></article>})}</div> : <div className="empty suggestion-empty"><p>No combination fits the remaining calories.</p><span>Try logging a little less, or adjust your daily target in Setup.</span></div>}</section>}
function makeSuggestions(items:Food[], remaining:number, proteinGap?:number) { if (remaining < 1) return [] as Food[][]; const combos:Food[][] = []; for (let i=0;i<items.length;i++) { combos.push([items[i]]); for (let j=i+1;j<items.length;j++) { combos.push([items[i],items[j]]); for (let k=j+1;k<items.length;k++) combos.push([items[i],items[j],items[k]]) } } const viable=combos.filter(combo => { const calories=combo.reduce((s,f)=>s+f.calories,0); return calories <= remaining && calories >= remaining * .5 }).sort((a,b) => { const ca=a.reduce((s,f)=>s+f.calories,0), cb=b.reduce((s,f)=>s+f.calories,0); if (proteinGap !== undefined) { const pa=a.reduce((s,f)=>s+f.protein,0), pb=b.reduce((s,f)=>s+f.protein,0); const scoreA=Math.abs(pa-proteinGap), scoreB=Math.abs(pb-proteinGap); if (scoreA !== scoreB) return scoreA-scoreB; return pb/Math.max(cb,1)-pa/Math.max(ca,1) } return cb-ca }).slice(0,5); return viable }
createRoot(document.getElementById('root')!).render(<App />)
