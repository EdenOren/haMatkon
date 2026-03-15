import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe.model';

export abstract class RecipeRepository {
  abstract getAll(): Observable<Recipe[]>;
  abstract getById(id: string): Observable<Recipe | null>;
  abstract save(recipe: Recipe): Observable<Recipe>;
  abstract delete(id: string): Observable<void>;
  abstract count(): Observable<number>;
}
