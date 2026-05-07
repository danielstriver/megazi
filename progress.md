# MEGAZI — Session Log

## 2026-05-07

**Live URL:** https://megazi.danielhustler-hacker.workers.dev  
**Repo:** https://github.com/danielstriver/megazi  
**Supabase project:** `iruweflihvozvcurhtqi` (credentials in `.env.local`, never commit)

---

### What we shipped

#### 1. Search
The search bar in the Navbar was UI-only. It now works end-to-end:
- Typing and pressing Enter (or clicking the button) navigates to `/search?q=...`
- New `/search` route queries Supabase with `ILIKE` on both `title` and `artist`
- Shows result count, skeleton loading state, and empty-state prompts
- Only returns promoted (playable) videos — consistent with the home feed

#### 2. Organic video filter
Non-promoted videos (no `campaign_id`) have no `video_url` and can't play. The home feed and search now filter to `campaign_id IS NOT NULL` so only promoted, playable videos are shown.

#### 3. Artist dashboard — suspension alert banner
A red alert banner now appears at the top of `/dashboard` whenever one or more campaigns are suspended, with a direct prompt to top up.

#### 4. Artist dashboard — smart top-up defaults
The top-up form previously defaulted to a fixed 5,000 views / 100 subs. It now pre-fills with the campaign's original `target_views` / `target_subs` — effectively suggesting "run the same campaign again."

#### 5. Artist dashboard — daily views chart
Each campaign card now includes a compact bar chart (recharts) showing views per day over the last 14 days. Data is pulled from `watch_history` joined to the campaign's video. Shows "No view data yet" when empty (expected until Supabase RLS is updated to allow artists to read all watch history for their own campaigns' videos).

#### 6. Automatic deployment (GitHub Actions)
Every push to `main` now builds and deploys to Cloudflare Workers automatically — no manual deploy step needed. Workflow at `.github/workflows/deploy.yml`.

**Three GitHub repository secrets required (already added):**

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Authenticates wrangler — use the "Edit Cloudflare Workers" template |
| `VITE_SUPABASE_URL` | Embedded at build time into the JS bundle |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Embedded at build time into the JS bundle |

---

### What to work on next

**Priority 1 — Enable daily views chart**  
Update Supabase RLS on `watch_history` to allow a row-level policy where the video owner (via `campaigns`) can read all entries for their campaign's video. Until then the chart shows zeros.

**Priority 2 — Artist dashboard notifications**  
Artists have no way to know a campaign suspended without checking manually. Options: email via Supabase Edge Function on `campaigns.status` change, or an in-app notification badge.

**Priority 3 — Wallet & withdrawals**  
The withdrawal form deducts balance and logs a transaction but does not call MTN MoMo / Airtel APIs. Needs API credentials, minimum threshold (suggested 1,000 FRW), and a fee structure defined before implementation.

**Priority 4 — Organic video support**  
Home feed is currently restricted to promoted videos. To support organic uploads, add a `video_url` column to the `videos` table and build an upload flow (YouTube URL input or direct upload).
