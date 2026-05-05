# MEGAZI — Progress & Handoff Guide

## Live URL
**https://megazi.danielhustler-hacker.workers.dev**

Hosted on **Cloudflare Workers**. See [Deployment](#deployment) for deploy steps.

---

## What's been built

### 1. Auth — frictionless signup
Email confirmation is disabled so users sign up and are logged in immediately. On signup, the `profiles` table is populated with their display name so it shows correctly across the app.

**Supabase step required:** Authentication → Providers → Email → disable **Confirm email**

---

### 2. Promoted video lifecycle
Artists promote a track on `/promote`. The system creates a `campaigns` row and a linked `videos` row that appears live in the home feed.

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

---

### 3. Subscription system
Campaign goals support **Views**, **Subscribers**, or **Both**.

**Pricing:**

| | |
|---|---|
| Artist pays | 5 FRW per view · 20 FRW per subscriber |
| Viewer earns | 50 MGZ per view · 150 MGZ per subscription |

**Goal logic:**
- **Views only** — suspends when view target is hit
- **Subs only** — suspends when subscriber target is hit
- **Both** — each earn button disables independently; video only fully suspends when **both** targets are met

On `/watch/$id`, promoted videos show a **Watch & earn** card (Views/Both campaigns) and a **Subscribe & earn** card (Subs/Both campaigns). Both flip to a confirmed state once the viewer has already claimed that reward or the goal is globally met.

**Supabase objects added:**
```sql
-- Columns added to campaigns
goal_type, target_subs, current_subs

-- New table
subscriptions (user_id, campaign_id)

-- RPCs
claim_subscribe_reward()
topup_campaign_subs()
increment_campaign_views()   -- updated for goal-type-aware suspension
```

---

### 4. Video playback
Videos on `/watch/$id` now actually play. Clicking the thumbnail overlay loads a **YouTube iframe embed** in place of the cover image. The earn/subscribe reward buttons below are unaffected — they work independently of playback.

- Promoted videos pull their YouTube URL from `campaigns.video_url`
- Organic (non-promoted) videos without a URL keep the cover-image fallback; clicking the overlay still triggers the reward claim

---

### 5. Auth redirect & error visibility fix
Two bugs on the login and signup pages were resolved:

- **Silent errors** — the login and signup pages don't use the shared `Layout`, so `<Toaster>` was never mounted. Any auth error (wrong password, rate limit, unconfirmed email) disappeared silently. Fixed by mounting `<Toaster>` directly on both pages.
- **Broken redirect in dev** — TanStack Start's SSR-aware router mishandled `navigate()` calls made immediately after an async auth operation in Vite dev mode (production on Cloudflare worked fine). Fixed by replacing `navigate()` with `window.location.href` so the post-auth redirect is a clean browser navigation in all environments.

---

## How to test locally

```bash
npm run dev   # http://localhost:8080
```

### Artist flow
1. Sign up / log in
2. Go to `/promote` — create a campaign with goal **Both**, set a low target (e.g. 2 views + 2 subs) for quick testing
3. Check `/dashboard` — campaign shows as Active with two progress bars

### Viewer flow (open an incognito window, sign up as a second account)
1. Home page — the promoted video appears in the feed
2. Open the video — click the thumbnail to play it in the YouTube embed
3. Click **Watch** below the video → +50 MGZ added, button flips to "Watched ✓"
4. Click **Subscribe** → +150 MGZ added, button flips to "Subscribed ✓"
5. Check `/wallet` — both rewards appear in transaction history

### Suspension test
1. With a second viewer account, claim both rewards again
2. After the 2nd view the **Watch** card shows "Views goal met" (disabled) for all future viewers
3. After the 2nd sub the campaign fully suspends — the video disappears from the home feed
4. Back on the artist dashboard: progress bars hit 100%, status badge turns red, **Top up** inputs appear
5. Top up → campaign reactivates → video reappears in the feed

---

## What to work on next

### Priority 1 — Auth UX polish
The auth flow works but feels bare. Key improvements:

- **Success feedback on login** — show a "Welcome back, [name]!" toast after sign-in so users know something happened
- **Loading state on page entry** — while the auth session is being resolved, protected UI flickers. Add a full-page skeleton or spinner so it doesn't feel broken
- **Sign-out confirmation** — currently silent; add a brief toast ("You've been signed out")
- **Password reset flow** — the "Forgot?" button on `/login` is a dead link. Wire it up to Supabase's `resetPasswordForEmail` and add a `/reset-password` route to handle the callback
- **Better error messages** — Supabase error strings like "Invalid login credentials" are technical. Map them to friendlier copy ("Wrong email or password — try again")

### Priority 2 — Organic video support
Non-promoted videos have no `video_url` in the database, so they can't play. Options:
- Add a `video_url` column to the `videos` table and seed it for existing records
- Or restrict the home feed to promoted videos only until organic upload is built out

### Priority 3 — Artist dashboard improvements
- Progress bars for views and subs goals are shown, but there's no historical chart (views over time)
- No notification when a campaign suspends — artists have to check manually
- Top-up UX could prompt with a suggested amount based on remaining target

### Priority 4 — Wallet & withdrawals
- The withdrawal form on `/wallet` exists but is not connected to MTN MoMo / Airtel APIs
- Need to define minimum withdrawal threshold and fee structure

---

## Deployment

```bash
npm run build
cd dist/server && npx wrangler deploy
```

Supabase secrets are already set on the Cloudflare Worker — no re-configuration needed on subsequent deploys unless the Supabase project changes.

---

## Supabase project
`iruweflihvozvcurhtqi` — credentials in `.env.local` (git-ignored, never commit)

## Repo
**https://github.com/danielstriver/megazi**
