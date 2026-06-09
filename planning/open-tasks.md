# Open tasks — read me on every pull

> Maor-maintained. Flows to Sivan via git. This is the live "what's pending /
> what changed" channel between us. Check it whenever you update the plugin.

## 🔐 Security audit (2026-06-09) — STATUS

**Maor ran a security audit and FIXED the holes in code** (app repo, commit
`c432dad` on `momlee-native`, report: `docs/audit/SECURITY_FIXES_2026-06-09.md`
in the app repo). What was fixed:

1. Public storage buckets → **private + signed URLs**.
2. **CRITICAL:** a broad `users` RLS policy exposed every mom's email+phone →
   removed; safe view **`public.user_display_info`** (id, display_name,
   avatar_url ONLY) is now the only way to show users to other users.
   (Pattern codified in `../knowledge/security.md` §24.)
3. `.env` was tracked in git → untracked + `.gitignore` fixed.
4. 16 hardcoded Mapbox tokens → moved to env.
5. 6 legacy Edge Functions (service-role + open CORS) → **deleted from the repo**.
6. `/api/geocode` had no auth/rate-limit → now authenticated + 30 req/min.

### ⚠️ Still PENDING — the live environment is NOT yet protected

The code is fixed, but the fixes are not live until these run against
**production Supabase** (coordinate with Maor before touching live):

- [ ] Apply migration `20260609200000` to the **live** database
      (buckets + `users` RLS + `user_display_info` view).
- [ ] **Delete the 6 legacy Edge Functions from the Supabase dashboard**
      (they're gone from the repo, but still deployed and callable).
- [ ] **Rotate the exposed tokens** (Mapbox; any key that lived in the
      committed `.env`), update env/secret stores accordingly.

**Until then:** treat the live DB as if the holes are still open — don't build
anything that depends on the old public buckets or on querying `users` directly.
New code MUST follow the fixed patterns (signed URLs, `user_display_info`,
env tokens) so it's correct the moment the deployment lands.

## Dev-environment notes (already in effect)

- The app is pinned to **Expo SDK 54** so the App Store **Expo Go** runs it on a
  real iPhone via QR (SDK 56 was rejected by Expo Go). Don't bump the SDK
  without checking Expo Go support. See `../knowledge/dev-environment.md`.
- pnpm monorepo with `node-linker=hoisted` (required for Metro). After pulling
  dep changes: `pnpm install` from the repo root.
