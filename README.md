# StockFlow MVP

A minimal multi-tenant SaaS inventory app. Each organization signs up, manages its own products, and sees a dashboard with stock totals and low-stock alerts. Built as a 6-hour MVP.

**Live demo:** https://stockflow-j2nr.vercel.app

## Demo account

Use this to explore without signing up (or create your own at `/signup`):

- Email: `YOUR_DEMO_EMAIL`
- Password: `YOUR_DEMO_PASSWORD`

## Features

**Authentication and tenancy**
- Sign up with email, password, confirm password, and organization name
- Log in and log out with a server-side-verified JWT session cookie
- Every signup creates an organization linked to the user
- All data is scoped by organization, so one org can never see another org's products

**Products**
- Create, edit, and delete products (name, SKU, description, quantity, cost price, selling price, low stock threshold)
- SKU is required and unique per organization (the same SKU can exist in different orgs)
- Search by name or SKU
- Inline "Adjust stock" control (+/- units with an optional note)
- Confirmation dialog before deleting
- Records who last updated a product and the last stock note

**Dashboard**
- Total number of products
- Total units on hand
- Low stock table (name, SKU, quantity, threshold)

**Settings**
- Default low stock threshold per organization, used when a product has no threshold of its own

## Low stock rule

A product is low stock when:

```
quantity <= (product threshold, or the organization default if empty)
```

The default threshold is 5 until changed in Settings.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Server Actions) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | bcryptjs for password hashing, JWT (jose) in an httpOnly cookie |
| Validation | zod |
| Hosting | Vercel |

## Getting started

### Prerequisites
- Node.js 18.17 or newer
- A PostgreSQL database (a free [Neon](https://neon.tech) database works well)

### Setup

```bash
git clone https://github.com/Rishi256455/stockflow.git
cd stockflow
npm install
```

Create your environment file from the template:

```bash
# macOS / Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Fill in the values in `.env` (see below), then create the tables and start the app:

```bash
npx prisma db push
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret used to sign session tokens. Generate one with `openssl rand -base64 32` |

Never commit your real `.env`. It is listed in `.gitignore`.

## Project structure

```
app/
  actions.js            Server actions: auth, products, stock, settings
  (app)/                Authenticated pages
    dashboard/          Summary cards and low stock list
    products/           List, create, and edit pages
    settings/           Default low stock threshold
  login/  signup/       Public auth pages
components/             ProductForm, DeleteForm (with confirm dialog)
lib/
  auth.js               Session create / verify / destroy
  db.js                 Prisma client
  stock.js              Low stock logic and currency formatting
middleware.js           Redirects unauthenticated users to /login
prisma/schema.prisma    Organization, User, Product models
```

## Design decisions

- **Tenant isolation:** every query and mutation filters by the `organizationId` stored in the user's session. Updates and deletes include the organization in the `where` clause, so a guessed product ID from another org matches nothing.
- **SKU uniqueness** is enforced by the database with `@@unique([organizationId, sku])`, and shown to the user as a clear error message.
- **Sessions:** a signed JWT in an httpOnly, `sameSite=lax` cookie (secure in production) lasting 7 days. Middleware protects `/dashboard`, `/products`, and `/settings`.
- **Validation:** all form input is validated server-side with zod (required fields, whole numbers, non-negative values).
- **Hard delete** is used for products, with a confirmation dialog, as allowed by the PRD.

## Deployment (Vercel + Neon)

1. Create a Postgres database on Neon and copy its connection string.
2. Locally, put it in `.env` as `DATABASE_URL`, then run `npx prisma db push` once to create the tables.
3. Push the repo to GitHub and import it in Vercel.
4. In Vercel, go to Settings, then Environment Variables, and add `DATABASE_URL` and `AUTH_SECRET`.
5. Deploy.

## Scope and known limitations

Intentionally out of scope for this MVP, per the PRD: password reset (reset a hash directly in the database if needed), multiple users per organization, roles, multi-warehouse support, variants, integrations, CSV import, stock movement history, and billing.

Possible next steps: atomic stock adjustments using Prisma's `increment`, pagination on the products list, and a full stock movement log.