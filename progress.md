# MEGAZI — Session Log

## 2026-05-06

**Live URL:** https://megazi.danielhustler-hacker.workers.dev  
**Repo:** https://github.com/danielstriver/megazi  
**Supabase project:** `iruweflihvozvcurhtqi` (credentials in `.env.local`, never commit)

---

### What we shipped

#### 1. Video playback
Clicking the thumbnail overlay on `/watch/$id` now loads a YouTube iframe embed in place of the cover image. The earn and subscribe reward buttons below are completely independent of playback.

- Promoted videos pull their YouTube URL from `campaigns.video_url`
- Organic videos without a URL keep the cover-image fallback (clicking the overlay still triggers the reward claim)
- Added `getYouTubeEmbedUrl()` helper in `src/lib/format.ts`

#### 2. Auth error visibility fix
The login and signup pages don't use the shared `Layout`, so `<Toaster>` was never mounted — auth errors disappeared silently. Added `<Toaster>` directly to both pages so errors are always visible.

#### 3. Auth redirect fix (dev vs. prod)
TanStack Start's SSR-aware router mishandled `navigate()` calls made right after async auth operations in Vite dev mode (production on Cloudflare worked fine). Replaced `navigate()` with `window.location.href` on login, signup, and sign-out for reliable redirection in all environments.

#### 4. Auth UX polish
| What | Detail |
|---|---|
| Personalized welcome | Login shows "Welcome back, [name]!" · Signup shows "Welcome to MEGAZI, [name]!" |
| Friendly error messages | Supabase error codes mapped to plain copy (e.g. "Wrong email or password — please try again.") |
| Forgot password | "Forgot password?" on `/login` uses the email field to send a Supabase reset email |
| Password reset route | New `/reset-password` page handles the Supabase callback, exchanges the code, and updates the password |
| Sign-out feedback | "You've been signed out." toast with a brief pause before redirect to `/login` |
| Navbar loading state | Pulsing avatar placeholder while auth resolves — eliminates the "Sign in" button flicker for logged-in users |

**One-time Supabase config needed:** Authentication → URL Configuration → add these to Redirect URLs:
- `http://localhost:8080/reset-password` (local dev)
- `https://megazi.danielhustler-hacker.workers.dev/reset-password` (production)

---

### What to work on next

**Priority 1 — Organic video support**  
Non-promoted videos have no `video_url` in the database so they can't play. Add a `video_url` column to the `videos` table and seed it for existing records, or restrict the home feed to promoted videos only until an upload flow is built.

**Priority 2 — Artist dashboard improvements**  
- No notification when a campaign suspends — artists must check manually  
- Top-up UX could suggest an amount based on remaining target  
- Add a simple views-over-time chart to the campaign card

**Priority 3 — Wallet & withdrawals**  
The withdrawal form on `/wallet` exists but is not connected to MTN MoMo / Airtel APIs. Define minimum withdrawal threshold and fee structure before implementation.

**Priority 4 — Search**  
The search bar in the Navbar is UI-only. Wire it up to a Supabase query filtering `videos` by title and artist.
