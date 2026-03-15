# haMatkon
**Stop reading life stories. Start cooking.**

haMatkon is a personal tool designed to rescue recipes from the cluttered, ad-heavy corners of the internet.  
It extracts the essential data from any recipe URL and transforms it into a clean, standardized format you can customize and navigate with ease.

---

## 🌟 The Problem

Most recipe websites are designed for search engines and advertisers.  
By the time you find the actual measurements, you’ve already:

- Scrolled past ten paragraphs about the author’s childhood  
- Closed five pop-up ads  
- Lost your place in the instructions

Cooking shouldn't feel like navigating a marketing page.

---

## 🛠 The Solution

haMatkon focuses only on what matters: **the recipe**.

### Extract
Paste a recipe URL and the app strips away everything except the **ingredients and steps**.

### Format
Recipes are displayed in a **clean, standardized, distraction-free interface**.

### Personalize
Customize recipes to match your cooking style:
- Adjust measurements
- Add personal notes
- Rewrite steps for clarity

### Take it to the Kitchen
A **mobile-optimized Android experience** lets you cook without fighting your browser.

---

## 🏗 How It Works

haMatkon is built as a **cross-platform web and mobile application** using a **clean architecture** approach.

The frontend, backend, and database are fully decoupled — the database is replaceable without touching a single line of application code.

### Stack
- **Frontend**: Angular 19 + Ionic — hosted on GitHub Pages
- **Backend**: Django REST API — hosted on Vercel
- **Database**: PostgreSQL via Supabase (swappable — one config line)
- **Mobile**: Capacitor 7 wraps the web app as a native Android app

### Cloud Storage
Recipes are securely synced so you can:

- Save recipes on your laptop
- Access them instantly on your phone

### Android Ready
The app is designed to feel like a **native Android application**, not just a mobile webpage.

### Custom Styling
Every pixel of the interface is styled from the ground up to keep the experience **simple, readable, and distraction-free**.

---

## 🚀 Quick Start

Install dependencies:

```bash
npm install
```

Launch the web app:

```bash
npm run start
```

Open the Android project:

```bash
npx cap open android
```

## 📚 Additional Documentation

Detailed coding standards, CLI commands, and development guidelines can be found in:

[CLAUDE.md](CLAUDE.md)