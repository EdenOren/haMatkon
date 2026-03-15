# haMatkon — Development Plan

**Stack:** Angular 19 (Standalone, Signals) · Ionic · Capacitor 7 · Django + DRF · PostgreSQL (Supabase)
**Hosting:** GitHub Pages (FE) · Vercel (BE) · Supabase (DB)
**Architecture:** Core / Shared / Features (Angular) · Django Apps (BE)
**Branch Strategy:** One feature branch per phase. Merge to `main` when phase is complete.

---

## Project Structure

```
haMatkon/
  src/                  ← Angular FE
  be/                   ← Django BE
    manage.py
    requirements.txt
    config/
      settings.py
      urls.py
      wsgi.py
    apps/
      users/
      recipes/
      extraction/
      groups/
  android/              ← Capacitor (auto-generated, Phase 11)
  angular.json
  package.json
```

---

## Access Tiers

| Capability | Guest | Logged-in User |
|---|---|---|
| Scrape recipe from URL | ✅ | ✅ |
| Add recipe manually | ✅ | ✅ |
| View & edit own recipes | ✅ (localStorage, max 5) | ✅ (DB, unlimited) |
| Share recipe (WhatsApp / email / link) | ✅ | ✅ |
| Categories with icons | ✅ (localStorage) | ✅ (DB) |
| Save more than 5 recipes | ❌ → prompt to register | ✅ |
| Cloud sync across devices | ❌ | ✅ |
| Create groups | ❌ | ✅ |
| Invite friends to groups | ❌ | ✅ |
| Edit shared/group recipes | ❌ | ✅ |

---

## Data Flow

```
Angular (FE)
  └── Guest             → localStorage (max 5 recipes)
  └── Logged-in         → Django REST API → PostgreSQL (Supabase)
  └── URL extraction    → Django REST API → fetch + parse → return recipe JSON
```

Supabase is a PostgreSQL host. Django owns the schema, migrations, and all queries.
To replace Supabase: change one `DATABASES` entry in `settings.py`.

---

## Recipe Data Model

```
Recipe
  id              uuid (auto)
  name            string
  image_url       string?
  ingredients     Ingredient[]
  steps           Step[]
  notes           string?
  category        FK → Category
  owner           FK → User
  created_at      datetime

Ingredient
  name            string
  amount          decimal
  unit            string

Step
  order           int
  text            string

Category
  id              uuid (auto)
  name            string
  icon            string        ← Ionicon name (e.g. "pizza-outline")
  owner           FK → User
```

---

## Phase 0 — Project Scaffold
**Branch:** `scaffold/init`

**Goal:** Both FE and BE runnable locally. Angular dev server proxies `/api` calls to Django. CORS configured for dev.

**Success Measures:**
- `npm run start` serves Angular without errors
- `python manage.py runserver` starts Django without errors
- `GET /api/health` returns `{ status: "ok" }`
- Angular proxy forwards `/api/*` to `localhost:8000`
- `@core` and `@shared` path aliases resolve in Angular

**Files Produced:**
```
── Angular ──
package.json
angular.json              ← proxy config: /api → localhost:8000
capacitor.config.ts
src/
  environments/
    environment.ts        ← { apiUrl: '/api' }
    environment.prod.ts   ← { apiUrl: 'https://yourdomain.com/api' }
  app/
    app.config.ts
    app.routes.ts
    app.component.ts/scss/html
    core/
      index.ts
    shared/
      index.ts
    features/

── Django ──
be/
  manage.py
  requirements.txt        ← django, djangorestframework, simplejwt,
                             psycopg2-binary, requests, beautifulsoup4,
                             extruct, django-cors-headers, python-dotenv
  .env                    ← DB credentials, secret key (gitignored)
  config/
    __init__.py
    settings.py           ← DATABASES → Supabase Postgres URL
    urls.py               ← /api/health, include app urls
    wsgi.py
  apps/
    __init__.py

── Vercel ──
vercel.json               ← routes all /api/* to Django WSGI (BE on Vercel)
.vercelignore             ← excludes src/, android/, node_modules/
```

