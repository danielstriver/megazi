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

RBAC uses the `user_roles` table and the `has_role(_role, _user_id)` Supabase RPC. Enum: `app_role = "admin" | "user"`.

### Supabase Clients

- `src/integrations/supabase/client.ts` — browser client using anon key (`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`). Subject to RLS. Use this everywhere in routes and components.
- `src/integrations/supabase/client.server.ts` — server-side admin client using service role key (`SUPABASE_SERVICE_ROLE_KEY`). Bypasses RLS. Only use in server functions/routes, never in client code.

### Database Schema (Supabase)

Core tables: `videos`, `ads`, `games`, `campaigns`, `wallets`, `transactions`, `profiles`, `watch_history`, `user_roles`. TypeScript types are auto-generated at `src/integrations/supabase/types.ts`.

Key columns:
- `videos.campaign_id` — FK to `campaigns.id`; present only on promoted videos
- `videos.is_active` — set to `false` when the campaign is suspended (target views reached)
- `campaigns.status` — `"Active"` | `"Suspended"` | `"Completed"`
- `campaigns.current_views` / `campaigns.target_views` — view progress tracking

### Supabase RPC Functions

Business logic that must be atomic lives in Postgres RPC functions; call them via `supabase.rpc(...)`:

| Function | Purpose |
|---|---|
| `claim_watch_reward(_content_id, _content_type, _label, _reward)` | Credits wallet, logs transaction, records watch history, increments video views and campaign views atomically. Returns `-1` if already claimed. |
| `increment_campaign_views(_campaign_id)` | Increments `campaigns.current_views`; suspends campaign and sets `videos.is_active = false` when target is reached. |
| `topup_campaign(_campaign_id, _extra_views)` | Adds extra views to `target_views`, sets campaign back to `"Active"`, and sets `videos.is_active = true`. |
| `has_role(_role, _user_id)` | Returns boolean for RBAC checks. |

### Promoted Video Lifecycle

1. Artist fills `/promote` form → campaign row inserted + a linked `videos` row created (`is_active: true`, `duration: "Promoted"`)
2. Viewers watch → each claim calls `claim_watch_reward` → `increment_campaign_views` auto-suspends the campaign when `current_views >= target_views`
3. Suspension sets `campaigns.status = "Suspended"` and `videos.is_active = false` — the watch page shows "Promotion ended"
4. Artist opens `/dashboard`, clicks "Top up views" → calls `topup_campaign` → campaign reactivated, video visible again

### Pricing (`src/lib/format.ts`)

```ts
COST_PER_VIEW_FRW = 5        // artist pays
REWARD_PER_VIEW_MGZ = 50     // viewer earns (= 5 FRW × 10)
computeCampaignCost(views)   // views × COST_PER_VIEW_FRW
```

### Routes

| Path | Purpose |
|---|---|
| `/` | Home feed — promoted + organic videos |
| `/watch/$id` | Video player with MGZ reward claim button |
| `/ads` | Ad content feed |
| `/earn` | Earn MGZ overview |
| `/explore` / `/trending` | Content discovery |
| `/play` | Games |
| `/wallet` | Balance, withdraw to MoMo/Airtel |
| `/promote` | Create promotion campaign |
| `/dashboard` | Artist campaign analytics + top-up |
| `/settings` | Profile settings |
| `/login` / `/signup` | Auth pages |

### Styling Conventions

Dark YouTube-inspired theme defined in `src/styles.css` using Tailwind CSS v4 and OKLch color space. Primary accent: `#ff0033` (red). Background: `#0f0f0f`. Use Tailwind utility classes; avoid inline styles.

### Code Style

Prettier: `printWidth: 100`, double quotes, semicolons, trailing commas. ESLint enforces React Hooks rules and TypeScript best practices.
