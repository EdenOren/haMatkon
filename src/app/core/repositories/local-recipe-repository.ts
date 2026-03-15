import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Recipe } from '../models/recipe.model';
import { RecipeRepository } from './recipe-repository';

const STORAGE_KEY = 'hm_recipes';
export const GUEST_RECIPE_LIMIT = 5;

@Injectable()
export class LocalRecipeRepository extends RecipeRepository {

  private read(): Recipe[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Recipe[]) : [];
    } catch {
      return [];
    }
  }

  private write(recipes: Recipe[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }

  override getAll(): Observable<Recipe[]> {
    return of(this.read());
  }

  override getById(id: string): Observable<Recipe | null> {
    return of(this.read().find(r => r.id === id) ?? null);
  }

  override save(recipe: Recipe): Observable<Recipe> {
    const recipes = this.read();
    const index = recipes.findIndex(r => r.id === recipe.id);

    if (index === -1) {
      if (recipes.length >= GUEST_RECIPE_LIMIT) {
        return throwError(() => new Error('GUEST_LIMIT_REACHED'));
      }
      recipes.push(recipe);
    } else {
      recipes[index] = recipe;
    }

    this.write(recipes);
    return of(recipe);
  }

  override delete(id: string): Observable<void> {
    this.write(this.read().filter(r => r.id !== id));
    return of(void 0);
  }

  override count(): Observable<number> {
    return of(this.read().length);
  }
}
