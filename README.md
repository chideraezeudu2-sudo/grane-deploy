# Grane — Full-Stack App (Frontend + Real Backend, Joined)

This is your `Guyt-main` frontend, with the demo/mock backend replaced by the real
Supabase + Groq + Stripe backend, so it's one runnable app.

## What's real now vs. what was fake before

| Piece | Before (Guyt-main demo) | Now |
|---|---|---|
| Auth | Plaintext passwords, in-memory | Supabase Auth (hashed, persistent) |
| Database | In-memory arrays, wiped on restart | Postgres via Supabase, with RLS |
| AI diagnosis | Gemini | Groq |
| Billing | Fake — instantly flips your plan | Real Stripe Checkout + webhook |
| Widget | Served inline from server.ts, 3-click rage threshold | Served from `widget/apppulse.js`, 5-click/3s threshold (matches the rest of the spec) |

## Setup

### 1. Supabase
- Create a project at supabase.com
- Open the SQL editor, paste in and run `db/schema.sql` top to bottom
- Grab your Project URL, anon key, and service role key from Settings → API

### 2. Groq
- Get an API key at console.groq.com
- Confirm the current recommended model name at build time — model names/pricing
  change; don't assume `GROQ_MODEL` in `.env.example` is still current.

### 3. Stripe
- Create two Products/Prices: Basic ($20/mo) and Pro ($50/mo recurring)
- Grab their price IDs (`price_...`)
- Set up a webhook endpoint pointing to `https://your-domain.com/api/billing/webhook`,
  subscribed to at least: `checkout.session.completed`, `customer.subscription.deleted`,
  `invoice.payment_failed`
- Grab the webhook signing secret

### 4. Environment
```
cp .env.example .env
# fill in every value from steps 1-3
```

### 5. Run
```
npm install
npm run dev
```
Visit `http://localhost:3000`. This single process serves both the React frontend
(via Vite middleware) and the API (Express routes) — no separate frontend/backend
deploy needed.

### 6. Production build
```
npm run build
npm start
```

## Widget & Fake Door embed URLs

Both the widget snippet and Fake Door button snippets shown in the dashboard use
`window.location.origin` — so they'll automatically point at wherever you deploy
this (no hardcoded URLs to fix).

## What to sanity-check before real users touch this

1. **Groq model name** — verify current at console.groq.com before going live.
2. **Stripe price IDs** — must be real, live-mode IDs before accepting real payments (test mode first).
3. **RLS policies** — already in `db/schema.sql`, but worth a manual check in Supabase's
   table editor that a second test user genuinely can't see the first user's events.
4. **Rate limit tuning** — currently 100 req/min/IP globally on `/api/*`. If your widget
   traffic is high-volume, you may want to raise this or scope it more precisely to
   the public event-ingestion endpoints only.
5. **Password reset flow** — still not implemented (flagged in the original workflow doc).
   Supabase Auth supports this natively; worth adding before real signups.
