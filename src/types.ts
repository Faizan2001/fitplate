export const ALLERGENS = ['dairy', 'gluten', 'nuts', 'peanuts', 'eggs', 'soy', 'shellfish', 'fish', 'sesame'] as const

export type Allergen = (typeof ALLERGENS)[number]

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: 'Dairy',
  gluten: 'Gluten',
  nuts: 'Tree nuts',
  peanuts: 'Peanuts',
  eggs: 'Eggs',
  soy: 'Soy',
  shellfish: 'Shellfish',
  fish: 'Fish',
  sesame: 'Sesame',
}

export type Food = {
  id: string
  name: string
  serving: string
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
  allergens: Allergen[]
}

export type Sex = 'male' | 'female'

export type Profile = {
  calories: number
  weight: number
  height: number
  allergies: Allergen[]
  protein?: number
  age?: number
  sex?: Sex
  activity?: number
}

export type LogEntry = { id: string; loggedAt: number }

export type Screen = 'profile' | 'today' | 'suggestions'
