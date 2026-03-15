# Project: haMatkon (Angular 19 / Django / Capacitor)

## 🎯 Architecture & Dependency Rules
- **Layered Structure**: `Core`, `Shared`, `Features`.
- **Import Policy**:
  - `Core`: System-wide logic (Auth, HTTP, State). Only imports from `Core`.
  - `Shared`: Stateless UI components, pipes, directives. Imports from `Core` or `Shared`.
  - `Features`: Self-contained screens/modules. Imports from `Core` or `Shared`.
- **Isolation**: **STRICTLY NO CROSS-FEATURE IMPORTS**. Features are isolated islands. Communication happens via `Core` services or `Router`.
- **Barrels**: Use `index.ts` for `@core` and `@shared`. Do not use barrels for `Features`.

## 💾 Data & State Management
- **Model Decoupling**: Components and Features must **never** import DB-specific types or Django serializer shapes.
- **Mapping Pattern**: Services in `Core` map raw API responses to clean Domain Models in `src/app/core/models/`.
- **State**: Use Angular **Signals** (`signal`, `computed`, `effect`) for all state management.
- **Injection**: Use the `inject()` function for all dependency injection.
- **Guest storage**: `localStorage` via `LocalRecipeRepository`. Max 5 recipes. Migrates to API on registration.
- **API calls**: All data (except auth session) flows through the Django REST API. Angular never queries the DB directly.

## 🎨 Styling (SCSS & BEM)
- **Convention**: Strictly follow **BEM** (`.block__element--modifier`) for all component styling.
- **Pre-processor**: Pure SCSS. No Tailwind or utility-first CSS frameworks.
- **Scope**: Use `:host` as the primary selector to encapsulate component styles.
- **Ionic Theming**: Use Ionic CSS variables (`--ion-color-primary`) for cross-platform consistency.

## 🛠 Tech Stack
- **FE Framework**: Angular 19+ (Standalone, Signals) + Ionic.
- **BE Framework**: Django + Django REST Framework + simplejwt.
- **Database**: PostgreSQL via Supabase (host only — replaceable by changing `DATABASES` in `settings.py`).
- **Mobile**: Capacitor 7+.
- **IDE**: Visual Studio Code.

## 🌍 Hosting
- **FE**: GitHub Pages (deployed via GitHub Actions on push to `main`).
- **BE**: Vercel (Django as Python serverless via `vercel.json`).
- **DB**: Supabase (managed PostgreSQL).

## 🚀 Key Commands

### Frontend
- **Serve**: `npm run start`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Run Android**: `npx cap run android`

### Backend
- **Serve**: `cd be && python manage.py runserver`
- **Migrate**: `cd be && python manage.py migrate`
- **New migration**: `cd be && python manage.py makemigrations`
- **Shell**: `cd be && python manage.py shell`
- **Deploy BE**: `vercel --prod` (from project root)

## 📁 Naming Conventions
- **FE files**: `kebab-case.component.ts`, `kebab-case.service.ts`, `kebab-case.model.ts`.
- **FE classes**: `PascalCase`.
- **SCSS**: Every component must have an accompanying `.scss` file.
- **BE files**: `snake_case.py` (Django convention).
- **BE classes**: `PascalCase` (models, serializers, views).

## 🔐 Environment & Secrets
- FE secrets live in `src/environments/` — only `apiUrl` (no DB credentials ever in FE).
- BE secrets live in `be/.env` — DB URL, Django secret key, allowed hosts. **Never committed.**
- Vercel environment variables mirror `be/.env` for production.
