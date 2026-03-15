# Project: [App Name] (Angular 19 / Supabase / Capacitor)

## 🎯 Architecture & Dependency Rules
- **Layered Structure**: `Core`, `Shared`, `Features`.
- **Import Policy**: 
  - `Core`: System-wide logic (Auth, Supabase, State). Only imports from `Core`.
  - `Shared`: Stateless UI components, pipes, directives. Imports from `Core` or `Shared`.
  - `Features`: Self-contained screens/modules. Imports from `Core` or `Shared`.
- **Isolation**: **STRICTLY NO CROSS-FEATURE IMPORTS**. Features are isolated islands. Communication happens via `Core` services or `Router`.
- **Barrels**: Use `index.ts` for `@core` and `@shared`. Do not use barrels for `Features`.

## 💾 Data & State Management
- **Model Decoupling**: Components and Features must **never** import Supabase-specific types/DTOs.
- **Mapping Pattern**: Services in `Core` are responsible for fetching data and mapping it to clean Domain Models located in `src/app/core/models/`.
- **State**: Use Angular **Signals** (`signal`, `computed`, `effect`) for all state management.
- **Injection**: Use the `inject()` function for all dependency injection.

## 🎨 Styling (SCSS & BEM)
- **Convention**: Strictly follow **BEM** (`.block__element--modifier`) for all component styling.
- **Pre-processor**: Pure SCSS. No Tailwind or utility-first CSS frameworks.
- **Scope**: Use `:host` as the primary selector to encapsulate component styles.
- **Ionic Theming**: Use Ionic CSS variables (`--ion-color-primary`) for cross-platform consistency.

## 🛠 Tech Stack & Environment
- **Framework**: Angular 19+ (Standalone, Signals).
- **IDE**: Visual Studio Code (VS Code).
- **Mobile**: Capacitor 7+.
- **Database/Auth**: Supabase.

## 🚀 Key Commands
- **Serve Web**: `npm run start`
- **Run Android**: `npx cap run android`
- **Lint**: `npm run lint`
- **Build**: `npm run build`

## 📁 Naming Conventions
- **Files**: `kebab-case.component.ts`, `kebab-case.service.ts`, `kebab-case.model.ts`.
- **Classes/Interfaces/Enums**: `PascalCase`.
- **Styles**: SCSS files must accompany every component.