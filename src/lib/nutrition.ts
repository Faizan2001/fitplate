import foodsData from '../data/foods.json'
import { ALLERGENS, type Allergen, type Food, type Profile } from '../types'

const allergenSet = new Set<string>(ALLERGENS)

// Exclude-on-unknown: any food with a missing or malformed allergen array is dropped entirely.
export const foods: Food[] = (foodsData as Food[]).filter(
  food => Array.isArray(food.allergens) && food.allergens.every(allergen => allergenSet.has(allergen)),
)

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary', hint: 'Little or no exercise' },
  { value: 1.375, label: 'Light', hint: '1–3 days a week' },
  { value: 1.55, label: 'Moderate', hint: '3–5 days a week' },
  { value: 1.725, label: 'Active', hint: '6–7 days a week' },
]

export const MEAL_TAGS = ['breakfast', 'lunch', 'dinner', 'snack']

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function calculateBmi(weight: number, height: number) {
  return weight > 0 && height > 0 ? weight / (height / 100) ** 2 : 0
}

export function bmiCategory(bmi: number) {
  if (!bmi) return ''
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Healthy range'
  if (bmi < 30) return 'Overweight'
  return 'Obesity range'
}

// Mifflin–St Jeor. Returns 0 when age or sex is missing — nothing is assumed on the user's behalf.
export function suggestedCalories({ age, sex, weight, height, activity }: Profile) {
  if (!age || !sex || !weight || !height) return 0
  const base = 10 * weight + 6.25 * height - 5 * age
  const bmr = sex === 'male' ? base + 5 : base - 161
  return Math.round(bmr * (activity || 1.2))
}

export function allowedFoods(allergies: Allergen[]) {
  return foods.filter(food => !food.allergens.some(allergen => allergies.includes(allergen)))
}

export function totals(items: Food[]) {
  return items.reduce(
    (sum, food) => ({
      calories: sum.calories + food.calories,
      protein: sum.protein + food.protein,
      carbs: sum.carbs + food.carbs,
      fat: sum.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

export function buildSuggestions(items: Food[], remaining: number, proteinGap?: number, limit = 5) {
  if (remaining < 1) return []
  const floor = remaining * 0.5
  const combos: Food[][] = []
  const consider = (combo: Food[], calories: number) => {
    if (calories <= remaining && calories >= floor) combos.push(combo)
  }
  for (let i = 0; i < items.length; i++) {
    const a = items[i]
    consider([a], a.calories)
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j]
      if (a.calories + b.calories > remaining) continue
      consider([a, b], a.calories + b.calories)
      for (let k = j + 1; k < items.length; k++) {
        const c = items[k]
        consider([a, b, c], a.calories + b.calories + c.calories)
      }
    }
  }
  return combos
    .sort((first, second) => {
      const one = totals(first)
      const two = totals(second)
      if (proteinGap !== undefined) {
        const closeness = Math.abs(one.protein - proteinGap) - Math.abs(two.protein - proteinGap)
        if (closeness !== 0) return closeness
        return two.protein / Math.max(two.calories, 1) - one.protein / Math.max(one.calories, 1)
      }
      return two.calories - one.calories
    })
    .slice(0, limit)
}
