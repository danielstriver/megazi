# MEGAZI — Progress & Testing Guide

## Live URL
**https://megazi.danielhustler-hacker.workers.dev**

Hosted on **Cloudflare Workers** (see [Why Cloudflare, not Vercel?](#why-cloudflare-not-vercel) below).

---

## What was built

### 1. Auth — frictionless signup
Email confirmation gate removed. Users sign up, get logged in immediately, and receive a welcome toast. The `profiles` table is populated with their display name on signup so it shows correctly in campaigns and the dashboard.

**Files:** `src/routes/signup.tsx`
**Supabase step:** Authentication → Providers → Email → disable **Confirm email**

---

### 2. Promoted video lifecycle
Artists promote a track by creating a campaign on `/promote`. The system creates both a `campaigns` row and a linked `videos` row that appears live in the home feed.

**Pricing:**
| | |
|---|---|
| Artist pays | 5 FRW per view |
| Viewer earns | 50 MGZ per view |

**Lifecycle:**
1. Campaign created → video live in feed (`is_active = true`, `status = Active`)
2. Viewer watches → `claim_watch_reward` RPC credits wallet, increments `current_views`
3. Target reached → `status = Suspended`, `is_active = false`, video hidden from feed
4. Artist tops up from `/dashboard` → `topup_campaign` RPC reactivates campaign and video

**Files:** `src/routes/promote.tsx`, `src/routes/dashboard.tsx`, `src/routes/watch.$id.tsx`

---

### 3. Subscription system
Artists can now set a campaign goal of **Views**, **Subscribers**, or **Both**.

**Pricing:**
| | |
|---|---|
| Artist pays | 5 FRW per view · 20 FRW per subscriber |
| Viewer earns | 50 MGZ per view · 150 MGZ per subscription |

**Goal logic:**
- **Views only** — suspends when view target is hit
- **Subs only** — suspends when subscriber target is hit
- **Both** — each goal button disables independently once its target is met; the video is only suspended (and hidden from the feed) when **both** targets are reached

**On the watch page** (`/watch/$id`), promoted videos show:
- A **"Watch this video / Earn +50 MGZ"** card — visible for Views and Both campaigns
- A **"Subscribe to {artist} / Earn +150 MGZ"** card — visible for Subs and Both campaigns

Both cards show a disabled/confirmed state once the viewer has already claimed that reward, or once that goal's global target is met.

**New Supabase objects required:**
```sql
-- Columns added to campaigns
goal_type, target_subs, current_subs

-- New table
subscriptions (user_id, campaign_id)

-- New / updated RPCs
claim_subscribe_reward()
topup_campaign_subs()
increment_campaign_views()   -- updated for goal_type-aware suspension
```

**Files:** `src/routes/promote.tsx`, `src/routes/watch.$id.tsx`, `src/routes/dashboard.tsx`, `src/lib/queries.ts`, `src/lib/format.ts`

---

## How to test locally

```bash
npm run dev   # http://localhost:5173
```

### Artist flow
1. Sign up / log in
2. Go to `/promote` — create a campaign with goal **Both**, set a low target (e.g. 2 views + 2 subs) for quick testing
3. Check `/dashboard` — campaign shows as Active with two progress bars

### Viewer flow (open an incognito window, sign up as a second account)
1. Home page — the promoted video appears in the feed
2. Open the video — you see a **Watch** card and a **Subscribe** card below the description
3. Click **Watch** → +50 MGZ added, button flips to "Watched ✓"
4. Click **Subscribe** → +150 MGZ added, button flips to "Subscribed ✓"
5. Check `/wallet` — both rewards appear in transaction history

### Suspension test
1. With a second viewer account, claim both rewards again
2. After the 2nd view the **Watch** card shows "Views goal met" (disabled) for all future viewers
3. After the 2nd sub the campaign fully suspends — the video disappears from the home feed
4. Back on the artist dashboard: progress bars hit 100%, status badge turns red, **Top up views** and **Top up subscribers** inputs appear
5. Top up → campaign reactivates → video reappears in the feed

---

## Why Cloudflare, not Vercel?

The project was scaffolded with **Lovable** which uses `@lovable.dev/vite-tanstack-config`. That build config targets **Cloudflare Workers** by default — the build output includes a `worker-entry.js` and a generated `wrangler.json`, both of which are Cloudflare-specific.

Deploying to Vercel would require swapping in a different TanStack Start adapter (the Vercel adapter), which means touching the framework config and potentially the server entry point. There is no benefit to doing that swap — Cloudflare Workers has a generous free tier, global edge distribution, and the project deploys with zero config changes using:

```bash
npm run build
cd dist/server && npx wrangler deploy
```

**Secrets are already set** on the worker (Supabase URL + anon key). Future deploys just need those two commands — no secret management needed again unless they change.

---

## Supabase project
`iruweflihvozvcurhtqi` — credentials in `.env.local` (git-ignored, never commit)

## Repo
**https://github.com/danielstriver/megazi**
