export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'breakfast', name: 'Breakfast', icon: 'sunny-outline' },
  { id: 'lunch', name: 'Lunch', icon: 'restaurant-outline' },
  { id: 'dinner', name: 'Dinner', icon: 'moon-outline' },
  { id: 'snack', name: 'Snack', icon: 'cafe-outline' },
  { id: 'dessert', name: 'Dessert', icon: 'ice-cream-outline' },
  { id: 'drink', name: 'Drink', icon: 'wine-outline' },
];