---

## Phase 1 — Recipe Domain & Local Storage (FE)
**Branch:** `feature/recipe-domain`

**Goal:** Angular domain models and a storage-agnostic `RecipeRepository`. Guest implementation uses `localStorage` with a 5-recipe cap.

**Success Measures:**
- CRUD works in browser with no auth
- Data survives page refresh
- Saving a 6th recipe as guest returns `LIMIT_REACHED`
- No DB or HTTP types leak outside `Core`
- Signals: `recipes`, `selectedRecipe`, `isLoading`, `guestLimitReached`

**Files Produced:**
```
src/app/core/
  models/
    recipe.model.ts         ← Recipe, Ingredient, Step, Category
  repositories/
    recipe.repository.ts    ← abstract interface
    local-recipe.repository.ts  ← localStorage, 5-recipe cap
  services/
    recipe.service.ts       ← orchestrates repo, exposes signals
    category.service.ts
```

---

## Phase 2 — Django: Users & Auth
**Branch:** `feature/django-auth`

**Goal:** Django user model, registration, login, JWT token issue/refresh. All subsequent API calls are authenticated via JWT.

**Success Measures:**
- `POST /api/auth/register` creates a user
- `POST /api/auth/login` returns `access` + `refresh` JWT tokens
- `POST /api/auth/refresh` returns a new access token
- Protected endpoints return `401` without a valid token
- Passwords are hashed (Django default)

**Files Produced:**
```
be/apps/
  users/
    __init__.py
    models.py             ← custom User model (email as username)
    serializers.py        ← RegisterSerializer, UserSerializer
    views.py              ← RegisterView, LoginView (simplejwt)
    urls.py               ← /api/auth/*
    admin.py
be/config/
  settings.py             ← INSTALLED_APPS, SIMPLE_JWT config, AUTH_USER_MODEL
  urls.py                 ← include users.urls
```

---

## Phase 3 — Django: Recipes API
**Branch:** `feature/django-recipes`

**Goal:** Full CRUD REST API for recipes and categories. All endpoints JWT-protected. Schema created via Django migrations on the Supabase Postgres DB.

**Success Measures:**
- `GET /api/recipes/` returns user's recipes only
- `POST /api/recipes/` creates a recipe
- `PUT /api/recipes/{id}/` updates (owner only)
- `DELETE /api/recipes/{id}/` deletes (owner only)
- Same CRUD for `/api/categories/`
- Migrations run cleanly against Supabase Postgres

**Files Produced:**
```
be/apps/
  recipes/
    __init__.py
    models.py             ← Recipe, Ingredient, Step, Category
    serializers.py
    views.py              ← RecipeViewSet, CategoryViewSet
    urls.py               ← /api/recipes/, /api/categories/
    admin.py
    migrations/
      0001_initial.py
```

---

## Phase 4 — Django: Extraction Endpoint
**Branch:** `feature/django-extraction`

**Goal:** `POST /api/extract` fetches a URL server-side and returns structured recipe JSON. No auth required (guests use this too).

**Success Measures:**
- JSON-LD `@type: Recipe` parsed correctly (covers most major sites)
- Falls back to BeautifulSoup HTML parsing
- Returns shape matching Angular `Recipe` model
- Works for guest and logged-in users

**Files Produced:**
```
be/apps/
  extraction/
    __init__.py
    service.py            ← fetch URL with requests, try JSON-LD, fallback HTML
    parsers/
      jsonld.py           ← extruct library
      html.py             ← BeautifulSoup4 heuristics
    views.py              ← ExtractView (POST /api/extract)
    urls.py
```

---

## Phase 5 — Add Recipe Feature (FE)
**Branch:** `feature/add-recipe`

**Goal:** Two entry points — paste a URL (calls `/api/extract`) or fill a form manually. Saves to localStorage (guest) or Django API (user).

