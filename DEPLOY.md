# Production Cutover — Enabling Real Auth (one-time)

The 2026-07-12 merge replaced the shared-password gate with real Better Auth
authentication. The deployed app will not work until these steps run, **in
this order**. Steps 1–2 happen in your hosting dashboard; steps 3–5 on your
laptop (any machine with this repo and the production `DATABASE_URL` in
`.env`); step 6 in the browser.

## 1. Set environment variables (hosting dashboard)

| Variable | Value |
|----------|-------|
| `BETTER_AUTH_SECRET` | Generate: `openssl rand -base64 48` (32+ chars, required — deploys fail loudly without it) |
| `BETTER_AUTH_URL` | Your production URL, e.g. `https://app.example.com` |
| `NEXT_PUBLIC_APP_URL` | Same production URL |
| `GATE_PASSWORD` | *Recommended while private:* a NEW password (the old `doublejack2024` is in git history — do not reuse). Unset = gate disabled |
| `DEFAULT_ORG_ID` | The Double Jack org UUID (the Gmail ingest webhook now fails closed without it) |
| `CRON_SECRET` | Keep existing value |

## 2. Redeploy

If the deploy triggered by the merge already failed on env validation,
redeploy after setting the variables. The previous version stays live until
a deploy succeeds — nothing goes down in the meantime.

## 3. Add the auth tables to the production database (one-time)

```bash
npm run db:adopt
```

This runs `drizzle-kit push` (adds the 4 Better Auth tables; existing tables
untouched) and then records the migration baseline as applied, so all future
schema changes ship via `npm run db:migrate`.

## 4. Register your account

Open the production URL (enter the gate password if set) → **Create one** →
register with your email. You'll land on onboarding — **stop there, do NOT
create a new organization** (your data lives in the existing Double Jack org).

## 5. Link your account to the Double Jack org as owner

```bash
npx tsx scripts/link-owner.ts your-email@example.com
```

## 6. Sign in

Reload the app — you'll land on the dashboard with all Double Jack data.
The old shared password no longer grants access to anything; `/login` is now
a real sign-in.

## Rollback

If anything goes wrong, redeploy the previous commit from your hosting
dashboard. The auth tables added in step 3 are additive and harmless to the
old code.
