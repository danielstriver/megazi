# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run format       # Prettier (write)
```

No test framework is configured.

## Architecture

**MEGAZI** is a music streaming and creator monetization platform (Rwanda). Viewers watch videos/ads, play games, and earn MEGAZI rewards. Artists promote campaigns. Withdrawal via MTN MoMo / Airtel. Exchange rate: **1 FRW = 10 MEGAZI**.

### Stack

- **TanStack Start** (full-stack React framework on Vite) + **TanStack Router** (file-based routing)
- **React 19** + **TanStack React Query** for server state
- **Supabase** — PostgreSQL, auth (email/password), RLS
- **Tailwind CSS v4** + **Radix UI** + **shadcn/ui** (new-york style)
- **Zod** + **React Hook Form** for form validation
- Path alias: `@/*` → `src/*`

### Key Directories

```
src/
├── routes/           # File-based pages (TanStack Router)
├── components/       # Layout + domain + ui/ (shadcn)
├── lib/              # auth.tsx, queries.ts, format.ts, utils.ts
└── integrations/supabase/  # client, types, auth-middleware
```

### Data Flow

All server state goes through **React Query hooks** in `src/lib/queries.ts` (`useVideos`, `useVideo(id)`, `useWalletBalance`, `useCampaigns`, etc.). These call the Supabase client directly from the browser.

The root route (`src/routes/__root.tsx`) wraps the app in `QueryClientProvider` (30s staleTime, no refetch on window focus) and `AuthProvider` from `src/lib/auth.tsx`.

Routes are auto-registered via `src/routeTree.gen.ts` (do not edit manually).

### Auth

`src/lib/auth.tsx` provides `AuthProvider` and `useAuth()` hook (returns `user`, `session`, `loading`, `signOut`). Protected routes check `useAuth()` and redirect to `/login` when unauthenticated.

### Database Schema (Supabase)

Core tables: `videos`, `ads`, `games`, `campaigns`, `wallets`, `transactions`, `profiles`, `watch_history`. TypeScript types are auto-generated at `src/integrations/supabase/types.ts`.

### Styling Conventions

Dark YouTube-inspired theme defined in `src/styles.css` using Tailwind CSS v4 and OKLch color space. Primary accent: `#ff0033` (red). Background: `#0f0f0f`. Use Tailwind utility classes; avoid inline styles.

### Code Style

Prettier: `printWidth: 100`, double quotes, semicolons, trailing commas. ESLint enforces React Hooks rules and TypeScript best practices.
