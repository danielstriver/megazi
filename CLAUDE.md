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

All server state goes through **React Query hooks** in `src/lib/queries.ts`. These call the Supabase client directly from the browser. Key hooks: `useVideos`, `useVideo(id)`, `useAds`, `useGames`, `useWalletBalance`, `useTransactions`, `useCampaigns`, `useCampaign(id)`, `useWatchHistory`, `useHasSubscribed(campaignId)`, `useProfile`.

The root route (`src/routes/__root.tsx`) wraps the app in `QueryClientProvider` (30s staleTime, no refetch on window focus) and `AuthProvider` from `src/lib/auth.tsx`.

Routes are auto-registered via `src/routeTree.gen.ts` (do not edit manually).

### Auth

`src/lib/auth.tsx` provides `AuthProvider` and `useAuth()` hook (returns `user`, `session`, `loading`, `signOut`). Protected routes check `useAuth()` and redirect to `/login` when unauthenticated.

RBAC uses the `user_roles` table and the `has_role(_role, _user_id)` Supabase RPC. Enum: `app_role = "admin" | "user"`.

### Supabase Clients

- `src/integrations/supabase/client.ts` — browser client using anon key (`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`). Subject to RLS. Use this everywhere in routes and components.
- `src/integrations/supabase/client.server.ts` — server-side admin client using service role key (`SUPABASE_SERVICE_ROLE_KEY`). Bypasses RLS. Only use in server functions/routes, never in client code.

### Database Schema (Supabase)

Core tables: `videos`, `ads`, `games`, `campaigns`, `wallets`, `transactions`, `profiles`, `watch_history`, `user_roles`, `subscriptions`. TypeScript types are auto-generated at `src/integrations/supabase/types.ts`.

Key columns:
- `videos.campaign_id` — FK to `campaigns.id`; present only on promoted videos
- `videos.is_active` — set to `false` when the campaign is suspended
- `videos.goal_type` — mirrors `campaigns.goal_type`; controls which earn cards show on the watch page
- `campaigns.status` — `"Active"` | `"Suspended"` | `"Completed"`
- `campaigns.goal_type` — `"views"` | `"subs"` | `"both"`
- `campaigns.current_views` / `campaigns.target_views` — view progress tracking
- `campaigns.current_subs` / `campaigns.target_subs` — subscriber progress tracking
- `subscriptions.user_id` / `subscriptions.campaign_id` — one row per viewer-campaign subscription

### Supabase RPC Functions

Business logic that must be atomic lives in Postgres RPC functions; call them via `supabase.rpc(...)`:

| Function | Purpose |
|---|---|
| `claim_watch_reward(_content_id, _content_type, _label, _reward)` | Credits wallet, logs transaction, records watch history, increments video views and campaign views atomically. Returns `-1` if already claimed. |
| `claim_subscribe_reward(_campaign_id, _label, _reward)` | Credits wallet, logs transaction, records subscription, increments `current_subs`. Returns `-1` if already subscribed. |
| `increment_campaign_views(_campaign_id)` | Increments `campaigns.current_views`; suspends campaign (goal-type aware) and sets `videos.is_active = false` when both targets are met. |
| `topup_campaign(_campaign_id, _extra_views)` | Adds extra views to `target_views`, sets campaign back to `"Active"`, sets `videos.is_active = true`. |
| `topup_campaign_subs(_campaign_id, _extra_subs)` | Adds extra subs to `target_subs`, reactivates campaign and video. |
| `has_role(_role, _user_id)` | Returns boolean for RBAC checks. |

### Campaign Goal Types

Campaigns support three goal types (`GoalType = "views" | "subs" | "both"`), controlled by `campaigns.goal_type` and `videos.goal_type`:

- **views** — suspended when `current_views >= target_views`
- **subs** — suspended when `current_subs >= target_subs`
- **both** — each earn button disables independently; video only suspends when **both** targets are met

The `/watch/$id` page conditionally renders a "Watch & earn" card (for `views`/`both`) and a "Subscribe & earn" card (for `subs`/`both`).

### Promoted Video Lifecycle

1. Artist fills `/promote` form → campaign row inserted + a linked `videos` row created (`is_active: true`, `duration: "Promoted"`)
2. Viewers watch/subscribe → `claim_watch_reward` / `claim_subscribe_reward` RPCs fire → `increment_campaign_views` auto-suspends when goal(s) met
3. Suspension sets `campaigns.status = "Suspended"` and `videos.is_active = false` — the watch page shows "Promotion ended"
4. Artist opens `/dashboard`, tops up views or subs → `topup_campaign` / `topup_campaign_subs` → campaign reactivated, video visible again

### Pricing (`src/lib/format.ts`)

```ts
COST_PER_VIEW_FRW = 5        // artist pays per view
REWARD_PER_VIEW_MGZ = 50     // viewer earns per view (= 5 FRW × 10)
COST_PER_SUB_FRW = 20        // artist pays per subscriber
REWARD_PER_SUB_MGZ = 150     // viewer earns per subscription
computeCampaignCost(views)   // views × COST_PER_VIEW_FRW
computeSubCost(subs)         // subs × COST_PER_SUB_FRW
computeTotalCost(views, subs, goalType)  // combined cost
getYouTubeThumbnail(url)     // extract maxresdefault.jpg from YouTube URL
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

### Deployment

Hosted on **Cloudflare Workers** (configured in `wrangler.jsonc`). Build output is a Worker entry — not a standard Node server.

```bash
npm run build
cd dist/server && npx wrangler deploy
```

Supabase secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are set on the worker and do not need to be re-added on subsequent deploys. Live URL: `https://megazi.danielhustler-hacker.workers.dev`.

Do **not** attempt a Vercel deploy without first swapping the TanStack Start adapter — the current build config is Cloudflare-specific.

### Styling Conventions

Dark YouTube-inspired theme defined in `src/styles.css` using Tailwind CSS v4 and OKLch color space. Primary accent: `#ff0033` (red). Background: `#0f0f0f`. Use Tailwind utility classes; avoid inline styles.

### Code Style

Prettier: `printWidth: 100`, double quotes, semicolons, trailing commas. ESLint enforces React Hooks rules and TypeScript best practices.
