# StockFlow MVP

Multi-tenant inventory app: Next.js 14 (App Router), Prisma + Postgres, bcrypt, JWT session cookie.

## Run it
```bash
npm install
cp .env.example .env        # then set AUTH_SECRET (openssl rand -base64 32)
npx prisma db push
npm run dev                 # http://localhost:3000
```

## Notes
- Every query filters by the logged-in user's organizationId (see app/actions.js and the pages).
- SKU is unique per organization (@@unique([organizationId, sku])).
- Password reset is out of scope per the PRD (reset a hash directly in the DB).

## Deploy (Vercel + Neon)
1. Create a free Postgres database at neon.tech and copy its connection string.
2. Locally: put it in `.env` as DATABASE_URL, then run `npx prisma db push` once to create the tables.
3. Push this repo to GitHub, import it in Vercel.
4. In Vercel > Settings > Environment Variables add DATABASE_URL and AUTH_SECRET, then deploy.
