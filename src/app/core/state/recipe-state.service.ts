import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Recipe } from '../models/recipe.model';
import { RecipeRepository } from '../repositories/recipe-repository';
import { GUEST_RECIPE_LIMIT } from '../repositories/local-recipe-repository';

@Injectable({ providedIn: 'root' })
export class RecipeStateService {
  private readonly repository = inject(RecipeRepository);

  private readonly _recipes = signal<Recipe[]>([]);
  readonly recipes = this._recipes.asReadonly();

  readonly count = computed(() => this._recipes().length);
  readonly canAddMore = computed(() => this._recipes().length < GUEST_RECIPE_LIMIT);

  readonly selectedCategoryId = signal<string | null>(null);

  readonly filteredRecipes = computed(() => {
    const categoryId = this.selectedCategoryId();
    const recipes = this._recipes();
    if (!categoryId) return recipes;
    return recipes.filter(r => r.categoryIds.includes(categoryId));
  });

  constructor() {
    this.loadAll();
  }

  loadAll(): void {
    this.repository.getAll().subscribe(recipes => this._recipes.set(recipes));
  }

  addRecipe(recipe: Recipe): Observable<Recipe> {
    return this.repository.save(recipe).pipe(
      tap(saved => this._recipes.update(all => [...all, saved]))
    );
  }

  updateRecipe(recipe: Recipe): Observable<Recipe> {
    return this.repository.save(recipe).pipe(
      tap(saved => this._recipes.update(all => all.map(r => r.id === saved.id ? saved : r)))
    );
  }

  deleteRecipe(id: string): Observable<void> {
    return this.repository.delete(id).pipe(
      tap(() => this._recipes.update(all => all.filter(r => r.id !== id)))
    );
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }
}
