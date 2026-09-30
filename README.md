# BenchStock

Shop-to-shop auto parts marketplace. Mechanic shops list surplus inventory (posted by **service writers**), buy with **Stripe Connect** checkout, and propose **trades**.

Repo: [jfoley970/Grok-Test](https://github.com/jfoley970/Grok-Test)

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Prisma + SQLite
- Auth.js (credentials) — multi-user shops (`owner` | `service_writer`)
- Stripe Checkout + Connect Express

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with AUTH_SECRET and Stripe test keys
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Stripe test mode

1. Create a [Stripe](https://dashboard.stripe.com) test account and enable Connect.
2. Put `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env`.
3. Forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Shop **owners** open **Stripe** in the nav and complete Express onboarding (test data).
6. Seeded shops have placeholder `stripeAccountId` values — reconnect via the Stripe settings page with real test Connect accounts before checkout will succeed.

### Seed logins

| Shop | Role | Email | Password |
| --- | --- | --- | --- |
| Riverside Auto Care | Owner | owner@riverside.shop | password123 |
| Riverside Auto Care | Service writer | writer@riverside.shop | password123 |
| Peak Performance Motors | Owner | owner@peak.shop | password123 |
| Peak Performance Motors | Service writer | writer@peak.shop | password123 |

## Roles

- **Owner** — registers the shop, manages Team + Stripe Connect, can post/buy/trade
- **Service writer** — primary poster of surplus parts; can browse, buy, and trade

## Scripts

- `npm run dev` — local server
- `npm run db:seed` — demo shops and parts
- `npx prisma studio` — inspect SQLite data