**Success Measures:**
- URL tab: loading → extraction preview → Save
- Manual tab: blank form, all fields fillable
- Guest at 5 recipes sees registration prompt instead of saving
- `ExtractionService` calls `POST /api/extract`

**Files Produced:**
```
src/app/core/
  services/
    extraction.service.ts   ← POST /api/extract
    api-recipe.service.ts   ← HTTP calls to /api/recipes (logged-in)

src/app/features/
  add-recipe/
    add-recipe.routes.ts
    add-recipe.component.ts/scss/html
    components/
      url-import/url-import.component.ts/scss/html
      manual-form/manual-form.component.ts/scss/html
      recipe-preview/recipe-preview.component.ts/scss/html
      guest-limit-prompt/guest-limit-prompt.component.ts/scss/html
```

---

## Phase 6 — Categories Feature (FE)
**Branch:** `feature/categories`

**Goal:** Create named categories with a chosen Ionicon. All recipes auto-assigned to a default category.

**Success Measures:**
- Default "All Recipes" category always exists, cannot be deleted
- Create / rename / delete custom categories
- Icon picker shows curated Ionicons grid
- Stored in localStorage (guest) or via `/api/categories/` (user)

**Files Produced:**
```
src/app/features/
  categories/
    categories.routes.ts
    categories.component.ts/scss/html
    components/
      icon-picker/icon-picker.component.ts/scss/html

src/app/shared/
  components/
    category-badge/category-badge.component.ts/scss/html
```

---

## Phase 7 — Recipe List (FE)
**Branch:** `feature/recipe-list`

**Goal:** Home screen. All recipes, filterable by category.

**Success Measures:**
- Recipes load from `RecipeService` signal
- Category filter tabs work
- Empty state with CTA to add recipe
- Pull-to-refresh on mobile
- Tap card → navigate to detail

**Files Produced:**
```
src/app/shared/
  components/
    recipe-card/recipe-card.component.ts/scss/html

src/app/features/
  recipe-list/
    recipe-list.routes.ts
    recipe-list.component.ts/scss/html
```

---

## Phase 8 — Recipe Detail + Edit (FE)
**Branch:** `feature/recipe-detail`

**Goal:** Clean view mode showing image, ingredients, steps, notes. Toggle to edit mode unlocks all fields inline.

**Success Measures:**
- Image with graceful fallback
- Ingredients: name + amount + unit
- Steps: numbered, easy to scan
- Notes: read-only in view mode, editable in edit mode
- Edit mode: add/remove/reorder ingredients and steps
- Unsaved changes prompt on navigate-away
- Save calls `RecipeService.update()`

**Files Produced:**
```
src/app/features/
  recipe-detail/
    recipe-detail.routes.ts
    recipe-detail.component.ts/scss/html
    components/
      ingredient-list/ingredient-list.component.ts/scss/html
      step-list/step-list.component.ts/scss/html
      edit-ingredient/edit-ingredient.component.ts/scss/html
      edit-step/edit-step.component.ts/scss/html
```

---

## Phase 9 — Sharing (FE + BE)
**Branch:** `feature/sharing`

**Goal:** Share any recipe via WhatsApp, email, or link. Recipient views without an account and can save to their own collection.

**How it works:**
1. Share button → `POST /api/share/` → Django saves a public snapshot, returns a UUID
2. Web Share API opens native share sheet with `hamatkon.app/r/{uuid}`
3. Recipient opens link → minimal public view → "Save to my collection"

**Success Measures:**
- Native share sheet on mobile (WhatsApp, email, copy link)
- Fallback "Copy link" on desktop
- Public view works without auth
- Recipient can save (to localStorage or DB depending on their auth state)

