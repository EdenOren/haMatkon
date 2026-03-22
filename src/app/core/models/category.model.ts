export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'b1ea5a00-0001-0000-0000-000000000001', name: 'Breakfast', icon: 'sunny-outline' },
  { id: 'b1ea5a00-0001-0000-0000-000000000002', name: 'Lunch', icon: 'restaurant-outline' },
  { id: 'b1ea5a00-0001-0000-0000-000000000003', name: 'Dinner', icon: 'moon-outline' },
  { id: 'b1ea5a00-0001-0000-0000-000000000004', name: 'Snack', icon: 'cafe-outline' },
  { id: 'b1ea5a00-0001-0000-0000-000000000005', name: 'Dessert', icon: 'ice-cream-outline' },
  { id: 'b1ea5a00-0001-0000-0000-000000000006', name: 'Drink', icon: 'wine-outline' },
];
