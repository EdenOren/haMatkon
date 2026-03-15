export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Step {
  order: number;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sourceUrl: string;
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  categoryIds: string[];
  ingredients: Ingredient[];
  steps: Step[];
  createdAt: string;
  updatedAt: string;
}