**Files Produced:**
```
be/apps/
  recipes/
    models.py             ← add SharedRecipe model
    views.py              ← ShareView (POST /api/share/), PublicRecipeView (GET /api/r/{uuid}/)
    urls.py
    migrations/

src/app/core/
  services/
    sharing.service.ts

src/app/features/
  shared-recipe/
    shared-recipe.routes.ts
    shared-recipe.component.ts/scss/html
```

---

## Phase 10 — Auth Feature (FE)
**Branch:** `feature/auth`

**Goal:** Optional registration and login UI. On register, local recipes migrate to DB. JWT stored in memory + refresh token in httpOnly cookie.

**Success Measures:**
- Register / login / logout UI works
- JWT sent in `Authorization: Bearer` header on all API calls
- On first login, up to 5 local recipes migrate to DB
- `RecipeService` switches from `LocalRecipeRepository` to `ApiRecipeRepository` after login
- Guests who never register are unaffected

**Files Produced:**
```
src/app/core/
  models/
    user.model.ts
  repositories/
    api-recipe.repository.ts    ← HTTP implementation of RecipeRepository
  services/
    auth.service.ts             ← signals: currentUser, isAuthenticated, token
    sync.service.ts             ← migrates localStorage → API on first login
  guards/
    auth.guard.ts
  interceptors/
    auth.interceptor.ts         ← attaches Bearer token to all API requests

src/app/features/
  auth/
    auth.routes.ts
    login/login.component.ts/scss/html
    register/register.component.ts/scss/html
```

---

## Phase 11 — Groups (FE + BE)
**Branch:** `feature/groups`

**Goal:** Logged-in users create groups, invite members by email, share and collaboratively edit recipes within a group.

**Success Measures:**
- Create group with a name
- Invite by email (Django sends invite email)
- Group recipe list visible to all members
- Any member can edit a group recipe
- Post a personal recipe to a group

**Files Produced:**
```
be/apps/
  groups/
    __init__.py
    models.py             ← Group, GroupMember, GroupRecipe
    serializers.py
    views.py
    urls.py               ← /api/groups/
    migrations/

src/app/core/
  models/
    group.model.ts
  services/
    group.service.ts

src/app/features/
  groups/
    groups.routes.ts
    group-list/group-list.component.ts/scss/html
    group-detail/group-detail.component.ts/scss/html
    group-invite/group-invite.component.ts/scss/html
```

---

## Phase 12 — Android & Mobile Polish
**Branch:** `feature/android-polish`

**Goal:** Native Android feel — safe areas, hardware back button, icon, splash screen.

**Success Measures:**
- `npx cap run android` builds and launches without errors
- Status bar, notch, and nav bar handled
- Hardware back button works on all screens
- App icon and splash screen set
- Native share sheet used on Android

**Files Produced:**
```
android/                      ← Capacitor Android project (generated)
capacitor.config.ts           ← appId, appName, webDir
resources/
  icon.png
  splash.png
src/app/app.config.ts         ← StatusBar + SplashScreen plugins
```

---

## Phase Order & Dependencies

| # | Branch | Depends On | Notes |
|---|--------|------------|-------|
| 0 | `scaffold/init` | — | Sets up both FE and BE |
| 1 | `feature/recipe-domain` | 0 | FE only |
| 2 | `feature/django-auth` | 0 | BE only — parallel with Phase 1 |
| 3 | `feature/django-recipes` | 2 | BE only |
| 4 | `feature/django-extraction` | 0 | BE only — parallel with 2 & 3 |
| 5 | `feature/add-recipe` | 1, 4 | FE + calls BE |
| 6 | `feature/categories` | 1 | FE — parallel with Phase 5 |
| 7 | `feature/recipe-list` | 1, 6 | FE |
| 8 | `feature/recipe-detail` | 7 | FE |
| 9 | `feature/sharing` | 3, 8 | FE + BE |
| 10 | `feature/auth` | 1, 3 | FE + wires to BE auth |
| 11 | `feature/groups` | 10 | FE + BE |
| 12 | `feature/android-polish` | 8, 9 | Final phase |
